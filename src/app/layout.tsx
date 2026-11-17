import { Suspense } from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { NavLinks, SideNav } from "@/app/site-nav";
import { UserChip } from "@/app/user-chip";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: { default: "Janna Edu", template: "%s · Janna Edu" },
  description: "Luyện thi IELTS cùng Janna Academy: phòng thi ảo, giám khảo AI và lộ trình học.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="shrink-0">
            <Image src="/ref/logo.png" alt="Janna Edu" width={623} height={193} priority className="h-12 w-auto md:h-14" />
          </Link>
          <p className="mr-auto hidden text-lg font-semibold md:block md:pl-16">Xin chào, Anh/Chị!</p>
          <Suspense>
            <UserChip />
          </Suspense>
        </header>
        <div className="flex flex-1 flex-col md:flex-row">
          {/* The active link needs the pathname, which is only known at request time on dynamic routes. */}
          <Suspense fallback={<NavLinks active={null} />}>
            <SideNav />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col bg-panel md:rounded-tl-3xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
