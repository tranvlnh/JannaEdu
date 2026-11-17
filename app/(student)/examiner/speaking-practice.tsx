"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bot, Clock, Mic, Square } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { formatClock } from "@/lib/exam-draft";
import type { Criterion } from "@/lib/mock/student";
import { CriteriaCard } from "./criteria-card";

type Phase = "idle" | "recording" | "scoring" | "done";

// Chiều cao cột sóng (cố định → không lệch hydration).
const BARS = [30, 55, 40, 75, 50, 90, 35, 65, 80, 45, 100, 60, 30, 70, 85, 40, 95, 55, 35, 75, 50, 85, 40, 65, 30, 80, 55, 45, 70, 35];

// ponytail: ghi âm giả lập (không xin quyền micro); thay bằng MediaRecorder + API chấm khi có BE
export function SpeakingPractice({ question, part, criteria }: { question: string; part: string; criteria: Criterion[] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase === "recording") {
      const t = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(t);
    }
    if (phase === "scoring") {
      const t = setTimeout(() => setPhase("done"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const recording = phase === "recording";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="mr-auto text-3xl font-bold text-brand-ink">Speaking Practice</h1>
        <p className="flex items-center gap-2 rounded-full border-2 border-brand px-4 py-1.5 text-brand-ink" role="timer">
          <Clock className="size-5" aria-hidden />
          Thời gian: <span className="tabular-nums">{formatClock(seconds)}</span>
        </p>
        {recording && (
          <Button variant="outline" onClick={() => setPhase("scoring")}>
            <Square className="size-4" aria-hidden />
            Kết thúc
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <p className="text-sm font-semibold text-muted">{part}</p>
            <p className="mt-1 text-xl font-semibold">{question}</p>
          </Card>

          <Card className="flex h-48 items-center justify-center gap-1.5" aria-hidden>
            {BARS.map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full bg-skill-writing ${recording ? "motion-safe:animate-wave" : "opacity-40"}`}
                style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.12}s` }}
              />
            ))}
          </Card>

          <div className="flex items-center gap-4">
            <Mic className={`size-10 ${recording ? "text-skill-writing" : "text-muted"}`} aria-hidden />
            {phase === "idle" || phase === "done" ? (
              <Button
                variant={phase === "done" ? "outline" : "primary"}
                onClick={() => {
                  setSeconds(0);
                  setPhase("recording");
                }}
                className="flex-1 py-3 text-lg"
              >
                {phase === "done" ? "Ghi lại" : "Bắt đầu ghi âm"}
              </Button>
            ) : (
              <p
                aria-live="polite"
                className="flex-1 rounded-full border-2 border-brand py-3 text-center text-xl font-medium text-brand-ink"
              >
                {recording ? "Đang ghi âm" : "Đang chấm…"}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {phase === "done" ? (
            <>
              <CriteriaCard criteria={criteria} />
              <Button href="/examiner/analysis" className="self-end">
                Xem phân tích lỗi chi tiết <ArrowRight className="size-5" aria-hidden />
              </Button>
            </>
          ) : (
            <Card className="grid min-h-80 place-items-center text-center text-muted">
              <p>{phase === "idle" ? "Bấm “Bắt đầu ghi âm” và trả lời câu hỏi. AI sẽ chấm ngay khi bạn kết thúc." : "Kết quả sẽ hiện ở đây."}</p>
            </Card>
          )}
        </div>
      </div>

      {phase === "scoring" && (
        <p
          role="status"
          className="mx-auto flex items-center gap-3 rounded-xl border-2 border-skill-writing bg-skill-writing/30 px-6 py-3 text-lg"
        >
          <Bot className="size-7" aria-hidden />
          AI đang chấm điểm và phân tích...
        </p>
      )}
    </div>
  );
}
