import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Flag, Target } from "lucide-react";
import { RetryButton } from "@/app/retry-button";
import { Tabs } from "@/components/tabs";
import { AIComment, Button, Card, ProgressBar, SKILL_ICON } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { pathTimeline } from "@/lib/path";
import { skillStyle } from "@/lib/skills";
import { requestTime } from "@/server/activity";
import { generateLearningPath, getMyLearningPath } from "@/server/learning-path";
import { getProfile } from "@/server/profile";
import { StageCard } from "./stage-card";

export const metadata: Metadata = { title: "Lộ trình học" };

async function generate() {
  "use server";
  try {
    await generateLearningPath();
  } catch (error) {
    console.error("learning path generation failed", error); // the page still shows the previous path
  }
  redirect("/path");
}

export default function PathPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải lộ trình…</p>}>
      <LearningPath />
    </Suspense>
  );
}

async function LearningPath() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { path, canGenerate } = await getMyLearningPath();
  const timeline = path && pathTimeline(path.stages, path.generatedAt, requestTime());
  const pct = timeline ? Math.round((timeline.currentWeek / timeline.totalWeeks) * 100) : 0;
  const current = timeline?.stages.find((s) => s.status === "current") ?? timeline?.stages.at(-1);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-white/50 p-6 sm:p-8">
        <Flag className="absolute -right-4 -bottom-6 hidden size-56 -rotate-12 text-skill-listening/15 lg:block" aria-hidden />
        <h1 className="text-4xl font-bold">Lộ trình học cá nhân hóa</h1>
        <p className="mt-2 max-w-3xl text-lg text-navy/80">
          Dựa trên mục tiêu, kết quả bài thi và phân tích từ AI, Janna Edu thiết kế lộ trình phù hợp nhất để giúp bạn đạt mục tiêu IELTS.
        </p>
        <div className="relative mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Card className="flex items-center gap-4 border-2 border-brand/40 bg-brand-soft/60! shadow-none!">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white">
              <Target className="size-9 text-brand-ink" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Mục tiêu của bạn</p>
              {profile.goalBand === null ? (
                <Link href="/account" className="text-lg font-bold text-brand-ink hover:underline">
                  Đặt band mục tiêu
                </Link>
              ) : (
                <p className="text-3xl font-bold">IELTS {band(profile.goalBand)}+</p>
              )}
              {timeline && <p className="text-sm">Dự kiến hoàn thành: {timeline.totalWeeks} tuần</p>}
            </div>
          </Card>
          <Card className="flex flex-col justify-center gap-2 border-2 border-skill-listening/40 shadow-none!">
            <p className="font-semibold">Tiến độ hiện tại</p>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold tabular-nums">{pct}%</p>
              <ProgressBar value={pct} label={`Tiến độ lộ trình ${pct}%`} className="flex-1" />
            </div>
            {timeline && (
              <p className="text-right text-sm">
                Tuần {timeline.currentWeek}/{timeline.totalWeeks}
              </p>
            )}
          </Card>
        </div>
        <Button href="/path/exercises" variant="ghost" className="relative mt-4 -ml-4">
          Xem bài tập AI gợi ý <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>

      {canGenerate && (
        <Card>
          <form action={generate} className="flex flex-wrap items-center gap-4">
            <p className="mr-auto">
              {path ? "Bạn có kết quả mới kể từ lần lập lộ trình trước." : "Bạn đã có kết quả thi, hãy để AI lập lộ trình đầu tiên."}
            </p>
            <RetryButton label={path ? "Cập nhật lộ trình" : "Lập lộ trình"} pendingLabel="AI đang lập lộ trình, có thể mất tới một phút…" />
          </form>
        </Card>
      )}

      {!path && !canGenerate && (
        <Card>
          <p>
            Chưa có kết quả nào để lập lộ trình. Hãy làm một{" "}
            <Link href="/mock-test" className="font-semibold text-brand-ink underline">
              bài thi
            </Link>
            , bài{" "}
            <Link href="/writing" className="font-semibold text-brand-ink underline">
              Writing
            </Link>{" "}
            hoặc{" "}
            <Link href="/examiner" className="font-semibold text-brand-ink underline">
              Speaking
            </Link>{" "}
            trước.
          </p>
        </Card>
      )}

      {path && timeline && (
        <>
          <AIComment title="Nhận xét từ AI">
            <p>{path.studentComment}</p>
            <p className="mt-2 text-sm text-muted">Lập ngày {formatDate(path.generatedAt)}</p>
          </AIComment>

          <Tabs
            tabs={[
              {
                id: "path",
                label: "Lộ trình học",
                content: (
                  <>
                    <h2 className="sr-only">Các giai đoạn</h2>
                    <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {timeline.stages.map((s, i) => (
                        <li key={i}>
                          <StageCard stage={s} />
                        </li>
                      ))}
                    </ol>
                  </>
                ),
              },
              {
                id: "week",
                label: "Kế hoạch tuần",
                content: current && (
                  <Card>
                    <h2 className="mb-1 text-xl font-bold">Tuần {timeline.currentWeek}</h2>
                    <p className="mb-4 text-muted">
                      Giai đoạn “{current.title}” · {current.goal}
                    </p>
                    <ul className="flex flex-col divide-y divide-navy/10">
                      {current.tasks.map((task, i) => (
                        <li key={i} className="flex items-center gap-3 py-3">
                          <span className="flex gap-1">
                            {current.skills.map((skill) => {
                              const Icon = SKILL_ICON[skill];
                              return <Icon key={skill} className={`size-5 ${skillStyle[skill].text}`} role="img" aria-label={skillStyle[skill].label} />;
                            })}
                          </span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ),
              },
              {
                id: "resources",
                label: "Tài liệu & tài nguyên",
                content:
                  (path.bookAdvice ?? []).length === 0 ? (
                    <Card>
                      <p className="text-muted">
                        AI chưa gợi ý sách nào cho bạn.{" "}
                        <Link href="/academy" className="font-semibold text-brand-ink hover:underline">
                          Xem thư viện Janna Academy
                        </Link>
                      </p>
                    </Card>
                  ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {path.bookAdvice!.map((b) => (
                        <li key={b.skill}>
                          <Link
                            href="/academy"
                            className="flex h-full items-start gap-3 rounded-2xl bg-white p-5 shadow-card hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand"
                          >
                            <BookOpen className={`size-6 shrink-0 ${skillStyle[b.skill].text}`} aria-hidden />
                            <span>
                              <span className="block font-semibold">IELTS {skillStyle[b.skill].label} Band 5.0 – 6.5 (Janna Book)</span>
                              <span className="text-sm text-navy/80">{b.reason}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
