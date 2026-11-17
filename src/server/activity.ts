// Everything a student has handed in, as one newest-first list: exams, essays and recordings.
import { cache } from "react";
import type { Activity } from "@/lib/progress";
import { listAttempts } from "@/server/exam";
import { listSpeakingSubmissions } from "@/server/speaking";
import { listWritingSubmissions } from "@/server/writing";

// One clock reading per request, so every part of a page agrees on "now".
export const requestTime = cache(() => Date.now());

// No studentId: the caller's own work (RLS). A parent passes the child's id.
export async function listActivity(studentId?: string): Promise<Activity[]> {
  const [attempts, essays, talks] = await Promise.all([
    listAttempts(studentId),
    listWritingSubmissions(studentId),
    listSpeakingSubmissions(studentId),
  ]);
  return [
    ...attempts.map((a) => ({
      id: a.id,
      skill: a.skill,
      kind: a.kind,
      title: a.testTitle,
      submittedAt: a.submittedAt,
      band: a.band,
      detail: `${a.rawScore} câu đúng`,
      href: `/mock-test/result/${a.id}`,
    })),
    ...essays.map((s) => ({
      id: s.id,
      skill: "writing" as const,
      kind: "writing" as const,
      title: s.promptTitle,
      submittedAt: s.submittedAt,
      band: s.band,
      detail: s.band === null ? "Chưa chấm" : "AI đã chấm",
      href: `/examiner/writing/analysis/${s.id}`,
    })),
    ...talks.map((s) => ({
      id: s.id,
      skill: "speaking" as const,
      kind: "speaking" as const,
      title: s.promptTitle,
      submittedAt: s.submittedAt,
      band: s.band,
      detail: s.band === null ? "Chưa chấm" : "AI đã chấm",
      href: `/examiner/analysis/${s.id}`,
    })),
  ].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
}
