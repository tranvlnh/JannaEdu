import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { submitSpeakingInput } from "@/contracts/speaking";
import { getProfile } from "@/server/profile";
import { listSpeakingPrompts, submitSpeaking } from "@/server/speaking";
import { Recorder } from "./recorder";

async function Speak({ params }: { params: Promise<{ promptId: string }> }) {
  const { promptId } = await params;
  const [profile, prompts] = await Promise.all([getProfile(), listSpeakingPrompts()]);
  if (!profile) redirect("/login");
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) notFound();
  if (profile.role !== "student") return <p>Chỉ tài khoản học sinh mới nộp bài được.</p>;

  // Returns the new submission id, or a message to show. Thrown errors would be masked in production.
  async function submit(formData: FormData) {
    "use server";
    const input = submitSpeakingInput.safeParse({ promptId, audio: formData.get("audio") });
    if (!input.success) {
      const audio = formData.get("audio");
      console.error("invalid speaking upload", audio instanceof Blob ? { type: audio.type, size: audio.size } : audio, input.error.issues);
      return { error: "Bản ghi âm không hợp lệ hoặc quá dài. Hãy ghi lại." };
    }
    try {
      return await submitSpeaking(input.data);
    } catch (error) {
      if (error instanceof Error && error.message === "daily limit reached") {
        return { error: "Bạn đã nộp đủ số bài trong 24 giờ qua. Hãy thử lại sau." };
      }
      console.error("submit speaking failed", error);
      return { error: "Không nộp được bài. Bản ghi âm vẫn còn ở trên, hãy thử nộp lại." };
    }
  }

  return <Recorder prompt={prompt} submit={submit} />;
}

export default function SpeakPage({ params }: PageProps<"/speaking/[promptId]">) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-8">
      <Suspense fallback={<p>Loading...</p>}>
        <Speak params={params} />
      </Suspense>
    </main>
  );
}
