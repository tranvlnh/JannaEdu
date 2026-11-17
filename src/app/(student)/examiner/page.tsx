import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Bot, Mic } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { listSpeakingPrompts, listSpeakingSubmissions } from "@/server/speaking";

export const metadata: Metadata = { title: "Giám khảo AI – Speaking" };

export default function ExaminerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Bot className="size-14 shrink-0 text-brand-ink" aria-hidden />
        <div>
          <h1 className="text-4xl font-bold">
            Giám khảo AI · <span className="text-brand-ink">Speaking</span>
          </h1>
          <p className="mt-2 text-lg">Ghi âm câu trả lời, AI chấm band theo 4 tiêu chí và phân tích lỗi phát âm, từ vựng, ngữ pháp.</p>
        </div>
      </div>
      <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
        <Prompts />
      </Suspense>
    </div>
  );
}

async function Prompts() {
  const [prompts, submissions] = await Promise.all([listSpeakingPrompts(), listSpeakingSubmissions()]);
  return (
    <>
      <section aria-labelledby="prompts-title" className="flex flex-col gap-4">
        <h2 id="prompts-title" className="text-2xl font-bold">
          Chọn đề
        </h2>
        {prompts.length === 0 ? (
          <p className="text-muted">Chưa có đề nào.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {prompts.map((p) => (
              <li key={p.id}>
                <Card className="flex h-full flex-wrap items-center gap-4">
                  <Mic className="size-8 shrink-0 text-skill-speaking-ink" aria-hidden />
                  <div className="mr-auto min-w-0">
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    <Pill className="mt-1">Speaking Part {p.part}</Pill>
                  </div>
                  <Button href={`/examiner/${p.id}`}>Làm ngay</Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Bài đã nộp</h2>
        {submissions.length === 0 ? (
          <p className="text-muted">Bạn chưa nộp bài nào.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-navy/10">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link href={`/examiner/analysis/${s.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:text-brand-ink">
                  <span className="mr-auto">
                    <span className="block font-semibold">{s.promptTitle}</span>
                    <span className="text-sm text-muted">{formatDate(s.submittedAt)}</span>
                  </span>
                  {s.band === null ? <Pill tone="warning">Chưa chấm</Pill> : <span className="text-xl font-bold">Band {s.band.toFixed(1)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
