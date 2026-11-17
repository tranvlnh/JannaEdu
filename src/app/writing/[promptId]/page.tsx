import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { submitWritingInput } from "@/contracts/writing";
import { getProfile } from "@/server/profile";
import { listWritingPrompts, submitWriting } from "@/server/writing";
import { Editor } from "./editor";

async function Write({ params }: { params: Promise<{ promptId: string }> }) {
  const { promptId } = await params;
  const [profile, prompts] = await Promise.all([getProfile(), listWritingPrompts()]);
  if (!profile) redirect("/login");
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) notFound();
  if (profile.role !== "student") return <p>Chỉ tài khoản học sinh mới nộp bài được.</p>;

  // Returns the new submission id, or a message to show. Thrown errors would be masked in production.
  async function submit(essay: string) {
    "use server";
    const input = submitWritingInput.safeParse({ promptId, essay });
    if (!input.success) return { error: "Bài viết đang trống hoặc dài quá 10.000 ký tự." };
    try {
      return await submitWriting(input.data);
    } catch (error) {
      if (error instanceof Error && error.message === "daily limit reached") {
        return { error: "Bạn đã nộp đủ số bài trong 24 giờ qua. Bài đang viết vẫn được giữ trên máy, hãy nộp lại sau." };
      }
      console.error("submit writing failed", error);
      return { error: "Không nộp được bài. Bài đang viết vẫn được giữ trên máy, hãy thử lại." };
    }
  }

  return <Editor prompt={prompt} submit={submit} />;
}

export default function WritePage({ params }: PageProps<"/writing/[promptId]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 md:p-8">
      <Suspense fallback={<p>Loading...</p>}>
        <Write params={params} />
      </Suspense>
    </main>
  );
}
