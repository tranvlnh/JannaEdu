import type { Metadata } from "next";
import { Suspense } from "react";
import { featuredCourses } from "@/lib/mock/student";
import { CourseGrid, CourseList } from "./course-list";

export const metadata: Metadata = { title: "Khóa học" };

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold">Khóa học</h1>
        <p className="mt-2 text-lg">Chọn khóa học phù hợp với trình độ và mục tiêu band của bạn.</p>
      </div>
      {/* useSearchParams cần Suspense; fallback = danh sách đầy đủ (prerender tĩnh) */}
      <Suspense fallback={<CourseGrid courses={featuredCourses} />}>
        <CourseList courses={featuredCourses} />
      </Suspense>
    </div>
  );
}
