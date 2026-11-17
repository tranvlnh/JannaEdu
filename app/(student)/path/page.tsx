import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, ClipboardList, Clock, ExternalLink, Flag, Layers, Lock, Target } from "lucide-react";
import { Tabs } from "@/components/tabs";
import { Card, Pill, ProgressBar, SKILL_ICON } from "@/components/ui";
import { band } from "@/lib/format";
import { goal, pathStages, resources, weekPlan, type PathStage } from "@/lib/mock/student";
import { skillStyle } from "@/lib/skills";

export const metadata: Metadata = { title: "Lộ trình học" };

// Tô theo trạng thái (mockup tô theo kỹ năng nhưng lệch màu kỹ năng ở các màn khác).
const STAGE_TONE: Record<PathStage["status"], { card: string; bar: string; badge: string }> = {
  done: { card: "border-success/40 bg-success/10!", bar: "bg-success", badge: "bg-success/20" },
  current: { card: "border-brand/50 bg-brand-soft/50!", bar: "bg-brand", badge: "bg-brand-soft" },
  locked: { card: "border-navy/15 bg-navy/5!", bar: "bg-muted", badge: "bg-navy/10" },
};

function StageCard({ stage }: { stage: PathStage }) {
  const tone = STAGE_TONE[stage.status];
  const Icon = stage.skill ? SKILL_ICON[stage.skill] : stage.title === "Foundation" ? Layers : ClipboardList;
  return (
    <Card className={`flex h-full flex-col gap-3 border-2 shadow-none! ${tone.card}`}>
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-full bg-white">
          {stage.status === "done" ? (
            <CircleCheck className="size-6 text-success" aria-hidden />
          ) : (
            <Icon className="size-6" aria-hidden />
          )}
        </span>
        {stage.status === "locked" && <Lock className="size-6" aria-label="Chưa mở khóa" />}
        {stage.status === "current" && <Pill tone="brand">Đang học</Pill>}
      </div>
      <p className={`self-start rounded-lg px-2 py-0.5 text-lg font-bold ${tone.badge}`}>{stage.weeks}</p>
      <h3 className="text-xl font-bold">{stage.title}</h3>
      <p className="flex-1 text-navy/80">{stage.description}</p>
      <div className="flex items-center gap-3">
        <ProgressBar value={stage.progress} barClass={tone.bar} label={`${stage.title}: ${stage.progress}%`} className="flex-1" />
        <span className="text-sm font-semibold tabular-nums">{stage.progress}%</span>
      </div>
    </Card>
  );
}

export default function PathPage() {
  const pct = Math.round((goal.currentWeek / goal.totalWeeks) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-white/50 p-6 sm:p-8">
        <Flag className="absolute -right-4 -bottom-6 hidden size-56 -rotate-12 text-skill-listening/15 lg:block" aria-hidden />
        <h1 className="text-4xl font-bold">Lộ trình học cá nhân hóa</h1>
        <p className="mt-2 max-w-3xl text-lg text-navy/80">
          Dựa trên mục tiêu, kết quả bài test và phân tích từ AI, Janna Edu đã thiết kế lộ trình phù hợp nhất để giúp bạn đạt mục tiêu IELTS.
        </p>
        <div className="relative mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Card className="flex items-center gap-4 border-2 border-brand/40 bg-brand-soft/60! shadow-none!">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white">
              <Target className="size-9 text-brand" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Mục tiêu của bạn</p>
              <p className="text-3xl font-bold">IELTS {band(goal.band)}+</p>
              <p className="text-sm">Dự kiến hoàn thành: {goal.totalWeeks} tuần</p>
            </div>
          </Card>
          <Card className="flex flex-col justify-center gap-2 border-2 border-skill-listening/40 shadow-none!">
            <p className="font-semibold">Tiến độ hiện tại</p>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold tabular-nums">{pct}%</p>
              <ProgressBar value={pct} label={`Tiến độ lộ trình ${pct}%`} className="flex-1" />
            </div>
            <p className="text-right text-sm">
              {goal.currentWeek}/{goal.totalWeeks} tuần
            </p>
          </Card>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "path",
            label: "Lộ trình học",
            content: (
              <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {pathStages.map((s) => (
                  <li key={s.weeks}>
                    <StageCard stage={s} />
                  </li>
                ))}
              </ol>
            ),
          },
          {
            id: "week",
            label: "Kế hoạch tuần",
            content: (
              <Card>
                <h2 className="mb-4 text-xl font-bold">Tuần {goal.currentWeek}</h2>
                <ul className="flex flex-col divide-y divide-navy/10">
                  {weekPlan.map((t) => {
                    const Icon = SKILL_ICON[t.skill];
                    return (
                      <li key={t.day} className="flex flex-wrap items-center gap-3 py-3">
                        <span className="w-14 font-semibold">{t.day}</span>
                        <Icon className={`size-5 ${skillStyle[t.skill].text}`} aria-label={skillStyle[t.skill].label} />
                        <span className={`mr-auto ${t.done ? "text-muted line-through" : ""}`}>{t.task}</span>
                        <span className="flex items-center gap-1 text-sm text-muted">
                          <Clock className="size-4" aria-hidden />
                          {t.minutes} phút
                        </span>
                        {t.done ? <Pill tone="success">Đã xong</Pill> : <Pill>Chưa làm</Pill>}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ),
          },
          {
            id: "resources",
            label: "Tài liệu & tài nguyên",
            content: (
              <ul className="grid gap-4 sm:grid-cols-2">
                {resources.map((r) => (
                  <li key={r.title}>
                    <Link
                      href={r.href}
                      className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-card hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <Pill>{r.type}</Pill>
                      <span className="mr-auto font-semibold">{r.title}</span>
                      <ExternalLink className="size-4 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </div>
  );
}
