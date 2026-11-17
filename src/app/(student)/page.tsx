import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui";
import { featuredCourses } from "@/lib/courses";

const FEATURES: { href: string; icon: string; title: string; text: string }[] = [
  { href: "/examiner", icon: "/ref/icon-robot.png", title: "Giám khảo AI 24/7", text: "Chấm điểm, phân tích lỗi chi tiết theo chuẩn quốc tế chỉ trong vài giây." },
  { href: "/mock-test", icon: "/ref/icon-bulb.png", title: "Phòng thi ảo", text: "Mô phỏng áp lực thời gian, giao diện và cấu trúc đề thi thật." },
  { href: "/path", icon: "/ref/icon-target.png", title: "Lộ trình phù hợp", text: "AI phân tích điểm yếu, gợi ý bài tập trọng tâm, tối ưu thời gian." },
  { href: "/parent", icon: "/ref/icon-parents.png", title: "Phụ huynh theo dõi tiến độ", text: "Theo dõi kết quả và báo cáo tiến độ học tập của con." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* The headline and button are part of the mockup image, so the whole banner is the link. */}
      <h1 className="sr-only">Chinh phục IELTS cùng Janna Edu</h1>
      <Link href="/path" className="block overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-brand">
        <Image
          src="/ref/hero.jpg"
          alt="Bắt đầu học ngay"
          width={1097}
          height={221}
          preload
          sizes="(min-width: 1024px) calc(100vw - 20rem), 100vw"
          className="h-40 w-full object-cover object-left sm:h-auto"
        />
      </Link>

      <section aria-labelledby="features">
        <h2 id="features" className="sr-only">
          Tính năng nổi bật
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map(({ href, icon, title, text }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span className="flex items-center gap-3">
                  <Image src={icon} alt="" width={48} height={48} className="size-12 shrink-0 object-contain" />
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
              <Card className="relative flex h-full flex-col gap-3 p-4!">
                <Image src={c.image} alt="" width={150} height={88} className="aspect-video w-full rounded-xl object-cover" />
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
