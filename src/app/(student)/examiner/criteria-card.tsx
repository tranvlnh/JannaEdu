import { DonutChart } from "@/components/charts";
import { Card } from "@/components/ui";
import { band } from "@/lib/format";
import { roundBand } from "@/lib/skills";

export type Criterion = { name: string; score: number };

/** Donut band + 4 tiêu chí chấm (Speaking/Writing). Dùng ở /examiner và /examiner/analysis. */
export function CriteriaCard({ criteria, showDonut = true }: { criteria: Criterion[]; showDonut?: boolean }) {
  const overall = roundBand(criteria.reduce((s, c) => s + c.score, 0) / criteria.length);
  return (
    <Card className="flex flex-col items-center gap-6">
      {showDonut && (
        <DonutChart
          label={`Band ${band(overall)} trên 9`}
          // Vòng band/9 một màu — tiêu chí không phải kỹ năng nên không dùng màu skill
          segments={[
            { value: overall, color: "var(--color-skill-listening)" },
            { value: 9 - overall, color: "color-mix(in srgb, var(--color-navy) 12%, transparent)" },
          ]}
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
