// Contract for the AI Writing examiner. FE and BE both import from here.
// The .describe() texts are sent to the model as part of the response schema, so they are instructions too.
import { z } from "zod";

const timestamp = z.iso.datetime({ offset: true });
const band = z.number().min(0).max(9).multipleOf(0.5);

export const writingPromptSchema = z.object({
  id: z.uuid(),
  task: z.union([z.literal(1), z.literal(2)]),
  title: z.string(),
  prompt: z.string(),
});
export type WritingPrompt = z.infer<typeof writingPromptSchema>;

const criterion = z.object({
  band: band.describe("IELTS band for this criterion, 0 to 9 in steps of 0.5"),
  comment: z.string().describe("2-3 sentences in Vietnamese justifying the band, citing the essay"),
});

// What the model returns. The overall band is not here: the server computes it from the four criteria.
export const writingAssessmentSchema = z.object({
  criteria: z.object({
    taskResponse: criterion.describe("Task Achievement (Task 1) or Task Response (Task 2)"),
    coherenceCohesion: criterion.describe("Coherence and Cohesion"),
    lexicalResource: criterion.describe("Lexical Resource"),
    grammaticalRange: criterion.describe("Grammatical Range and Accuracy"),
  }),
  summary: z
    .string()
    .describe("Overall feedback in Vietnamese, 3-5 sentences: main strengths, then what to improve first"),
  errors: z
    .array(
      z.object({
        quote: z.string().describe("The exact words from the essay that contain the error, copied verbatim"),
        type: z.enum(["grammar", "vocabulary", "spelling", "coherence", "task"]),
        explanation: z.string().describe("Why it is wrong, in Vietnamese, one sentence"),
        suggestion: z.string().describe("The corrected English wording"),
      }),
    )
    .max(20)
    .describe("The most important errors, most serious first; empty if there are none"),
});
export type WritingAssessment = z.infer<typeof writingAssessmentSchema>;

export const writingReportSchema = writingAssessmentSchema.extend({
  band, // mean of the four criteria, rounded to the nearest half band
});
export type WritingReport = z.infer<typeof writingReportSchema>;

export const submitWritingInput = z.object({
  promptId: z.uuid(),
  essay: z.string().trim().min(1).max(10000),
});
export type SubmitWritingInput = z.infer<typeof submitWritingInput>;

export const gradeWritingInput = z.object({ submissionId: z.uuid() });

export const writingSubmissionSchema = z.object({
  id: z.uuid(),
  prompt: writingPromptSchema,
  essay: z.string(),
  submittedAt: timestamp,
  report: writingReportSchema.nullable(), // null = not graded yet, or grading failed and can be retried
});
export type WritingSubmission = z.infer<typeof writingSubmissionSchema>;

// A submission in a list. Students see their own, parents their linked children's.
export const writingSubmissionSummarySchema = z.object({
  id: z.uuid(),
  promptTitle: z.string(),
  submittedAt: timestamp,
  band: band.nullable(),
});
export type WritingSubmissionSummary = z.infer<typeof writingSubmissionSummarySchema>;
