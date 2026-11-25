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

/** Every week of the path in order, each with its stage; only the current week of the current stage is "current". */
export function pathWeeks<T extends { firstWeek: number; lastWeek: number; status: StageStatus }>(stages: T[], currentWeek: number) {
  return stages.flatMap((stage) =>
    Array.from({ length: stage.lastWeek - stage.firstWeek + 1 }, (_, i) => {
      const week = stage.firstWeek + i;
      const status: StageStatus =
        stage.status !== "current" ? stage.status : week < currentWeek ? "done" : week === currentWeek ? "current" : "locked";
      return { week, stage, status };
    }),
  );
}
