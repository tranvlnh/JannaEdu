"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { grade, useExamDraft } from "@/lib/exam-draft";

/** Tab "Theo câu hỏi": chấm bài Reading đã làm (localStorage) với đáp án từ server. */
export function QuestionReview({ testId, answerKey }: { testId: string; answerKey: Record<number, string> }) {
  const router = useRouter();
  const { draft, reset } = useExamDraft(testId);

  if (!draft.submittedAt) {
    return (
      <p className="text-muted">
        Chưa có bài Reading đã nộp.{" "}
        <Link href={`/mock-test/${testId}`} className="font-semibold text-brand hover:underline">
          Làm bài ngay
        </Link>
      </p>
    );
  }

  const rows = grade(draft.answers, answerKey);
  const correct = rows.filter((r) => r.ok).length;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">
        Reading: <span className="text-success">{correct}</span>/{rows.length} câu đúng
      </p>
      <table className="w-full text-sm">
        <thead className="text-left text-muted">
          <tr>
            <th scope="col" className="py-1">Câu</th>
            <th scope="col">Bạn trả lời</th>
            <th scope="col">Đáp án</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.n} className="border-t border-navy/10">
              <td className="py-1.5 font-semibold">{r.n}</td>
              <td className={r.ok ? "text-success" : "text-danger"}>
                <span className="sr-only">{r.ok ? "Đúng: " : "Sai: "}</span>
                {r.given || "—"}
              </td>
              <td>{r.correct}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        variant="outline"
        className="self-start print:hidden"
        onClick={() => {
          reset();
          router.push(`/mock-test/${testId}`);
        }}
      >
        <RotateCcw className="size-4" aria-hidden />
        Làm lại
      </Button>
    </div>
  );
}
