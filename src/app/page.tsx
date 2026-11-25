import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bot,
  ClipboardCheck,
  Lightbulb,
  ListChecks,
  LogIn,
  Route,
  ShoppingCart,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SkipLink } from "@/components/app-shell";
import { Logo } from "@/components/logo";
import { Button, Card } from "@/components/ui";
import { featuredCourses } from "@/lib/courses";
import { homeOf } from "@/server/auth";
import { getProfile } from "@/server/profile";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Bot, title: "Giám khảo AI 24/7", text: "Chấm Writing và Speaking theo 4 tiêu chí IELTS, phân tích lỗi chi tiết chỉ trong vài giây." },
  { icon: Lightbulb, title: "Phòng thi ảo", text: "Mô phỏng áp lực thời gian, giao diện và cấu trúc đề thi Reading, Listening thật." },
  { icon: Target, title: "Lộ trình cá nhân hoá", text: "AI phân tích điểm yếu từ kết quả thi, xếp bài tập trọng tâm theo từng tuần." },
  { icon: Users, title: "Phụ huynh theo dõi", text: "Phụ huynh xem kết quả, tiến độ và nhận xét AI về quá trình học của con." },
  { icon: ClipboardCheck, title: "Bài test năng lực đầu vào", text: "Biết chính xác band hiện tại của bạn trước khi bắt đầu học." },
  { icon: ListChecks, title: "Nhiệm vụ hằng ngày", text: "Mỗi ngày vài nhiệm vụ nhỏ bám theo lộ trình, giữ thói quen học đều đặn." },
];

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: LogIn, title: "Đăng nhập", text: "Đăng nhập nhanh bằng tài khoản Google." },
  { icon: ClipboardCheck, title: "Chọn mục tiêu & làm test năng lực", text: "Đặt band mục tiêu và làm bài test đầu vào." },
  { icon: ShoppingCart, title: "Mua khoá học", text: "Chọn khoá học phù hợp với trình độ và mục tiêu." },
  { icon: Route, title: "Học theo lộ trình", text: "Học theo lộ trình AI thiết kế và nhiệm vụ mỗi ngày." },
];

// A signed-in user has their own home; the landing is for visitors.
async function RedirectSignedIn() {
  const profile = await getProfile();
  if (profile) redirect(homeOf(profile.role));
  return null;
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-surface to-surface-deep">
      <Suspense fallback={null}>
        <RedirectSignedIn />
      </Suspense>
      <SkipLink />
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 bg-white px-4 lg:px-8">
        <Logo />
        <Button href="/login">Đăng nhập</Button>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-7xl flex-col gap-16 p-4 outline-none sm:p-6 lg:p-8">
        <section className="relative isolate flex min-h-96 flex-col items-start justify-center gap-5 overflow-hidden rounded-3xl p-6 sm:p-12">
          <Image src="/ref/hero.jpg" alt="" fill preload sizes="(min-width: 1280px) 80rem, 100vw" className="-z-10 object-cover object-right" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-navy via-navy/80 to-navy/0 sm:via-navy/70 sm:to-60%" />
          <p className="font-semibold text-brand">Nền tảng luyện thi IELTS của Janna Academy</p>
          <h1 className="text-4xl leading-tight font-bold text-white sm:text-5xl">
            Chinh phục IELTS
            <br />
            cùng <span className="text-brand">Janna Edu</span>
          </h1>
          <p className="max-w-xl text-lg text-white/90">
            Phòng thi ảo, giám khảo AI và lộ trình cá nhân hoá giúp bạn biết mình đang ở đâu và cần học gì mỗi ngày để đạt band mục tiêu.
          </p>
          <Link href="/login" className="btn focus-visible:outline-2 focus-visible:outline-white">
            Bắt đầu học ngay
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        <section aria-labelledby="features">
          <h2 id="features" className="mb-6 text-3xl font-bold text-brand-ink">
            Tính năng đặc biệt
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-card">
                <span className="flex items-center gap-3">
                  <Icon className="size-12 shrink-0 text-navy" strokeWidth={1.75} aria-hidden />
                  <h3 className="text-lg font-bold">{title}</h3>
                </span>
                <p className="text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="mb-6 text-3xl font-bold text-brand-ink">
            Bắt đầu thế nào?
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card">
                <span className="flex items-center gap-3">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-tint font-bold text-brand-ink">
                    {i + 1}
                  </span>
                  <Icon className="size-6 text-navy" aria-hidden />
                </span>
                <h3 className="text-lg font-bold">
                  <span className="sr-only">Bước {i + 1}: </span>
                  {title}
                </h3>
                <p className="text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="courses">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 id="courses" className="text-3xl font-bold text-brand-ink">
              Khóa học nổi bật
            </h2>
            <Link href="/courses" className="flex items-center gap-1 font-medium text-brand-ink hover:underline">
              Xem tất cả <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {featuredCourses.map((c) => (
              <li key={c.id}>
                <Link href="/courses" className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                  <Card className="flex h-full flex-col gap-3 p-4! transition-transform hover:-translate-y-0.5">
                    <Image src={c.image} alt="" width={800} height={450} className="aspect-video w-full rounded-xl object-cover" />
                    <h3 className="font-bold">{c.title}</h3>
                    <p className="-mt-2 text-sm text-muted">{c.range}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cta" className="flex flex-col items-center gap-4 rounded-3xl bg-navy p-8 text-center text-white sm:p-12">
          <h2 id="cta" className="text-3xl font-bold">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="max-w-xl text-white/90">Đăng nhập bằng Google, làm bài test năng lực và nhận lộ trình học của riêng bạn.</p>
          <Button href="/login">Đăng nhập để bắt đầu</Button>
        </section>
      </main>

      <footer className="p-6 text-center text-sm text-muted">© Janna Academy</footer>
    </div>
  );
}
