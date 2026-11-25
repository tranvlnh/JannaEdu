import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
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

  if (!user && !isPublic) {
    // Relative Location: behind Docker/tunnel request.url is http://0.0.0.0:3000.
    return new NextResponse(null, { status: 307, headers: { Location: "/login" } });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
