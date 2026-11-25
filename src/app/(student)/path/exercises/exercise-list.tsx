"use client";

import { useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import { skillStyle, type Skill } from "@/lib/skills";

export type Exercise = {
  id: string;
  skill: Skill;
  part: string;
  title: string;
  description: string;
  minutes: number | null; // null = untimed
  href: string;
  suggested: boolean; // trains a skill the path or the results point at
};

// Thứ tự theo mockup (Reading trước Listening).
const FILTERS = ["all", "reading", "listening", "writing", "speaking"] as const;

export function ExerciseList({ exercises, initialSkill }: { exercises: Exercise[]; initialSkill?: Skill }) {
  const [filter, setFilter] = useState<Skill | "all">(initialSkill ?? "all");
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
            className="rounded-full bg-white px-4 py-1.5 font-bold shadow-card transition-colors hover:bg-brand-soft/40 focus-visible:outline-2 focus-visible:outline-brand aria-pressed:bg-brand aria-pressed:text-white sm:px-6 sm:py-2 sm:text-lg"
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="none" className={`${skillStyle[e.skill].soft} ${skillStyle[e.skill].text}`}>
                    {skillStyle[e.skill].label}
                  </Pill>
                  <Pill>{e.part}</Pill>
                  {e.suggested && (
                    <Pill tone="brand">
                      <Sparkles className="mr-1 size-3.5" aria-hidden />
                      AI gợi ý
                    </Pill>
                  )}
                </div>
              </div>
              <p className="flex items-center gap-2">
                <Clock className="size-5" aria-hidden />
                {e.minutes === null ? "Không giới hạn" : `Thời gian: ${e.minutes} phút`}
              </p>
              <Button href={e.href} className="w-36">
                Làm ngay
              </Button>
            </Card>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="text-muted">Chưa có bài tập cho kỹ năng này.</p>}
    </div>
  );
}
