import { ChevronDown, CircleCheck } from "lucide-react";
import { Pill, SKILL_ICON } from "@/components/ui";
import type { LearningPath } from "@/contracts/learning-path";
import { pathWeeks } from "@/lib/path";
import { skillStyle, type Skill } from "@/lib/skills";
import type { StageView } from "./stage-card";

function SkillIcon({ skill }: { skill: Skill }) {
  const Icon = SKILL_ICON[skill];
  return <Icon className={`size-5 shrink-0 ${skillStyle[skill].text}`} role="img" aria-label={skillStyle[skill].label} />;
}

// Every week of the path, one <details> each: the current week open, past weeks dimmed.
// Weeks 1-2 show the day-by-day sessions when the path has them (paths made before weekPlan existed fall back to the stage tasks).
export function WeekList({ stages, currentWeek, weekPlan }: { stages: StageView[]; currentWeek: number; weekPlan?: LearningPath["weekPlan"] }) {
  return (
    <ol className="flex flex-col gap-3">
      {pathWeeks(stages, currentWeek).map(({ week, stage, status }) => {
        const sessions = weekPlan?.find((w) => w.week === week)?.sessions;
        return (
          <li key={week}>
            <details
              open={status === "current"}
              className={`group rounded-2xl border-2 bg-white p-4 ${status === "current" ? "border-brand/50" : "border-navy/10"} ${status === "done" ? "opacity-60" : ""}`}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                <span className="text-lg font-bold">Tuần {week}</span>
                <span className="min-w-0 flex-1 truncate text-navy/80">{stage.title}</span>
                {status === "current" && <Pill tone="brand">Tuần này</Pill>}
                {status === "done" && <CircleCheck className="size-5 shrink-0 text-success-ink" role="img" aria-label="Đã xong" />}
                <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-muted">{stage.goal}</p>
              {sessions ? (
                <ul className="mt-2 flex flex-col divide-y divide-navy/10">
                  {sessions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 py-3">
                      <span className="w-14 shrink-0 font-semibold">{s.day}</span>
                      <SkillIcon skill={s.skill} />
                      <span className="flex-1">
                        <span className="block font-semibold">{s.topic}</span>
                        <span className="text-sm text-navy/80">{s.activity}</span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-muted">{s.minutes} phút</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-2 flex flex-col divide-y divide-navy/10">
                  {stage.tasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                      <span className="flex gap-1">
                        {stage.skills.map((skill) => (
                          <SkillIcon key={skill} skill={skill} />
                        ))}
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </li>
        );
      })}
    </ol>
  );
}
