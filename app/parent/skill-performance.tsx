import { Card, CardTitle, ProgressBar, SKILL_ICON } from "@/components/ui";
import { band } from "@/lib/format";
import { SKILLS, skillStyle, type SkillScores } from "@/lib/skills";

/** Điểm từng kỹ năng + thanh + chênh lệch so với kỳ trước. Dùng ở báo cáo tháng và tiến độ. */
export function SkillPerformance({ scores, previous, title = "Hiệu suất theo kỹ năng" }: { scores: SkillScores; previous: SkillScores; title?: string }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <ul className="flex flex-col gap-3">
        {SKILLS.map((k) => {
          const s = skillStyle[k];
          const Icon = SKILL_ICON[k];
          const delta = scores[k] - previous[k];
          return (
            <li key={k} className="flex items-center gap-4 rounded-xl bg-surface/60 px-3 py-2.5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${s.soft}`}>
                <Icon className={`size-5 ${s.text}`} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{s.label}</p>
                <ProgressBar value={scores[k]} max={9} barClass={s.bg} label={`${s.label} ${band(scores[k])}/9`} className="mt-1" />
              </div>
              <span className="w-10 text-right text-lg font-bold tabular-nums">{band(scores[k])}</span>
              <span className={`w-12 text-sm font-semibold ${delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted"}`}>
                {delta > 0 ? "↑ +" : delta < 0 ? "↓ " : "– "}
                {delta !== 0 && band(delta)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
