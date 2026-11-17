import { Suspense } from "react";
import { Bot } from "lucide-react";
import Link from "next/link";
import { listWritingPrompts, listWritingSubmissions } from "@/server/writing";

async function Writing() {
  const [prompts, submissions] = await Promise.all([listWritingPrompts(), listWritingSubmissions()]);
  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Chọn đề</h2>
        {prompts.length === 0 ? (
          <p className="text-muted">Chưa có đề nào.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {prompts.map((p) => (
              <li key={p.id}>
                <Link href={`/writing/${p.id}`} className="card flex items-center justify-between gap-4 hover:shadow-lg">
                  <span>
                    <span className="block text-lg font-bold">{p.title}</span>
                    <span className="mt-1 inline-block rounded-full bg-surface px-3 py-0.5 text-sm">Writing Task {p.task}</span>
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
          <p className="text-muted">Chưa có bài nào.</p>
        ) : (
          <ul className="divide-y divide-navy/10">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link href={`/writing/submissions/${s.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand-ink">
                  <span>
                    <span className="block font-semibold">{s.promptTitle}</span>
                    <span className="text-sm text-muted">
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

export default function WritingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex items-center gap-4">
        <Bot className="size-14 shrink-0 text-brand-ink" aria-hidden />
        <div>
          <h1 className="page-title">
            Giám khảo AI · <span className="text-brand-ink">Writing</span>
          </h1>
          <p className="mt-1 text-lg">Viết bài theo đề, AI chấm band theo 4 tiêu chí và chỉ ra từng lỗi cần sửa.</p>
        </div>
      </header>
      <Suspense fallback={<p>Loading...</p>}>
        <Writing />
      </Suspense>
    </div>
  );
}
