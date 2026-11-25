import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ExamRoom } from "@/app/(exam)/mock-test/[id]/exam-room";
import type { SaveAnswersInput } from "@/contracts/exam";
import { homeOf } from "@/server/auth";
import { listTests, saveAnswers, startAttempt, submitAttempt } from "@/server/exam";
import { completePlacement, getPlacement } from "@/server/placement";
import { getProfile } from "@/server/profile";

export const metadata: Metadata = { title: "Kiểm tra xếp lớp" };

export default function PlacementTestPage({ params }: PageProps<"/placement/test/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Đang tải đề thi…</p>}>
      <Exam params={params} />
    </Suspense>
  );
}

async function Exam({ params }: Pick<PageProps<"/placement/test/[id]">, "params">) {
  const { id: testId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const [tests, { parts }] = await Promise.all([listTests(), getPlacement()]);
  const test = parts.some((p) => p.itemId === testId) ? tests.find((t) => t.id === testId) : undefined;
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
    await completePlacement();
    redirect("/placement");
  }

  return <ExamRoom test={test} start={start} save={save} submit={submit} />;
}
