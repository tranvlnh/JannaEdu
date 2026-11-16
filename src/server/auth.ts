// Auth API for the UI. Pages import from @/server/* and never touch Supabase directly.
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/server/supabase/server";

export async function getUser() {
  await connection(); // supabase getUser() reads Date.now(); must run at request time
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signInWithGoogle() {
  "use server";
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/account` },
  });
  redirect(data.url ?? "/login?error=oauth");
}

export async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
