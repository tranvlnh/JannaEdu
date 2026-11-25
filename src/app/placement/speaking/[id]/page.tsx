import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { SpeakingPractice } from "@/app/(student)/examiner/speaking-practice";
import { submitSpeakingInput } from "@/contracts/speaking";
import { homeOf } from "@/server/auth";
import { completePlacement, getPlacement } from "@/server/placement";
import { getProfile } from "@/server/profile";
import { listSpeakingPrompts, submitSpeaking } from "@/server/speaking";

export const metadata: Metadata = { title: "Kiểm tra xếp lớp · Speaking" };

export default function PlacementSpeakingPage({ params }: PageProps<"/placement/speaking/[id]">) {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <Suspense fallback={<p className="text-muted">Đang tải đề…</p>}>
        <Speak params={params} />
      </Suspense>
    </div>
  );
}

async function Speak({ params }: Pick<PageProps<"/placement/speaking/[id]">, "params">) {
  const { id: promptId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const [prompts, { parts }] = await Promise.all([listSpeakingPrompts(), getPlacement()]);
  const prompt = parts.some((p) => p.skill === "speaking" && p.itemId === promptId) ? prompts.find((p) => p.id === promptId) : undefined;
  if (!prompt) notFound();

  // Same messages as the examiner page; on success it goes back to the placement hub instead of the analysis page.
  async function submit(formData: FormData) {
    "use server";
    const input = submitSpeakingInput.safeParse({ promptId, audio: formData.get("audio") });
    if (!input.success) return { error: "Bản ghi âm không hợp lệ hoặc quá dài. Hãy ghi lại." };
    try {
      await submitSpeaking(input.data);
    } catch (error) {
      unstable_rethrow(error); // let the login redirect through
      if (error instanceof Error && error.message === "daily limit reached") {
        return { error: "Bạn đã nộp đủ số bài trong 24 giờ qua. Hãy thử lại sau." };
      }
      console.error("submit placement speaking failed", error);
      return { error: "Không nộp được bài. Bản ghi âm vẫn còn ở trên, hãy thử nộp lại." };
    }
    await completePlacement();
    redirect("/placement");
  }

  return <SpeakingPractice prompt={prompt} submit={submit} />;
}
