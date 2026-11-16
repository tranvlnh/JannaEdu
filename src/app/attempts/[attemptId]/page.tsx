import { Suspense } from "react";
import Link from "next/link";
import { getAttemptResult } from "@/server/exam";

async function Result({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const result = await getAttemptResult(attemptId);
  if (!result) return <p>Không tìm thấy kết quả. Bài có thể chưa được nộp.</p>;

  return (
    <>
      <header>
        <h1 className="text-xl font-semibold">{result.test.title}</h1>
        <p className="mt-1 text-lg">
          Đúng {result.rawScore}/{result.total} câu
          {result.band !== null && (
            <>
              {" · "}
              <strong>Band {result.band.toFixed(1)}</strong>
            </>
          )}
        </p>
      </header>

      {result.answers.length > 0 && (
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className="py-2 pr-2">Câu</th>
            <th scope="col" className="py-2 pr-2">Bạn trả lời</th>
            <th scope="col" className="py-2 pr-2">Kết quả</th>
            <th scope="col" className="py-2">Đáp án</th>
          </tr>
        </thead>
        <tbody>
          {result.answers.map((a) => (
            <tr key={a.questionId} className="border-b align-top">
              <th scope="row" className="py-2 pr-2">{a.number}</th>
              <td className="py-2 pr-2">{a.answer || <span className="text-zinc-500">(bỏ trống)</span>}</td>
              <td className={`py-2 pr-2 ${a.correct ? "text-green-700" : "text-red-600"}`}>{a.correct ? "✓ Đúng" : "✗ Sai"}</td>
              <td className="py-2">{a.accepted.join(" / ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </>
  );
}

export default function AttemptPage({ params }: PageProps<"/attempts/[attemptId]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Result params={params} />
      </Suspense>
      <Link href="/tests" className="underline">
        ← Danh sách đề
      </Link>
    </main>
  );
}
