import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Bot, Lightbulb } from "lucide-react";
import { Button, Card, CheckList, ProgressBar } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { pathTimeline } from "@/lib/path";
import { bandsAt, type Activity } from "@/lib/progress";
import { SKILLS, skillStyle, type Skill } from "@/lib/skills";
import { listActivity, requestTime } from "@/server/activity";
import { getLearningPath } from "@/server/learning-path";
import { getSpeakingSubmission } from "@/server/speaking";
import { getWritingSubmission } from "@/server/writing";
import { childName, loadChild, NoChild } from "../child";

export const metadata: Metadata = { title: "Nhận xét từ AI" };

export default function ParentAIFeedbackPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải nhận xét…</p>}>
      <Feedback />
    </Suspense>
  );
}

async function Feedback() {
  const child = await loadChild();
  if (!child) return <NoChild />;
  const [activity, path] = await Promise.all([listActivity(child.id), getLearningPath(child.id)]);
  const name = childName(child);
  const bands = bandsAt(activity);
  const latest = (skill: Skill) => activity.find((a) => a.skill === skill && a.band !== null);
  const lastEssay = latest("writing");
  const lastTalk = latest("speaking");
  // The AI's own summary of the latest graded essay and recording.
  const [essay, talk] = await Promise.all([
    lastEssay ? getWritingSubmission(lastEssay.id) : null,
    lastTalk ? getSpeakingSubmission(lastTalk.id) : null,
  ]);
  const summary: Partial<Record<Skill, string>> = { writing: essay?.report?.summary, speaking: talk?.report?.summary };

  const known = SKILLS.filter((s) => bands[s] !== null).sort((a, b) => bands[b]! - bands[a]!);
  const strengths = known.slice(0, 2).map((s) => `${skillStyle[s].label}: band ${band(bands[s]!)}`);
  const improvements = [
    ...known.slice(2).reverse().map((s) => `${skillStyle[s].label}: band ${band(bands[s]!)}`),
    ...SKILLS.filter((s) => bands[s] === null).map((s) => `${skillStyle[s].label}: chưa có kết quả`),
  ];
  const current = path && pathTimeline(path.stages, path.generatedAt, requestTime()).stages.find((s) => s.status === "current");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Nhận xét từ AI</h1>
        <p className="mt-2 text-lg">Phân tích từ AI về điểm mạnh, điểm yếu và gợi ý cải thiện cho {name}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Card className="flex gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface">
            <Bot className="size-8" aria-hidden />
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold">Tổng quan nhận xét</h2>
            <p className="leading-relaxed">{path?.parentComment ?? `${name} chưa lập lộ trình học nên AI chưa có nhận xét tổng quan.`}</p>
            {path && <p className="text-sm text-muted">Cập nhật ngày {formatDate(path.generatedAt)}</p>}
          </div>
        </Card>
        <Card className="bg-success/10!">
          <CheckList tone="good" title="Điểm mạnh" items={strengths.length ? strengths : ["Chưa có kết quả được chấm band"]} />
        </Card>
        <Card className="bg-danger/10!">
          <CheckList tone="bad" title="Cần cải thiện" items={improvements.length ? improvements : ["Chưa có kỹ năng nào cần ưu tiên"]} />
        </Card>
      </div>

      <section aria-labelledby="skills-title">
        <h2 id="skills-title" className="mb-4 text-2xl font-bold">
          Chi tiết các kỹ năng
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SKILLS.map((k) => (
            <li key={k}>
              <SkillCard skill={k} score={bands[k]} last={latest(k)} summary={summary[k]} />
            </li>
          ))}
        </ul>
      </section>

      <Card className="flex flex-wrap items-center gap-6">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-skill-speaking/10">
          <Lightbulb className="size-8 text-skill-speaking-ink" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold">Gợi ý cho phụ huynh</h2>
          <p className="mt-2 leading-relaxed">
            {current
              ? `${name} đang ở giai đoạn “${current.title}”: ${current.goal} Hãy khuyến khích con hoàn thành các bài tập của tuần này.`
              : `Hãy khuyến khích ${name} làm đủ bài ở cả 4 kỹ năng để AI lập lộ trình học phù hợp.`}
          </p>
        </div>
        <Button href="/parent/path" variant="navy">
          Xem chi tiết lộ trình học <ArrowRight className="size-5" aria-hidden />
        </Button>
      </Card>
    </div>
  );
}

function SkillCard({ skill, score, last, summary }: { skill: Skill; score: number | null; last?: Activity; summary?: string }) {
  const s = skillStyle[skill];
  return (
    <Card className={`flex h-full flex-col border ${s.border}`}>
      <h3 className={`text-xl font-bold ${s.text}`}>{s.label}</h3>
      <p className="text-2xl">
        <strong className="text-4xl">{score === null ? "–" : band(score)}</strong> / 9.0
      </p>
      <ProgressBar value={score ?? 0} max={9} barClass={s.bg} label={`${s.label} ${score === null ? "chưa có" : band(score)}/9`} className="mt-3" />
      {last ? (
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link href={last.href} className="font-semibold hover:underline">
            {last.title} · {formatDate(last.submittedAt)}
          </Link>
          {summary && <p className="leading-relaxed text-navy/80">{summary}</p>}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">Chưa có bài được chấm.</p>
      )}
    </Card>
  );
}
