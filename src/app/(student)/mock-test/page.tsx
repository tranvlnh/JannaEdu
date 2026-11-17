import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Laptop, NotebookText, SearchCheck, Timer, type LucideIcon } from "lucide-react";
import { Button, Card, Pill, SKILL_ICON } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { SKILLS, skillStyle, type Skill } from "@/lib/skills";
import { listAttempts, listTests } from "@/server/exam";
import { listSpeakingPrompts } from "@/server/speaking";
import { listWritingPrompts } from "@/server/writing";

export const metadata: Metadata = { title: "Phòng thi ảo" };

const PERKS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: NotebookText, title: "Bám sát đề thi thật", text: "Cập nhật liên tục theo đề thi mới nhất" },
  { icon: Timer, title: "Áp lực thời gian", text: "Rèn luyện kỹ năng quản lý thời gian" },
  { icon: Laptop, title: "Giao diện chuẩn quốc tế", text: "Như bài thi IELTS trên máy tính" },
  { icon: SearchCheck, title: "Đánh giá chi tiết", text: "Nhận kết quả và phân tích như bài thi thật" },
];

type Item = { id: string; href: string; title: string; meta: string };

export default function MockTestPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl bg-white/60 px-6 py-10 sm:px-10 sm:py-14">
        <div aria-hidden className="absolute -top-16 -left-16 size-48 rounded-full bg-skill-listening/30" />
        <Image src="/ref/exam-student.jpg" alt="" width={1065} height={677} preload className="absolute right-0 bottom-0 hidden h-full w-[40%] object-contain object-right-bottom xl:block" />
        <div className="relative max-w-2xl xl:max-w-[58%]">
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            Trải nghiệm kỳ thi IELTS <span className="block text-brand-ink">như thật – mọi lúc, mọi nơi</span>
          </h1>
          <p className="mt-4 text-lg text-navy/80">Mô phỏng chính xác cấu trúc đề thi, áp lực thời gian và giao diện như kỳ thi thật tại IDP/BC.</p>
          <Button href="#listening" className="mt-6 px-8 py-3 text-lg">
            Bắt đầu thi thử <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Card className="h-full text-center">
              <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface">
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-1 text-muted">{text}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Các kỹ năng</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SKILLS.map((skill) => {
            const Icon = SKILL_ICON[skill];
            const s = skillStyle[skill];
            return (
              <li key={skill}>
                <Link
                  href={`#${skill}`}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand ${s.soft}`}
                >
                  <Icon className={`size-7 ${s.text}`} aria-hidden />
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <Suspense fallback={<p className="text-muted">Đang tải đề thi…</p>}>
        <Tests />
      </Suspense>
    </div>
  );
}

async function Tests() {
  const [tests, attempts, writing, speaking] = await Promise.all([listTests(), listAttempts(), listWritingPrompts(), listSpeakingPrompts()]);
  const testItems = (skill: "reading" | "listening"): Item[] =>
    tests
      .filter((t) => t.skill === skill)
      .map((t) => ({
        id: t.id,
        href: `/mock-test/${t.id}`,
        title: t.title,
        meta: `${t.kind === "exam" ? "Đề thi" : "Ôn tập"} · ${t.durationSeconds ? `${Math.round(t.durationSeconds / 60)} phút` : "Không giới hạn"}`,
      }));
  const sections: Record<Skill, Item[]> = {
    listening: testItems("listening"),
    reading: testItems("reading"),
    writing: writing.map((p) => ({ id: p.id, href: `/examiner/writing/${p.id}`, title: p.title, meta: `Writing Task ${p.task} · AI chấm band` })),
    speaking: speaking.map((p) => ({ id: p.id, href: `/examiner/${p.id}`, title: p.title, meta: `Speaking Part ${p.part} · AI chấm band` })),
  };

  return (
    <>
      {SKILLS.map((skill) => {
        const Icon = SKILL_ICON[skill];
        const s = skillStyle[skill];
        return (
          <section key={skill} id={skill} aria-labelledby={`${skill}-title`} className="flex scroll-mt-24 flex-col gap-4">
            <h2 id={`${skill}-title`} className={`flex items-center gap-2 text-2xl font-bold ${s.text}`}>
              <Icon className="size-7" aria-hidden />
              {s.label}
            </h2>
            {sections[skill].length === 0 ? (
              <p className="text-muted">Chưa có đề nào.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {sections[skill].map((t) => (
                  <li key={t.id}>
                    <Card className="flex h-full flex-wrap items-center gap-4">
                      <div className="mr-auto min-w-0">
                        <h3 className="text-lg font-bold">{t.title}</h3>
                        <p className="flex items-center gap-1 text-sm text-muted">
                          <Clock className="size-4" aria-hidden />
                          {t.meta}
                        </p>
                      </div>
                      <Button href={t.href}>Làm ngay</Button>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <Card>
        <h2 className="mb-4 text-xl font-bold">Bài thi đã nộp</h2>
        {attempts.length === 0 ? (
          <p className="text-muted">Bạn chưa nộp bài thi nào.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-navy/10">
            {attempts.map((a) => (
              <li key={a.id}>
                <Link href={`/mock-test/result/${a.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:text-brand-ink">
                  <span className="mr-auto">
                    <span className="block font-semibold">{a.testTitle}</span>
                    <span className="text-sm text-muted">
                      {formatDate(a.submittedAt)} · {a.rawScore} câu đúng
                    </span>
                  </span>
                  {a.band === null ? <Pill>Ôn tập</Pill> : <span className="text-xl font-bold">Band {a.band.toFixed(1)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
