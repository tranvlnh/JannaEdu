import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui";
import { CURRENT_BANDS, GOAL_BANDS } from "@/contracts/profile";
import { band } from "@/lib/format";
import { homeOf } from "@/server/auth";
import { chooseRole, getProfile, setCurrentBand, setGoalBand } from "@/server/profile";

async function pickRole(formData: FormData) {
  "use server";
  await chooseRole({ role: formData.get("role") });
  redirect("/onboarding"); // students go on to pick a goal band; parents are sent home from there
}

async function pickGoal(formData: FormData) {
  "use server";
  await setGoalBand({ goalBand: formData.get("goalBand") });
  redirect("/onboarding"); // next: the current band
}

async function pickCurrent(formData: FormData) {
  "use server";
  const currentBand = formData.get("unknown") ? "unknown" : formData.get("currentBand");
  await setCurrentBand({ currentBand });
  redirect(currentBand === "unknown" ? "/placement" : homeOf("student"));
}

const SELECT =
  "rounded-xl border-2 border-navy/20 bg-white px-4 py-2.5 text-lg font-medium focus-visible:outline-2 focus-visible:outline-brand";

async function Steps() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (!profile.role) {
    return (
      <form action={pickRole} className="card flex flex-col items-center gap-4 p-10">
        <h1 className="page-title">Bạn là ai?</h1>
        <p className="text-sm text-muted">Lựa chọn này không đổi lại được.</p>
        <div className="flex gap-4">
          <button name="role" value="student" className="btn px-8 py-3 text-lg">
            Học sinh
          </button>
          <button name="role" value="parent" className="btn px-8 py-3 text-lg">
            Phụ huynh
          </button>
        </div>
      </form>
    );
  }
  if (profile.role !== "student") redirect(homeOf(profile.role));
  if (profile.goalBand !== null) {
    if (profile.needsPlacement) redirect("/placement");
    if (profile.currentBand !== null) redirect(homeOf(profile.role));
    return (
      <form action={pickCurrent} className="card flex flex-col items-center gap-4 p-10">
        <h1 className="page-title">Band hiện tại của bạn?</h1>
        <label className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted">Band IELTS gần nhất bạn đạt được hoặc tự đánh giá.</span>
          <select name="currentBand" defaultValue={5} className={SELECT}>
            {CURRENT_BANDS.map((b) => (
              <option key={b} value={b}>
                IELTS {band(b)}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Tiếp tục</Button>
        <p className="text-sm text-muted">hoặc</p>
        <Button type="submit" name="unknown" value="1" variant="outline">
          Tôi chưa biết, làm bài kiểm tra xếp lớp
        </Button>
        <p className="max-w-sm text-center text-sm text-muted">Bài kiểm tra gồm 4 kỹ năng, miễn phí. Bạn cần làm xong trước khi vào các trang khác.</p>
      </form>
    );
  }

  return (
    <form action={pickGoal} className="card flex flex-col items-center gap-4 p-10">
      <h1 className="page-title">Mục tiêu của bạn?</h1>
      <label className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted">Band IELTS bạn muốn đạt. Có thể đổi sau trong Tài khoản.</span>
        <select
          name="goalBand"
          defaultValue={6.5}
          className={SELECT}
        >
          {GOAL_BANDS.map((b) => (
            <option key={b} value={b}>
              IELTS {band(b)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit">Bắt đầu</Button>
    </form>
  );
}

export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-linear-to-br from-surface to-surface-deep p-4">
      <Suspense fallback={<p>Loading...</p>}>
        <Steps />
      </Suspense>
    </main>
  );
}
