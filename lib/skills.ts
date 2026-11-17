export type Skill = "listening" | "reading" | "writing" | "speaking";

export const SKILLS: Skill[] = ["listening", "reading", "writing", "speaking"];

// Class đầy đủ (không ghép chuỗi) để Tailwind quét được.
export const skillStyle: Record<
  Skill,
  { label: string; text: string; bg: string; soft: string; border: string; color: string }
> = {
  listening: {
    label: "Listening",
    text: "text-skill-listening",
    bg: "bg-skill-listening",
    soft: "bg-skill-listening/10",
    border: "border-skill-listening",
    color: "var(--color-skill-listening)",
  },
  reading: {
    label: "Reading",
    text: "text-skill-reading",
    bg: "bg-skill-reading",
    soft: "bg-skill-reading/10",
    border: "border-skill-reading",
    color: "var(--color-skill-reading)",
  },
  writing: {
    label: "Writing",
    text: "text-skill-writing",
    bg: "bg-skill-writing",
    soft: "bg-skill-writing/10",
    border: "border-skill-writing",
    color: "var(--color-skill-writing)",
  },
  speaking: {
    label: "Speaking",
    text: "text-skill-speaking",
    bg: "bg-skill-speaking",
    soft: "bg-skill-speaking/10",
    border: "border-skill-speaking",
    color: "var(--color-skill-speaking)",
  },
};

export type SkillScores = Record<Skill, number>;

/** Overall IELTS: trung bình 4 kỹ năng, làm tròn tới 0.5 gần nhất (.25 → lên .5, .75 → lên số nguyên). */
export function overallBand(s: SkillScores): number {
  return roundBand(SKILLS.reduce((sum, k) => sum + s[k], 0) / SKILLS.length);
}

/** Làm tròn tới 0.5 gần nhất, .25/.75 làm tròn lên (cũng dùng cho band tiêu chí Speaking/Writing). */
export function roundBand(avg: number): number {
  return Math.round(avg * 2) / 2;
}
