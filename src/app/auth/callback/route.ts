import { NextResponse } from "next/server";
import { roleSchema } from "@/contracts/profile";
import { homeOf } from "@/server/auth";
import { createClient } from "@/server/supabase/server";

// Relative Location: behind Docker/tunnel request.url is http://0.0.0.0:3000, so the browser must resolve the host.
const redirectTo = (path: string) => new NextResponse(null, { status: 307, headers: { Location: path } });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
      // Same-origin paths only; "//" would be protocol-relative to another host.
      const target = role && next?.startsWith("/") && !next.startsWith("//") ? next : homeOf(role);
      return redirectTo(target);
    }
  }
  return redirectTo("/login?error=oauth");
}
