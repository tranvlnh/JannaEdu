import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { PathSkill } from "@/contracts/learning-path";
import { generateLearningPath, getMyLearningPath } from "@/server/learning-path";
import { RetryButton } from "@/app/retry-button";

const SKILLS: [PathSkill, string, string][] = [
  ["listening", "Listening", "/tests"],
  ["reading", "Reading", "/tests"],
  ["writing", "Writing", "/writing"],
  ["speaking", "Speaking", "/speaking"],
];

async function generate() {
  "use server";
  try {
    await generateLearningPath();
  } catch (error) {
    console.error("learning path generation failed", error); // the page still shows the previous path
  }
  redirect("/learning-path");
}

async function LearningPath() {
  const { path, canGenerate } = await getMyLearningPath();
  return (
    <>
      <h1 className="text-xl font-semibold">Lộ trình học</h1>

      {canGenerate ? (
        <form action={generate} className="flex flex-col items-start gap-2">
          <p className="text-sm text-zinc-600">
            {path ? "Bạn có kết quả mới kể từ lần lập lộ trình trước." : "Bạn đã có kết quả thi, hãy lập lộ trình đầu tiên."}
          </p>
          <RetryButton
            label={path ? "Cập nhật lộ trình" : "Lập lộ trình"}
            pendingLabel="AI đang lập lộ trình, có thể mất tới một phút..."
          />
        </form>
      ) : (
        !path && (
          <p>
            Chưa có kết quả nào để lập lộ trình. Hãy làm một{" "}
            <Link href="/tests" className="underline">
              bài thi
            </Link>
            , bài{" "}
            <Link href="/writing" className="underline">
              Writing
            </Link>{" "}
            hoặc{" "}
            <Link href="/speaking" className="underline">
              Speaking
            </Link>{" "}
            trước.
          </p>
        )
      )}

      {path && (
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
            <p>{path.studentComment}</p>
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
                  <p className="mt-2 flex gap-3 text-sm">
                    {SKILLS.filter(([skill]) => stage.skills.includes(skill)).map(([skill, label, href]) => (
                      <Link key={skill} href={href} className="underline">
                        Luyện {label}
                      </Link>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <p className="text-sm text-zinc-600">
            Lập lúc {new Date(path.generatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </p>
        </>
      )}
    </>
  );
}

export default function LearningPathPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <LearningPath />
      </Suspense>
    </main>
  );
}
