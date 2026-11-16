// Account API for the UI: profile, role, parent-student linking.
import { randomInt } from "node:crypto";
import {
  chooseRoleInput,
  linkCodeSchema,
  profileSchema,
  redeemLinkCodeInput,
  redeemLinkCodeOutput,
  type LinkCode,
  type Profile,
  type RedeemLinkCodeOutput,
} from "@/contracts/profile";
import { getUser } from "@/server/auth";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

const COLUMNS = "id, role, fullName:full_name";
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // no 0/O, 1/I/L, U
const CODE_TTL_MS = 15 * 60 * 1000;

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select(COLUMNS).eq("id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return data && profileSchema.parse(data);
}

// Parent: their linked students. Student: their linked parents. RLS does the filtering.
export async function getLinkedProfiles(): Promise<Profile[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select(COLUMNS).neq("id", user.id);
  if (error) throw new Error(error.message);
  return profileSchema.array().parse(data);
}

async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) throw new Error("unauthenticated");
  return profile;
}

// One-time: the role cannot be changed once set.
export async function chooseRole(input: unknown): Promise<Profile> {
  "use server";
  const { role } = chooseRoleInput.parse(input);
  const profile = await requireProfile();
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ role })
    .eq("id", profile.id)
    .is("role", null);
  if (error) throw new Error(error.message);
  return requireProfile();
}

// Student creates a code for a parent to enter. A new code replaces the old one.
export async function createLinkCode(): Promise<LinkCode> {
  "use server";
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
  // shortcut: no rate limit on redeem attempts (30^8 codes, 15 min TTL); add one if abuse shows up.
  const code = Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
  const { error } = await createAdminClient()
    .from("link_codes")
    .upsert({ code, student_id: profile.id, expires_at: expiresAt }, { onConflict: "student_id" });
  if (error) throw new Error(error.message);
  return linkCodeSchema.parse({ code, expiresAt });
}

export async function redeemLinkCode(input: unknown): Promise<RedeemLinkCodeOutput> {
  "use server";
  const { code } = redeemLinkCodeInput.parse(input);
  const profile = await requireProfile();
  if (profile.role !== "parent") throw new Error("forbidden");
  const admin = createAdminClient();

  // Deleting is the claim: two parents racing on one code cannot both win.
  const claim = await admin
    .from("link_codes")
    .delete()
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .select("student_id")
    .maybeSingle();
  if (claim.error) throw new Error(claim.error.message);
  if (!claim.data) return { student: null };

  const link = await admin
    .from("parent_links")
    .upsert({ parent_id: profile.id, student_id: claim.data.student_id }, { ignoreDuplicates: true });
  if (link.error) throw new Error(link.error.message);

  const student = await admin.from("profiles").select(COLUMNS).eq("id", claim.data.student_id).single();
  if (student.error) throw new Error(student.error.message);
  return redeemLinkCodeOutput.parse({ student: student.data });
}
