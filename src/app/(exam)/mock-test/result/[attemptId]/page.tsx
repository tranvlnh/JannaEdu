import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { ArcGauge } from "@/components/charts";
import { PrintButton } from "@/components/print-button";
import { AIComment, Button, Card, SkillScoreCard } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { skillStyle } from "@/lib/skills";
import { getAttemptResult, listAttempts } from "@/server/exam";
import { getProfile } from "@/server/profile";

export const metadata: Metadata = { title: "Kết quả bài thi" };

export default function ResultPage({ params }: PageProps<"/mock-test/result/[attemptId]">) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Đang tải kết quả…</p>}>
      <Result params={params} />
    </Suspense>
  );
}

async function Result({ params }: Pick<PageProps<"/mock-test/result/[attemptId]">, "params">) {
  const { attemptId } = await params;
  const [result, profile] = await Promise.all([getAttemptResult(attemptId), getProfile()]);
  if (!result) {
    return (
      <p className="mx-auto max-w-md p-10 text-center text-muted">Không tìm thấy kết quả. Bài có thể chưa được nộp hoặc bạn không có quyền xem.</p>
    );
  }
  const { test, attempt } = result;
  const isStudent = profile?.role === "student";
  const style = skillStyle[test.skill];
  // The previous graded exam of the same skill, to show the change.
  const history = isStudent && result.band !== null ? await listAttempts() : [];
  const previous = history.find((a) => a.id !== attempt.id && a.skill === test.skill && a.band !== null && a.submittedAt < attempt.submittedAt!);
  const delta = previous && result.band !== null ? result.band - previous.band! : null;
  const correctPct = Math.round((result.rawScore / result.total) * 100);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Kết quả bài thi</h1>
          <p className="mt-2 text-lg">{test.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {attempt.submittedAt && (
            <p className="text-muted">
              Ngày thi: <time dateTime={attempt.submittedAt} className="font-semibold text-navy">{formatDate(attempt.submittedAt)}</time>
            </p>
          )}
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card className="flex flex-col items-center gap-2">
          <h2 className="self-start text-lg font-semibold">{result.band === null ? "Bài ôn tập" : `${style.label} band score`}</h2>
          {result.band === null ? (
            <ArcGauge value={correctPct} max={100} label={`Đúng ${correctPct}%`}>
              <p className="text-6xl font-black tabular-nums">{correctPct}%</p>
            </ArcGauge>
          ) : (
            <ArcGauge value={result.band} label={`Band ${band(result.band)} trên 9`}>
              <p className="text-7xl font-black tabular-nums">{band(result.band)}</p>
            </ArcGauge>
          )}
          {delta !== null && (
            <p className="text-lg">
              <span className={`font-bold ${delta >= 0 ? "text-success-ink" : "text-danger-ink"}`}>
                {delta >= 0 ? "+" : ""}
                {band(delta)}
              </span>{" "}
              so với lần trước
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 text-xl font-bold">Điểm kỹ năng</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.band !== null && <SkillScoreCard skill={test.skill} score={result.band} />}
              <div className={`flex flex-col justify-center gap-1 rounded-2xl border-2 p-4 ${style.border} ${style.soft}`}>
                <p className={`font-semibold ${style.text}`}>Số câu đúng</p>
                <p className="text-4xl font-bold tabular-nums">
                  {result.rawScore}
                  <span className="text-xl font-semibold text-muted">/{result.total}</span>
                </p>
              </div>
            </div>
          </Card>

          <AIComment
            title="Bước tiếp theo"
            action={
              isStudent && (
                <div className="mt-2 flex flex-wrap gap-3 print:hidden">
                  <Button href="/path">
                    Xem lộ trình cá nhân <ArrowRight className="size-5" aria-hidden />
                  </Button>
                  <Button href={`/mock-test/${test.id}`} variant="outline">
                    <RotateCcw className="size-4" aria-hidden />
                    Làm lại đề này
                  </Button>
                </div>
              )
            }
          >
            <p>
              Kết quả này được dùng để cập nhật lộ trình học. Hãy làm thêm bài ở các kỹ năng còn thiếu để AI có đủ dữ liệu đánh giá band tổng.
            </p>
          </AIComment>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Theo câu hỏi</h2>
        {result.answers.length === 0 ? (
          <p className="text-muted">Đề thi chỉ báo điểm, không hiện đáp án từng câu vì đề có thể được làm lại.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th scope="col" className="py-1">Câu</th>
                <th scope="col">Bạn trả lời</th>
                <th scope="col">Đáp án</th>
              </tr>
            </thead>
            <tbody>
              {result.answers.map((a) => (
                <tr key={a.questionId} className="border-t border-navy/10">
                  <th scope="row" className="py-1.5 text-left font-semibold">{a.number}</th>
                  <td className={a.correct ? "text-success-ink" : "text-danger-ink"}>
                    <span className="sr-only">{a.correct ? "Đúng: " : "Sai: "}</span>
                    {a.answer || "—"}
                  </td>
                  <td>{a.accepted.join(" / ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
