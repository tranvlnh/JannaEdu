import Link from "next/link";
import { ArrowRight, Bot, GraduationCap, Lightbulb, Target, Users, type LucideIcon } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { featuredCourses } from "@/lib/mock/student";

const FEATURES: { href: string; icon: LucideIcon; title: string; text: string }[] = [
  { href: "/examiner", icon: Bot, title: "Giám khảo AI 24/7", text: "Chấm điểm, phân tích lỗi chi tiết theo chuẩn quốc tế chỉ trong vài giây." },
  { href: "/mock-test", icon: Lightbulb, title: "Phòng thi ảo", text: "Mô phỏng áp lực thời gian, giao diện và cấu trúc đề thi thật." },
  { href: "/path", icon: Target, title: "Lộ trình phù hợp", text: "AI phân tích điểm yếu, gợi ý bài tập trọng tâm, tối ưu thời gian." },
  { href: "/parent", icon: Users, title: "Phụ huynh theo dõi tiến độ", text: "Theo dõi kết quả và báo cáo tiến độ học tập của con." },
];

// Màu nền thay ảnh khóa học (chưa có asset) — xoay vòng theo index.
const COURSE_BG = ["bg-skill-listening/15", "bg-skill-reading/15", "bg-skill-writing/15", "bg-skill-speaking/15"];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* ponytail: hero gradient thay ảnh lớp học trong mockup, thêm ảnh khi có asset bản quyền */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy to-skill-listening px-6 py-10 text-white sm:px-10 sm:py-14">
        <GraduationCap className="absolute -right-6 -bottom-10 size-64 text-white/10" aria-hidden />
        <h1 className="relative max-w-xl text-4xl leading-tight font-bold sm:text-5xl">
          Chinh phục IELTS cùng <span className="text-brand">Janna Edu</span>
        </h1>
        <p className="relative mt-3 max-w-lg text-white/85">
          Chấm điểm – luyện đề – cá nhân hóa lộ trình. Tất cả trong một nền tảng.
        </p>
        <Button href="/path" className="relative mt-6">
          Bắt đầu học ngay <ArrowRight className="size-5" aria-hidden />
        </Button>
      </section>

      <section aria-labelledby="features">
        <h2 id="features" className="sr-only">
          Tính năng nổi bật
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map(({ href, icon: Icon, title, text }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-10 shrink-0" strokeWidth={1.5} aria-hidden />
                  <span className="text-lg font-bold">{title}</span>
                </span>
                <span className="text-sm leading-relaxed text-muted">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="courses">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="courses" className="text-2xl font-bold text-brand-ink">
            Khóa học nổi bật
          </h2>
          <Link href="/courses" className="flex items-center gap-1 font-medium text-brand-ink hover:underline">
            Xem tất cả <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {featuredCourses.map((c, i) => (
            <li key={c.id}>
              <Card className="relative flex h-full flex-col gap-3 p-4!">
                <div className={`grid aspect-video place-items-center rounded-xl ${COURSE_BG[i % COURSE_BG.length]}`}>
                  <GraduationCap className="size-10 text-navy/40" aria-hidden />
                </div>
                <h3 className="font-bold">
                  <Link href={`/courses#${c.id}`} className="after:absolute after:inset-0 hover:underline">
                    {c.title}
                  </Link>
                </h3>
                <p className="-mt-2 text-sm text-muted">{c.range}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
