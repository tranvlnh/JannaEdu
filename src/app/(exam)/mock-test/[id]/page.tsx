import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { SaveAnswersInput } from "@/contracts/exam";
import { homeOf } from "@/server/auth";
import { listTests, saveAnswers, startAttempt, submitAttempt } from "@/server/exam";
import { getProfile } from "@/server/profile";
import { ExamRoom } from "./exam-room";

export const metadata: Metadata = { title: "Phòng thi" };

export default function ExamPage({ params }: PageProps<"/mock-test/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Đang tải đề thi…</p>}>
      <Exam params={params} />
    </Suspense>
  );
}

async function Exam({ params }: Pick<PageProps<"/mock-test/[id]">, "params">) {
  const { id: testId } = await params;
  const [profile, tests] = await Promise.all([getProfile(), listTests()]);
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const test = tests.find((t) => t.id === testId);
  if (!test) notFound();

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
    redirect(`/mock-test/result/${attemptId}`);
  }

  return <ExamRoom test={test} start={start} save={save} submit={submit} />;
}
