import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AiReport } from "@/app/ai-report";
import { RetryButton } from "@/app/retry-button";
import type { SpeakingReport } from "@/contracts/speaking";
import { getProfile } from "@/server/profile";
import { getSpeakingSubmission, gradeSpeaking } from "@/server/speaking";

const CRITERIA: [keyof SpeakingReport["criteria"], string][] = [
  ["fluencyCoherence", "Fluency and Coherence"],
  ["lexicalResource", "Lexical Resource"],
  ["grammaticalRange", "Grammatical Range and Accuracy"],
  ["pronunciation", "Pronunciation"],
];
const ERROR_TYPE = { grammar: "Ngữ pháp", vocabulary: "Từ vựng", pronunciation: "Phát âm", fluency: "Độ trôi chảy" };

async function Submission({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  const [profile, submission] = await Promise.all([getProfile(), getSpeakingSubmission(submissionId)]);
  if (!submission) return <p>Không tìm thấy bài nói.</p>;
  const { report } = submission;

  async function retry() {
    "use server";
    try {
      await gradeSpeaking({ submissionId });
    } catch (error) {
      console.error("speaking regrade failed", submissionId, error); // the page shows it is still ungraded
    }
    redirect(`/speaking/submissions/${submissionId}`);
  }

  return (
    <>
      <h1 className="text-xl font-semibold">{submission.prompt.title}</h1>
      <audio controls src={submission.audioUrl} aria-label="Bản ghi âm" className="w-full" />

      {report ? (
        <AiReport
          band={report.band}
          summary={report.summary}
          criteria={CRITERIA.map(([key, label]) => ({ label, ...report.criteria[key] }))}
          errors={report.errors}
          errorTypes={ERROR_TYPE}
        />
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p role="status">Bản ghi âm đã được lưu nhưng AI chưa chấm xong.</p>
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
      {report && (
        <section>
          <h2 className="mb-2 font-semibold">AI nghe được</h2>
          <p className="whitespace-pre-line leading-7">{report.transcript || "(không nghe thấy lời nói)"}</p>
        </section>
      )}
    </>
  );
}

export default function SubmissionPage({ params }: PageProps<"/speaking/submissions/[submissionId]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Submission params={params} />
      </Suspense>
      <Link href="/speaking" className="underline">
        ← Danh sách đề Speaking
      </Link>
    </main>
  );
}
