import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Bot, Mic, PenLine, type LucideIcon } from "lucide-react";
import { Tabs } from "@/components/tabs";
import { Button, Card, Pill } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { listSpeakingPrompts, listSpeakingSubmissions } from "@/server/speaking";
import { listWritingPrompts, listWritingSubmissions } from "@/server/writing";

export const metadata: Metadata = { title: "Giám khảo AI" };

export default function ExaminerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Bot className="size-14 shrink-0 text-brand-ink" aria-hidden />
        <div>
          <h1 className="text-4xl font-bold">Giám khảo AI</h1>
          <p className="mt-2 text-lg">AI chấm band Writing và Speaking theo 4 tiêu chí IELTS, chỉ ra từng lỗi và gợi ý cách sửa.</p>
        </div>
      </div>
      <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
        <Skills />
      </Suspense>
    </div>
  );
}

type Prompt = { id: string; title: string; label: string; href: string };
type Submission = { id: string; promptTitle: string; submittedAt: string; band: number | null; href: string };

async function Skills() {
  const [speakPrompts, speakSubs, writePrompts, writeSubs] = await Promise.all([
    listSpeakingPrompts(),
    listSpeakingSubmissions(),
    listWritingPrompts(),
    listWritingSubmissions(),
  ]);
  return (
    <Tabs
      variant="underline"
      tabs={[
        {
          id: "speaking",
          label: "Speaking",
          content: (
            <SkillPanel
              icon={Mic}
              iconClass="text-skill-speaking-ink"
              prompts={speakPrompts.map((p) => ({ id: p.id, title: p.title, label: `Speaking Part ${p.part}`, href: `/examiner/${p.id}` }))}
              submissions={speakSubs.map((s) => ({ ...s, href: `/examiner/analysis/${s.id}` }))}
            />
          ),
        },
        {
          id: "writing",
          label: "Writing",
          content: (
            <SkillPanel
              icon={PenLine}
              iconClass="text-skill-writing-ink"
              prompts={writePrompts.map((p) => ({ id: p.id, title: p.title, label: `Writing Task ${p.task}`, href: `/examiner/writing/${p.id}` }))}
              submissions={writeSubs.map((s) => ({ ...s, href: `/examiner/writing/analysis/${s.id}` }))}
            />
          ),
        },
      ]}
    />
  );
}

function SkillPanel({ icon: Icon, iconClass, prompts, submissions }: { icon: LucideIcon; iconClass: string; prompts: Prompt[]; submissions: Submission[] }) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Chọn đề</h2>
        {prompts.length === 0 ? (
          <p className="text-muted">Chưa có đề nào.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {prompts.map((p) => (
              <li key={p.id}>
                <Card className="flex h-full flex-wrap items-center gap-4">
                  <Icon className={`size-8 shrink-0 ${iconClass}`} aria-hidden />
                  <div className="mr-auto min-w-0">
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    <Pill className="mt-1">{p.label}</Pill>
                  </div>
                  <Button href={p.href}>Làm ngay</Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Bài đã nộp</h2>
        {submissions.length === 0 ? (
          <p className="text-muted">Bạn chưa nộp bài nào.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-navy/10">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="flex flex-wrap items-center gap-3 py-3 hover:text-brand-ink">
                  <span className="mr-auto">
                    <span className="block font-semibold">{s.promptTitle}</span>
                    <span className="text-sm text-muted">{formatDate(s.submittedAt)}</span>
                  </span>
                  {s.band === null ? <Pill tone="warning">Chưa chấm</Pill> : <span className="text-xl font-bold">Band {s.band.toFixed(1)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
