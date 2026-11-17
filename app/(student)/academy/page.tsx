import type { Metadata } from "next";
import { ArrowRight, BookOpenText, Check, Clapperboard, Clock, GraduationCap, Lightbulb, Monitor, ShieldCheck, Star, type LucideIcon } from "lucide-react";
import { Button, Card, SKILL_ICON } from "@/components/ui";
import { SKILLS, skillStyle, type Skill } from "@/lib/skills";

export const metadata: Metadata = { title: "Janna Academy" };

const VALUES: { icon: LucideIcon; text: string }[] = [
  { icon: BookOpenText, text: "Nội dung chuẩn quốc tế" },
  { icon: ShieldCheck, text: "Cập nhật đề thi mới nhất" },
  { icon: Lightbulb, text: "Phương pháp học khoa học, linh hoạt" },
  { icon: Star, text: "Độc quyền chỉ có ở Janna Edu" },
];

const BOOK_TAGLINE: Record<Skill, string> = {
  listening: "Sharpen Your Ears",
  reading: "Build Your Skills",
  writing: "Organise Your Ideas",
  speaking: "Speak Confidently",
};

const BOOK_PERKS = ["Giải thích chi tiết đáp án", "Chiến lược làm bài hiệu quả", "Bài tập thực hành phong phú", "Tài liệu bổ trợ (audio, video, PDF)"];

const COURSE_PERKS: { icon: LucideIcon; text: string }[] = [
  { icon: Clapperboard, text: "Bài giảng chất lượng cao từ giảng viên chuyên môn" },
  { icon: Monitor, text: "Truy cập linh hoạt trên mọi thiết bị" },
  { icon: BookOpenText, text: "Hệ thống bài tập & kiểm tra định kỳ" },
  { icon: Clock, text: "Hỗ trợ giải đáp 24/7" },
];

// ponytail: bìa sách dựng bằng CSS thay ảnh mockup; thay <Image> khi có file bìa thật
function BookCover({ skill }: { skill: Skill }) {
  const s = skillStyle[skill];
  const Icon = SKILL_ICON[skill];
  return (
    <div className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-r-xl rounded-l-sm bg-white p-4 shadow-[6px_8px_20px_rgb(11_42_91/0.18)]">
      <p className="flex items-center gap-1 text-xs font-bold">
        <GraduationCap className="size-4" aria-hidden />
        JANNA <span className="text-brand">BOOK</span>
      </p>
      <p className="mt-3 text-2xl leading-none font-black">IELTS</p>
      <p className={`text-2xl leading-tight font-black uppercase ${s.text}`}>{s.label}</p>
      <p className={`mt-2 self-start rounded-full px-2 py-0.5 text-xs font-bold text-white ${s.bg}`}>Band 5.0 – 6.5</p>
      <p className="mt-2 text-xs">{BOOK_TAGLINE[skill]}</p>
      <Icon className={`absolute -right-4 -bottom-4 size-28 opacity-20 ${s.text}`} aria-hidden />
      <div className={`absolute inset-x-0 bottom-0 h-3 ${s.bg}`} />
    </div>
  );
}

export default function AcademyPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid items-center gap-8 rounded-3xl bg-white/50 p-6 sm:p-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <p className="inline-flex items-center gap-3 rounded-full bg-skill-listening py-1.5 pr-5 pl-1.5 font-semibold text-white">
            <span className="size-6 rounded-full bg-white" aria-hidden />
            Hệ sinh thái sản phẩm
          </p>
          <h1 className="mt-5 text-5xl font-bold sm:text-6xl">
            Janna <span className="text-brand">Academy</span>
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
        <div className="mx-auto w-48 rotate-6 sm:w-56" aria-hidden>
          <BookCover skill="reading" />
        </div>
      </section>

      <section id="books" aria-labelledby="books-title" className="scroll-mt-24 rounded-3xl bg-white/50 p-6 sm:p-10">
        <h2 id="books-title" className="text-3xl font-bold sm:text-4xl">
          Sách tự học IELTS
        </h2>
        <p className="mt-2 max-w-2xl text-lg">
          Hệ thống sách thiết kế theo từng kỹ năng, từ cơ bản đến nâng cao, giúp người học hiểu sâu – tiến bộ.
        </p>
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
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {COURSE_PERKS.map(({ icon: Icon, text }) => (
            <li key={text}>
              <Card className="flex h-full flex-col items-center gap-4 text-center">
                <Icon className="size-14" strokeWidth={1.25} aria-hidden />
                <p className="font-medium">{text}</p>
              </Card>
            </li>
          ))}
        </ul>
        <Button href="/courses" variant="outline" className="mt-8">
          Xem các khóa học <ArrowRight className="size-5" aria-hidden />
        </Button>
      </section>
    </div>
  );
}
