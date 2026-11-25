import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { featuredCourses } from "@/lib/courses";
import { homeOf } from "@/server/auth";
import { enrollCourse, getProfile } from "@/server/profile";
import { CourseGrid, CourseList } from "./course-list";

export const metadata: Metadata = { title: "Khóa học" };

// Demo purchase: no payment; the course opens at once.
async function buy(formData: FormData) {
  "use server";
  await enrollCourse({ courseId: formData.get("courseId") });
  redirect(homeOf("student"));
}

async function Courses() {
  const profile = await getProfile();
  const viewer = profile ? { role: profile.role, enrolledCourse: profile.enrolledCourse } : null;
  return <CourseList courses={featuredCourses} viewer={viewer} buy={buy} />;
}

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold">Khóa học</h1>
        <p className="mt-2 text-lg">Chọn khóa học phù hợp với trình độ và mục tiêu band của bạn.</p>
      </div>
      {/* Người xem và useSearchParams cần Suspense; fallback = danh sách đầy đủ, chưa có nút mua (prerender tĩnh) */}
      <Suspense fallback={<CourseGrid courses={featuredCourses} />}>
        <Courses />
      </Suspense>
    </div>
  );
}
