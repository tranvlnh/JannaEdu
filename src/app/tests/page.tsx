import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Skill } from "@/contracts/exam";
import { Icon, type IconName } from "@/app/icons";
import { SKILL_STYLE } from "@/app/scores";
import { listAttempts, listTests } from "@/server/exam";
import { listSpeakingPrompts } from "@/server/speaking";
import { listWritingPrompts } from "@/server/writing";

const KIND = { exam: "Đề thi", practice: "Ôn tập" };

const FEATURES: [string, string, IconName][] = [
  ["Bám sát đề thi thật", "Cập nhật liên tục theo đề thi mới nhất", "test"],
  ["Áp lực thời gian", "Rèn luyện khả năng quản lý thời gian", "clock"],
  ["Giao diện chuẩn quốc tế", "Như IELTS trên máy tính", "course"],
  ["Đánh giá chi tiết", "Nhận kết quả và band điểm như bài thi thật", "target"],
];

const SKILLS: [string, keyof typeof SKILL_STYLE][] = [
  ["#listening", "listening"],
  ["#reading", "reading"],
  ["#writing", "writing"],
  ["#speaking", "speaking"],
];

type Card = { id: string; href: string; title: string; meta: React.ReactNode };

async function Tests() {
  const [tests, attempts, writing, speaking] = await Promise.all([
    listTests(),
    listAttempts(),
    listWritingPrompts(),
    listSpeakingPrompts(),
  ]);
  const testCards = (skill: Skill): Card[] =>
    tests
      .filter((t) => t.skill === skill)
      .map((t) => ({
        id: t.id,
        href: `/tests/${t.id}`,
        title: t.title,
        meta: (
          <>
            {KIND[t.kind]} · <Icon name="clock" className="size-4" />
            {t.durationSeconds ? `${Math.round(t.durationSeconds / 60)} phút` : "Không giới hạn"}
          </>
        ),
      }));
  const sections: [keyof typeof SKILL_STYLE, Card[]][] = [
    ["listening", testCards("listening")],
    ["reading", testCards("reading")],
    ["writing", writing.map((p) => ({ id: p.id, href: `/writing/${p.id}`, title: p.title, meta: `Writing Task ${p.task} · AI chấm band` }))],
    ["speaking", speaking.map((p) => ({ id: p.id, href: `/speaking/${p.id}`, title: p.title, meta: `Speaking Part ${p.part} · AI chấm band` }))],
  ];
  return (
    <>
      {sections.map(([skill, list]) => {
        const style = SKILL_STYLE[skill];
        return (
          <section key={skill} id={skill} className="flex scroll-mt-4 flex-col gap-3">
            <h2 className={`flex items-center gap-2 text-2xl font-bold ${style.text}`}>
              <Icon name={style.icon} /> {style.label}
            </h2>
            {list.length === 0 ? (
              <p className="text-slate-600">Chưa có đề nào.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {list.map((t) => (
                  <li key={t.id}>
                    <Link href={t.href} className="card flex items-center justify-between gap-4 hover:shadow-lg">
                      <span>
                        <span className="block text-lg font-bold">{t.title}</span>
                        <span className="flex items-center gap-1 text-sm text-slate-600">{t.meta}</span>
                      </span>
                      <span className="btn shrink-0">Làm ngay</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <section className="card">
        <h2 className="mb-3 text-xl font-bold">Bài đã nộp</h2>
        {attempts.length === 0 ? (
          <p className="text-slate-600">Chưa có bài nào.</p>
        ) : (
          <ul className="divide-y">
            {attempts.map((a) => (
              <li key={a.id}>
                <Link href={`/attempts/${a.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand">
                  <span>
                    <span className="block font-semibold">{a.testTitle}</span>
                    <span className="text-sm text-slate-600">
                      {new Date(a.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · {a.rawScore} câu đúng
                    </span>
                  </span>
                  {a.band !== null && <span className="text-xl font-bold">Band {a.band.toFixed(1)}</span>}
                </Link>
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
      <section className="relative grid items-center gap-4 overflow-hidden rounded-3xl md:grid-cols-[3fr_2fr]">
        <div aria-hidden className="absolute -left-16 -top-16 size-48 rounded-full bg-blue-400/80" />
        <div className="relative flex flex-col items-start gap-4 px-6 pt-10 md:py-12 md:pl-12">
        <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
          Trải nghiệm kỳ thi IELTS
          <br />
          <span className="text-brand">như thật – mọi lúc, mọi nơi</span>
        </h1>
        <p className="max-w-2xl text-lg">
          Mô phỏng chính xác cấu trúc đề thi, áp lực thời gian và giao diện như kỳ thi thật tại IDP/BC.
        </p>
        <Link href="#listening" className="btn px-6 py-3 text-lg">
          Bắt đầu thi thử <Icon name="arrow" className="size-5" />
        </Link>
        </div>
        <Image src="/ref/exam-student.jpg" alt="" width={1086} height={677} priority className="h-full w-full object-cover object-left" />
      </section>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(([title, text, icon]) => (
          <li key={title} className="card flex flex-col gap-1">
            <span className="mb-2 grid size-12 place-items-center self-center rounded-full bg-panel">
              <Icon name={icon} />
            </span>
            <span className="text-lg font-bold">{title}</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <section className="card">
        <h2 className="mb-4 text-2xl font-bold">Các kỹ năng</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SKILLS.map(([href, skill]) => {
            const style = SKILL_STYLE[skill];
            return (
              <li key={skill}>
                <Link href={href} className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-lg font-medium hover:shadow-md ${style.soft}`}>
                  <Icon name={style.icon} className={`size-9 ${style.text}`} />
                  {style.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Suspense fallback={<p>Loading...</p>}>
        <Tests />
      </Suspense>
    </main>
  );
}
