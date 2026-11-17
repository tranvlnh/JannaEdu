import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { ActivityList } from "@/components/activity-list";
import { DonutChart, LineChart } from "@/components/charts";
import { Card, CardTitle, Delta, Pill, ProgressBar } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { bandSeries, bandsAt, lastMonths, overallOf } from "@/lib/progress";
import { SKILLS, skillStyle } from "@/lib/skills";
import { listActivity, requestTime } from "@/server/activity";
import { childName, loadChild, NoChild } from "./child";

const ACTIVE_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

export default function ParentHomePage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const child = await loadChild();
  if (!child) return <NoChild />;
  const activity = await listActivity(child.id);
  const now = requestTime();
  const name = childName(child);
  const bands = bandsAt(activity);
  const overall = overallOf(bands);
  const monthAgo = overallOf(bandsAt(activity, now - 30 * DAY));
  const months = lastMonths(now, 6);
  const series = bandSeries(activity, months.map((m) => Math.min(now, m.to - 1)));
  const active = activity.some((a) => now - Date.parse(a.submittedAt) < ACTIVE_DAYS * DAY);
  const first = activity.at(-1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Tổng quan học tập của con</h1>
        <p className="mt-3 text-lg font-semibold">Xin chào, Anh/Chị!</p>
        <p className="text-lg">Dưới đây là tổng quan về tình hình học tập của {name} trong chương trình luyện thi IELTS tại Janna Edu.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr_0.8fr]">
        <Card className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <span aria-hidden className="grid size-28 place-items-center rounded-full bg-brand-soft text-4xl font-bold text-brand-ink">
              {name.split(" ").at(-1)?.[0]}
            </span>
            <Pill tone={active ? "success" : "neutral"} className="px-5 py-1.5 text-base">
              {active ? "Đang học" : "Chưa học gần đây"}
            </Pill>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p>
              Trình độ hiện tại: <strong>{overall === null ? "chưa đủ 4 kỹ năng" : `Band ${band(overall)}`}</strong>
            </p>
            <p>{first ? `Bài đầu tiên: ${formatDate(first.submittedAt)}` : "Con chưa nộp bài nào."}</p>
            <p>Đã nộp {activity.length} bài</p>
          </div>
        </Card>

        <Card>
          <CardTitle>Điểm IELTS hiện tại</CardTitle>
          <div className="flex flex-wrap items-center gap-6">
            <DonutChart
              size={150}
              label={overall === null ? "Chưa đủ 4 kỹ năng để tính Overall" : `Overall ${band(overall)}`}
              segments={SKILLS.map((s) => ({ value: bands[s] ?? 0, color: skillStyle[s].color }))}
            >
              <p className="text-3xl font-bold">{overall === null ? "–" : band(overall)}</p>
            </DonutChart>
            <dl className="flex flex-1 flex-col gap-2">
              {SKILLS.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`size-3.5 rounded-full ${skillStyle[s].bg}`} aria-hidden />
                  <dt className="flex-1">{skillStyle[s].label}</dt>
                  <dd className="font-bold tabular-nums">{bands[s] === null ? "–" : band(bands[s])}</dd>
                </div>
              ))}
            </dl>
          </div>
          {overall !== null && monthAgo !== null && (
            <div className="mt-4">
              <Delta value={overall - monthAgo} suffix="so với 30 ngày trước" />
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Mục tiêu của con</h2>
          <Link
            href="/parent/path"
            className="flex flex-1 items-center gap-3 rounded-2xl bg-surface p-5 transition-colors hover:bg-surface-deep focus-visible:outline-2 focus-visible:outline-brand"
          >
            <div className="flex-1">
              {child.goalBand === null ? (
                <p className="text-xl font-bold">Con chưa đặt mục tiêu</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">BAND {band(child.goalBand)}</p>
                  <ProgressBar
                    value={overall ?? 0}
                    max={child.goalBand}
                    label={`Đạt ${overall === null ? "chưa có" : band(overall)} trên mục tiêu ${band(child.goalBand)}`}
                    className="mt-3 h-4"
                  />
                </>
              )}
              <p className="mt-2 text-sm text-muted">Xem lộ trình của con</p>
            </div>
            <ChevronRight className="size-8" aria-hidden />
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardTitle>Tiến độ học tập 6 tháng gần nhất</CardTitle>
          <LineChart
            title="Band theo tháng"
            labels={months.map((m) => `Tháng ${m.month}`)}
            domain={[3, 9]}
            series={[
              { name: "Overall", color: "var(--color-navy)", values: series.overall },
              ...SKILLS.map((s) => ({ name: skillStyle[s].label, color: skillStyle[s].color, values: series[s] })),
            ]}
          />
        </Card>

        <Card>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <ActivityList activity={activity.slice(0, 5)} empty="Con chưa nộp bài nào." />
        </Card>
      </div>
    </div>
  );
}
