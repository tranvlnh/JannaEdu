"use client";

import { useState } from "react";
import { Bot, CalendarDays, FileText, NotebookPen, Target } from "lucide-react";
import { Delta, ProgressBar, Select, StatCard } from "@/components/ui";
import { band } from "@/lib/format";
import type { rangeStats } from "@/lib/progress";

export const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

/** Tiêu đề + chọn khoảng thời gian + 4 thẻ thống kê. Dùng cho học sinh và phụ huynh. */
export function ProgressOverview({
  title,
  subtitle,
  stats,
  overall,
  goal,
}: {
  title: string;
  subtitle: string;
  stats: Record<Range, ReturnType<typeof rangeStats>>;
  overall: number | null;
  goal: number | null;
}) {
  const [range, setRange] = useState<Range>(30);
  const s = stats[range];
  const prev = `so với ${range} ngày trước`;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-lg">{subtitle}</p>
        </div>
        <Select icon={CalendarDays} aria-label="Khoảng thời gian" value={range} onChange={(e) => setRange(Number(e.target.value) as Range)}>
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
          <StatCard icon={NotebookPen} iconClass="bg-brand text-white" label="Số bài hoàn thành" value={s.completed.value} unit="bài">
            <Delta value={s.completed.delta} suffix={`bài ${prev}`} />
          </StatCard>
          <StatCard icon={FileText} iconClass="bg-skill-reading text-white" label="Mock test đã làm" value={s.exams.value} unit="bài">
            <Delta value={s.exams.delta} suffix={`bài ${prev}`} />
          </StatCard>
          <StatCard icon={Bot} iconClass="bg-skill-listening/20 text-skill-listening-ink" label="Bài AI đã chấm" value={s.graded.value} unit="bài">
            <Delta value={s.graded.delta} suffix={`bài ${prev}`} />
          </StatCard>
          <StatCard
            icon={Target}
            iconClass="bg-skill-speaking/20 text-skill-speaking-ink"
            label="Band so với mục tiêu"
            value={overall === null ? "–" : band(overall)}
            unit={goal === null ? undefined : `/ ${band(goal)}`}
          >
            {goal === null ? (
              <p className="text-sm text-muted">Chưa đặt band mục tiêu</p>
            ) : (
              <ProgressBar value={overall ?? 0} max={goal} label="Band hiện tại so với mục tiêu" />
            )}
            {overall === null && <p className="text-sm text-muted">Cần kết quả đủ 4 kỹ năng</p>}
          </StatCard>
        </div>
      </section>
    </>
  );
}
