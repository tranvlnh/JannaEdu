import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { redeemLinkCodeInput } from "@/contracts/profile";
import { signOut } from "@/server/auth";
import { createLinkCode, getLinkedProfiles, getProfile, redeemLinkCode } from "@/server/profile";
import { CreateCodeForm, RedeemCodeForm } from "./link-forms";

const STUDENT_LINKS = [
  ["/tests", "Phòng thi", "Reading, Listening có đếm giờ"],
  ["/writing", "Writing", "Viết bài, AI chấm band"],
  ["/speaking", "Speaking", "Ghi âm, AI chấm band"],
  ["/learning-path", "Lộ trình học", "AI gợi ý từ kết quả thi"],
] as const;

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
              <li key={p.id}>
                {isStudent ? (
                  (p.fullName ?? "(chưa có tên)")
                ) : (
                  <Link href={`/children/${p.id}`} className="underline">
                    {p.fullName ?? "(chưa có tên)"} · xem kết quả và lộ trình
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isStudent ? <CreateCodeForm action={createCode} /> : <RedeemCodeForm action={redeemCode} />}

      {isStudent && (
        <section>
          <h2 className="font-semibold">Bắt đầu luyện tập</h2>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {STUDENT_LINKS.map(([href, title, text]) => (
              <li key={href}>
                <Link href={href} className="block h-full rounded-lg border p-4 hover:border-orange-600 hover:bg-orange-50">
                  <span className="font-medium">{title} →</span>
                  <br />
                  <span className="text-sm text-zinc-600">{text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={signOut}>
        <button className="rounded border px-4 py-2">Sign out</button>
      </form>
    </>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Account />
      </Suspense>
    </main>
  );
}
