// Pure grading rules for Reading/Listening. No I/O, so it is testable with `npm test`.
import type { Skill } from "@/contracts/exam";

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export const isCorrect = (answer: string | null, accepted: string[]) =>
  answer !== null && accepted.some((a) => normalize(a) === normalize(answer));

// [minimum raw score out of 40, band]. Approximate public IELTS conversion; Reading is the Academic table.
const BANDS: Record<Skill, [number, number][]> = {
  reading: [
    [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5],
    [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1],
  ],
  listening: [
    [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5],
    [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1],
  ],
};

// Tests with a question count other than 40 are scaled to 40 first.
export function toBand(skill: Skill, rawScore: number, total: number): number {
  const scaled = total > 0 ? Math.round((rawScore * 40) / total) : 0;
  return BANDS[skill].find(([min]) => scaled >= min)?.[1] ?? 0;
}

// IELTS overall band: mean of the criteria, rounded to the nearest half band (.25 and .75 round up).
export const overallBand = (bands: number[]) =>
  Math.round((bands.reduce((sum, b) => sum + b, 0) / bands.length) * 2) / 2;
