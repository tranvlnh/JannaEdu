// Contract for the account module. FE and BE both import from here.
import { z } from "zod";
import { bandSchema } from "@/contracts/writing";

export const roleSchema = z.enum(["student", "parent"]);
export type Role = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  id: z.uuid(),
  role: roleSchema.nullable(), // null until the user picks one at onboarding
  fullName: z.string().nullable(),
  avatarUrl: z.url().nullable(), // Google profile picture
  learningAccess: z.boolean(),
  baselineBand: bandSchema.nullable(),
  baselineSource: z.enum(["self", "placement", "previous"]).nullable(),
  placementStartedAt: z.iso.datetime({ offset: true }).nullable(),
  goalBand: bandSchema.nullable(), // the student's target band; null until they pick one
});
export type Profile = z.infer<typeof profileSchema>;

export const chooseRoleInput = z.object({ role: roleSchema });

export const GOAL_BANDS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
// Comes from a <select>, so the value arrives as a string.
export const setGoalBandInput = z.object({ goalBand: z.coerce.number().pipe(bandSchema.min(5)) });

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

export const baselineInput = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("self"), band: z.string().regex(/^[0-9](?:\.[05])?$/).transform(Number).pipe(bandSchema) }),
  z.object({ mode: z.literal("placement") }),
]);

export const PLACEMENT = [
  { skill: "reading", id: "00000000-0000-4000-8000-000000000011", href: "/mock-test/00000000-0000-4000-8000-000000000011" },
  { skill: "listening", id: "00000000-0000-4000-8000-000000000021", href: "/mock-test/00000000-0000-4000-8000-000000000021" },
  { skill: "writing", id: "00000000-0000-4000-8000-000000000111", href: "/examiner/writing/00000000-0000-4000-8000-000000000111" },
  { skill: "speaking", id: "00000000-0000-4000-8000-000000000213", href: "/examiner/00000000-0000-4000-8000-000000000213" },
] as const;
