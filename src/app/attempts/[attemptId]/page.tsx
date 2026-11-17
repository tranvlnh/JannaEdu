import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/app/icons";
import { BandBar, BandRing, SKILL_STYLE } from "@/app/scores";
import { getAttemptResult } from "@/server/exam";

async function Result({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const result = await getAttemptResult(attemptId);
  if (!result) return <p>Không tìm thấy kết quả. Bài có thể chưa được nộp.</p>;
  const style = SKILL_STYLE[result.test.skill];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold">Kết quả bài thi</h1>
          <p className="mt-1 text-lg">{result.test.title}</p>
        </div>
        {result.attempt.submittedAt && (
          <p className="text-slate-600">
            Ngày thi: {new Date(result.attempt.submittedAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </p>
        )}
      </header>

      <div className="grid gap-5 md:grid-cols-[auto_1fr]">
        <section className="card flex flex-col items-center gap-3 px-10">
          <h2 className="text-lg font-semibold">{result.band === null ? "Bài ôn tập" : "Band score"}</h2>
          <BandRing band={result.band} label={style.label} className="size-44" />
        </section>

        <section className={`card flex flex-col justify-center gap-3 border-2 border-current ${style.text}`}>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Icon name={style.icon} /> {style.label}
          </h2>
          <p className="text-5xl font-extrabold text-navy">
            {result.rawScore}
            <span className="text-2xl font-semibold text-slate-500">/{result.total} câu đúng</span>
          </p>
          <BandBar band={(result.rawScore / result.total) * 9} className={style.bar} />
        </section>
      </div>

      {result.answers.length > 0 && (
        <section className="card overflow-x-auto">
          <h2 className="mb-3 text-xl font-bold">Theo câu hỏi</h2>
          <table className="w-full border-collapse text-left">
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
                <tr key={a.questionId} className="border-b align-top last:border-0">
                  <th scope="row" className="py-2 pr-2">{a.number}</th>
                  <td className="py-2 pr-2">{a.answer || <span className="text-slate-500">(bỏ trống)</span>}</td>
                  <td className={`py-2 pr-2 font-medium ${a.correct ? "text-green-700" : "text-red-600"}`}>
                    {a.correct ? "✓ Đúng" : "✗ Sai"}
                  </td>
                  <td className="py-2">{a.accepted.join(" / ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="card flex flex-wrap items-center justify-between gap-4">
        <p className="text-xl font-semibold">Improve your skills everyday!</p>
        <Link href="/learning-path" className="btn px-6 py-3">
          Xem lộ trình cá nhân <Icon name="arrow" className="size-5" />
        </Link>
      </section>
    </>
  );
}

export default function AttemptPage({ params }: PageProps<"/attempts/[attemptId]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
      <Suspense fallback={<p>Loading...</p>}>
        <Result params={params} />
      </Suspense>
      <Link href="/tests" className="flex items-center gap-1 font-medium text-brand hover:underline">
        <Icon name="back" className="size-5" /> Danh sách đề
      </Link>
    </main>
  );
}
