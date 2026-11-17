import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { ArcGauge } from "@/components/charts";
import { Tabs } from "@/components/tabs";
import { AIComment, Button, Card, CheckList, SkillScoreCard } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { readingTest } from "@/lib/mock/exam";
import { mockTestResults } from "@/lib/mock/student";
import { SKILLS, overallBand } from "@/lib/skills";
import { PrintButton } from "@/components/print-button";
import { QuestionReview } from "./client";

export const metadata: Metadata = { title: "Kết quả bài thi" };

const TESTS = { [readingTest.id]: readingTest };

export function generateStaticParams() {
  return Object.keys(TESTS).map((id) => ({ id }));
}

export default function ResultPage({ params }: PageProps<"/mock-test/[id]/result">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Đang tải kết quả…</p>}>
      <Result params={params} />
    </Suspense>
  );
}

async function Result({ params }: Pick<PageProps<"/mock-test/[id]/result">, "params">) {
  const test = TESTS[(await params).id];
  if (!test) notFound();
  // ponytail: điểm 4 kỹ năng lấy từ mock test gần nhất; tab "Theo câu hỏi" chấm bài Reading thật
  const result = mockTestResults[0];
  const overall = overallBand(result.scores);
  const delta = overall - result.previousOverall;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold sm:text-5xl">Kết quả bài thi</h1>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted">
            Ngày thi: <time dateTime={result.date} className="font-semibold text-navy">{formatDate(result.date)}</time>
          </p>
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col items-center gap-2">
            <h2 className="self-start text-lg font-semibold">Overall band score</h2>
            <ArcGauge value={overall} label={`Overall band ${band(overall)} trên 9`}>
              <p className="text-7xl font-black tabular-nums">{band(overall)}</p>
            </ArcGauge>
            <p className="text-lg">
              <span className={`font-bold ${delta >= 0 ? "text-success-ink" : "text-danger-ink"}`}>
                {delta >= 0 ? "+" : ""}
                {band(delta)}
              </span>{" "}
              so với lần trước
            </p>
          </Card>

          <Card>
            <Tabs
              tabs={[
                {
                  id: "skills",
                  label: "Theo kỹ năng",
                  content: <CheckList tone="good" title="Điểm mạnh" items={result.strengths} />,
                },
                {
                  id: "questions",
                  label: "Theo câu hỏi",
                  content: <QuestionReview testId={test.id} answerKey={test.answers} />,
                },
              ]}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 text-xl font-bold">Điểm từng kỹ năng</h2>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {SKILLS.map((s) => (
                <SkillScoreCard key={s} skill={s} score={result.scores[s]} />
              ))}
            </div>
            <Link
              href={`/examiner/report/${result.id}`}
              className="mt-4 block rounded-full border border-navy/15 py-2 text-center text-sm hover:bg-surface print:hidden"
            >
              Xem báo cáo chi tiết
            </Link>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4 px-2">
                <p className="text-2xl font-semibold">Improve your skills everyday!</p>
                <span className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-skill-listening text-skill-listening">
                  <BookOpen className="size-10" aria-hidden />
                </span>
              </div>
              <Card className="border-2 border-brand">
                <CheckList tone="bad" title="Cần cải thiện" items={result.improvements} />
              </Card>
            </div>
            <AIComment
              title="Nhận xét từ giám khảo AI"
              action={
                <Button href="/path" className="mt-2 w-full print:hidden">
                  Xem lộ trình cá nhân <ArrowRight className="size-5" aria-hidden />
                </Button>
              }
            >
              <p className="italic">{result.aiComment}</p>
            </AIComment>
          </div>
        </div>
      </div>
    </div>
  );
}
