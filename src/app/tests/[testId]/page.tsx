import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { SaveAnswersInput } from "@/contracts/exam";
import { listTests, saveAnswers, startAttempt, submitAttempt } from "@/server/exam";
import { getProfile } from "@/server/profile";
import { ExamRoom } from "./exam-room";

async function Room({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const [profile, tests] = await Promise.all([getProfile(), listTests()]);
  if (!profile) redirect("/login");
  const test = tests.find((t) => t.id === testId);
  if (!test) notFound();
  if (profile.role !== "student") return <p className="p-6">Chỉ tài khoản học sinh mới làm bài được.</p>;

  // The attempt (and its timer) starts on the button click, never on page load or prefetch.
  async function start() {
    "use server";
    return startAttempt({ testId });
  }
  async function save(input: SaveAnswersInput) {
    "use server";
    return saveAnswers(input);
  }
  async function submit(attemptId: string) {
    "use server";
    await submitAttempt({ attemptId });
    redirect(`/attempts/${attemptId}`);
  }

  return <ExamRoom test={test} start={start} save={save} submit={submit} />;
}

export default function TestPage({ params }: PageProps<"/tests/[testId]">) {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <Room params={params} />
    </Suspense>
  );
}
