import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import { DonutChart } from "@/components/charts";
import { PrintButton } from "@/components/print-button";
import { AIComment, Card, ProgressBar, SKILL_ICON } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { goal, mockTestResults } from "@/lib/mock/student";
import { SKILLS, overallBand, skillStyle } from "@/lib/skills";

export const metadata: Metadata = { title: "Báo cáo kết quả Mock Test" };

export function generateStaticParams() {
  return mockTestResults.map((r) => ({ id: r.id }));
}

export default function ReportPage({ params }: PageProps<"/examiner/report/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Đang tải báo cáo…</p>}>
      <Report params={params} />
    </Suspense>
  );
}

async function Report({ params }: Pick<PageProps<"/examiner/report/[id]">, "params">) {
  const { id } = await params;
  const result = mockTestResults.find((r) => r.id === id);
  if (!result) notFound();
  const overall = overallBand(result.scores);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4 border-b-2 border-skill-listening/50 pb-4">
        <h1 className="mr-auto flex items-center gap-3 text-3xl font-bold">
          <Link href="/examiner" aria-label="Quay lại Giám khảo AI" className="rounded-full p-1 hover:bg-white print:hidden">
            <ArrowLeft className="size-7" aria-hidden />
          </Link>
          Báo cáo kết quả IELTS Mock Test
        </h1>
        <p className="font-semibold">
          Ngày thi: <time dateTime={result.date}>{formatDate(result.date)}</time>
        </p>
        <PrintButton label="Tải xuống PDF" variant="outline" />
      </div>

      <div className="grid items-center justify-items-center gap-6 lg:grid-cols-[auto_1fr] lg:justify-items-stretch">
        <DonutChart
          size={200}
          label={`Overall band ${band(overall)}`}
          segments={SKILLS.map((s) => ({ value: result.scores[s], color: skillStyle[s].color }))}
        >
          <div>
            <p className="text-xs font-semibold">Overall Band</p>
            <p className="text-4xl font-bold">{band(overall)}</p>
          </div>
        </DonutChart>
        <ul className="grid w-full grid-cols-2 gap-4 xl:grid-cols-4">
          {SKILLS.map((s) => {
            const Icon = SKILL_ICON[s];
            return (
              <li key={s}>
                <Card className="flex flex-col items-center gap-2">
                  <p className="flex items-center gap-2 text-lg">
                    <Icon className={`size-7 ${skillStyle[s].text}`} aria-hidden />
                    {skillStyle[s].label}
                  </p>
                  <p className="text-3xl font-bold tabular-nums">{band(result.scores[s])}</p>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <AIComment title="Nhận xét tổng quan từ AI">
          <p className="text-lg">{result.aiComment}</p>
        </AIComment>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">So sánh với mục tiêu</h2>
            <Link href="/path" className="flex items-center gap-1 text-sm hover:underline print:hidden">
              Xem chi tiết <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="flex justify-between">
            <span>Mục tiêu của bạn</span>
            <strong>{band(goal.band)}</strong>
          </div>
          <ProgressBar value={overall} max={goal.band} label={`Hiện tại ${band(overall)} trên mục tiêu ${band(goal.band)}`} />
          <div className="flex justify-between">
            <span>Hiện tại</span>
            <strong>{band(overall)}</strong>
          </div>
          <h3 className="mt-2 text-lg font-bold">Lộ trình cải thiện</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {result.plan.map((p) => (
              <li key={p.skill} className="flex gap-2">
                <CircleCheck className={`size-5 shrink-0 ${skillStyle[p.skill].text}`} aria-hidden />
                <span>
                  <strong>{skillStyle[p.skill].label}:</strong> {p.text} ({p.weeks})
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
