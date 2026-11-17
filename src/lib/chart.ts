// Hàm thuần cho chart — test ở lib/chart.test.ts (`npm test`).

export type Segment = { value: number; color: string };

/** conic-gradient từ các segment, chia theo tỉ lệ value. */
export function conicGradient(segments: Segment[]): string {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return "conic-gradient(var(--color-surface) 0 100%)";
  let acc = 0;
  const stops = segments.map((s) => {
    const from = (acc / total) * 100;
    acc += s.value;
    const to = (acc / total) * 100;
    return `${s.color} ${round(from)}% ${round(to)}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

/** Map giá trị domain [min, max] sang pixel [start, end]. Clamp ngoài khoảng. */
export function scale(value: number, [min, max]: [number, number], [start, end]: [number, number]) {
  if (max === min) return start;
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return start + t * (end - start);
}

/** Tọa độ điểm trên cung tròn, góc 0 = 12 giờ, chiều kim đồng hồ. */
export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: round(cx + r * Math.cos(rad)), y: round(cy + r * Math.sin(rad)) };
}

/** SVG path của cung tròn từ góc `from` tới `to` (độ). */
export function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
