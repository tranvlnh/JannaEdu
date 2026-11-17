import { Suspense } from "react";
import Image from "next/image";
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
      <header className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold md:text-5xl">Lộ trình học cá nhân hóa</h1>
          <p className="mt-3 max-w-3xl text-lg">
            Dựa trên kết quả bài thi và phân tích từ AI, Janna Edu thiết kế lộ trình học phù hợp nhất để giúp bạn đạt mục tiêu
            IELTS.
          </p>
        </div>
        <Image src="/ref/learning-path.jpg" alt="" width={492} height={407} priority className="hidden w-64 shrink-0 rounded-2xl md:block lg:w-80" />
      </header>

      {canGenerate ? (
        <form action={generate} className="card flex flex-col items-start gap-3">
          <p className="text-slate-600">
            {path ? "Bạn có kết quả mới kể từ lần lập lộ trình trước." : "Bạn đã có kết quả thi, hãy lập lộ trình đầu tiên."}
          </p>
          <RetryButton
            label={path ? "Cập nhật lộ trình" : "Lập lộ trình"}
            pendingLabel="AI đang lập lộ trình, có thể mất tới một phút..."
          />
        </form>
      ) : (
        !path && (
          <p className="card">
            Chưa có kết quả nào để lập lộ trình. Hãy làm một{" "}
            <Link href="/tests" className="font-medium text-brand underline">
              bài thi
            </Link>
            , bài{" "}
            <Link href="/writing" className="font-medium text-brand underline">
              Writing
            </Link>{" "}
            hoặc{" "}
            <Link href="/speaking" className="font-medium text-brand underline">
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <Suspense fallback={<p>Loading...</p>}>
        <LearningPath />
      </Suspense>
    </main>
  );
}
