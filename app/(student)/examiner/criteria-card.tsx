import { DonutChart } from "@/components/charts";
import { Card } from "@/components/ui";
import { band } from "@/lib/format";
import type { Criterion } from "@/lib/mock/student";
import { SKILLS, roundBand, skillStyle } from "@/lib/skills";

/** Donut band + 4 tiêu chí chấm (Speaking/Writing). Dùng ở /examiner và /examiner/analysis. */
export function CriteriaCard({ criteria, showDonut = true }: { criteria: Criterion[]; showDonut?: boolean }) {
  const overall = roundBand(criteria.reduce((s, c) => s + c.score, 0) / criteria.length);
  return (
    <Card className="flex flex-col items-center gap-6">
      {showDonut && (
        <DonutChart
          label={`Band ${band(overall)}`}
          segments={criteria.map((c, i) => ({ value: c.score, color: skillStyle[SKILLS[i % SKILLS.length]].color }))}
        >
          <div className="text-brand-ink">
            <p className="font-semibold">Band</p>
            <p className="text-3xl font-bold">{band(overall)}</p>
          </div>
        </DonutChart>
      )}
      <dl className="w-full">
        {criteria.map((c) => (
          <div key={c.name} className="flex justify-between gap-4 border-b-2 border-skill-listening/60 py-2.5">
            <dt>{c.name}</dt>
            <dd className="font-bold tabular-nums">{band(c.score)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
