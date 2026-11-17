import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, BookOpenText, Check, Clapperboard, Clock, Lightbulb, Monitor, ShieldCheck, Sparkles, Star, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button, Card } from "@/components/ui";
import type { LearningPath } from "@/contracts/learning-path";
import { SKILLS, skillStyle, type Skill } from "@/lib/skills";

const VALUES: { icon: LucideIcon; text: string }[] = [
  { icon: BookOpenText, text: "Nội dung chuẩn quốc tế" },
  { icon: ShieldCheck, text: "Cập nhật đề thi mới nhất" },
  { icon: Lightbulb, text: "Phương pháp học khoa học, linh hoạt" },
  { icon: Star, text: "Độc quyền chỉ có ở Janna Edu" },
];

const BOOK_PERKS = ["Giải thích chi tiết đáp án", "Chiến lược làm bài hiệu quả", "Bài tập thực hành phong phú", "Tài liệu bổ trợ (audio, video, PDF)"];

const COURSE_PERKS: { icon: LucideIcon; text: string }[] = [
  { icon: Clapperboard, text: "Bài giảng chất lượng cao từ giảng viên chuyên môn" },
  { icon: Monitor, text: "Truy cập linh hoạt trên mọi thiết bị" },
  { icon: BookOpenText, text: "Hệ thống bài tập & kiểm tra định kỳ" },
  { icon: Clock, text: "Hỗ trợ giải đáp 24/7" },
];

const BOOK_SIZE: Record<Skill, [number, number]> = {
  listening: [389, 464],
  reading: [412, 466],
  writing: [384, 463],
  speaking: [371, 466],
};

function BookCover({ skill }: { skill: Skill }) {
  const [width, height] = BOOK_SIZE[skill];
  return (
    <Image
      src={`/ref/book-${skill}.jpg`}
      alt={`Bìa sách IELTS ${skillStyle[skill].label} Band 5.0 – 6.5`}
      width={width}
      height={height}
      className="w-full rounded-r-xl rounded-l-sm shadow-[6px_8px_20px_rgb(11_42_91/0.18)]"
    />
  );
}

/** Sách AI đã gợi ý trong lộ trình học; không hiện gì khi chưa có lộ trình hoặc AI không gợi ý. */
export function BookAdvice({ title, advice }: { title: string; advice: LearningPath["bookAdvice"] }) {
  if (!advice?.length) return null;
  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <p className="flex items-center gap-2 font-bold">
        <Sparkles className="size-5 text-brand-ink" aria-hidden />
        {title}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {advice.map((b) => (
          <li key={b.skill}>
            <span className={`font-semibold ${skillStyle[b.skill].text}`}>IELTS {skillStyle[b.skill].label}:</span> {b.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Nội dung Academy dùng chung cho /academy và /parent/academy. `showCourses=false` ẩn CTA dẫn sang khu học sinh. `advice` = gợi ý sách theo người xem. */
export function AcademyContent({ showCourses = true, advice }: { showCourses?: boolean; advice?: ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full bg-skill-listening/25 px-6 py-4 sm:px-8">
        <Logo href={showCourses ? "/" : "/parent"} />
        <p className="font-semibold">Explore knowledge – Shaping future</p>
      </div>
      <section className="grid items-center gap-8 rounded-3xl bg-white/50 p-6 sm:p-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <p className="inline-flex items-center gap-3 rounded-full bg-skill-listening py-1.5 pr-5 pl-1.5 font-semibold text-white">
            <span className="size-6 rounded-full bg-white" aria-hidden />
            Hệ sinh thái sản phẩm
          </p>
          <h1 className="mt-5 text-5xl font-bold sm:text-6xl">
            Janna <span className="text-brand-ink">Academy</span>
          </h1>
          <p className="mt-4 text-xl font-semibold">
            Hệ thống các khóa học video trực tuyến, dòng sách tự học và bộ đề luyện thi độc quyền IELTS
          </p>
          <p className="mt-3 text-navy/80">
            Được biên soạn bởi đội ngũ chuyên gia IELTS, đồng hành cùng bạn từ nền tảng đến mục tiêu band điểm mong muốn.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {VALUES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex flex-col items-center gap-2 text-center text-sm font-medium">
                <span className="grid size-16 place-items-center rounded-2xl bg-white shadow-card">
                  <Icon className="size-8" strokeWidth={1.5} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <Button href="#books" className="mt-8 px-8 py-3 text-lg uppercase">
            Khám phá Janna Academy <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
        <Image src="/ref/academy-book.jpg" alt="" width={1158} height={1120} preload className="mx-auto w-full max-w-md" />
      </section>

      <section id="books" aria-labelledby="books-title" className="scroll-mt-24 rounded-3xl bg-white/50 p-6 sm:p-10">
        <h2 id="books-title" className="text-3xl font-bold sm:text-4xl">
          Sách tự học IELTS
        </h2>
        <p className="mt-2 max-w-2xl text-lg">
          Hệ thống sách thiết kế theo từng kỹ năng, từ cơ bản đến nâng cao, giúp người học hiểu sâu – tiến bộ.
        </p>
        {advice}
        <div className="mt-8 grid gap-8 xl:grid-cols-[3fr_1fr]">
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {SKILLS.map((s) => (
              <li key={s}>
                <BookCover skill={s} />
                <p className="mt-3 text-center font-semibold">IELTS {skillStyle[s].label}</p>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col justify-center gap-3">
            {BOOK_PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-full bg-white py-2 pr-5 pl-2 font-medium shadow-card">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-white">
                  <Check className="size-5" aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="courses-title" className="rounded-3xl bg-white/50 p-6 sm:p-10">
        <h2 id="courses-title" className="text-3xl font-bold sm:text-4xl">
          Khóa học video trực tuyến
        </h2>
        <p className="mt-2 max-w-2xl text-lg">
          Học mọi lúc, mọi nơi với hệ thống khóa học chất lượng cao, thiết kế bài bản theo từng kỹ năng và trình độ.
        </p>
        <div className="mt-8 grid items-center gap-8 xl:grid-cols-[2fr_1fr]">
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {COURSE_PERKS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Card className="flex h-full flex-col items-center gap-4 text-center">
                  <Icon className="size-14" strokeWidth={1.25} aria-hidden />
                  <p className="font-medium">{text}</p>
                </Card>
              </li>
            ))}
          </ul>
          <Image src="/ref/video-devices.jpg" alt="" width={666} height={390} className="mx-auto w-full max-w-md" />
        </div>
        {showCourses && (
          <Button href="/courses" variant="outline" className="mt-8">
            Xem các khóa học <ArrowRight className="size-5" aria-hidden />
          </Button>
        )}
      </section>
    </div>
  );
}
