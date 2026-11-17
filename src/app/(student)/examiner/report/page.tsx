import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import { DonutChart } from "@/components/charts";
import { PrintButton } from "@/components/print-button";
import { AIComment, Card, ProgressBar, SKILL_ICON } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { bandsAt, overallOf } from "@/lib/progress";
import { SKILLS, skillStyle } from "@/lib/skills";
import { listActivity } from "@/server/activity";
import { getMyLearningPath } from "@/server/learning-path";
import { getProfile } from "@/server/profile";

export const metadata: Metadata = { title: "Báo cáo band IELTS" };

export default function ReportPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải báo cáo…</p>}>
      <Report />
    </Suspense>
  );
}

async function Report() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const [activity, { path }] = await Promise.all([listActivity(), getMyLearningPath()]);
  const bands = bandsAt(activity);
  const overall = overallOf(bands);
  const latest = activity.find((a) => a.band !== null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4 border-b-2 border-skill-listening/50 pb-4">
        <div className="mr-auto flex items-center gap-3">
          <Link href="/mock-test" aria-label="Quay lại Phòng thi ảo" className="rounded-full p-1 hover:bg-white print:hidden">
            <ArrowLeft className="size-7" aria-hidden />
          </Link>
          <h1 className="text-3xl font-bold">Báo cáo kết quả IELTS</h1>
        </div>
        {latest && (
          <p className="font-semibold">
            Cập nhật: <time dateTime={latest.submittedAt}>{formatDate(latest.submittedAt)}</time>
          </p>
        )}
        <PrintButton label="Tải xuống PDF" variant="outline" />
      </div>

      <div className="grid items-center justify-items-center gap-6 lg:grid-cols-[auto_1fr] lg:justify-items-stretch">
        <DonutChart
          size={200}
          label={overall === null ? "Chưa đủ 4 kỹ năng để tính Overall" : `Overall Band Score ${band(overall)}`}
          segments={SKILLS.map((s) => ({ value: bands[s] ?? 0, color: skillStyle[s].color }))}
        >
          <div>
            <p className="text-xs font-semibold">Overall Band Score</p>
            <p className="text-4xl font-bold">{overall === null ? "–" : band(overall)}</p>
          </div>
        </DonutChart>
        <ul className="grid w-full grid-cols-2 gap-4 xl:grid-cols-4">
          {SKILLS.map((s) => {
            const Icon = SKILL_ICON[s];
            return (
              <li key={s}>
                <Card className="flex flex-col items-center gap-2">
                  <p className="flex items-center gap-2 text-lg">
                    <Icon className={`size-7 ${skillStyle[s].text}`} aria-hidden />
                    {skillStyle[s].label}
                  </p>
                  <p className="text-3xl font-bold tabular-nums">{bands[s] === null ? "–" : band(bands[s])}</p>
                  {bands[s] === null && <p className="text-sm text-muted">Chưa có kết quả</p>}
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <AIComment title="Nhận xét tổng quan từ AI">
          <p className="text-lg">
            {path?.studentComment ?? "Chưa có nhận xét. Hãy lập lộ trình học để AI phân tích kết quả của bạn."}
          </p>
        </AIComment>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">So sánh với mục tiêu</h2>
            <Link href="/path" className="flex items-center gap-1 text-sm hover:underline print:hidden">
              Xem lộ trình <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {profile.goalBand === null ? (
            <p className="text-muted">
              Bạn chưa đặt band mục tiêu.{" "}
              <Link href="/account" className="font-semibold text-brand-ink hover:underline">
                Đặt mục tiêu
              </Link>
            </p>
          ) : (
            <>
              <div className="flex justify-between">
                <span>Mục tiêu của bạn</span>
                <strong>{band(profile.goalBand)}</strong>
              </div>
              <ProgressBar
                value={overall ?? 0}
                max={profile.goalBand}
                label={`Hiện tại ${overall === null ? "chưa có" : band(overall)} trên mục tiêu ${band(profile.goalBand)}`}
              />
              <div className="flex justify-between">
                <span>Hiện tại</span>
                <strong>{overall === null ? "Chưa đủ 4 kỹ năng" : band(overall)}</strong>
              </div>
            </>
          )}
          {path && (
            <>
              <h3 className="mt-2 text-lg font-bold">Lộ trình cải thiện</h3>
              <ul className="flex flex-col gap-2 text-sm">
                {path.stages.slice(0, 3).map((stage, i) => (
                  <li key={i} className="flex gap-2">
                    <CircleCheck className={`size-5 shrink-0 ${skillStyle[stage.skills[0]].text}`} aria-hidden />
                    <span>
                      <strong>{stage.title}:</strong> {stage.goal} ({stage.weeks} tuần)
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
