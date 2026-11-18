import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Lightbulb, Target, Users, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";
import { featuredCourses } from "@/lib/courses";

const FEATURES: { href: string; icon: LucideIcon; title: string; text: string }[] = [
  { href: "/examiner", icon: Bot, title: "Giám khảo AI 24/7", text: "Chấm điểm, phân tích lỗi chi tiết theo chuẩn quốc tế chỉ trong vài giây." },
  { href: "/mock-test", icon: Lightbulb, title: "Phòng thi ảo", text: "Mô phỏng áp lực thời gian, giao diện và cấu trúc đề thi thật." },
  { href: "/path", icon: Target, title: "Lộ trình phù hợp", text: "AI phân tích điểm yếu, gợi ý bài tập trọng tâm, tối ưu thời gian." },
  { href: "/parent", icon: Users, title: "Phụ huynh theo dõi tiến độ", text: "Theo dõi kết quả và báo cáo tiến độ học tập của con." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="relative isolate flex min-h-56 flex-col items-start justify-center gap-5 overflow-hidden rounded-3xl p-6 sm:p-10">
        <Image
          src="/ref/hero.jpg"
          alt=""
          fill
          preload
          sizes="(min-width: 1024px) calc(100vw - 20rem), 100vw"
          className="-z-10 object-cover object-right"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-navy via-navy/80 to-navy/0 sm:via-navy/70 sm:to-60%" />
        <h1 className="text-3xl leading-tight font-bold text-white sm:text-4xl">
          Chinh phục IELTS
          <br />
          cùng <span className="text-brand">Janna Edu</span>
        </h1>
        <Link href="/path" className="btn focus-visible:outline-2 focus-visible:outline-white">
          Bắt đầu học ngay
          <ArrowRight className="size-4" aria-hidden />
        </Link>
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
                  <Icon className="size-12 shrink-0 text-navy" strokeWidth={1.75} aria-hidden />
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
          {featuredCourses.map((c) => (
            <li key={c.id}>
              <Card className="flex h-full cursor-pointer flex-col gap-3 p-4! transition-transform select-none hover:-translate-y-0.5 active:scale-95">
                <Image src={c.image} alt="" width={800} height={450} className="aspect-video w-full rounded-xl object-cover" />
                <h3 className="font-bold">{c.title}</h3>
                <p className="-mt-2 text-sm text-muted">{c.range}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
