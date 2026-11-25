import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PLACEMENT } from "@/contracts/profile";
import type { Database } from "@/server/supabase/database.types";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Default-deny: new pages need login unless listed here, so FE never edits this file.
  const { pathname } = request.nextUrl;
  const isPublic = ["/", "/login", "/courses"].includes(pathname) || pathname.startsWith("/auth/");

  const redirectTo = (destination: string, status: 303 | 307) => {
    const redirected = NextResponse.redirect(new URL(destination, request.url), status);
    for (const cookie of response.cookies.getAll()) redirected.cookies.set(cookie);
    return redirected;
  };

  if (!user && !isPublic) return redirectTo("/login", 307);
  if (user && !isPublic && pathname !== "/onboarding" && pathname !== "/account") {
    const { data: profile, error } = await supabase.from("profiles")
      .select("role, learning_access, baseline_band, placement_started_at").eq("id", user.id).maybeSingle();
    if (error) throw new Error(error.message);
    const result = /^\/(?:mock-test\/result|examiner(?:\/writing)?\/analysis)\/[^/]+$/.test(pathname);
    const placementPage = result || PLACEMENT.some((item) => item.href === pathname);
    const parentPage = pathname === "/parent" || pathname.startsWith("/parent/");
    const destination = !profile?.role ? "/onboarding"
      : profile.role === "student" && (!profile.learning_access ||
        (profile.baseline_band === null && pathname !== "/dashboard" &&
          !(profile.placement_started_at && placementPage))) ? "/onboarding"
      : profile.role === "parent" && !parentPage && !result ? "/parent"
      : profile.role === "student" && parentPage ? "/dashboard"
      : null;
    if (destination) return redirectTo(destination, 303);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
