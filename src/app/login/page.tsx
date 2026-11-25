import { Suspense } from "react";
import { Button } from "@/components/ui";
import { getUser, homeOf, signInWithGoogle, signOut } from "@/server/auth";

import { getProfile } from "@/server/profile";
async function LoginState({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getUser();
  const { error } = await searchParams;
  const profile = user ? await getProfile() : null;

  return (
    <>
      {error && <p className="text-danger-ink">OAuth lỗi: {error}</p>}
      {user && <>
        <p>Đã đăng nhập: {user.email}</p>
        <Button href={homeOf(profile?.role ?? null)}>Tiếp tục</Button>
      </>}
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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-linear-to-br from-surface to-surface-deep p-4">
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <h1 className="page-title">
          Chào mừng đến <span className="text-brand-ink">Janna Edu</span>
        </h1>
      <Suspense fallback={<p>Loading...</p>}>
        <LoginState searchParams={searchParams} />
      </Suspense>
      </div>
    </main>
  );
}
