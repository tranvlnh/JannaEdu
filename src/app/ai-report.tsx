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
      <p className="text-lg">
        <strong>Band {band.toFixed(1)}</strong>
      </p>
      <p>{summary}</p>

      <section>
        <h2 className="mb-2 font-semibold">Điểm theo tiêu chí</h2>
        <dl className="flex flex-col gap-3">
          {criteria.map((c) => (
            <div key={c.label}>
              <dt className="font-medium">
                {c.label}: {c.band.toFixed(1)}
              </dt>
              <dd className="text-sm text-zinc-600">{c.comment}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Lỗi cần sửa ({errors.length})</h2>
        {errors.length === 0 ? (
          <p className="text-sm text-zinc-600">Không có lỗi đáng kể.</p>
        ) : (
          <ol className="flex list-decimal flex-col gap-3 pl-5">
            {errors.map((e, i) => (
              <li key={i}>
                <span className="text-sm text-zinc-600">{errorTypes[e.type] ?? e.type}</span>
                <br />
                <del className="text-red-600">{e.quote}</del> → <ins className="text-green-700 no-underline">{e.suggestion}</ins>
                <br />
                <span className="text-sm">{e.explanation}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
