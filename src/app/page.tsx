import Link from "next/link";
import { HomeContent } from "@/components/home-content";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Logo href="/" />
        <Link href="/courses" className="btn">Xem khóa học</Link>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <HomeContent publicView />
      </main>
    </div>
  );
}
