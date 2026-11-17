import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { redeemLinkCodeInput } from "@/contracts/profile";
import { signOut } from "@/server/auth";
import { createLinkCode, getLinkedProfiles, getProfile, redeemLinkCode } from "@/server/profile";
import { ArrowRight, Mic, NotebookPen, PenLine, Route, type LucideIcon } from "lucide-react";
import { CreateCodeForm, RedeemCodeForm } from "./link-forms";

const STUDENT_LINKS: [string, string, string, LucideIcon][] = [
  ["/mock-test", "Phòng thi ảo", "Reading, Listening có đếm giờ", NotebookPen],
  ["/writing", "Writing", "Viết bài, AI chấm band", PenLine],
  ["/examiner", "Speaking", "Ghi âm, AI chấm band", Mic],
  ["/path", "Lộ trình học", "AI gợi ý từ kết quả thi", Route],
];

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
      <header>
        <h1 className="page-title">{profile.fullName ?? "Tài khoản"}</h1>
        <p className="mt-1 text-lg">{isStudent ? "Học sinh" : "Phụ huynh"}</p>
      </header>

      <section className="card flex flex-col gap-3">
        <h2 className="text-xl font-bold">{isStudent ? "Phụ huynh đã liên kết" : "Con đã liên kết"}</h2>
        {linked.length === 0 ? (
          <p className="text-muted">Chưa có liên kết nào.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {linked.map((p) => (
              <li key={p.id}>
                {isStudent ? (
                  (p.fullName ?? "(chưa có tên)")
                ) : (
                  <Link href="/parent" className="btn">
                    {p.fullName ?? "(chưa có tên)"} · xem tổng quan học tập <ArrowRight className="size-5" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">{isStudent ? <CreateCodeForm action={createCode} /> : <RedeemCodeForm action={redeemCode} />}</section>

      {isStudent && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Bắt đầu luyện tập</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {STUDENT_LINKS.map(([href, title, text, Icon]) => (
              <li key={href}>
                <Link href={href} className="card flex h-full items-center gap-4 hover:shadow-lg">
                  <Icon className="size-10 shrink-0 text-brand-ink" aria-hidden />
                  <span>
                    <span className="block text-lg font-bold">{title}</span>
                    <span className="text-sm text-muted">{text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={signOut}>
        <button className="btn-outline">Đăng xuất</button>
      </form>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Account />
      </Suspense>
    </div>
  );
}
