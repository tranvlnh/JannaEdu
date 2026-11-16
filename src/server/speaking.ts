// Speaking API for the UI: prompts, recorded submissions and AI grading.
import { z } from "zod";
import {
  gradeSpeakingInput,
  speakingPromptSchema,
  speakingSubmissionSchema,
  speakingSubmissionSummarySchema,
  submitSpeakingInput,
  submitSpeakingOutput,
  type SpeakingPrompt,
  type SpeakingSubmission,
  type SpeakingSubmissionSummary,
  type SubmitSpeakingOutput,
} from "@/contracts/speaking";
import { requireProfile } from "@/server/profile";
import { assessSpeaking } from "@/server/speaking-examiner";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

type Admin = ReturnType<typeof createAdminClient>;

// Private bucket; speaking_submissions.audio_path is a path inside it.
const BUCKET = "speaking-recordings";
const PLAYBACK_URL_TTL_SECONDS = 60 * 60;
// Every submission costs one AI call.
// shortcut: a per-student daily cap is the only spend control; add a global budget if usage grows.
const DAILY_LIMIT = 10;
// Browsers call Safari's recordings audio/mp4; the model knows that container as audio/m4a.
const MODEL_MIME: Record<string, string> = { "audio/mp4": "audio/m4a" };

export async function listSpeakingPrompts(): Promise<SpeakingPrompt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("speaking_prompts").select("id, part, title, prompt").order("created_at");
  if (error) throw new Error(error.message);
  return speakingPromptSchema.array().parse(data);
}

// Submissions the caller may see (RLS), newest first.
export async function listSpeakingSubmissions(): Promise<SpeakingSubmissionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("speaking_submissions")
    .select("id, submittedAt:submitted_at, band, prompt:speaking_prompts(title)")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return speakingSubmissionSummarySchema.array().parse(data.map((s) => ({ ...s, promptTitle: s.prompt.title })));
}

// Grades a stored recording and saves the report. A failure leaves report null, so it can be retried.
async function grade(admin: Admin, submission: { id: string; audio_path: string; audio_type: string; prompt: unknown }) {
  const file = await admin.storage.from(BUCKET).download(submission.audio_path);
  if (file.error) throw new Error(file.error.message);
  const data = Buffer.from(await file.data.arrayBuffer()).toString("base64");
  const report = await assessSpeaking(speakingPromptSchema.parse(submission.prompt), {
    data,
    mimeType: MODEL_MIME[submission.audio_type] ?? submission.audio_type,
  });
  const { error } = await admin
    .from("speaking_submissions")
    .update({ report, band: report.band })
    .eq("id", submission.id);
  if (error) throw new Error(error.message);
}

export async function submitSpeaking(input: unknown): Promise<SubmitSpeakingOutput> {
  "use server";
  const { promptId, audio } = submitSpeakingInput.parse(input);
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
  const admin = createAdminClient();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recent = await admin
    .from("speaking_submissions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", profile.id)
    .gt("submitted_at", since);
  if (recent.error) throw new Error(recent.error.message);
  if ((recent.count ?? 0) >= DAILY_LIMIT) throw new Error("daily limit reached");

  const id = crypto.randomUUID();
  const path = `${profile.id}/${id}`;
  const upload = await admin.storage.from(BUCKET).upload(path, audio, { contentType: audio.type });
  if (upload.error) throw new Error(upload.error.message);

  const created = await admin
    .from("speaking_submissions")
    .insert({ id, student_id: profile.id, prompt_id: promptId, audio_path: path, audio_type: audio.type })
    .select("id, audio_path, audio_type, prompt:speaking_prompts(id, part, title, prompt)")
    .single();
  if (created.error) {
    await admin.storage.from(BUCKET).remove([path]); // do not keep a recording nothing points to
    throw new Error(created.error.message);
  }

  try {
    await grade(admin, created.data);
  } catch (error) {
    console.error("speaking grading failed", id, error); // the recording is saved; the student can retry
  }
  return submitSpeakingOutput.parse({ id });
}

// Retry for a submission whose grading failed. Never re-grades a finished report.
export async function gradeSpeaking(input: unknown): Promise<void> {
  "use server";
  const { submissionId } = gradeSpeakingInput.parse(input);
  const profile = await requireProfile();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("speaking_submissions")
    .select("id, student_id, audio_path, audio_type, report, prompt:speaking_prompts(id, part, title, prompt)")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.student_id !== profile.id) throw new Error("not found");
  if (data.report) return;
  await grade(admin, data);
}

// For the student or a linked parent. Null when it does not exist or is not visible to the caller.
export async function getSpeakingSubmission(id: string): Promise<SpeakingSubmission | null> {
  if (!z.uuid().safeParse(id).success) return null; // comes straight from the URL
  // RLS decides who may see this submission; the admin client only signs the playback URL after that.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("speaking_submissions")
    .select("id, audio_path, submittedAt:submitted_at, report, prompt:speaking_prompts(id, part, title, prompt)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const signed = await createAdminClient().storage.from(BUCKET).createSignedUrl(data.audio_path, PLAYBACK_URL_TTL_SECONDS);
  if (signed.error) throw new Error(signed.error.message);
  return speakingSubmissionSchema.parse({ ...data, audioUrl: signed.data.signedUrl });
}
