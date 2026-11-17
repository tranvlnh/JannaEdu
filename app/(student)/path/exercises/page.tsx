import type { Metadata } from "next";
import { Target } from "lucide-react";
import { band } from "@/lib/format";
import { exercises, goal } from "@/lib/mock/student";
import { ExerciseList } from "./exercise-list";

export const metadata: Metadata = { title: "Gợi ý bài tập" };

export default function ExercisesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Gợi ý bài tập</h1>
          <p className="mt-2 text-lg">Dựa trên phân tích điểm số và mục tiêu của bạn, Janna đã gợi ý</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-navy bg-white px-5 py-3">
          <Target className="size-9" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Mục tiêu điểm số</p>
            <p className="text-3xl font-bold">{band(goal.band)}</p>
          </div>
        </div>
      </div>
      <ExerciseList exercises={exercises} />
    </div>
  );
}
