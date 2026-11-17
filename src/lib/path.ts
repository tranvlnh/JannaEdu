// Where a student is on their learning path, counted from the day it was generated.
const WEEK = 7 * 24 * 60 * 60 * 1000;

export type StageStatus = "done" | "current" | "locked";

export function pathTimeline<T extends { weeks: number }>(stages: T[], generatedAt: string, now: number) {
  const elapsed = Math.max(0, (now - Date.parse(generatedAt)) / WEEK); // weeks since the path started
  let start = 0;
  const timeline = stages.map((stage) => {
    const from = start;
    start += stage.weeks;
    const status: StageStatus = elapsed >= start ? "done" : elapsed >= from ? "current" : "locked";
    const progress = Math.round(Math.min(1, Math.max(0, (elapsed - from) / stage.weeks)) * 100);
    return { ...stage, firstWeek: from + 1, lastWeek: start, status, progress };
  });
  return { stages: timeline, totalWeeks: start, currentWeek: Math.min(start, Math.floor(elapsed) + 1) };
}

/** "Tuần 3" or "Tuần 3 – 5". */
export const weekRange = (first: number, last: number) => (first === last ? `Tuần ${first}` : `Tuần ${first} – ${last}`);
