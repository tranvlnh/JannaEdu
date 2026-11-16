import { Suspense } from "react";
import Link from "next/link";
import { listAttempts, listTests } from "@/server/exam";

const SKILL = { reading: "Reading", listening: "Listening" };
const KIND = { exam: "Đề thi", practice: "Ôn tập" };

async function Tests() {
  const [tests, attempts] = await Promise.all([listTests(), listAttempts()]);
  return (
    <>
      <section>
        <h1 className="text-xl font-semibold">Đề luyện tập</h1>
        {tests.length === 0 ? (
          <p className="text-sm text-zinc-600">Chưa có đề nào.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {tests.map((t) => (
              <li key={t.id}>
                <Link href={`/tests/${t.id}`} className="block rounded border p-3 hover:bg-zinc-50">
                  <span className="font-medium">{t.title}</span>
                  <br />
                  <span className="text-sm text-zinc-600">
                    {SKILL[t.skill]} · {KIND[t.kind]} ·{" "}
                    {t.durationSeconds ? `${Math.round(t.durationSeconds / 60)} phút` : "Không giới hạn thời gian"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold">Bài đã nộp</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-zinc-600">Chưa có bài nào.</p>
        ) : (
          <ul className="mt-2 list-disc pl-5">
            {attempts.map((a) => (
              <li key={a.id}>
                <Link href={`/attempts/${a.id}`} className="underline">
                  {a.testTitle}
                </Link>{" "}
                <span className="text-sm text-zinc-600">
                  {new Date(a.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · {a.rawScore} câu
                  đúng{a.band !== null && ` · Band ${a.band.toFixed(1)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function TestsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Tests />
      </Suspense>
    </main>
  );
}
