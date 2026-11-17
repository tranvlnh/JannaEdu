import { Suspense } from "react";
import { Icon } from "@/app/icons";
import Link from "next/link";
import { listSpeakingPrompts, listSpeakingSubmissions } from "@/server/speaking";

async function Speaking() {
  const [prompts, submissions] = await Promise.all([listSpeakingPrompts(), listSpeakingSubmissions()]);
  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Chọn đề</h2>
        {prompts.length === 0 ? (
          <p className="text-slate-600">Chưa có đề nào.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {prompts.map((p) => (
              <li key={p.id}>
                <Link href={`/speaking/${p.id}`} className="card flex items-center justify-between gap-4 hover:shadow-lg">
                  <span>
                    <span className="block text-lg font-bold">{p.title}</span>
                    <span className="mt-1 inline-block rounded-full bg-blue-200 px-3 py-0.5 text-sm">Speaking Part {p.part}</span>
                  </span>
                  <span className="btn shrink-0">Làm ngay</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-xl font-bold">Bài đã nộp</h2>
        {submissions.length === 0 ? (
          <p className="text-slate-600">Chưa có bài nào.</p>
        ) : (
          <ul className="divide-y">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link href={`/speaking/submissions/${s.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand">
                  <span>
                    <span className="block font-semibold">{s.promptTitle}</span>
                    <span className="text-sm text-slate-600">
                      {new Date(s.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                    </span>
                  </span>
                  <span className="text-xl font-bold">{s.band === null ? "Chưa chấm" : `Band ${s.band.toFixed(1)}`}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function SpeakingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
      <header className="flex items-center gap-4">
        <Icon name="robot" className="size-14 shrink-0 text-brand" />
        <div>
          <h1 className="page-title">
            Giám khảo AI · <span className="text-brand">Speaking</span>
          </h1>
          <p className="mt-1 text-lg">Ghi âm câu trả lời, AI chấm band theo 4 tiêu chí và phân tích lỗi phát âm, từ vựng, ngữ pháp.</p>
        </div>
      </header>
      <Suspense fallback={<p>Loading...</p>}>
        <Speaking />
      </Suspense>
    </main>
  );
}
