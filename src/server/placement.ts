import { baselineInput, PLACEMENT } from "@/contracts/profile";
import { latestBands } from "@/server/grading";
import { requireLearningAccess } from "@/server/profile";
import { createAdminClient } from "@/server/supabase/admin";

export async function placementStatus(studentId: string, placement: boolean) {
  const admin = createAdminClient();
  const [exams, writing, speaking] = await Promise.all([
    admin.from("attempts").select("id, test_id, band, tests(skill)")
      .eq("student_id", studentId).eq("placement", placement)
      .not("submitted_at", "is", null).order("submitted_at", { ascending: false }),
    admin.from("writing_submissions").select("id, band")
      .eq("student_id", studentId).eq("placement", placement).order("submitted_at", { ascending: false }),
    admin.from("speaking_submissions").select("id, band")
      .eq("student_id", studentId).eq("placement", placement).order("submitted_at", { ascending: false }),
  ]);
  const error = exams.error ?? writing.error ?? speaking.error;
  if (error) throw new Error(error.message);

  const items = PLACEMENT.map((item) => {
    const rows = item.skill === "writing" ? writing.data! : item.skill === "speaking" ? speaking.data!
      : exams.data!.filter((row) => placement ? row.test_id === item.id : row.tests.skill === item.skill);
    const result = placement ? rows[0] : rows.find((row) => row.band !== null);
    const resultHref = !result ? null : item.skill === "writing" ? `/examiner/writing/analysis/${result.id}`
      : item.skill === "speaking" ? `/examiner/analysis/${result.id}` : `/mock-test/result/${result.id}`;
    return { ...item, band: result?.band ?? null, resultHref };
  });
  return { items, overall: latestBands(items.flatMap(({ skill, band }) => band === null ? [] : [{ skill, band }])).overall };
}

export async function setBaseline(input: unknown) {
  const choice = baselineInput.parse(input);
  const profile = await requireLearningAccess();
  if (profile.baselineBand !== null || profile.placementStartedAt || profile.goalBand === null) return;
  const previous = choice.mode === "placement" ? (await placementStatus(profile.id, false)).overall : null;
  const update = choice.mode === "self" ? { baseline_band: choice.band, baseline_source: "self" }
    : previous !== null ? { baseline_band: previous, baseline_source: "previous" }
    : { placement_started_at: new Date().toISOString() };
  const { error } = await createAdminClient().from("profiles").update(update).eq("id", profile.id)
    .eq("learning_access", true).is("baseline_band", null).is("placement_started_at", null);
  if (error) throw new Error(error.message);
}

export async function finishPlacement() {
  const profile = await requireLearningAccess();
  if (profile.baselineBand !== null || !profile.placementStartedAt) return;
  const { overall } = await placementStatus(profile.id, true);
  if (overall === null) return;
  const { error } = await createAdminClient().from("profiles")
    .update({ baseline_band: overall, baseline_source: "placement" })
    .eq("id", profile.id).eq("learning_access", true).is("baseline_band", null);
  if (error) throw new Error(error.message);
}
