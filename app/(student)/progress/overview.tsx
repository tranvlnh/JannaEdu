"use client";

import { useState } from "react";
import { CalendarDays, Clock, FileText, NotebookPen, Target } from "lucide-react";
import { Delta, ProgressBar, Select, StatCard } from "@/components/ui";
import { progressByRange, weeklyGoal } from "@/lib/mock/student";

const RANGES = [7, 30, 90] as const;

/** Tiêu đề + chọn khoảng thời gian + 4 thẻ thống kê. */
export function ProgressOverview() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const s = progressByRange[range];
  const prev = `so với ${range} ngày trước`;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Theo dõi tiến độ học tập</h1>
          <p className="mt-2 text-lg">Cùng xem hành trình chinh phục IELTS của bạn nhé!</p>
        </div>
        <Select
          icon={CalendarDays}
          aria-label="Khoảng thời gian"
          value={range}
          onChange={(e) => setRange(Number(e.target.value) as typeof range)}
        >
          {RANGES.map((r) => (
            <option key={r} value={r}>
              Trong {r} ngày
            </option>
          ))}
        </Select>
      </div>

      <section aria-labelledby="overview-title">
        <h2 id="overview-title" className="mb-4 text-2xl font-bold">
          Tổng quan
        </h2>
        <p role="status" className="sr-only">
          Đang xem {range} ngày gần nhất
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Clock} iconClass="bg-brand text-white" label="Tổng thời gian học" value={s.studyHours} unit="giờ">
            <Delta value={s.studyHoursDelta} suffix={`giờ ${prev}`} />
          </StatCard>
          <StatCard icon={NotebookPen} iconClass="bg-skill-reading text-white" label="Số bài hoàn thành" value={s.completed} unit="bài">
            <Delta value={s.completedDelta} suffix={`bài ${prev}`} />
          </StatCard>
          <StatCard icon={FileText} iconClass="bg-skill-listening/20 text-skill-listening" label="Mock test đã làm" value={s.mockTests} unit="bài">
            <Delta value={s.mockTestsDelta} suffix={`bài ${prev}`} />
          </StatCard>
          <StatCard
            icon={Target}
            iconClass="bg-skill-speaking/20 text-skill-speaking"
            label="Mục tiêu tuần này"
            value={`${weeklyGoal.done}/${weeklyGoal.total}`}
            unit="bài"
          >
            <ProgressBar value={weeklyGoal.done} max={weeklyGoal.total} label="Mục tiêu tuần này" />
          </StatCard>
        </div>
      </section>
    </>
  );
}
