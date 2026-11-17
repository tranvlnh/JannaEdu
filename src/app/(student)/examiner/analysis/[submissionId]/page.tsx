import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import type { SpeakingReport } from "@/contracts/speaking";
import { RetryButton } from "@/app/retry-button";
import { Tabs } from "@/components/tabs";
import { AIComment, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getProfile } from "@/server/profile";
import { getSpeakingSubmission, gradeSpeaking } from "@/server/speaking";
import { CriteriaCard } from "../../criteria-card";

export const metadata: Metadata = { title: "Phân tích lỗi Speaking" };

const CRITERIA: [keyof SpeakingReport["criteria"], string][] = [
  ["fluencyCoherence", "Fluency & Coherence"],
  ["lexicalResource", "Lexical Resource"],
  ["grammaticalRange", "Grammatical Range & Accuracy"],
  ["pronunciation", "Pronunciation"],
];
const ERROR_TYPE: Record<SpeakingReport["errors"][number]["type"], string> = {
  grammar: "Ngữ pháp",
  vocabulary: "Từ vựng",
  pronunciation: "Phát âm",
  fluency: "Độ trôi chảy",
};

export default function AnalysisPage({ params }: PageProps<"/examiner/analysis/[submissionId]">) {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải bài nói…</p>}>
      <Analysis params={params} />
    </Suspense>
  );
}

async function Analysis({ params }: Pick<PageProps<"/examiner/analysis/[submissionId]">, "params">) {
  const { submissionId } = await params;
  const [profile, submission] = await Promise.all([getProfile(), getSpeakingSubmission(submissionId)]);
  if (!submission) return <p className="text-muted">Không tìm thấy bài nói, hoặc bạn không có quyền xem.</p>;
  const { report } = submission;

  async function retry() {
    "use server";
    try {
      await gradeSpeaking({ submissionId });
    } catch (error) {
      console.error("speaking regrade failed", submissionId, error); // the page shows it is still ungraded
    }
    redirect(`/examiner/analysis/${submissionId}`);
  }

  const header = (
    <div className="flex flex-wrap items-center gap-4">
      <div className="mr-auto">
        <h1 className="text-4xl font-bold">
          Phân tích lỗi <span className="text-brand-ink">Speaking</span>
        </h1>
        <p className="mt-2 text-lg">
          {submission.prompt.title} · {formatDate(submission.submittedAt)}
        </p>
      </div>
      {profile?.role === "student" && (
        <Button href="/examiner" variant="outline">
          <ArrowLeft className="size-4" aria-hidden />
          Danh sách đề
        </Button>
      )}
    </div>
  );

  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card className="flex flex-col items-start gap-3">
          <p role="status">Bản ghi âm đã được lưu nhưng AI chưa chấm xong.</p>
          {profile?.role === "student" && (
            <form action={retry}>
              <RetryButton />
            </form>
          )}
        </Card>
        <audio controls src={submission.audioUrl} aria-label="Bản ghi âm" className="w-full" />
      </div>
    );
  }

  const criteria = CRITERIA.map(([key, name]) => ({ name, score: report.criteria[key].band, comment: report.criteria[key].comment }));
  const withCriteria = (right: React.ReactNode) => (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <CriteriaCard criteria={criteria} />
      {right}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {header}
      <Tabs
        variant="underline"
        defaultTab={report.errors.length > 0 ? "errors" : "overview"}
        tabs={[
          {
            id: "overview",
            label: "Tổng quan",
            content: withCriteria(
              <div className="flex flex-col gap-6">
                <AIComment title="Nhận xét tổng quan">
                  <p>{report.summary}</p>
                </AIComment>
                <Card>
                  <h2 className="mb-4 text-xl font-bold">Nhận xét theo tiêu chí</h2>
                  <dl className="flex flex-col gap-3">
                    {criteria.map((c) => (
                      <div key={c.name}>
                        <dt className="font-semibold">{c.name}</dt>
                        <dd className="text-navy/80">{c.comment}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </div>,
            ),
          },
          {
            id: "errors",
            label: `Lỗi sai (${report.errors.length})`,
            content: withCriteria(
              <Card>
                <h2 className="mb-4 text-xl font-bold">Các lỗi sai nổi bật</h2>
                {report.errors.length === 0 ? (
                  <p className="text-muted">Không có lỗi đáng kể.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {report.errors.map((e, i) => (
                      <li key={i} className="rounded-xl bg-warning-soft px-4 py-3">
                        <p className="font-bold">{ERROR_TYPE[e.type]} — Cần cải thiện</p>
                        <p className="mt-1">
                          <del className="text-danger-ink">{e.quote}</del> → <ins className="font-medium text-success-ink no-underline">{e.suggestion}</ins>
                        </p>
                        <p className="text-navy/80">{e.explanation}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>,
            ),
          },
          {
            id: "tips",
            label: "Gợi ý cải thiện",
            content: withCriteria(
              <Card>
                <h2 className="mb-4 text-xl font-bold">Gợi ý cải thiện</h2>
                {report.errors.length === 0 ? (
                  <p className="text-muted">Giữ phong độ và thử đề ở Part khác để AI đánh giá thêm.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {report.errors.map((e, i) => (
                      <li key={i} className="flex gap-3">
                        <Lightbulb className="mt-0.5 size-5 shrink-0 text-skill-writing-ink" aria-hidden />
                        <span>
                          <strong>{ERROR_TYPE[e.type]}:</strong> nói “{e.suggestion}” thay vì “{e.quote}”.
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>,
            ),
          },
          {
            id: "recording",
            label: "Bản ghi",
            content: (
              <Card className="flex flex-col gap-4">
                <audio controls src={submission.audioUrl} aria-label="Bản ghi âm" className="w-full" />
                <h2 className="text-xl font-bold">AI nghe được</h2>
                <p className="leading-relaxed whitespace-pre-line">{report.transcript || "(không nghe thấy lời nói)"}</p>
                <h2 className="text-xl font-bold">Đề bài</h2>
                <p className="whitespace-pre-line text-navy/80">{submission.prompt.prompt}</p>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
