// Today's tasks for a student, derived from their learning path and what they handed in today. No storage.
import { pathTimeline } from "./path.ts";
import type { Activity } from "./progress.ts";
import { SKILLS, skillStyle, type Skill } from "./skills.ts";

export type DailyTask = { id: string; label: string; href: string; done: boolean };

type Path = {
  stages: { weeks: number; skills: Skill[]; tasks: string[] }[];
  bands: Partial<Record<Skill, number | null>>;
  generatedAt: string;
};

const DAY = 24 * 60 * 60 * 1000;
const VN_OFFSET = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh has no DST

/** Calendar day number in Vietnam time, so "today" flips at local midnight. */
export const vnDay = (ms: number) => Math.floor((ms + VN_OFFSET) / DAY);

const HREF: Record<Skill, string> = {
  reading: "/mock-test",
  listening: "/mock-test",
  writing: "/examiner",
  speaking: "/examiner",
};

// A stage task is free text from the AI; it counts for the skill it names, else for the stage's skill.
const skillOf = (text: string, fallback: Skill) => SKILLS.find((s) => text.toLowerCase().includes(s)) ?? fallback;

export function dailyTasks(path: Path, activity: Activity[], now: number): DailyTask[] {
  const { stages } = pathTimeline(path.stages, path.generatedAt, now);
  const stage = stages.find((s) => s.status === "current") ?? stages.at(-1)!;
  const day = Math.max(0, vnDay(now) - vnDay(Date.parse(path.generatedAt)));

  const picked = Array.from({ length: Math.min(3, stage.tasks.length) }, (_, i) => {
    const text = stage.tasks[(day + i) % stage.tasks.length];
    return { id: `stage-${i}`, label: text, skill: skillOf(text, stage.skills[(day + i) % stage.skills.length]) };
  });
  // One practice task a day, cycling through the skills weakest first (no result yet = weakest).
  const weakest = [...SKILLS].sort((a, b) => (path.bands[a] ?? -1) - (path.bands[b] ?? -1));
  const practice = weakest[day % weakest.length];
  picked.push({ id: "practice", label: `Làm 1 bài ${skillStyle[practice].label}`, skill: practice });

  // Each submission today ticks off one task of its skill, in list order.
  const left = Object.fromEntries(SKILLS.map((s) => [s, 0])) as Record<Skill, number>;
  for (const a of activity) if (vnDay(Date.parse(a.submittedAt)) === vnDay(now)) left[a.skill]++;
  return picked.map(({ id, label, skill }) => ({ id, label, href: HREF[skill], done: left[skill]-- > 0 }));
}
