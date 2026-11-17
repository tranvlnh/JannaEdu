import { CircleCheck, Lock } from "lucide-react";
import { Card, Pill, ProgressBar, SKILL_ICON } from "@/components/ui";
import { weekRange, type StageStatus } from "@/lib/path";
import { skillStyle, type Skill } from "@/lib/skills";

export type StageView = {
  title: string;
  goal: string;
  skills: Skill[];
  tasks: string[];
  firstWeek: number;
  lastWeek: number;
  status: StageStatus;
  progress: number;
};

// Tô theo trạng thái (mockup tô theo kỹ năng nhưng lệch màu kỹ năng ở các màn khác).
const STAGE_TONE: Record<StageStatus, { card: string; bar: string; badge: string }> = {
  done: { card: "border-success/40 bg-success/10!", bar: "bg-success", badge: "bg-success/20" },
  current: { card: "border-brand/50 bg-brand-soft/50!", bar: "bg-brand", badge: "bg-brand-soft" },
  locked: { card: "border-navy/15 bg-navy/5!", bar: "bg-muted", badge: "bg-navy/10" },
};

export function StageCard({ stage }: { stage: StageView }) {
  const tone = STAGE_TONE[stage.status];
  return (
    <Card className={`flex h-full flex-col gap-3 border-2 shadow-none! ${tone.card}`}>
      <div className="flex items-center justify-between">
        <span className="flex gap-1.5">
          {stage.status === "done" ? (
            <span className="grid size-11 place-items-center rounded-full bg-white">
              <CircleCheck className="size-6 text-success-ink" aria-hidden />
            </span>
          ) : (
            stage.skills.map((skill) => {
              const Icon = SKILL_ICON[skill];
              return (
                <span key={skill} className="grid size-11 place-items-center rounded-full bg-white">
                  <Icon className={`size-6 ${skillStyle[skill].text}`} role="img" aria-label={skillStyle[skill].label} />
                </span>
              );
            })
          )}
        </span>
        {stage.status === "locked" && <Lock className="size-6" role="img" aria-label="Chưa tới" />}
        {stage.status === "current" && <Pill tone="brand">Đang học</Pill>}
      </div>
      <p className={`self-start rounded-lg px-2 py-0.5 text-lg font-bold ${tone.badge}`}>{weekRange(stage.firstWeek, stage.lastWeek)}</p>
      <h3 className="text-xl font-bold">{stage.title}</h3>
      <p className="flex-1 text-navy/80">{stage.goal}</p>
      <div className="flex items-center gap-3">
        <ProgressBar value={stage.progress} barClass={tone.bar} label={`${stage.title}: ${stage.progress}%`} className="flex-1" />
        <span className="text-sm font-semibold tabular-nums">{stage.progress}%</span>
      </div>
    </Card>
  );
}
