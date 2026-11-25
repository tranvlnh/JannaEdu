import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui";
import { GOAL_BANDS } from "@/contracts/profile";
import { band } from "@/lib/format";
import { homeOf, signOut } from "@/server/auth";
import { skillStyle } from "@/lib/skills";
import { finishPlacement, placementStatus, setBaseline } from "@/server/placement";
import { chooseRole, getProfile, openDemoLearning, setGoalBand } from "@/server/profile";

async function pickRole(formData: FormData) {
  "use server";
  await chooseRole({ role: formData.get("role") });
  redirect("/onboarding"); // students go on to pick a goal band; parents are sent home from there
}

async function pickGoal(formData: FormData) {
  "use server";
  await setGoalBand({ goalBand: formData.get("goalBand") });
  redirect("/onboarding");
}

async function chooseBaseline(formData: FormData) {
  "use server";
  await setBaseline({ mode: formData.get("mode"), band: formData.get("band") });
  redirect("/onboarding");
}

async function completePlacement() {
  "use server";
  await finishPlacement();
  redirect("/onboarding");
}

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

  if (!profile.learningAccess) {
    return (
      <section className="card flex w-full max-w-lg flex-col items-start gap-4 p-8">
        <h1 className="page-title">Mở khóa học</h1>
        <form action={openDemoLearning}>
          <Button type="submit">Thanh toán (demo)</Button>
        </form>
        <Button href="/courses" variant="outline">Xem các khóa học</Button>
        <form action={signOut}><button className="underline">Đăng xuất</button></form>
      </section>
    );
  }

  if (profile.baselineBand !== null) redirect(homeOf("student"));
  if (profile.placementStartedAt) {
    const { items, overall } = await placementStatus(profile.id, true);
    return (
      <section className="card flex w-full max-w-xl flex-col gap-4 p-8">
        <h1 className="page-title">Kiểm tra năng lực đầu vào</h1>
        <p>Hoàn thành bốn kỹ năng để nhận band IELTS ước tính và bắt đầu học.</p>
        <ul className="divide-y divide-navy/10">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="font-semibold">{skillStyle[item.skill].label}{item.band !== null && ` · Band ${band(item.band)}`}</span>
              <Button href={item.resultHref ?? item.href} variant="outline">
                {item.band !== null ? "Xem kết quả" : item.resultHref ? "Xem trạng thái chấm" : "Làm hoặc tiếp tục bài"}
              </Button>
            </li>
          ))}
        </ul>
        {overall !== null && (
          <form action={completePlacement} className="flex flex-wrap items-center gap-3">
            <strong>Band đầu vào ước tính: {band(overall)}</strong>
            <Button type="submit">Vào trang học</Button>
          </form>
        )}
      </section>
    );
  }

  if (profile.goalBand !== null) {
    return (
      <section className="card flex w-full max-w-lg flex-col gap-5 p-8">
        <h1 className="page-title">Band IELTS hiện tại của bạn?</h1>
        <form action={chooseBaseline} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-2">
            Band hiện tại
            <select name="band" className="rounded-lg border border-navy/30 bg-white p-2" required defaultValue="">
              <option value="" disabled>Chọn band</option>
              {Array.from({ length: 19 }, (_, i) => i / 2).map((value) => (
                <option key={value} value={value}>{band(value)}</option>
              ))}
            </select>
          </label>
          <Button type="submit" name="mode" value="self">Lưu band tự khai</Button>
        </form>
        <form action={chooseBaseline}>
          <p className="mb-2">Chọn kiểm tra đầu vào nếu bạn chưa biết band của mình.</p>
          <Button type="submit" variant="outline" name="mode" value="placement">Tôi chưa biết band</Button>
        </form>
      </section>
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
          className="rounded-xl border-2 border-navy/20 bg-white px-4 py-2.5 text-lg font-medium focus-visible:outline-2 focus-visible:outline-brand"
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
