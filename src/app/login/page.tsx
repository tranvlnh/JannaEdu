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
        <button className="btn">
          {user ? "Đăng xuất" : "Đăng nhập bằng Google"}
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
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <h1 className="page-title">
          Chào mừng đến <span className="text-brand">Janna Edu</span>
        </h1>
      <Suspense fallback={<p>Loading...</p>}>
        <LoginState searchParams={searchParams} />
      </Suspense>
      </div>
    </main>
  );
}
