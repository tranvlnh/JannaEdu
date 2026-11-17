import type { Metadata } from "next";
import { ArrowRight, Laptop, NotebookText, SearchCheck, Timer, type LucideIcon } from "lucide-react";
import { Button, Card, Pill, SKILL_ICON } from "@/components/ui";
import { readingTest } from "@/lib/mock/exam";
import { SKILLS, skillStyle } from "@/lib/skills";

export const metadata: Metadata = { title: "Phòng thi ảo" };

const PERKS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: NotebookText, title: "Bám sát đề thi thật", text: "Cập nhật liên tục theo đề thi mới nhất" },
  { icon: Timer, title: "Áp lực thời gian", text: "Rèn luyện kỹ năng quản lý thời gian" },
  { icon: Laptop, title: "Giao diện chuẩn quốc tế", text: "Như bài thi IELTS trên máy tính" },
  { icon: SearchCheck, title: "Đánh giá chi tiết", text: "Nhận kết quả và phân tích như bài thi thật" },
];

// ponytail: mới có đề Reading; kỹ năng khác hiện "Sắp có" tới khi có mock data
const AVAILABLE = { reading: readingTest.id } as const;

export default function MockTestPage() {
  const startHref = `/mock-test/${readingTest.id}`;
  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl bg-white/60 px-6 py-10 sm:px-10 sm:py-14">
        <div aria-hidden className="absolute -top-16 -left-16 size-48 rounded-full bg-skill-listening/30" />
        <div aria-hidden className="absolute right-24 -bottom-32 hidden size-80 rounded-full bg-skill-listening/40 xl:block" />
        <div aria-hidden className="absolute -right-20 -bottom-24 hidden size-96 rounded-full bg-brand xl:block" />
        <div className="relative max-w-2xl">
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            Trải nghiệm kỳ thi IELTS <span className="block text-brand-ink">như thật – mọi lúc, mọi nơi</span>
          </h1>
          <p className="mt-4 text-lg text-navy/80">
            Mô phỏng chính xác cấu trúc đề thi, áp lực thời gian và giao diện như kỳ thi thật tại IDP/BC.
          </p>
          <Button href={startHref} className="mt-6 px-8 py-3 text-lg">
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

      {/* Form GET thuần: chọn loại đề + bấm kỹ năng = submit, không cần JS */}
      <form action={startHref} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <fieldset>
            <legend className="mb-4 text-xl font-bold">Chọn bài thi</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* ponytail: chỉ có đề Academic; General Training khóa tới khi có dữ liệu */}
              {[
                { label: "IELTS Academic", value: "academic", ready: true },
                { label: "IELTS General Training", value: "general", ready: false },
              ].map((t) => (
                <label
                  key={t.value}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-navy/15 px-4 py-3 text-center font-medium transition-colors has-checked:border-brand has-checked:bg-brand has-checked:text-white has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:outline-2 has-focus-visible:outline-brand"
                >
                  <input type="radio" name="type" value={t.value} defaultChecked={t.ready} disabled={!t.ready} className="sr-only" />
                  {t.label}
                  {!t.ready && <Pill>Sắp có</Pill>}
                </label>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold">Các kỹ năng</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SKILLS.map((skill) => {
              const Icon = SKILL_ICON[skill];
              const s = skillStyle[skill];
              const available = skill in AVAILABLE;
              return (
                <button
                  key={skill}
                  type="submit"
                  name="skill"
                  value={skill}
                  disabled={!available}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 font-medium transition-transform enabled:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed ${s.soft}`}
                >
                  <Icon className={`size-7 ${s.text}`} aria-hidden />
                  {s.label}
                  {!available && <Pill className="mt-1">Sắp có</Pill>}
                </button>
              );
            })}
          </div>
        </Card>
      </form>
    </div>
  );
}
