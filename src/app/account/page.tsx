import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut, Target } from "lucide-react";
import { GOAL_BANDS, redeemLinkCodeInput } from "@/contracts/profile";
import { Button, Card } from "@/components/ui";
import { band } from "@/lib/format";
import { homeOf, signOut } from "@/server/auth";
import { createLinkCode, getLinkedProfiles, getProfile, redeemLinkCode, selectChild, setGoalBand } from "@/server/profile";
import { CreateCodeForm, RedeemCodeForm } from "./link-forms";

export const metadata: Metadata = { title: "Tài khoản & cài đặt" };

async function createCode() {
  "use server";
  return createLinkCode();
}

async function redeemCode(_prev: string | null, formData: FormData) {
  "use server";
  const input = redeemLinkCodeInput.safeParse({ code: formData.get("code") });
  if (!input.success) return "Mã phải có đúng 8 ký tự.";
  let student;
  try {
    ({ student } = await redeemLinkCode(input.data));
  } catch (error) {
    if (error instanceof Error && error.message === "too many attempts") return "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.";
    throw error;
  }
  if (!student) return "Mã sai hoặc đã hết hạn.";
  await selectChild(student.id);
  redirect("/parent");
}

async function saveGoal(formData: FormData) {
  "use server";
  await setGoalBand({ goalBand: formData.get("goalBand") });
  redirect("/account");
}

async function viewChild(formData: FormData) {
  "use server";
  await selectChild(formData.get("child"));
  redirect("/parent");
}

async function Account() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.role) redirect(homeOf(null));
  const isStudent = profile.role === "student";
  const linked = await getLinkedProfiles();

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">{profile.fullName ?? "Tài khoản"}</h1>
        <p className="mt-2 text-lg">{isStudent ? "Học sinh" : "Phụ huynh"}</p>
      </div>

      {isStudent && (
        <Card>
          <form action={saveGoal} className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-xl font-bold">
                <Target className="size-6 text-brand-ink" aria-hidden />
                Band mục tiêu
              </span>
              <select
                name="goalBand"
                defaultValue={profile.goalBand ?? 6.5}
                className="rounded-xl border-2 border-navy/20 bg-white px-4 py-2.5 text-lg font-medium focus-visible:outline-2 focus-visible:outline-brand"
              >
                {GOAL_BANDS.map((b) => (
                  <option key={b} value={b}>
                    IELTS {band(b)}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit">Lưu mục tiêu</Button>
            <p className="w-full text-sm text-muted">
              {profile.goalBand === null ? "Bạn chưa đặt mục tiêu." : `Mục tiêu hiện tại: IELTS ${band(profile.goalBand)}.`} Lộ trình và
              báo cáo so sánh kết quả của bạn với mục tiêu này.
            </p>
          </form>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
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
                  <form action={viewChild}>
                    <input type="hidden" name="child" value={p.id} />
                    <Button type="submit" variant="outline">
                      {p.fullName ?? "(chưa có tên)"} · xem tổng quan học tập <ArrowRight className="size-5" aria-hidden />
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>{isStudent ? <CreateCodeForm action={createCode} /> : <RedeemCodeForm action={redeemCode} />}</Card>

      <form action={signOut}>
        <Button type="submit" variant="outline">
          <LogOut className="size-5" aria-hidden />
          Đăng xuất
        </Button>
      </form>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
        <Account />
      </Suspense>
    </div>
  );
}
