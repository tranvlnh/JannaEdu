"use client";

import { useState } from "react";
import { BookA, Clock, FileText, NotebookPen } from "lucide-react";
import { LineChart } from "@/components/charts";
import { Card, CardTitle, Delta, Select, StatCard } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import type { MonthlyReport } from "@/lib/mock/parent";
import { SKILLS, overallBand, skillStyle } from "@/lib/skills";
import { SkillPerformance } from "../skill-performance";

const PREV = "so với tháng trước";

export function ReportView({ reports, goalBand }: { reports: MonthlyReport[]; goalBand: number }) {
  const [month, setMonth] = useState(reports[0].month);
  const r = reports.find((x) => x.month === month) ?? reports[0];
  const st = r.stats;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Báo cáo học tập tháng {r.month}</h1>
          <p className="mt-2 text-lg">
            (Từ {formatDate(r.from)} – {formatDate(r.to)})
          </p>
        </div>
        <Select aria-label="Chọn tháng" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-48">
          {reports.map((x) => (
            <option key={x.month} value={x.month}>
              Tháng {x.month}
            </option>
          ))}
        </Select>
      </div>

      <p role="status" className="sr-only">
        Đang xem báo cáo tháng {r.month}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Tổng thời gian học" value={st.hours} unit="giờ">
          <Delta value={st.hoursDelta} suffix={`giờ ${PREV}`} />
        </StatCard>
        <StatCard icon={NotebookPen} iconClass="bg-skill-reading/15 text-skill-reading" label="Số bài hoàn thành" value={st.completed} unit="bài">
          <Delta value={st.completedDelta} suffix={`bài ${PREV}`} />
        </StatCard>
        <StatCard icon={FileText} iconClass="bg-skill-listening/15 text-skill-listening" label="Mock test đã làm" value={st.mockTests} unit="lần">
          <Delta value={st.mockTestsDelta} suffix={`lần ${PREV}`} />
        </StatCard>
        <StatCard icon={BookA} iconClass="bg-skill-speaking/15 text-skill-speaking" label="Từ vựng đã học" value={st.vocab} unit="từ">
          <Delta value={st.vocabDelta} suffix={`từ ${PREV}`} />
        </StatCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SkillPerformance scores={r.scores} previous={r.previousScores} />
        <Card>
          <CardTitle>Tiến độ điểm số</CardTitle>
          <LineChart
            title="Band tháng trước và tháng này"
            labels={[`Tháng ${r.month - 1}`, `Tháng ${r.month}`]}
            domain={[4, 8]}
            series={[
              { name: "Overall", color: "var(--color-navy)", values: [overallBand(r.previousScores), overallBand(r.scores)] },
              ...SKILLS.map((s) => ({ name: skillStyle[s].label, color: skillStyle[s].color, values: [r.previousScores[s], r.scores[s]] })),
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardTitle>Nhận xét từ giáo viên</CardTitle>
          <p className="leading-relaxed">{r.teacherComment}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-2 text-center">
          <h2 className="self-start text-xl font-bold">So sánh với mục tiêu</h2>
          <p className="mt-2">Overall band score</p>
          <p className="text-2xl">
            <strong className="text-5xl">{band(overallBand(r.scores))}</strong> / {band(goalBand)}
          </p>
        </Card>
      </div>
    </div>
  );
}
