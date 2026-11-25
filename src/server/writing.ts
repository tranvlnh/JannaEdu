// Writing API for the UI: prompts, submissions and AI grading.
import { z } from "zod";
import {
  gradeWritingInput,
  submitWritingInput,
  submitWritingOutput,
  writingPromptSchema,
  writingSubmissionSchema,
  writingSubmissionSummarySchema,
  type SubmitWritingOutput,
  type WritingPrompt,
  type WritingSubmission,
  type WritingSubmissionSummary,
} from "@/contracts/writing";
import { PLACEMENT } from "@/contracts/profile";
import { isPlacementWork, requireLearningAccess } from "@/server/profile";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";
import { assessWriting } from "@/server/writing-examiner";

type Admin = ReturnType<typeof createAdminClient>;

// Every submission costs one AI call.
// shortcut: a per-student daily cap is the only spend control; add a global budget if usage grows.
const DAILY_LIMIT = 10;

export async function listWritingPrompts(): Promise<WritingPrompt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("writing_prompts").select("id, task, title, prompt").order("created_at");
  if (error) throw new Error(error.message);
  return writingPromptSchema.array().parse(data);
}

// Submissions the caller may see (RLS), newest first.
export async function listWritingSubmissions(studentId?: string): Promise<WritingSubmissionSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("writing_submissions")
    .select("id, submittedAt:submitted_at, band, prompt:writing_prompts(title)")
    .order("submitted_at", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId); // a parent looking at one child
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return writingSubmissionSummarySchema.array().parse(data.map((s) => ({ ...s, promptTitle: s.prompt.title })));
}

async function loadSubmission(admin: Admin, id: string) {
  const { data, error } = await admin
    .from("writing_submissions")
    .select("id, studentId:student_id, placement, essay, submittedAt:submitted_at, report, prompt:writing_prompts(id, task, title, prompt)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Grades a submission and stores the report. A failure leaves report null, so it can be retried.
async function grade(admin: Admin, submission: { id: string; essay: string; prompt: unknown }) {
  const report = await assessWriting(writingPromptSchema.parse(submission.prompt), submission.essay);
  const { error } = await admin
    .from("writing_submissions")
    .update({ report, band: report.band })
    .eq("id", submission.id);
  if (error) throw new Error(error.message);
}

export async function submitWriting(input: unknown): Promise<SubmitWritingOutput> {
  "use server";
  const { promptId, essay } = submitWritingInput.parse(input);
  const profile = await requireLearningAccess();
  const placement = isPlacementWork(profile, promptId === PLACEMENT[2].id);
  const admin = createAdminClient();

  const findPlacement = () => admin.from("writing_submissions").select("id")
    .eq("student_id", profile.id).eq("placement", true).maybeSingle();
  if (placement) {
    const existing = await findPlacement();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) return { id: existing.data.id };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recent = await admin
    .from("writing_submissions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", profile.id)
    .gt("submitted_at", since);
  if (recent.error) throw new Error(recent.error.message);
  if ((recent.count ?? 0) >= DAILY_LIMIT) throw new Error("daily limit reached");

  const created = await admin
    .from("writing_submissions")
    .insert({ student_id: profile.id, placement, prompt_id: promptId, essay })
    .select("id, essay, prompt:writing_prompts(id, task, title, prompt)")
    .single();
  if (created.error) {
    if (placement && created.error.code === "23505") {
      const existing = await findPlacement();
      if (existing.data) return { id: existing.data.id };
    }
    throw new Error(created.error.message);
  }

  try {
    await grade(admin, created.data);
  } catch (error) {
    console.error("writing grading failed", created.data.id, error); // the essay is saved; the student can retry
  }
  return submitWritingOutput.parse({ id: created.data.id });
}

// Retry for a submission whose grading failed. Never re-grades a finished report.
export async function gradeWriting(input: unknown): Promise<void> {
  "use server";
  const { submissionId } = gradeWritingInput.parse(input);
  const profile = await requireLearningAccess();
  const admin = createAdminClient();
  const submission = await loadSubmission(admin, submissionId);
  if (!submission || submission.studentId !== profile.id) throw new Error("not found");
  isPlacementWork(profile, submission.placement);
  if (submission.report) return;
  await grade(admin, submission);
}

// For the student or a linked parent. Null when it does not exist or is not visible to the caller.
export async function getWritingSubmission(id: string): Promise<WritingSubmission | null> {
  if (!z.uuid().safeParse(id).success) return null; // comes straight from the URL
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("writing_submissions")
    .select("id, essay, submittedAt:submitted_at, report, prompt:writing_prompts(id, task, title, prompt)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data && writingSubmissionSchema.parse(data);
}
