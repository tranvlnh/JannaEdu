import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { submitWritingInput } from "@/contracts/writing";
import { homeOf } from "@/server/auth";
import { getProfile } from "@/server/profile";
import { listWritingPrompts, submitWriting } from "@/server/writing";
import { Editor } from "./editor";

export const metadata: Metadata = { title: "Writing Practice" };

export default function WritePage({ params }: PageProps<"/examiner/writing/[promptId]">) {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải đề…</p>}>
      <Write params={params} />
    </Suspense>
  );
}

async function Write({ params }: Pick<PageProps<"/examiner/writing/[promptId]">, "params">) {
  const { promptId } = await params;
  const [profile, prompts] = await Promise.all([getProfile(), listWritingPrompts()]);
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) notFound();

  // Returns the new submission id, or a message to show. Thrown errors would be masked in production.
  async function submit(essay: string) {
    "use server";
    const input = submitWritingInput.safeParse({ promptId, essay });
    if (!input.success) return { error: "Bài viết đang trống hoặc dài quá 10.000 ký tự." };
    try {
      return await submitWriting(input.data);
    } catch (error) {
      unstable_rethrow(error); // let the login redirect through
      if (error instanceof Error && error.message === "daily limit reached") {
        return { error: "Bạn đã nộp đủ số bài trong 24 giờ qua. Bài đang viết vẫn được giữ trên máy, hãy nộp lại sau." };
      }
      console.error("submit writing failed", error);
      return { error: "Không nộp được bài. Bài đang viết vẫn được giữ trên máy, hãy thử lại." };
    }
  }

  return <Editor prompt={prompt} submit={submit} />;
}
