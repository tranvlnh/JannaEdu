import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { readingTest } from "@/lib/mock/exam";
import { ReadingExam } from "./reading-exam";

// ponytail: 1 đề mock; khi có BE thay bằng fetch theo id
const TESTS = { [readingTest.id]: readingTest };

export function generateStaticParams() {
  return Object.keys(TESTS).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/mock-test/[id]">): Promise<Metadata> {
  const test = TESTS[(await params).id];
  return { title: test?.title ?? "Không tìm thấy đề" };
}

// Đọc params trong Suspense để App Shell không gắn với 1 URL (partialPrefetching).
export default function ExamPage({ params }: PageProps<"/mock-test/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Đang tải đề thi…</p>}>
      <Exam params={params} />
    </Suspense>
  );
}

async function Exam({ params }: Pick<PageProps<"/mock-test/[id]">, "params">) {
  const test = TESTS[(await params).id];
  if (!test) notFound();
  // Không gửi đáp án xuống client khi đang làm bài.
  return <ReadingExam test={{ id: test.id, title: test.title, minutes: test.minutes, passages: test.passages }} />;
}
