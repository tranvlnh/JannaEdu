import { Suspense } from "react";
import { getUser, signInWithGoogle, signOut } from "@/server/auth";

// Test-only page: shows login state and a Google sign-in button.
async function LoginState({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getUser();
  const { error } = await searchParams;

  return (
    <>
      {error && <p className="text-red-600">OAuth lỗi: {error}</p>}
      {user && <p>Đã đăng nhập: {user.email}</p>}
      <form action={user ? signOut : signInWithGoogle}>
        <button className="rounded border px-4 py-2">
          {user ? "Sign out" : "Sign in with Google"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <Suspense fallback={<p>Loading...</p>}>
        <LoginState searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
