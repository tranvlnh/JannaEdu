import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/app/icons";
import { SKILL_STYLE } from "@/app/scores";
import { listSpeakingSubmissions } from "@/server/speaking";
import { listWritingSubmissions } from "@/server/writing";

async function Reviews() {
  const [writing, speaking] = await Promise.all([listWritingSubmissions(), listSpeakingSubmissions()]);
  const items = [
    ...writing.map((s) => ({ ...s, skill: "writing" as const })),
    ...speaking.map((s) => ({ ...s, skill: "speaking" as const })),
  ].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));

  if (items.length === 0) {
    return (
      <p className="card text-slate-600">
        Chưa có bài nào. Làm đề Writing hoặc Speaking trong{" "}
        <Link href="/tests" className="font-medium text-brand underline">Luyện đề</Link> để AI nhận xét.
      </p>
    );
  }
  return (
    <ul className="card divide-y">
      {items.map((s) => {
        const style = SKILL_STYLE[s.skill];
        return (
          <li key={`${s.skill}-${s.id}`}>
            <Link href={`/${s.skill}/submissions/${s.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand">
              <span className="flex items-center gap-3">
                <Icon name={style.icon} className={`size-6 shrink-0 ${style.text}`} />
                <span>
                  <span className="block font-semibold">{s.promptTitle}</span>
                  <span className="text-sm text-slate-600">
                    {style.label} · {new Date(s.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </span>
                </span>
              </span>
              <span className="text-xl font-bold">{s.band === null ? "Chưa chấm" : `Band ${s.band.toFixed(1)}`}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AiReviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
      <header className="flex items-center gap-4">
        <Icon name="robot" className="size-14 shrink-0 text-brand" />
        <div>
          <h1 className="page-title">
            <span className="text-brand">AI</span> nhận xét
          </h1>
          <p className="mt-1 text-lg">Tất cả bài Writing và Speaking đã được giám khảo AI chấm band và phân tích lỗi.</p>
        </div>
      </header>
      <Suspense fallback={<p>Loading...</p>}>
        <Reviews />
      </Suspense>
    </main>
  );
}
