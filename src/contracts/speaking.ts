// Contract for the AI Speaking examiner. FE and BE both import from here.
// The .describe() texts are sent to the model as part of the response schema, so they are instructions too.
import { z } from "zod";
import { bandSchema } from "@/contracts/writing";

const timestamp = z.iso.datetime({ offset: true });

export const MAX_RECORDING_SECONDS = 120;
const MAX_RECORDING_BYTES = 3 * 1024 * 1024;
// What browsers record: webm (Chrome, Firefox), ogg (Firefox), mp4 (Safari).
export const RECORDING_TYPES = ["audio/webm", "audio/ogg", "audio/mp4"] as const;

export const speakingPromptSchema = z.object({
  id: z.uuid(),
  part: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string(),
  prompt: z.string(),
});
export type SpeakingPrompt = z.infer<typeof speakingPromptSchema>;

const criterion = z.object({
  band: bandSchema.describe("IELTS band for this criterion, 0 to 9 in steps of 0.5"),
  comment: z.string().describe("2-3 sentences in Vietnamese justifying the band, citing what the candidate said"),
});

// What the model returns. The overall band is not here: the server computes it from the four criteria.
export const speakingAssessmentSchema = z.object({
  transcript: z
    .string()
    .describe("Verbatim English transcript of the recording, keeping hesitations, repetitions and mistakes; empty if there is no speech"),
  criteria: z.object({
    fluencyCoherence: criterion.describe("Fluency and Coherence"),
    lexicalResource: criterion.describe("Lexical Resource"),
    grammaticalRange: criterion.describe("Grammatical Range and Accuracy"),
    pronunciation: criterion.describe("Pronunciation, judged from the audio itself, not the transcript"),
  }),
  summary: z
    .string()
    .describe("Overall feedback in Vietnamese, 3-5 sentences: main strengths, then what to improve first"),
  errors: z
    .array(
      z.object({
        quote: z.string().describe("The exact words from the transcript that contain the problem, copied verbatim"),
        type: z.enum(["grammar", "vocabulary", "pronunciation", "fluency"]),
        explanation: z.string().describe("What is wrong, in Vietnamese, one sentence"),
        suggestion: z.string().describe("The corrected English wording, or how to pronounce it"),
      }),
    )
    .max(20)
    .describe("The most important problems, most serious first; empty if there are none"),
});
export type SpeakingAssessment = z.infer<typeof speakingAssessmentSchema>;

export const speakingReportSchema = speakingAssessmentSchema.extend({
  band: bandSchema, // mean of the four criteria, rounded to the nearest half band
});
export type SpeakingReport = z.infer<typeof speakingReportSchema>;

export const submitSpeakingInput = z.object({
  promptId: z.uuid(),
  audio: z.file().min(1).max(MAX_RECORDING_BYTES).mime([...RECORDING_TYPES]),
});

// The recording is saved even when grading fails; the page for this id then offers a retry.
export const submitSpeakingOutput = z.object({ id: z.uuid() });
export type SubmitSpeakingOutput = z.infer<typeof submitSpeakingOutput>;

export const gradeSpeakingInput = z.object({ submissionId: z.uuid() });

export const speakingSubmissionSchema = z.object({
  id: z.uuid(),
  prompt: speakingPromptSchema,
  audioUrl: z.url(), // short-lived signed URL
  submittedAt: timestamp,
  report: speakingReportSchema.nullable(), // null = not graded yet, or grading failed and can be retried
});
export type SpeakingSubmission = z.infer<typeof speakingSubmissionSchema>;

// A submission in a list. Students see their own, parents their linked children's.
export const speakingSubmissionSummarySchema = z.object({
  id: z.uuid(),
  promptTitle: z.string(),
  submittedAt: timestamp,
  band: bandSchema.nullable(),
});
export type SpeakingSubmissionSummary = z.infer<typeof speakingSubmissionSummarySchema>;
