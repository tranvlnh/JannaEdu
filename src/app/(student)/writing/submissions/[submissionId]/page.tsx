import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { WritingReport } from "@/contracts/writing";
import { getProfile } from "@/server/profile";
import { getWritingSubmission, gradeWriting } from "@/server/writing";
import { AiReport } from "@/app/ai-report";
import { RetryButton } from "@/app/retry-button";

const CRITERIA: [keyof WritingReport["criteria"], string][] = [
  ["taskResponse", "Task Response"],
  ["coherenceCohesion", "Coherence and Cohesion"],
  ["lexicalResource", "Lexical Resource"],
  ["grammaticalRange", "Grammatical Range and Accuracy"],
];
const ERROR_TYPE = {
  grammar: "Ngữ pháp",
  vocabulary: "Từ vựng",
  spelling: "Chính tả",
  coherence: "Mạch lạc",
  task: "Yêu cầu đề bài",
};

function Report({ report }: { report: WritingReport }) {
  return (
    <AiReport
      band={report.band}
      summary={report.summary}
      criteria={CRITERIA.map(([key, label]) => ({ label, ...report.criteria[key] }))}
      errors={report.errors}
      errorTypes={ERROR_TYPE}
    />
  );
}

async function Submission({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  const [profile, submission] = await Promise.all([getProfile(), getWritingSubmission(submissionId)]);
  if (!submission) return <p>Không tìm thấy bài viết.</p>;

  async function retry() {
    "use server";
    try {
      await gradeWriting({ submissionId });
    } catch (error) {
      console.error("writing regrade failed", submissionId, error); // the page shows it is still ungraded
    }
    redirect(`/writing/submissions/${submissionId}`);
  }

  return (
    <>
      <header>
        <h1 className="page-title">
          Phân tích lỗi <span className="text-brand-ink">Writing</span>
        </h1>
        <p className="mt-1 text-lg">{submission.prompt.title}</p>
      </header>

      {submission.report ? (
        <Report report={submission.report} />
      ) : (
        <div className="card flex flex-col items-start gap-3">
          <p role="status">Bài đã được lưu nhưng AI chưa chấm xong.</p>
          {profile?.role === "student" && (
            <form action={retry}>
              <RetryButton />
            </form>
          )}
        </div>
      )}

      <section className="card">
        <h2 className="mb-2 text-xl font-bold">Đề bài</h2>
        <p className="whitespace-pre-line text-muted">{submission.prompt.prompt}</p>
      </section>
      <section className="card">
        <h2 className="mb-2 text-xl font-bold">Bài viết</h2>
        <p className="whitespace-pre-line leading-7">{submission.essay}</p>
      </section>
    </>
  );
}

export default function SubmissionPage({ params }: PageProps<"/writing/submissions/[submissionId]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Submission params={params} />
      </Suspense>
      <Link href="/writing" className="font-medium text-brand-ink hover:underline">
        ← Danh sách đề Writing
      </Link>
    </div>
  );
}
