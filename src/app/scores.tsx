import type { PathSkill } from "@/contracts/learning-path";
import type { IconName } from "@/app/icons";

// One colour per IELTS skill, the same on every page.
export const SKILL_STYLE: Record<PathSkill, { label: string; icon: IconName; text: string; bar: string; soft: string }> = {
  listening: { label: "Listening", icon: "headphones", text: "text-blue-600", bar: "bg-blue-600", soft: "bg-blue-50" },
  reading: { label: "Reading", icon: "book", text: "text-emerald-600", bar: "bg-emerald-500", soft: "bg-emerald-50" },
  writing: { label: "Writing", icon: "pen", text: "text-orange-500", bar: "bg-orange-500", soft: "bg-orange-50" },
  speaking: { label: "Speaking", icon: "mic", text: "text-purple-600", bar: "bg-purple-600", soft: "bg-purple-50" },
};

// Segment colours of the donut, in the order of `parts` (the design's blue, teal, orange, purple).
export const RING_COLORS = ["#2f6df6", "#5fe3d3", "#f5b968", "#8b5cf6"];

// Donut showing a band out of 9. With `parts` (sub-scores out of 9, e.g. the four criteria),
// the filled arc is split into one coloured segment per part, like the design.
export function BandRing({
  band,
  parts,
  label = "Band",
  className = "size-40",
}: {
  band: number | null;
  parts?: number[];
  label?: string;
  className?: string;
}) {
  const stops: string[] = [];
  let at = 0;
  for (const [i, part] of (parts ?? [band ?? 0]).entries()) {
    const end = at + (part / 9 / (parts?.length ?? 1)) * 100;
    stops.push(`${parts ? RING_COLORS[i % RING_COLORS.length] : "var(--color-brand)"} ${at}% ${end}%`);
    at = end;
  }
  return (
    <div
      role="img"
      aria-label={`${label} ${band === null ? "chưa có" : band.toFixed(1)}`}
      className={`grid shrink-0 place-items-center rounded-full ${className}`}
      style={{ background: `conic-gradient(${stops.join(", ")}, ${parts ? "#b8b8b8" : "#d6e4fb"} 0)` }}
    >
      <div className="grid size-[50%] place-items-center rounded-full bg-white text-center leading-tight">
        <span>
          <span className="block text-sm font-semibold text-brand">{label}</span>
          <span className="text-3xl font-bold text-brand">{band === null ? "–" : band.toFixed(1)}</span>
        </span>
      </div>
    </div>
  );
}

// Thin bar under a score, band out of 9.
export function BandBar({ band, className }: { band: number | null; className: string }) {
  return (
    <div className="h-2 rounded-full bg-slate-200" aria-hidden>
      <div className={`h-2 rounded-full ${className}`} style={{ width: `${band === null ? 0 : (band / 9) * 100}%` }} />
    </div>
  );
}
