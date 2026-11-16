import { Suspense } from "react";
import Link from "next/link";
import { listSpeakingPrompts, listSpeakingSubmissions } from "@/server/speaking";

async function Speaking() {
  const [prompts, submissions] = await Promise.all([listSpeakingPrompts(), listSpeakingSubmissions()]);
  return (
    <>
      <section>
        <h1 className="text-xl font-semibold">Luyện Speaking</h1>
        {prompts.length === 0 ? (
          <p className="text-sm text-zinc-600">Chưa có đề nào.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {prompts.map((p) => (
              <li key={p.id}>
                <Link href={`/speaking/${p.id}`} className="block rounded border p-3 hover:bg-zinc-50">
                  <span className="font-medium">{p.title}</span>
                  <br />
                  <span className="text-sm text-zinc-600">Part {p.part}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold">Bài đã nộp</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-zinc-600">Chưa có bài nào.</p>
        ) : (
          <ul className="mt-2 list-disc pl-5">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link href={`/speaking/submissions/${s.id}`} className="underline">
                  {s.promptTitle}
                </Link>{" "}
                <span className="text-sm text-zinc-600">
                  {new Date(s.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} ·{" "}
                  {s.band === null ? "Chưa chấm" : `Band ${s.band.toFixed(1)}`}
                </span>
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Speaking />
      </Suspense>
    </main>
  );
}
