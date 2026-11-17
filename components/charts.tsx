import { arcPath, conicGradient, scale, type Segment } from "@/lib/chart";

/** Donut bằng CSS conic-gradient. `label` mô tả cho screen reader. */
export function DonutChart({
  segments,
  label,
  size = 176,
  children,
}: {
  segments: Segment[];
  label: string;
  size?: number;
  /** Nội dung giữa donut (vd "Band 7.5"). */
  children?: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: conicGradient(segments) }}
    >
      <div className="grid size-[58%] place-items-center rounded-full bg-white text-center">{children}</div>
    </div>
  );
}

/** Cung tròn 270° hiển thị điểm overall (mockup kết quả mock test). */
export function ArcGauge({
  value,
  max = 9,
  size = 200,
  label,
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  label: string;
  children?: React.ReactNode;
}) {
  const c = 50;
  const r = 42;
  const start = -135;
  const end = scale(value, [0, max], [start, 135]);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0" role="img" aria-label={label}>
        <path d={arcPath(c, c, r, start, 135)} fill="none" stroke="var(--color-skill-listening)" strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" />
        {value > 0 && (
          <path d={arcPath(c, c, r, start, end)} fill="none" stroke="var(--color-brand)" strokeWidth={6} strokeLinecap="round" />
        )}
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

export type Series = { name: string; color: string; values: number[] };

const W = 640;
const H = 280;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };

/** Line chart SVG thuần, nhiều series cùng trục x. Có bảng ẩn cho screen reader. */
export function LineChart({
  series,
  labels,
  domain = [4, 8],
  step = 1,
  title,
  showValues = false,
}: {
  series: Series[];
  labels: string[];
  domain?: [number, number];
  step?: number;
  title: string;
  showValues?: boolean;
}) {
  const x = (i: number) => scale(i, [0, Math.max(1, labels.length - 1)], [PAD.left, W - PAD.right]);
  const y = (v: number) => scale(v, domain, [H - PAD.bottom, PAD.top]);
  const ticks: number[] = [];
  for (let v = domain[0]; v <= domain[1] + 1e-9; v += step) ticks.push(Math.round(v * 10) / 10);

  return (
    <figure>
      <ul className="mb-2 flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs" aria-hidden>
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
      {/* Màn hẹp: giữ tối thiểu 32rem rồi cuộn ngang, tránh chữ trục co quá nhỏ */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-lg text-muted" aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.15} />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="currentColor">
                {t.toFixed(1)}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l} x={x(i)} y={H - 10} textAnchor="middle" fontSize={11} fill="currentColor">
              {l}
            </text>
          ))}
          {series.map((s) => (
            <g key={s.name} fill={s.color} stroke={s.color}>
              <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" strokeWidth={2} />
              {s.values.map((v, i) => (
                <g key={i}>
                  <circle cx={x(i)} cy={y(v)} r={3.5} />
                  {showValues && (
                    <text x={x(i)} y={y(v) - 8} textAnchor="middle" fontSize={10} fontWeight={600} stroke="none">
                      {v.toFixed(1)}
                    </text>
                  )}
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {/* sr-only đặt trên div: <table> không bị co về 1px, sẽ kéo dài trang */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Kỹ năng</th>
              {labels.map((l) => (
                <th key={l} scope="col">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.name}>
                <th scope="row">{s.name}</th>
                {s.values.map((v, i) => (
                  <td key={i}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
