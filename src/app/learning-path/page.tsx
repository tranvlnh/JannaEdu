import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { generateLearningPath, getMyLearningPath } from "@/server/learning-path";
import { LearningPathView } from "@/app/learning-path-view";
import { RetryButton } from "@/app/retry-button";

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

      {path && <LearningPathView path={path} />}
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
