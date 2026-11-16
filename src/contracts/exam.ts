// Contract for the Reading/Listening exam room. FE and BE both import from here.
// Nothing a client can get before submitting carries answer keys.
import { z } from "zod";

const timestamp = z.iso.datetime({ offset: true });

export const skillSchema = z.enum(["reading", "listening"]);
export type Skill = z.infer<typeof skillSchema>;

export const testKindSchema = z.enum(["exam", "practice"]);
export type TestKind = z.infer<typeof testKindSchema>;

export const testSummarySchema = z.object({
  id: z.uuid(),
  skill: skillSchema,
  kind: testKindSchema,
  title: z.string(),
  durationSeconds: z.number().int().positive().nullable(), // null = untimed practice
});
export type TestSummary = z.infer<typeof testSummarySchema>;

export const questionSchema = z.object({
  id: z.uuid(),
  number: z.number().int().positive(),
  section: z.number().int().nonnegative(), // index into Test.sections
  instruction: z.string().nullable(), // shown above the first question of a group
  prompt: z.string(),
  options: z.array(z.string()).nullable(), // null = free-text answer
});
export type Question = z.infer<typeof questionSchema>;

export const testSchema = testSummarySchema.extend({
  sections: z.array(z.object({ title: z.string(), passage: z.string() })),
  audioUrl: z.url().nullable(), // short-lived signed URL, listening only
  questions: z.array(questionSchema),
});
export type Test = z.infer<typeof testSchema>;

export const attemptSchema = z.object({
  id: z.uuid(),
  testId: z.uuid(),
  startedAt: timestamp,
  deadline: timestamp.nullable(), // decided by the server; null = untimed
  submittedAt: timestamp.nullable(), // null = in progress
});
export type Attempt = z.infer<typeof attemptSchema>;

export const savedAnswerSchema = z.object({
  questionId: z.uuid(),
  answer: z.string().trim().max(200).nullable(),
  flagged: z.boolean(),
});
export type SavedAnswer = z.infer<typeof savedAnswerSchema>;

// Starts a new attempt, or resumes the one already in progress for this test.
export const startAttemptInput = z.object({ testId: z.uuid() });
export const startAttemptOutput = z.object({
  serverNow: timestamp, // the client shows the countdown against this, not its own clock
  attempt: attemptSchema,
  test: testSchema,
  answers: z.array(savedAnswerSchema),
});
export type StartAttemptOutput = z.infer<typeof startAttemptOutput>;

// Autosave: send only the answers that changed.
export const saveAnswersInput = z.object({
  attemptId: z.uuid(),
  answers: z.array(savedAnswerSchema).min(1).max(100),
});
export type SaveAnswersInput = z.infer<typeof saveAnswersInput>;
// locked = the attempt was already submitted or its deadline passed; nothing was saved.
export const saveAnswersOutput = z.object({ locked: z.boolean() });
export type SaveAnswersOutput = z.infer<typeof saveAnswersOutput>;

export const submitAttemptInput = z.object({ attemptId: z.uuid() });

// Only exists for submitted attempts. Exams report the score only; practice also lists every answer with its key.
export const attemptResultSchema = z.object({
  attempt: attemptSchema,
  test: testSummarySchema,
  rawScore: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  band: z.number().min(0).max(9).nullable(), // null for practice tests
  // Empty for exams.
  answers: z.array(
    z.object({
      questionId: z.uuid(),
      number: z.number().int().positive(),
      answer: z.string().nullable(),
      correct: z.boolean(),
      accepted: z.array(z.string()),
    }),
  ),
});
export type AttemptResult = z.infer<typeof attemptResultSchema>;

// A submitted attempt in a list. Students see their own, parents their linked children's.
export const attemptSummarySchema = z.object({
  id: z.uuid(),
  testTitle: z.string(),
  submittedAt: timestamp,
  rawScore: z.number().int().nonnegative(),
  band: z.number().min(0).max(9).nullable(),
});
export type AttemptSummary = z.infer<typeof attemptSummarySchema>;
