import type { Metadata } from "next";
import { Suspense } from "react";
import { activeMonths, bandsAt, monthStats, overallOf, previousMonth } from "@/lib/progress";
import { listActivity, requestTime } from "@/server/activity";
import { getLearningPath } from "@/server/learning-path";
import { loadChild, NoChild } from "../child";
import { ReportView, type MonthlyReport } from "./report-view";

export const metadata: Metadata = { title: "Báo cáo học tập" };

export default function ParentReportPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải báo cáo…</p>}>
      <Report />
    </Suspense>
  );
}

async function Report() {
  const child = await loadChild();
  if (!child) return <NoChild />;
  const [activity, path] = await Promise.all([listActivity(child.id), getLearningPath(child.id)]);

  const reports: MonthlyReport[] = activeMonths(activity, requestTime()).map((m) => {
    const scores = bandsAt(activity, m.to - 1);
    const previousScores = bandsAt(activity, previousMonth(m).to - 1);
    return {
      key: m.key,
      month: m.month,
      year: m.year,
      from: new Date(m.from).toISOString(),
      to: new Date(m.to - 1).toISOString(),
      stats: monthStats(activity, m),
      scores,
      previousScores,
      overall: overallOf(scores),
      previousOverall: overallOf(previousScores),
    };
  });

  return <ReportView reports={reports} goalBand={child.goalBand} comment={path?.parentComment ?? null} />;
}
