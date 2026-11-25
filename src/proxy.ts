import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accessRedirect, type AccessFacts } from "@/lib/access";
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

  let facts: AccessFacts | null = null;
  if (user) {
    // RLS returns the user's own row plus linked ones: a parent's children, a student's parents.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, goal_band, current_band, needs_placement, enrolled_course");
    if (error) throw new Error(error.message);
    const own = data.find((p) => p.id === user.id);
    const role = own?.role === "student" || own?.role === "parent" ? own.role : null;
    facts = {
      role,
      onboarded: !!own && own.goal_band !== null && (own.current_band !== null || own.needs_placement),
      needsPlacement: !!own?.needs_placement,
      enrolled: !!own?.enrolled_course,
      childEnrolled: role === "parent" && data.some((p) => p.id !== user.id && !!p.enrolled_course),
    };
  }

  // Default-deny for anonymous users: new pages need login unless listed in src/lib/access.ts.
  const target = accessRedirect(request.nextUrl.pathname, facts);
  if (target) {
    // Relative Location: behind Docker/tunnel request.url is http://0.0.0.0:3000.
    const redirect = new NextResponse(null, { status: 307, headers: { Location: target } });
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c)); // keep a session refreshed above
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
