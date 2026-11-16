import Link from "next/link";
import type { LearningPath, PathSkill } from "@/contracts/learning-path";

const SKILLS: [PathSkill, string, string][] = [
  ["listening", "Listening", "/tests"],
  ["reading", "Reading", "/tests"],
  ["writing", "Writing", "/writing"],
  ["speaking", "Speaking", "/speaking"],
];

// forParent: shows the comment written for the parent and drops the practice links.
export function LearningPathView({ path, forParent = false }: { path: LearningPath; forParent?: boolean }) {
  return (
    <>
      <section>
        <h2 className="mb-2 font-semibold">
          Trình độ hiện tại{path.overall !== null && `: Overall ${path.overall.toFixed(1)}`}
        </h2>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SKILLS.map(([skill, label]) => (
            <div key={skill} className="rounded border p-3">
              <dt className="text-sm text-zinc-600">{label}</dt>
              <dd className="text-lg font-semibold">{path.bands[skill]?.toFixed(1) ?? "Chưa thi"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Nhận xét của AI</h2>
        <p>{forParent ? path.parentComment : path.studentComment}</p>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Các giai đoạn</h2>
        <ol className="flex flex-col gap-3">
          {path.stages.map((stage, i) => (
            <li key={i} className="rounded border p-3">
              <h3 className="font-medium">
                {i + 1}. {stage.title} <span className="text-sm font-normal text-zinc-600">· {stage.weeks} tuần</span>
              </h3>
              <p className="text-sm text-zinc-600">{stage.goal}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {stage.tasks.map((task, j) => (
                  <li key={j}>{task}</li>
                ))}
              </ul>
              {!forParent && (
                <p className="mt-2 flex gap-3 text-sm">
                  {SKILLS.filter(([skill]) => stage.skills.includes(skill)).map(([skill, label, href]) => (
                    <Link key={skill} href={href} className="underline">
                      Luyện {label}
                    </Link>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <p className="text-sm text-zinc-600">
        Lập lúc {new Date(path.generatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
      </p>
    </>
  );
}
