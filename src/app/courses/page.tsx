import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CourseList } from "@/app/courses/course-list";
import { Icon, type IconName } from "@/app/icons";

export const metadata: Metadata = { title: "Khóa học" };

const BENEFITS: [string, IconName][] = [
  ["Bài giảng chất lượng cao từ giảng viên có chuyên môn", "course"],
  ["Truy cập linh hoạt trên mọi thiết bị", "user"],
  ["Hệ thống bài tập & kiểm tra định kỳ", "book"],
  ["Hỗ trợ giải đáp 24/7", "clock"],
];

export default function CoursesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
      <section className="grid items-center gap-6 lg:grid-cols-[3fr_1fr]">
        <div className="flex flex-col gap-5">
          <header>
            <h1 className="text-4xl font-extrabold">Khóa học video trực tuyến</h1>
            <p className="mt-3 max-w-3xl text-xl">
              Học mọi lúc, mọi nơi với hệ thống khóa học chất lượng cao, được thiết kế bài bản theo từng kỹ năng và trình độ.
            </p>
          </header>
          <ul className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {BENEFITS.map(([item, icon]) => (
              <li key={item} className="card flex flex-col items-center gap-4 text-center font-medium shadow-[4px_5px_0_#c7d7f3]">
                <Icon name={icon} className="size-16" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Image src="/ref/video-devices.jpg" alt="Khóa học Janna Edu trên laptop và điện thoại" width={666} height={390} className="w-full" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand">Các khóa học</h2>
        <CourseList />
      </section>

      <p className="card flex flex-wrap items-center justify-between gap-4">
        <span>Chưa biết mình ở trình độ nào? Làm một bài thi thử để có band điểm và lộ trình học.</span>
        <Link href="/tests" className="btn">
          Làm bài thi thử <Icon name="arrow" className="size-5" />
        </Link>
      </p>
    </main>
  );
}
