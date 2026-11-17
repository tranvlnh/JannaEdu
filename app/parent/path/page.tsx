import type { Metadata } from "next";
import { CircleCheck, Circle } from "lucide-react";
import { Card, CardTitle, ProgressBar } from "@/components/ui";
import { band } from "@/lib/format";
import { goal, pathStages, weekPlan } from "@/lib/mock/student";
import { skillStyle } from "@/lib/skills";
import { StageCard } from "@/app/(student)/path/stage-card";

export const metadata: Metadata = { title: "Lộ trình học của con" };

export default function ParentPathPage() {
  const pct = Math.round((goal.currentWeek / goal.totalWeeks) * 100);
  const done = weekPlan.filter((t) => t.done).length;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Lộ trình học của con</h1>
        <p className="mt-2 text-lg">
          Mục tiêu <strong>IELTS {band(goal.band)}+</strong> trong {goal.totalWeeks} tuần · đang ở tuần {goal.currentWeek} ({pct}%)
        </p>
        <ProgressBar value={pct} label={`Tiến độ lộ trình ${pct}%`} className="mt-3 max-w-xl" />
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {pathStages.map((s) => (
          <li key={s.weeks}>
            <StageCard stage={s} />
          </li>
        ))}
      </ol>

      <Card>
        <CardTitle>
          Kế hoạch tuần {goal.currentWeek} · {done}/{weekPlan.length} đã xong
        </CardTitle>
        <ul className="flex flex-col gap-2">
          {weekPlan.map((t) => (
            <li key={t.day} className="flex items-center gap-3">
              {t.done ? (
                <CircleCheck className="size-5 shrink-0 text-success-ink" aria-label="Đã xong" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted" aria-label="Chưa làm" />
              )}
              <span className="w-14 font-semibold">{t.day}</span>
              <span className={`${skillStyle[t.skill].text} w-20 text-sm font-semibold`}>{skillStyle[t.skill].label}</span>
              <span className="flex-1">{t.task}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
