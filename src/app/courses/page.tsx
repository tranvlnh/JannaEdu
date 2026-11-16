import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/app/site-nav";

export const metadata: Metadata = { title: "Khóa học" };

const COURSES = [
  ["IELTS Foundation", "Band 4.0 – 5.0"],
  ["IELTS Intensive", "Band 5.5 – 7.0"],
  ["IELTS Advanced", "Band 7.0+"],
  ["Luyện đề toàn diện", "Cả bốn kỹ năng"],
];

const BENEFITS = [
  "Bài giảng chất lượng cao từ giảng viên có chuyên môn",
  "Truy cập linh hoạt trên mọi thiết bị",
  "Hệ thống bài tập & kiểm tra định kỳ",
  "Hỗ trợ giải đáp 24/7",
];

export default function CoursesPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
        <header>
          <h1 className="text-3xl font-bold">Khóa học video trực tuyến</h1>
          <p className="mt-2">
            Học mọi lúc, mọi nơi với hệ thống khóa học chất lượng cao, được thiết kế bài bản theo từng kỹ năng và trình độ.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {COURSES.map(([name, level]) => (
            <li key={name} className="rounded-lg border p-4">
              <h2 className="font-semibold">{name}</h2>
              <p className="text-sm text-orange-600">{level}</p>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Học viên nhận được gì</h2>
          <ul className="list-disc pl-5">
            {BENEFITS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <p>
          Chưa biết mình ở trình độ nào?{" "}
          <Link href="/tests" className="underline">
            Làm một bài thi thử
          </Link>{" "}
          để có band điểm và lộ trình học.
        </p>
      </main>
    </>
  );
}
