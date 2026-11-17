"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Clock, GraduationCap } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import type { Course } from "@/lib/courses";

const BG = ["bg-skill-listening/15", "bg-skill-reading/15", "bg-skill-writing/15", "bg-skill-speaking/15"];

/** Lọc theo `?q=` (ô tìm kiếm trên Header submit về đây). */
export function CourseList({ courses }: { courses: Course[] }) {
  const q = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  const shown = q ? courses.filter((c) => `${c.title} ${c.description}`.toLowerCase().includes(q)) : courses;
  return <CourseGrid courses={shown} query={q} />;
}

export function CourseGrid({ courses, query = "" }: { courses: Course[]; query?: string }) {
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
        {courses.map((c, i) => (
          <li key={c.id} id={c.id} className="scroll-mt-24">
            <Card className="flex h-full flex-col gap-3 p-4!">
              <div className={`grid aspect-video place-items-center rounded-xl ${BG[i % BG.length]}`}>
                <GraduationCap className="size-12 text-navy/40" aria-hidden />
              </div>
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
              <Button href="/path" variant="outline">
                Xem lộ trình
              </Button>
            </Card>
          </li>
        ))}
      </ul>
      {courses.length === 0 && <p className="text-muted">Không tìm thấy khóa học phù hợp.</p>}
    </>
  );
}
