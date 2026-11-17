import type { Metadata } from "next";
import { ArrowRight, Bot, Lightbulb } from "lucide-react";
import { Button, Card, CheckList, ProgressBar } from "@/components/ui";
import { band } from "@/lib/format";
import { aiFeedback, child } from "@/lib/mock/parent";
import { SKILLS, skillStyle } from "@/lib/skills";

export const metadata: Metadata = { title: "Nhận xét từ AI" };

export default function ParentAIFeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Nhận xét từ AI</h1>
        <p className="mt-2 text-lg">Phân tích chi tiết từ công nghệ AI về điểm mạnh, điểm yếu và gợi ý cải thiện cho con</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Card className="flex gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface">
            <Bot className="size-8" aria-hidden />
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold">Tổng quan nhận xét</h2>
            <p className="leading-relaxed">{aiFeedback.overview}</p>
            <p className="flex items-center gap-2 self-start rounded-full border-2 border-skill-listening/50 bg-surface px-4 py-1.5 font-semibold text-skill-listening">
              <Bot className="size-5" aria-hidden />
              AI phân tích từ 100+ tiêu chí
            </p>
          </div>
        </Card>
        <Card className="bg-success/10!">
          <CheckList tone="good" title="Điểm mạnh" items={aiFeedback.strengths} />
        </Card>
        <Card className="bg-danger/10!">
          <CheckList tone="bad" title="Cần cải thiện" items={aiFeedback.improvements} />
        </Card>
      </div>

      <section aria-labelledby="skills-title">
        <h2 id="skills-title" className="mb-4 text-2xl font-bold">
          Chi tiết các kỹ năng
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SKILLS.map((k) => {
            const s = skillStyle[k];
            return (
              <li key={k}>
                <Card className={`h-full border ${s.border}`}>
                  <h3 className={`text-xl font-bold ${s.text}`}>{s.label}</h3>
                  <p className="text-2xl">
                    <strong className="text-4xl">{band(child.scores[k])}</strong> / 9.0
                  </p>
                  <ProgressBar value={child.scores[k]} max={9} barClass={s.bg} label={`${s.label} ${band(child.scores[k])}/9`} className="mt-3" />
                  <ul className="mt-4 flex flex-col gap-2">
                    {aiFeedback.skills[k].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className={`size-2.5 shrink-0 rounded-full ${s.bg}`} aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <Card className="flex flex-wrap items-center gap-6">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-skill-speaking/10">
          <Lightbulb className="size-8 text-skill-speaking" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold">Gợi ý cho phụ huynh</h2>
          <p className="mt-2 leading-relaxed">{aiFeedback.parentTip}</p>
        </div>
        <Button href="/parent/path" variant="navy">
          Xem chi tiết lộ trình học <ArrowRight className="size-5" aria-hidden />
        </Button>
      </Card>
    </div>
  );
}
