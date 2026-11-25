import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { submitSpeakingInput } from "@/contracts/speaking";
import { homeOf } from "@/server/auth";
import { getProfile } from "@/server/profile";
import { listSpeakingPrompts, submitSpeaking } from "@/server/speaking";
import { SpeakingPractice } from "../speaking-practice";

export const metadata: Metadata = { title: "Speaking Practice" };

export default function SpeakPage({ params }: PageProps<"/examiner/[promptId]">) {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải đề…</p>}>
      <Speak params={params} />
    </Suspense>
  );
}

async function Speak({ params }: Pick<PageProps<"/examiner/[promptId]">, "params">) {
  const { promptId } = await params;
  const [profile, prompts] = await Promise.all([getProfile(), listSpeakingPrompts()]);
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) notFound();

  // Returns the new submission id, or a message to show. Thrown errors would be masked in production.
  async function submit(formData: FormData) {
    "use server";
    const input = submitSpeakingInput.safeParse({ promptId, audio: formData.get("audio") });
    if (!input.success) return { error: "Bản ghi âm không hợp lệ hoặc quá dài. Hãy ghi lại." };
    try {
      return await submitSpeaking(input.data);
    } catch (error) {
      unstable_rethrow(error);
      if (error instanceof Error && error.message === "daily limit reached") {
        return { error: "Bạn đã nộp đủ số bài trong 24 giờ qua. Hãy thử lại sau." };
      }
      console.error("submit speaking failed", error);
      return { error: "Không nộp được bài. Bản ghi âm vẫn còn ở trên, hãy thử nộp lại." };
    }
  }

  return <SpeakingPractice prompt={prompt} submit={submit} />;
}
