import Link from "next/link";
import type { LearningPath, PathSkill } from "@/contracts/learning-path";
import { Icon } from "@/app/icons";
import { BandRing, RING_COLORS, SKILL_STYLE } from "@/app/scores";

const SKILLS: [PathSkill, string][] = [
  ["listening", "/tests#listening"],
  ["reading", "/tests#reading"],
  ["writing", "/writing"],
  ["speaking", "/speaking"],
];

// Stage cards cycle through these, like the week blocks in the design.
const STAGE_TONES = [
  "border-emerald-300 bg-emerald-50",
  "border-orange-300 bg-orange-50",
  "border-blue-300 bg-blue-50",
  "border-purple-300 bg-purple-50",
  "border-slate-300 bg-slate-100",
];

// forParent: shows the comment written for the parent and drops the practice links.
export function LearningPathView({ path, forParent = false }: { path: LearningPath; forParent?: boolean }) {
  // Last week of each stage, counted from the start of the path.
  const weekEnds = path.stages.map((_, i) => path.stages.slice(0, i + 1).reduce((sum, s) => sum + s.weeks, 0));
  const totalWeeks = weekEnds.at(-1) ?? 0;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card flex flex-wrap items-center gap-6">
          <h2 className="w-full text-xl font-bold">Điểm IELTS hiện tại</h2>
          <BandRing band={path.overall} parts={SKILLS.map(([skill]) => path.bands[skill] ?? 0)} label="Overall" className="size-40" />
          <dl className="flex flex-1 flex-col gap-2">
            {SKILLS.map(([skill], i) => (
              <div key={skill} className="flex items-center gap-3">
                <span aria-hidden className="size-4 rounded-full" style={{ background: RING_COLORS[i] }} />
                <dt className="flex-1 text-lg">{SKILL_STYLE[skill].label}</dt>
                <dd className="text-lg font-bold">{path.bands[skill]?.toFixed(1) ?? "Chưa thi"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card flex gap-4">
          <Icon name="robot" className="size-12 shrink-0" />
          <div>
            <h2 className="mb-1 text-xl font-bold">Nhận xét từ AI</h2>
            <p className="leading-7">{forParent ? path.parentComment : path.studentComment}</p>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">
          Các giai đoạn <span className="text-lg font-normal">· dự kiến hoàn thành trong {totalWeeks} tuần</span>
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {path.stages.map((stage, i) => {
            const weekEnd = weekEnds[i];
            const weekStart = weekEnd - stage.weeks + 1;
            return (
              <li key={i} className={`flex flex-col gap-2 rounded-2xl border-2 p-5 ${STAGE_TONES[i % STAGE_TONES.length]}`}>
                <p aria-hidden className="flex gap-2">
                  {stage.skills.map((skill) => (
                    <span key={skill} className="grid size-12 place-items-center rounded-full bg-white/70">
                      <Icon name={SKILL_STYLE[skill].icon} className={`size-7 ${SKILL_STYLE[skill].text}`} />
                    </span>
                  ))}
                </p>
                <p className="self-start rounded-lg bg-white/70 px-3 py-1 text-xl font-bold">
                  Tuần {weekStart === weekEnd ? weekStart : `${weekStart} - ${weekEnd}`}
                </p>
                <h3 className="text-xl font-bold">{stage.title}</h3>
                <p>{stage.goal}</p>
                <ul className="list-disc pl-5 text-sm">
                  {stage.tasks.map((task, j) => (
                    <li key={j}>{task}</li>
                  ))}
                </ul>
                {!forParent && (
                  <p className="mt-auto flex flex-wrap gap-2 pt-2">
                    {SKILLS.filter(([skill]) => stage.skills.includes(skill)).map(([skill, href]) => (
                      <Link key={skill} href={href} className="btn px-4 py-1 text-sm">
                        Luyện {SKILL_STYLE[skill].label}
                      </Link>
                    ))}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <p className="text-sm text-slate-600">
        Lập lúc {new Date(path.generatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
      </p>
    </>
  );
}
