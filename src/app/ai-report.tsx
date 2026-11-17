import { DonutChart } from "@/components/charts";
import { AIComment, Card } from "@/components/ui";
import { band as fmt } from "@/lib/format";

// Shared layout of an AI examiner report (Writing and Speaking).
type Props = {
  band: number;
  summary: string;
  criteria: { label: string; band: number; comment: string }[];
  errors: { type: string; quote: string; suggestion: string; explanation: string }[];
  errorTypes: Record<string, string>;
};

export function AiReport({ band, summary, criteria, errors, errorTypes }: Props) {
  return (
    <>
      <AIComment title="Nhận xét tổng quan từ AI">
        <p>{summary}</p>
      </AIComment>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="flex flex-col items-center gap-6">
          <DonutChart
            label={`Band ${fmt(band)} trên 9`}
            segments={[
              { value: band, color: "var(--color-skill-listening)" },
              { value: 9 - band, color: "color-mix(in srgb, var(--color-navy) 12%, transparent)" },
            ]}
          >
            <div className="text-brand-ink">
              <p className="font-semibold">Band</p>
              <p className="text-3xl font-bold">{fmt(band)}</p>
            </div>
          </DonutChart>
          <dl aria-label="Điểm theo tiêu chí" className="flex w-full flex-col">
            {criteria.map((c) => (
              <div key={c.label} className="border-b-2 border-skill-listening/60 py-2.5">
                <dt className="flex justify-between gap-4">
                  {c.label} <strong className="tabular-nums">{fmt(c.band)}</strong>
                </dt>
                <dd className="text-sm text-muted">{c.comment}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold">Các lỗi sai nổi bật ({errors.length})</h2>
          {errors.length === 0 ? (
            <p className="text-muted">Không có lỗi đáng kể.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {errors.map((e, i) => (
                <li key={i} className="rounded-xl bg-warning-soft px-4 py-3">
                  <h3 className="font-bold">{errorTypes[e.type] ?? e.type} — Cần cải thiện</h3>
                  <p className="mt-1">
                    <del className="text-danger-ink">{e.quote}</del> →{" "}
                    <ins className="font-medium text-success-ink no-underline">{e.suggestion}</ins>
                  </p>
                  <p className="text-navy/80">Gợi ý: {e.explanation}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
