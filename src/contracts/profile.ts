// Contract for the account module. FE and BE both import from here.
import { z } from "zod";
import { bandSchema } from "@/contracts/writing";
import { featuredCourses } from "@/lib/courses";

export const roleSchema = z.enum(["student", "parent"]);
export type Role = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  id: z.uuid(),
  role: roleSchema.nullable(), // null until the user picks one at onboarding
  fullName: z.string().nullable(),
  avatarUrl: z.url().nullable(), // Google profile picture
  goalBand: bandSchema.nullable(), // the student's target band; null until they pick one
  enrolledCourse: z.string().nullable(), // course id from src/lib/courses.ts; null = not purchased
  currentBand: bandSchema.nullable(), // self-reported at onboarding, or the placement test result
  needsPlacement: z.boolean(), // picked "Tôi chưa biết" and has not finished the placement test
});
export type Profile = z.infer<typeof profileSchema>;

export const chooseRoleInput = z.object({ role: roleSchema });

export const GOAL_BANDS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
// Comes from a <select>, so the value arrives as a string.
export const setGoalBandInput = z.object({ goalBand: z.coerce.number().pipe(bandSchema.min(5)) });

export const CURRENT_BANDS = Array.from({ length: 19 }, (_, i) => i / 2); // 0 to 9
// "unknown" = the student does not know and takes the placement test.
export const setCurrentBandInput = z.object({
  currentBand: z.union([z.literal("unknown"), z.coerce.number().pipe(bandSchema)]),
});

export const enrollCourseInput = z.object({
  courseId: z.string().refine((id) => featuredCourses.some((c) => c.id === id), "unknown course"),
});

// Placement test: one flagged item per skill. Free, even without a course.
export const placementPartSchema = z.object({
  skill: z.enum(["reading", "listening", "writing", "speaking"]),
  itemId: z.uuid(), // test id (reading, listening) or prompt id (writing, speaking)
  title: z.string(),
  status: z.enum(["todo", "grading", "done"]), // grading = handed in, no band yet (AI grading failed and can be retried)
  band: z.number().min(0).max(9).nullable(),
  ungradedId: z.uuid().nullable(), // writing/speaking submission to retry grading for
});
export type PlacementPart = z.infer<typeof placementPartSchema>;
export const placementSchema = z.object({
  parts: z.array(placementPartSchema),
  overall: bandSchema.nullable(), // set once every part has a band
});
export type Placement = z.infer<typeof placementSchema>;

export const linkCodeSchema = z.object({
  code: z.string(),
  expiresAt: z.iso.datetime(),
});
export type LinkCode = z.infer<typeof linkCodeSchema>;

export const redeemLinkCodeInput = z.object({
  code: z.string().trim().toUpperCase().length(8),
});
// student is null when the code is wrong or expired.
export const redeemLinkCodeOutput = z.object({ student: profileSchema.nullable() });
export type RedeemLinkCodeOutput = z.infer<typeof redeemLinkCodeOutput>;
