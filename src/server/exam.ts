// Exam room API for the UI: list tests, take an attempt, read results.
// Every write uses the admin client; the server owns the timer and the grading.
import { z } from "zod";
import {
  attemptResultSchema,
  attemptSummarySchema,
  saveAnswersInput,
  skillSchema,
  startAttemptInput,
  startAttemptOutput,
  submitAttemptInput,
  testSummarySchema,
  type AttemptResult,
  type AttemptSummary,
  type SaveAnswersOutput,
  type StartAttemptOutput,
  type TestSummary,
} from "@/contracts/exam";
import { isCorrect, toBand } from "@/server/grading";
import { requireProfile } from "@/server/profile";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

type Admin = ReturnType<typeof createAdminClient>;

// An autosave fired right at the deadline still lands.
const SAVE_GRACE_MS = 10_000;

// Private bucket; tests.audio_path is a path inside it.
const AUDIO_BUCKET = "listening-audio";
// Longer than any test. Resuming an attempt signs a fresh URL.
const AUDIO_URL_TTL_SECONDS = 3 * 60 * 60;

const deadlineOf = (startedAt: string, durationSeconds: number | null) =>
  durationSeconds === null ? null : new Date(Date.parse(startedAt) + durationSeconds * 1000).toISOString();

const isPast = (deadline: string | null, graceMs = 0) =>
  deadline !== null && Date.now() > Date.parse(deadline) + graceMs;

export async function listTests(): Promise<TestSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tests")
    .select("id, skill, kind, title, durationSeconds:duration_seconds")
    .order("created_at");
  if (error) throw new Error(error.message);
  return testSummarySchema.array().parse(data);
}

// Submitted attempts the caller may see (RLS), newest first.
export async function listAttempts(studentId?: string): Promise<AttemptSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("attempts")
    .select("id, submittedAt:submitted_at, rawScore:raw_score, band, test:tests(title, skill, kind)")
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId); // a parent looking at one child
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return attemptSummarySchema
    .array()
    .parse(data.map(({ test, ...a }) => ({ ...a, testTitle: test.title, skill: test.skill, kind: test.kind })));
}

async function loadAttempt(admin: Admin, attemptId: string) {
  const { data, error } = await admin
    .from("attempts")
    .select(
      "id, testId:test_id, studentId:student_id, startedAt:started_at, submittedAt:submitted_at, rawScore:raw_score, band, test:tests(id, skill, kind, title, durationSeconds:duration_seconds)",
    )
    .eq("id", attemptId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data && { ...data, deadline: deadlineOf(data.startedAt, data.test.durationSeconds) };
}
type LoadedAttempt = NonNullable<Awaited<ReturnType<typeof loadAttempt>>>;

async function loadOwnAttempt(admin: Admin, attemptId: string, studentId: string) {
  const attempt = await loadAttempt(admin, attemptId);
  if (!attempt || attempt.studentId !== studentId) throw new Error("not found");
  return attempt;
}

// Marks every question of the test against its key. Unanswered questions are wrong.
async function grade(admin: Admin, attemptId: string, testId: string) {
  const [questions, answers] = await Promise.all([
    admin.from("questions").select("id, number, key:answer_keys(accepted)").eq("test_id", testId).order("number"),
    admin.from("attempt_answers").select("question_id, answer").eq("attempt_id", attemptId),
  ]);
  if (questions.error) throw new Error(questions.error.message);
  if (answers.error) throw new Error(answers.error.message);
  const given = new Map(answers.data.map((a) => [a.question_id, a.answer]));
  return questions.data.map((q) => {
    const accepted = q.key?.accepted ?? [];
    const answer = given.get(q.id) ?? null;
    return { questionId: q.id, number: q.number, answer, correct: isCorrect(answer, accepted), accepted };
  });
}

// Locks and scores an attempt. Safe to call twice: only the first call writes.
async function finalize(
  admin: Admin,
  attempt: { id: string; testId: string; deadline: string | null; test: { skill: string; kind: string } },
) {
  const graded = await grade(admin, attempt.id, attempt.testId);
  const rawScore = graded.filter((g) => g.correct).length;
  const { error } = await admin
    .from("attempts")
    .update({
      // A timed-out attempt may be finalized long after the fact; record when it really ended.
      submitted_at: isPast(attempt.deadline) ? attempt.deadline! : new Date().toISOString(),
      raw_score: rawScore,
      band: attempt.test.kind === "exam" ? toBand(skillSchema.parse(attempt.test.skill), rawScore, graded.length) : null,
    })
    .eq("id", attempt.id)
    .is("submitted_at", null);
  if (error) throw new Error(error.message);
}

async function buildResult(admin: Admin, attempt: LoadedAttempt): Promise<AttemptResult> {
  const graded = await grade(admin, attempt.id, attempt.testId);
  // Exams report the score only. Per-question marks would leak the key: the same test can be retaken.
  const answers = attempt.test.kind === "exam" ? [] : graded;
  return attemptResultSchema.parse({ attempt, test: attempt.test, rawScore: attempt.rawScore, total: graded.length, band: attempt.band, answers });
}

// Starts a new attempt, or resumes the one in progress. An expired one is closed first.
export async function startAttempt(input: unknown): Promise<StartAttemptOutput> {
  "use server";
  const { testId } = startAttemptInput.parse(input);
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
  const admin = createAdminClient();

  const test = await admin
    .from("tests")
    .select(
      "id, skill, kind, title, durationSeconds:duration_seconds, sections, audioPath:audio_path, isPlacement:is_placement, questions(id, number, section, instruction, prompt, options)",
    )
    .eq("id", testId)
    .order("number", { referencedTable: "questions" })
    .maybeSingle();
  if (test.error) throw new Error(test.error.message);
  if (!test.data) throw new Error("not found");
  if (!profile.enrolledCourse && !test.data.isPlacement) throw new Error("locked"); // the placement test is free
  const { durationSeconds } = test.data;

  const findOpen = () =>
    admin
      .from("attempts")
      .select("id, startedAt:started_at")
      .eq("student_id", profile.id)
      .eq("test_id", testId)
      .is("submitted_at", null)
      .maybeSingle();

  let open = await findOpen();
  if (open.error) throw new Error(open.error.message);
  let row = open.data;
  if (row && isPast(deadlineOf(row.startedAt, durationSeconds))) {
    await finalize(admin, { id: row.id, testId, deadline: deadlineOf(row.startedAt, durationSeconds), test: test.data });
    row = null;
  }
  if (!row) {
    const created = await admin
      .from("attempts")
      .insert({ student_id: profile.id, test_id: testId })
      .select("id, startedAt:started_at")
      .single();
    row = created.data;
    if (!row) {
      // Double click: the one-in-progress index rejected this insert, so use the attempt that won.
      open = await findOpen();
      row = open.data;
      if (!row) throw new Error(created.error?.message ?? "could not start attempt");
    }
  }

  const answers = await admin
    .from("attempt_answers")
    .select("questionId:question_id, answer, flagged")
    .eq("attempt_id", row.id);
  if (answers.error) throw new Error(answers.error.message);

  let audioUrl: string | null = null;
  if (test.data.audioPath) {
    const signed = await admin.storage.from(AUDIO_BUCKET).createSignedUrl(test.data.audioPath, AUDIO_URL_TTL_SECONDS);
    if (signed.error) throw new Error(signed.error.message);
    audioUrl = signed.data.signedUrl;
  }

  return startAttemptOutput.parse({
    serverNow: new Date().toISOString(),
    attempt: {
      id: row.id,
      testId,
      startedAt: row.startedAt,
      deadline: deadlineOf(row.startedAt, durationSeconds),
      submittedAt: null,
    },
    test: { ...test.data, audioUrl }, // the schema strips audioPath
    answers: answers.data,
  });
}

export async function saveAnswers(input: unknown): Promise<SaveAnswersOutput> {
  "use server";
  const { attemptId, answers } = saveAnswersInput.parse(input);
  const profile = await requireProfile();
  const admin = createAdminClient();
  const attempt = await loadOwnAttempt(admin, attemptId, profile.id);

  if (attempt.submittedAt) return { locked: true };
  if (isPast(attempt.deadline, SAVE_GRACE_MS)) {
    await finalize(admin, attempt);
    return { locked: true };
  }
  // Rows for questions of another test are harmless: grading only reads this test's questions.
  // shortcut: a save racing a submit can land after grading (stored score stays, shown answer may differ); move the lock check into a DB trigger if that ever matters.
  const { error } = await admin.from("attempt_answers").upsert(
    answers.map((a) => ({ attempt_id: attemptId, question_id: a.questionId, answer: a.answer, flagged: a.flagged })),
  );
  if (error) throw new Error(error.message);
  return { locked: false };
}

export async function submitAttempt(input: unknown): Promise<AttemptResult> {
  "use server";
  const { attemptId } = submitAttemptInput.parse(input);
  const profile = await requireProfile();
  const admin = createAdminClient();
  const attempt = await loadOwnAttempt(admin, attemptId, profile.id);
  if (!attempt.submittedAt) await finalize(admin, attempt);
  return buildResult(admin, (await loadAttempt(admin, attemptId))!);
}

// For the student or a linked parent. Null while the attempt is in progress or not visible to the caller.
export async function getAttemptResult(attemptId: string): Promise<AttemptResult | null> {
  if (!z.uuid().safeParse(attemptId).success) return null; // comes straight from the URL
  // RLS decides who may see this attempt; the admin client is only used after that check.
  const supabase = await createClient();
  const visible = await supabase.from("attempts").select("id").eq("id", attemptId).maybeSingle();
  if (visible.error) throw new Error(visible.error.message);
  if (!visible.data) return null;

  const admin = createAdminClient();
  let attempt = (await loadAttempt(admin, attemptId))!;
  if (!attempt.submittedAt) {
    if (!isPast(attempt.deadline, SAVE_GRACE_MS)) return null;
    await finalize(admin, attempt);
    attempt = (await loadAttempt(admin, attemptId))!;
  }
  return buildResult(admin, attempt);
}
