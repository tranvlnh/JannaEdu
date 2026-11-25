// Account API for the UI: profile, role, parent-student linking.
import { randomInt } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  chooseRoleInput,
  linkCodeSchema,
  profileSchema,
  redeemLinkCodeInput,
  redeemLinkCodeOutput,
  setGoalBandInput,
  type LinkCode,
  type Profile,
  type RedeemLinkCodeOutput,
} from "@/contracts/profile";
import { getUser } from "@/server/auth";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

const COLUMNS = "id, role, fullName:full_name, avatarUrl:avatar_url, goalBand:goal_band, learningAccess:learning_access, baselineBand:baseline_band, baselineSource:baseline_source, placementStartedAt:placement_started_at";
const CHILD_COOKIE = "janna-child";
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // no 0/O, 1/I/L, U
const CODE_TTL_MS = 15 * 60 * 1000;
const REDEEM_LIMIT = 10; // wrong codes per parent per CODE_TTL_MS
// shortcut: in-memory, so it resets on restart and is per process; move to a table if we run more than one container.
const failedRedeems = new Map<string, number[]>();

async function loadProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select(COLUMNS).eq("id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return data && profileSchema.parse(data);
}

// Once per request: the header, the sidebar and the page all ask for it.
export const getProfile = cache(loadProfile);

// Parent: their linked students. Student: their linked parents. RLS does the filtering.
export async function getLinkedProfiles(): Promise<Profile[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select(COLUMNS).neq("id", user.id);
  if (error) throw new Error(error.message);
  return profileSchema.array().parse(data);
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login"); // session expired mid-visit: send to login, not the error page
  return profile;
}

export async function openDemoLearning() {
  "use server";
  const profile = await requireProfile();
  if (profile.role !== "student") redirect(profile.role === "parent" ? "/parent" : "/onboarding");
  if (!profile.learningAccess) {
    const { error } = await createAdminClient().from("profiles")
      .update({ learning_access: true }).eq("id", profile.id).eq("role", "student");
    if (error) throw new Error(error.message);
  }
  redirect("/dashboard");
}

export async function requireLearningAccess() {
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
  if (!profile.learningAccess) redirect("/onboarding");
  return profile;
}

export async function requireLearningReady() {
  const profile = await requireLearningAccess();
  if (profile.baselineBand === null) redirect("/onboarding");
  return { ...profile, baselineBand: profile.baselineBand };
}

export function isPlacementWork(profile: Profile, eligible: boolean) {
  if (profile.baselineBand !== null) return false;
  if (!profile.placementStartedAt || !eligible) redirect("/onboarding");
  return true;
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
  return (await loadProfile())!; // not the cached one: it still has role null
}

export async function setGoalBand(input: unknown): Promise<void> {
  "use server";
  const { goalBand } = setGoalBandInput.parse(input);
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
  const { error } = await createAdminClient().from("profiles").update({ goal_band: goalBand }).eq("id", profile.id);
  if (error) throw new Error(error.message);
}

// Parent: the linked child the /parent pages show. The cookie only picks among linked children, so it grants nothing.
export async function getSelectedChild(): Promise<{ child: Profile | null; children: Profile[] }> {
  const children = await getLinkedProfiles();
  const picked = (await cookies()).get(CHILD_COOKIE)?.value;
  return { child: children.find((c) => c.id === picked) ?? children[0] ?? null, children };
}

export async function selectChild(input: unknown): Promise<void> {
  "use server";
  const childId = z.uuid().parse(input);
  (await cookies()).set(CHILD_COOKIE, childId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
}

// Student creates a code for a parent to enter. A new code replaces the old one.
export async function createLinkCode(): Promise<LinkCode> {
  "use server";
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("forbidden");
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
  const failures = (failedRedeems.get(profile.id) ?? []).filter((t) => t > Date.now() - CODE_TTL_MS);
  if (failures.length >= REDEEM_LIMIT) throw new Error("too many attempts");
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
  if (!claim.data) {
    failedRedeems.set(profile.id, [...failures, Date.now()]);
    return { student: null };
  }

  const link = await admin
    .from("parent_links")
    .upsert({ parent_id: profile.id, student_id: claim.data.student_id }, { ignoreDuplicates: true });
  if (link.error) throw new Error(link.error.message);

  const student = await admin.from("profiles").select(COLUMNS).eq("id", claim.data.student_id).single();
  if (student.error) throw new Error(student.error.message);
  return redeemLinkCodeOutput.parse({ student: student.data });
}
