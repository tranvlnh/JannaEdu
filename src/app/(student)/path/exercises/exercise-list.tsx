"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import type { Exercise } from "@/lib/mock/student";
import { skillStyle, type Skill } from "@/lib/skills";

// Thứ tự theo mockup (Reading trước Listening).
const FILTERS = ["all", "reading", "listening", "writing", "speaking"] as const;

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  const [filter, setFilter] = useState<Skill | "all">("all");
  const shown = filter === "all" ? exercises : exercises.filter((e) => e.skill === filter);

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Lọc theo kỹ năng" className="flex flex-wrap gap-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className="rounded-full bg-white px-4 py-1.5 font-bold shadow-card sm:px-6 sm:py-2 sm:text-lg transition-colors hover:bg-brand-soft/40 focus-visible:outline-2 focus-visible:outline-brand aria-pressed:bg-brand aria-pressed:text-white"
          >
            {f === "all" ? "Tất cả" : skillStyle[f].label}
          </button>
        ))}
      </div>

      <p role="status" className="sr-only">
        {shown.length} bài tập
      </p>
      <ul className="flex flex-col gap-4">
        {shown.map((e) => (
          <li key={e.id}>
            <Card className="flex flex-wrap items-center gap-4">
              <div className="mr-auto min-w-0">
                <h2 className="text-xl font-bold">{e.title}</h2>
                <p className="text-navy/80">{e.description}</p>
                <div className="mt-3 flex gap-2">
                  <Pill tone="none" className={`${skillStyle[e.skill].soft} ${skillStyle[e.skill].text}`}>{skillStyle[e.skill].label}</Pill>
                  <Pill>{e.part}</Pill>
                </div>
              </div>
              <p className="flex items-center gap-2">
                <Clock className="size-5" aria-hidden />
                Thời gian: {e.minutes} phút
              </p>
              {e.href ? (
                <Button href={e.href} className="w-36">
                  Làm ngay
                </Button>
              ) : (
                <Button disabled className="w-36">
                  Sắp có
                </Button>
              )}
            </Card>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="text-muted">Chưa có bài tập gợi ý cho kỹ năng này.</p>}
    </div>
  );
}
