// Contract for the account module. FE and BE both import from here.
import { z } from "zod";

export const roleSchema = z.enum(["student", "parent"]);
export type Role = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  id: z.uuid(),
  role: roleSchema.nullable(), // null until the user picks one at onboarding
  fullName: z.string().nullable(),
});
export type Profile = z.infer<typeof profileSchema>;

export const chooseRoleInput = z.object({ role: roleSchema });

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
