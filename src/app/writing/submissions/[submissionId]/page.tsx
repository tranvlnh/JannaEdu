import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { WritingReport } from "@/contracts/writing";
import { getProfile } from "@/server/profile";
import { getWritingSubmission, gradeWriting } from "@/server/writing";
import { RetryButton } from "./retry-button";

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
    <>
      <p className="text-lg">
        <strong>Band {report.band.toFixed(1)}</strong>
      </p>
      <p>{report.summary}</p>

      <section>
        <h2 className="mb-2 font-semibold">Điểm theo tiêu chí</h2>
        <dl className="flex flex-col gap-3">
          {CRITERIA.map(([key, label]) => (
            <div key={key}>
              <dt className="font-medium">
                {label}: {report.criteria[key].band.toFixed(1)}
              </dt>
              <dd className="text-sm text-zinc-600">{report.criteria[key].comment}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Lỗi cần sửa ({report.errors.length})</h2>
        {report.errors.length === 0 ? (
          <p className="text-sm text-zinc-600">Không có lỗi đáng kể.</p>
        ) : (
          <ol className="flex list-decimal flex-col gap-3 pl-5">
            {report.errors.map((e, i) => (
              <li key={i}>
                <span className="text-sm text-zinc-600">{ERROR_TYPE[e.type]}</span>
                <br />
                <del className="text-red-600">{e.quote}</del> → <ins className="text-green-700 no-underline">{e.suggestion}</ins>
                <br />
                <span className="text-sm">{e.explanation}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
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
      <h1 className="text-xl font-semibold">{submission.prompt.title}</h1>

      {submission.report ? (
        <Report report={submission.report} />
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p role="status">Bài đã được lưu nhưng AI chưa chấm xong.</p>
          {profile?.role === "student" && (
            <form action={retry}>
              <RetryButton />
            </form>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Đề bài</h2>
        <p className="whitespace-pre-line text-sm text-zinc-600">{submission.prompt.prompt}</p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Bài viết</h2>
        <p className="whitespace-pre-line leading-7">{submission.essay}</p>
      </section>
    </>
  );
}

export default function SubmissionPage({ params }: PageProps<"/writing/submissions/[submissionId]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Submission params={params} />
      </Suspense>
      <Link href="/writing" className="underline">
        ← Danh sách đề Writing
      </Link>
    </main>
  );
}
