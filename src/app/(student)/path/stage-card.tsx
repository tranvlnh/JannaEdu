import { CircleCheck, ClipboardList, Layers, Lock } from "lucide-react";
import { Card, Pill, ProgressBar, SKILL_ICON } from "@/components/ui";
import type { PathStage } from "@/lib/mock/student";

// Tô theo trạng thái (mockup tô theo kỹ năng nhưng lệch màu kỹ năng ở các màn khác).
const STAGE_TONE: Record<PathStage["status"], { card: string; bar: string; badge: string }> = {
  done: { card: "border-success/40 bg-success/10!", bar: "bg-success", badge: "bg-success/20" },
  current: { card: "border-brand/50 bg-brand-soft/50!", bar: "bg-brand", badge: "bg-brand-soft" },
  locked: { card: "border-navy/15 bg-navy/5!", bar: "bg-muted", badge: "bg-navy/10" },
};

export function StageCard({ stage }: { stage: PathStage }) {
  const tone = STAGE_TONE[stage.status];
  const Icon = stage.skill ? SKILL_ICON[stage.skill] : stage.title === "Foundation" ? Layers : ClipboardList;
  return (
    <Card className={`flex h-full flex-col gap-3 border-2 shadow-none! ${tone.card}`}>
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-full bg-white">
          {stage.status === "done" ? (
            <CircleCheck className="size-6 text-success-ink" aria-hidden />
          ) : (
            <Icon className="size-6" aria-hidden />
          )}
        </span>
        {stage.status === "locked" && <Lock className="size-6" role="img" aria-label="Chưa mở khóa" />}
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

