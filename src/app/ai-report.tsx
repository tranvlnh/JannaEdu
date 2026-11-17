import { Icon } from "@/app/icons";
import { BandRing } from "@/app/scores";

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
      <section className="card flex gap-4">
        <Icon name="robot" className="size-12 shrink-0" />
        <div>
          <h2 className="mb-1 text-xl font-bold">Nhận xét tổng quan từ AI</h2>
          <p className="leading-7">{summary}</p>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <section className="flex flex-col items-center gap-6">
          <BandRing band={band} parts={criteria.map((c) => c.band)} className="size-48" />
          <dl aria-label="Điểm theo tiêu chí" className="card flex w-full flex-col gap-4 px-6">
            {criteria.map((c) => (
              <div key={c.label} className="border-b-2 border-blue-500 pb-2">
                <dt className="flex justify-between gap-2 text-lg">
                  {c.label} <strong>{c.band.toFixed(1)}</strong>
                </dt>
                <dd className="text-sm text-slate-600">{c.comment}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card flex flex-col gap-3">
          <h2 className="text-xl font-bold">Các lỗi sai nổi bật ({errors.length})</h2>
          {errors.length === 0 ? (
            <p className="text-slate-600">Không có lỗi đáng kể.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {errors.map((e, i) => (
                <li key={i} className="rounded-xl bg-[#fbdcb9] px-5 py-3">
                  <h3 className="font-bold">{errorTypes[e.type] ?? e.type} — Cần cải thiện</h3>
                  <p className="mt-1">
                    <del className="text-red-600">{e.quote}</del> → <ins className="font-medium text-green-700 no-underline">{e.suggestion}</ins>
                  </p>
                  <p className="text-sm">Gợi ý: {e.explanation}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
