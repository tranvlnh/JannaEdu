// Auth API for the UI. Pages import from @/server/* and never touch Supabase directly.
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/contracts/profile";
import { createClient } from "@/server/supabase/server";

// Once per request: every profile lookup starts here.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

// Where a signed-in user lands: their role's home, or onboarding until they pick a role.
export const homeOf = (role: Role | null) => (role === "parent" ? "/parent" : role === "student" ? "/home" : "/onboarding");

export async function signInWithGoogle() {
  "use server";
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  redirect(data.url ?? "/login?error=oauth");
}

export async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
