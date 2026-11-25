// Placement test API for the UI: the four flagged items, the student's results on them, and the final band.
// Taking each part goes through the normal exam / writing / speaking services, which let placement items through without a course.
import { placementSchema, type Placement } from "@/contracts/profile";
import { overallOf, type Bands } from "@/lib/progress";
import { requireProfile } from "@/server/profile";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

const SKILL_ORDER = ["listening", "reading", "writing", "speaking"] as const;

// Reads go through RLS: a student only sees their own results.
export async function getPlacement(): Promise<Placement> {
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
  const supabase = await createClient();
  const [tests, writing, speaking] = await Promise.all([
    supabase.from("tests").select("id, skill, title").eq("is_placement", true),
    supabase.from("writing_prompts").select("id, title").eq("is_placement", true).limit(1).maybeSingle(),
    supabase.from("speaking_prompts").select("id, title").eq("is_placement", true).limit(1).maybeSingle(),
  ]);
  const error = tests.error ?? writing.error ?? speaking.error;
  if (error) throw new Error(error.message);

  const testIds = tests.data!.map((t) => t.id);
  const [attempts, essays, talks] = await Promise.all([
    supabase
      .from("attempts")
      .select("testId:test_id, band")
      .eq("student_id", profile.id)
      .in("test_id", testIds)
      .not("band", "is", null)
      .order("submitted_at", { ascending: false }),
    writing.data
      ? supabase
          .from("writing_submissions")
          .select("id, band")
          .eq("student_id", profile.id)
          .eq("prompt_id", writing.data.id)
          .order("submitted_at", { ascending: false })
      : null,
    speaking.data
      ? supabase
          .from("speaking_submissions")
          .select("id, band")
          .eq("student_id", profile.id)
          .eq("prompt_id", speaking.data.id)
          .order("submitted_at", { ascending: false })
      : null,
  ]);
  const listError = attempts.error ?? essays?.error ?? talks?.error;
  if (listError) throw new Error(listError.message);

  // Newest graded result wins; handed in without a band means AI grading failed.
  const submitted = (rows: { id: string; band: number | null }[]) => {
    const graded = rows.find((r) => r.band !== null);
    return {
      status: graded ? ("done" as const) : rows.length ? ("grading" as const) : ("todo" as const),
      band: graded?.band ?? null,
      ungradedId: graded ? null : (rows[0]?.id ?? null),
    };
  };
  const parts = [
    ...tests.data!.map((t) => {
      const band = attempts.data!.find((a) => a.testId === t.id)?.band ?? null;
      return { skill: t.skill, itemId: t.id, title: t.title, status: band === null ? "todo" : "done", band, ungradedId: null };
    }),
    ...(writing.data ? [{ skill: "writing", itemId: writing.data.id, title: writing.data.title, ...submitted(essays!.data!) }] : []),
    ...(speaking.data ? [{ skill: "speaking", itemId: speaking.data.id, title: speaking.data.title, ...submitted(talks!.data!) }] : []),
  ].sort((a, b) => SKILL_ORDER.indexOf(a.skill as never) - SKILL_ORDER.indexOf(b.skill as never));

  const bands = Object.fromEntries(SKILL_ORDER.map((s) => [s, parts.find((p) => p.skill === s)?.band ?? null])) as Bands;
  return placementSchema.parse({ parts, overall: overallOf(bands) });
}

// Once all four parts have a band: the overall becomes the student's current band and the gate opens. Safe to call any time.
export async function completePlacement(): Promise<void> {
  "use server";
  const profile = await requireProfile();
  if (profile.role !== "student" || !profile.needsPlacement) return;
  const { overall } = await getPlacement();
  if (overall === null) return;
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ current_band: overall, needs_placement: false })
    .eq("id", profile.id)
    .eq("needs_placement", true);
  if (error) throw new Error(error.message);
}
