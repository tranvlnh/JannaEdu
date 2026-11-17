// Pure helpers that turn a student's activity list into bands, counts and time series.
import { SKILLS, roundBand, type Skill } from "./skills.ts";

/** Day ranges offered on the progress page. */
export const RANGES = [7, 30, 90] as const;

export type Activity = {
  id: string;
  skill: Skill;
  kind: "exam" | "practice" | "writing" | "speaking";
  title: string;
  submittedAt: string; // ISO
  band: number | null; // null = practice test or not graded yet
  detail: string;
  href: string;
};

export type Bands = Record<Skill, number | null>;

const DAY = 24 * 60 * 60 * 1000;
const VN_OFFSET = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh has no DST
const at = (a: Activity) => Date.parse(a.submittedAt);

/** Latest band per skill among results handed in up to `until` (ms). `activity` is newest first. */
export function bandsAt(activity: Activity[], until = Infinity): Bands {
  const latest = (skill: Skill) => activity.find((a) => a.skill === skill && a.band !== null && at(a) <= until)?.band ?? null;
  return Object.fromEntries(SKILLS.map((s) => [s, latest(s)])) as Bands;
}

/** IELTS overall: only once all four skills have a band. */
export function overallOf(bands: Bands): number | null {
  const values = SKILLS.map((s) => bands[s]);
  if (values.some((v) => v === null)) return null;
  return roundBand((values as number[]).reduce((sum, v) => sum + v, 0) / values.length);
}

/** Band per skill (and overall) at the end of each period, for a line chart. */
export function bandSeries(activity: Activity[], ends: number[]) {
  const snapshots = ends.map((end) => bandsAt(activity, end));
  return {
    overall: snapshots.map(overallOf),
    ...(Object.fromEntries(SKILLS.map((s) => [s, snapshots.map((b) => b[s])])) as Record<Skill, (number | null)[]>),
  };
}

/** Ends of the last `count` periods of `days` days, oldest first; the last one is `now`. */
export const periodEnds = (now: number, count: number, days: number) =>
  Array.from({ length: count }, (_, i) => now - (count - 1 - i) * days * DAY);

const countIn = (activity: Activity[], from: number, to: number, keep: (a: Activity) => boolean = () => true) =>
  activity.filter((a) => at(a) > from && at(a) <= to && keep(a)).length;

/** Counts for the last `days` days, with the change against the `days` before that. */
export function rangeStats(activity: Activity[], now: number, days: number) {
  const from = now - days * DAY;
  const before = from - days * DAY;
  const pair = (keep?: (a: Activity) => boolean) => {
    const value = countIn(activity, from, now, keep);
    return { value, delta: value - countIn(activity, before, from, keep) };
  };
  return {
    completed: pair(),
    exams: pair((a) => a.kind === "exam"),
    graded: pair((a) => (a.kind === "writing" || a.kind === "speaking") && a.band !== null),
  };
}

export type Month = { key: string; year: number; month: number; from: number; to: number };

const monthBounds = (year: number, month: number): Month => ({
  key: `${year}-${String(month).padStart(2, "0")}`,
  year,
  month,
  from: Date.UTC(year, month - 1, 1) - VN_OFFSET,
  to: Date.UTC(year, month, 1) - VN_OFFSET,
});

/** Calendar month (Vietnam time) containing `ms`. */
export function monthOf(ms: number): Month {
  const d = new Date(ms + VN_OFFSET);
  return monthBounds(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export const previousMonth = (m: Month) => (m.month === 1 ? monthBounds(m.year - 1, 12) : monthBounds(m.year, m.month - 1));

/** The last `count` calendar months up to the one containing `now`, oldest first. */
export function lastMonths(now: number, count: number): Month[] {
  const months = [monthOf(now)];
  while (months.length < count) months.unshift(previousMonth(months[0]));
  return months;
}

/** This month plus every month with activity, newest first. */
export function activeMonths(activity: Activity[], now: number): Month[] {
  const months = new Map([now, ...activity.map(at)].map((ms) => [monthOf(ms).key, monthOf(ms)]));
  return [...months.values()].sort((a, b) => b.from - a.from);
}

/** Counts inside one month and the change against the month before. */
export function monthStats(activity: Activity[], m: Month) {
  const prev = previousMonth(m);
  const pair = (keep?: (a: Activity) => boolean) => {
    const value = countIn(activity, m.from - 1, m.to - 1, keep);
    return { value, delta: value - countIn(activity, prev.from - 1, prev.to - 1, keep) };
  };
  return {
    completed: pair(),
    exams: pair((a) => a.kind === "exam"),
    graded: pair((a) => (a.kind === "writing" || a.kind === "speaking") && a.band !== null),
  };
}
