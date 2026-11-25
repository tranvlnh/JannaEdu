// Contract for the learning path. FE and BE both import from here.
// The .describe() texts are sent to the model as part of the response schema, so they are instructions too.
import { z } from "zod";
import { bandSchema } from "@/contracts/writing";

export const pathSkillSchema = z.enum(["reading", "listening", "writing", "speaking"]);
export type PathSkill = z.infer<typeof pathSkillSchema>;

// What the model returns. Bands are not here: the server reads them from the student's results.
export const learningPlanSchema = z.object({
  studentComment: z
    .string()
    .describe("To the student, in Vietnamese, 3-5 sentences: where they stand, their strongest and weakest points, what to do first"),
  parentComment: z
    .string()
    .describe("To the student's parent, in Vietnamese, 3-5 sentences in plain language without IELTS jargon: current level, progress, how to support the child"),
  stages: z
    .array(
      z.object({
        title: z.string().describe("Short stage name in Vietnamese"),
        weeks: z.int().min(1).max(8).describe("Length of the stage in weeks"),
        skills: z.array(pathSkillSchema).min(1).describe("The skills this stage trains"),
        goal: z.string().describe("One sentence in Vietnamese: what the student can do at the end of the stage"),
        tasks: z.array(z.string()).min(1).max(6).describe("Concrete weekly tasks in Vietnamese"),
      }),
    )
    .min(1)
    .max(5)
    .describe("Stages in study order, weakest areas first; at most 12 weeks in total"),
  bookAdvice: z
    .array(
      z.object({
        skill: pathSkillSchema.describe("The book, named by its skill"),
        reason: z.string().describe("To the student, one sentence in Vietnamese: why this book, based on their results"),
      }),
    )
    .max(2)
    .describe("Janna Academy publishes one self-study book per skill, each for bands 5.0-6.5. The books this student should start with, most useful first; empty when their results are already above 6.5 in every skill"),
});
export type LearningPlan = z.infer<typeof learningPlanSchema>;

// bookAdvice is optional here only: paths stored before it existed do not have it.
export const learningPathSchema = learningPlanSchema.partial({ bookAdvice: true }).extend({
  bands: z.record(pathSkillSchema, bandSchema.nullable()), // latest band per skill; null = no result yet
  overall: bandSchema.nullable(), // null until all four skills have a result
  generatedAt: z.iso.datetime({ offset: true }),
});
export type LearningPath = z.infer<typeof learningPathSchema>;

// The student's own page: the current path, and whether results newer than it exist.
export const myLearningPathSchema = z.object({
  path: learningPathSchema.nullable(),
  canGenerate: z.boolean(),
});
export type MyLearningPath = z.infer<typeof myLearningPathSchema>;
