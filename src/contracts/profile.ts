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
