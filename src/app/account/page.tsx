import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { redeemLinkCodeInput } from "@/contracts/profile";
import { signOut } from "@/server/auth";
import { createLinkCode, getLinkedProfiles, getProfile, redeemLinkCode } from "@/server/profile";
import { CreateCodeForm, RedeemCodeForm } from "./link-forms";

async function createCode() {
  "use server";
  return createLinkCode();
}

async function redeemCode(_prev: string | null, formData: FormData) {
  "use server";
  const input = redeemLinkCodeInput.safeParse({ code: formData.get("code") });
  if (!input.success) return "Mã phải có đúng 8 ký tự.";
  const { student } = await redeemLinkCode(input.data);
  if (!student) return "Mã sai hoặc đã hết hạn.";
  redirect("/account"); // re-render with the new link in the list
}

async function Account() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.role) redirect("/onboarding");
  const isStudent = profile.role === "student";
  const linked = await getLinkedProfiles();

  return (
    <>
      <h1 className="text-xl font-semibold">{profile.fullName ?? "Tài khoản"}</h1>
      <p>Vai trò: {isStudent ? "Học sinh" : "Phụ huynh"}</p>

      <section>
        <h2 className="font-semibold">{isStudent ? "Phụ huynh đã liên kết" : "Con đã liên kết"}</h2>
        {linked.length === 0 ? (
          <p className="text-sm text-zinc-600">Chưa có liên kết nào.</p>
        ) : (
          <ul className="list-disc pl-5">
            {linked.map((p) => (
              <li key={p.id}>{p.fullName ?? "(chưa có tên)"}</li>
            ))}
          </ul>
        )}
      </section>

      {isStudent ? <CreateCodeForm action={createCode} /> : <RedeemCodeForm action={redeemCode} />}

      <Link href="/tests" className="underline">
        {isStudent ? "Vào phòng thi" : "Xem bài đã nộp của con"}
      </Link>

      <form action={signOut}>
        <button className="rounded border px-4 py-2">Sign out</button>
      </form>
    </>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Account />
      </Suspense>
    </main>
  );
}
