import { NextResponse } from "next/server";
import { roleSchema } from "@/contracts/profile";
import { homeOf } from "@/server/auth";
import { createClient } from "@/server/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      const role = roleSchema.nullable().catch(null).parse(profile?.role ?? null);
      // Same-origin paths only: the result is appended to our own origin.
      const target = role && next?.startsWith("/") ? next : homeOf(role);
      return NextResponse.redirect(`${origin}${target}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
