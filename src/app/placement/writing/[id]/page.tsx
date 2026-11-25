import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { Editor } from "@/app/(student)/examiner/writing/[promptId]/editor";
import { submitWritingInput } from "@/contracts/writing";
import { homeOf } from "@/server/auth";
import { completePlacement, getPlacement } from "@/server/placement";
import { getProfile } from "@/server/profile";
import { listWritingPrompts, submitWriting } from "@/server/writing";

export const metadata: Metadata = { title: "Kiểm tra xếp lớp · Writing" };

export default function PlacementWritingPage({ params }: PageProps<"/placement/writing/[id]">) {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <Suspense fallback={<p className="text-muted">Đang tải đề…</p>}>
        <Write params={params} />
      </Suspense>
    </div>
  );
}

async function Write({ params }: Pick<PageProps<"/placement/writing/[id]">, "params">) {
  const { id: promptId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const [prompts, { parts }] = await Promise.all([listWritingPrompts(), getPlacement()]);
  const prompt = parts.some((p) => p.skill === "writing" && p.itemId === promptId) ? prompts.find((p) => p.id === promptId) : undefined;
  if (!prompt) notFound();

  // Same messages as the examiner page; on success it goes back to the placement hub instead of the analysis page.
  async function submit(essay: string) {
    "use server";
    const input = submitWritingInput.safeParse({ promptId, essay });
    if (!input.success) return { error: "Bài viết đang trống hoặc dài quá 10.000 ký tự." };
    try {
      await submitWriting(input.data);
    } catch (error) {
      unstable_rethrow(error); // let the login redirect through
      if (error instanceof Error && error.message === "daily limit reached") {
        return { error: "Bạn đã nộp đủ số bài trong 24 giờ qua. Bài đang viết vẫn được giữ trên máy, hãy nộp lại sau." };
      }
      console.error("submit placement writing failed", error);
      return { error: "Không nộp được bài. Bài đang viết vẫn được giữ trên máy, hãy thử lại." };
    }
    await completePlacement();
    redirect("/placement");
  }

  return <Editor prompt={prompt} submit={submit} />;
}
