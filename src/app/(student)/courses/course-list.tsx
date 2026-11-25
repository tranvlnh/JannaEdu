"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Clock, Lock } from "lucide-react";
import type { Role } from "@/contracts/profile";
import { Button, Card, Pill } from "@/components/ui";
import type { Course } from "@/lib/courses";

/** null = chưa đăng nhập. */
type Viewer = { role: Role | null; enrolledCourse: string | null } | null;
type Buy = (formData: FormData) => Promise<void>;

/** Lọc theo `?q=` (ô tìm kiếm trên Header submit về đây). `?locked=1`: proxy chặn vì chưa mua khóa học. */
export function CourseList({ courses, viewer, buy }: { courses: Course[]; viewer: Viewer; buy: Buy }) {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const shown = q ? courses.filter((c) => `${c.title} ${c.description}`.toLowerCase().includes(q)) : courses;
  return (
    <>
      {params.get("locked") && (
        <p role="alert" className="flex items-center gap-3 rounded-2xl bg-yellow-300/40 p-4 font-medium">
          <Lock className="size-5 shrink-0" aria-hidden />
          Bạn cần mua một khóa học để dùng tính năng này. Chọn khóa học bên dưới, khóa học mở ngay sau khi mua.
        </p>
      )}
      <CourseGrid courses={shown} query={q} viewer={viewer} buy={buy} />
    </>
  );
}

/** `viewer` undefined = đang tải người xem: chưa hiện nút mua. */
export function CourseGrid({ courses, query = "", viewer, buy }: { courses: Course[]; query?: string; viewer?: Viewer; buy?: Buy }) {
  return (
    <>
      {query && (
        <p aria-live="polite">
          {courses.length} kết quả cho “<strong>{query}</strong>” ·{" "}
          <Link href="/courses" className="font-semibold text-brand-ink hover:underline">
            Xem tất cả
          </Link>
        </p>
      )}
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map((c) => (
          <li key={c.id} id={c.id} className="scroll-mt-24">
            <Card className="flex h-full flex-col gap-3 p-4!">
              <Image src={c.image} alt="" width={800} height={450} className="aspect-video w-full rounded-xl object-cover" />
              <Pill className="self-start">{c.range}</Pill>
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p className="flex-1 text-navy/80">{c.description}</p>
              <p className="flex gap-4 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-4" aria-hidden />
                  {c.lessons} bài học
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" aria-hidden />
                  {c.weeks} tuần
                </span>
              </p>
              {viewer === null && (
                <Button href="/login" variant="outline">
                  Đăng nhập để mua
                </Button>
              )}
              {viewer?.role === "student" &&
                (viewer.enrolledCourse === c.id ? (
                  <div className="flex items-center justify-between gap-2">
                    <Pill tone="success">Đang học</Pill>
                    <Button href="/path" variant="ghost">
                      Xem lộ trình
                    </Button>
                  </div>
                ) : (
                  <form action={buy}>
                    <input type="hidden" name="courseId" value={c.id} />
                    <Button type="submit" className="w-full">
                      Mua khóa học
                    </Button>
                  </form>
                ))}
            </Card>
          </li>
        ))}
      </ul>
      {courses.length === 0 && <p className="text-muted">Không tìm thấy khóa học phù hợp.</p>}
    </>
  );
}
