"use client";

import { useState } from "react";
import { Bot, FileText, NotebookPen } from "lucide-react";
import { LineChart } from "@/components/charts";
import { Card, CardTitle, Delta, Select, StatCard } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import type { Bands, monthStats } from "@/lib/progress";
import { SKILLS, skillStyle } from "@/lib/skills";
import { SkillPerformance } from "../skill-performance";

export type MonthlyReport = {
  key: string;
  month: number;
  year: number;
  from: string; // ISO, first day
  to: string; // ISO, last day
  stats: ReturnType<typeof monthStats>;
  scores: Bands; // at the end of the month
  previousScores: Bands; // at the end of the month before
  overall: number | null;
  previousOverall: number | null;
};

const PREV = "so với tháng trước";

export function ReportView({ reports, goalBand, comment }: { reports: MonthlyReport[]; goalBand: number | null; comment: string | null }) {
  const [key, setKey] = useState(reports[0].key);
  const r = reports.find((x) => x.key === key) ?? reports[0];
  const st = r.stats;
  const prevMonth = r.month === 1 ? 12 : r.month - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Báo cáo học tập tháng {r.month}</h1>
          <p className="mt-2 text-lg">
            (Từ {formatDate(r.from)} – {formatDate(r.to)})
          </p>
        </div>
        <Select aria-label="Chọn tháng" value={key} onChange={(e) => setKey(e.target.value)} className="w-52">
          {reports.map((x) => (
            <option key={x.key} value={x.key}>
              Tháng {x.month}/{x.year}
            </option>
          ))}
        </Select>
      </div>

      <p role="status" className="sr-only">
        Đang xem báo cáo tháng {r.month}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={NotebookPen} iconClass="bg-skill-reading/15 text-skill-reading-ink" label="Số bài hoàn thành" value={st.completed.value} unit="bài">
          <Delta value={st.completed.delta} suffix={`bài ${PREV}`} />
        </StatCard>
        <StatCard icon={FileText} iconClass="bg-skill-listening/15 text-skill-listening-ink" label="Mock test đã làm" value={st.exams.value} unit="lần">
          <Delta value={st.exams.delta} suffix={`lần ${PREV}`} />
        </StatCard>
        <StatCard icon={Bot} iconClass="bg-skill-speaking/15 text-skill-speaking-ink" label="Bài AI đã chấm" value={st.graded.value} unit="bài">
          <Delta value={st.graded.delta} suffix={`bài ${PREV}`} />
        </StatCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SkillPerformance scores={r.scores} previous={r.previousScores} />
        <Card>
          <CardTitle>Tiến độ điểm số</CardTitle>
          <LineChart
            title="Band cuối tháng trước và cuối tháng này"
            labels={[`Tháng ${prevMonth}`, `Tháng ${r.month}`]}
            domain={[3, 9]}
            series={[
              { name: "Overall", color: "var(--color-navy)", values: [r.previousOverall, r.overall] },
              ...SKILLS.map((s) => ({ name: skillStyle[s].label, color: skillStyle[s].color, values: [r.previousScores[s], r.scores[s]] })),
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardTitle>Nhận xét từ AI</CardTitle>
          <p className="leading-relaxed">{comment ?? "Con chưa lập lộ trình học nên AI chưa có nhận xét."}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-2 text-center">
          <h2 className="self-start text-xl font-bold">So sánh với mục tiêu</h2>
          <p className="mt-2">Overall band score</p>
          <p className="text-2xl">
            <strong className="text-5xl">{r.overall === null ? "–" : band(r.overall)}</strong> / {goalBand === null ? "chưa đặt" : band(goalBand)}
          </p>
          {r.overall === null && <p className="text-sm text-muted">Cần kết quả đủ 4 kỹ năng</p>}
        </Card>
      </div>
    </div>
  );
}
