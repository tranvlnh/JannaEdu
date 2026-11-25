import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { band } from "@/lib/format";
import { pathTimeline } from "@/lib/path";
import { bandsAt } from "@/lib/progress";
import { SKILLS, type Skill } from "@/lib/skills";
import { listActivity, requestTime } from "@/server/activity";
import { listTests } from "@/server/exam";
import { getMyLearningPath } from "@/server/learning-path";
import { getProfile } from "@/server/profile";
import { listSpeakingPrompts } from "@/server/speaking";
import { listWritingPrompts } from "@/server/writing";
import { ExerciseList, type Exercise } from "./exercise-list";

export const metadata: Metadata = { title: "Gợi ý bài tập" };

// IELTS timings for the AI-graded tasks.
const WRITING_MINUTES = { 1: 20, 2: 40 };
const SPEAKING_MINUTES = { 1: 5, 2: 4, 3: 5 };

export default function ExercisesPage({ searchParams }: PageProps<"/path/exercises">) {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải bài tập…</p>}>
      <Exercises searchParams={searchParams} />
    </Suspense>
  );
}

async function Exercises({ searchParams }: Pick<PageProps<"/path/exercises">, "searchParams">) {
  const { skill } = await searchParams;
  const initialSkill = SKILLS.find((option) => option === skill);
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const [{ path }, activity, tests, writing, speaking] = await Promise.all([
    getMyLearningPath(),
    listActivity(),
    listTests(),
    listWritingPrompts(),
    listSpeakingPrompts(),
  ]);

  // Suggested: the skills of the current stage; without a path, the two weakest (untested counts as weakest).
  const bands = bandsAt(activity);
  const current = path && pathTimeline(path.stages, path.startedAt ?? path.generatedAt, requestTime()).stages.find((s) => s.status === "current");
  const focus = new Set<Skill>(current?.skills ?? [...SKILLS].sort((a, b) => (bands[a] ?? -1) - (bands[b] ?? -1)).slice(0, 2));

  const exercises: Exercise[] = [
    ...tests.map((t) => ({
      id: t.id,
      skill: t.skill,
      part: t.kind === "exam" ? "Đề thi" : "Ôn tập",
      title: t.title,
      description: t.kind === "exam" ? "Làm như thi thật, chấm band ngay khi nộp" : "Làm không áp lực, xem đáp án từng câu sau khi nộp",
      minutes: t.durationSeconds && Math.round(t.durationSeconds / 60),
      href: `/mock-test/${t.id}`,
    })),
    ...writing.map((p) => ({
      id: p.id,
      skill: "writing" as const,
      part: `Task ${p.task}`,
      title: p.title,
      description: "AI chấm band theo 4 tiêu chí và chỉ ra từng lỗi",
      minutes: WRITING_MINUTES[p.task],
      href: `/examiner/writing/${p.id}`,
    })),
    ...speaking.map((p) => ({
      id: p.id,
      skill: "speaking" as const,
      part: `Part ${p.part}`,
      title: p.title,
      description: "Ghi âm câu trả lời, AI chấm phát âm, từ vựng, ngữ pháp",
      minutes: SPEAKING_MINUTES[p.part],
      href: `/examiner/${p.id}`,
    })),
  ]
    .map((e) => ({ ...e, suggested: focus.has(e.skill) }))
    .sort((a, b) => Number(b.suggested) - Number(a.suggested));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Gợi ý bài tập</h1>
          <p className="mt-2 text-lg">
            {current ? `Đang ở giai đoạn “${current.title}”, Janna ưu tiên các bài dưới đây.` : "Dựa trên kết quả của bạn, Janna ưu tiên các kỹ năng còn yếu."}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-navy bg-white px-5 py-3">
          <Target className="size-9" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Mục tiêu điểm số</p>
            {profile.goalBand === null ? (
              <Link href="/account" className="font-bold text-brand-ink hover:underline">
                Đặt mục tiêu
              </Link>
            ) : (
              <p className="text-3xl font-bold">{band(profile.goalBand)}</p>
            )}
          </div>
        </div>
      </div>
      <ExerciseList key={initialSkill} exercises={exercises} initialSkill={initialSkill} />
    </div>
  );
}
