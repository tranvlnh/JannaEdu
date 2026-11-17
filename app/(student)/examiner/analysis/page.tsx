import type { Metadata } from "next";
import { ArrowRight, Clock, Lightbulb } from "lucide-react";
import { Tabs } from "@/components/tabs";
import { AIComment, Button, Card, Pill } from "@/components/ui";
import { exercises, speakingSession } from "@/lib/mock/student";
import { CriteriaCard } from "../criteria-card";

export const metadata: Metadata = { title: "Phân tích lỗi Speaking" };

export default function AnalysisPage() {
  const { criteria, errors } = speakingSession;
  const speakingExercises = exercises.filter((e) => e.skill === "speaking");
  const weakest = [...criteria].sort((a, b) => a.score - b.score)[0];

  const errorList = (
    <Card>
      <h2 className="mb-4 text-xl font-bold">Các lỗi sai nổi bật</h2>
      <ul className="flex flex-col gap-3">
        {errors.map((e) => (
          <li key={e.category} className="rounded-xl bg-warning-soft px-4 py-3">
            <p className="font-bold">{e.category} — Cần cải thiện</p>
            <p className="mt-1">{e.issue}</p>
            <p className="text-navy/80">Gợi ý: {e.suggestion}</p>
          </li>
        ))}
      </ul>
    </Card>
  );

  const withCriteria = (right: React.ReactNode) => (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <CriteriaCard criteria={criteria} />
      {right}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold">
        Phân tích lỗi <span className="text-brand-ink">Speaking</span>
      </h1>
      <Tabs
        variant="underline"
        defaultTab="errors"
        tabs={[
          {
            id: "overview",
            label: "Tổng quan",
            content: withCriteria(
              <AIComment title="Nhận xét tổng quan">
                Bài nói trôi chảy, phát âm tốt. Tiêu chí thấp nhất là <strong>{weakest.name}</strong> ({weakest.score.toFixed(1)}) —
                tập trung cải thiện để nâng band tổng.
              </AIComment>,
            ),
          },
          { id: "errors", label: "Lỗi sai", content: withCriteria(errorList) },
          {
            id: "tips",
            label: "Gợi ý cải thiện",
            content: withCriteria(
              <Card>
                <h2 className="mb-4 text-xl font-bold">Gợi ý cải thiện</h2>
                <ul className="flex flex-col gap-3">
                  {errors.map((e) => (
                    <li key={e.category} className="flex gap-3">
                      <Lightbulb className="mt-0.5 size-5 shrink-0 text-skill-writing" aria-hidden />
                      <span>
                        <strong>{e.category}:</strong> {e.suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>,
            ),
          },
          {
            id: "exercises",
            label: "Bài tập",
            content: withCriteria(
              <Card>
                <h2 className="mb-4 text-xl font-bold">Bài tập gợi ý</h2>
                <ul className="flex flex-col gap-3">
                  {speakingExercises.map((ex) => (
                    <li key={ex.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface p-4">
                      <div className="mr-auto">
                        <p className="font-bold">{ex.title}</p>
                        <p className="text-sm text-muted">{ex.description}</p>
                      </div>
                      <Pill>
                        <Clock className="mr-1 size-3.5" aria-hidden />
                        {ex.minutes} phút
                      </Pill>
                      <Button href={ex.href ?? "/examiner"}>
                        Làm ngay <ArrowRight className="size-4" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>,
            ),
          },
        ]}
      />
    </div>
  );
}
