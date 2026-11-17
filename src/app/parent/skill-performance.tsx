import { Card, CardTitle, ProgressBar, SKILL_ICON } from "@/components/ui";
import { band } from "@/lib/format";
import type { Bands } from "@/lib/progress";
import { SKILLS, skillStyle } from "@/lib/skills";

/** Điểm từng kỹ năng + thanh + chênh lệch so với kỳ trước. Dùng ở báo cáo tháng và tiến độ. */
export function SkillPerformance({ scores, previous, title = "Hiệu suất theo kỹ năng" }: { scores: Bands; previous: Bands; title?: string }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <ul className="flex flex-col gap-3">
        {SKILLS.map((k) => {
          const s = skillStyle[k];
          const Icon = SKILL_ICON[k];
          const score = scores[k];
          const before = previous[k];
          const delta = score !== null && before !== null ? score - before : null;
          return (
            <li key={k} className="flex items-center gap-4 rounded-xl bg-surface/60 px-3 py-2.5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${s.soft}`}>
                <Icon className={`size-5 ${s.text}`} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{s.label}</p>
                <ProgressBar value={score ?? 0} max={9} barClass={s.bg} label={`${s.label} ${score === null ? "chưa có" : band(score)}/9`} className="mt-1" />
              </div>
              <span className="w-10 text-right text-lg font-bold tabular-nums">{score === null ? "–" : band(score)}</span>
              <span
                className={`w-12 text-sm font-semibold ${delta === null || delta === 0 ? "text-muted" : delta > 0 ? "text-success-ink" : "text-danger-ink"}`}
              >
                {delta === null ? "" : delta > 0 ? `↑ +${band(delta)}` : delta < 0 ? `↓ ${band(-delta)}` : "–"}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
