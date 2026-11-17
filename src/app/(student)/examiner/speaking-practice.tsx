"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Clock, Mic, Send, Square } from "lucide-react";
import { MAX_RECORDING_SECONDS, type SpeakingPrompt } from "@/contracts/speaking";
import { Button, Card } from "@/components/ui";
import { formatClock } from "@/lib/format";

type Result = { id: string } | { error: string };

// Wave bar heights (fixed, so server and client render the same).
const BARS = [30, 55, 40, 75, 50, 90, 35, 65, 80, 45, 100, 60, 30, 70, 85, 40, 95, 55, 35, 75, 50, 85, 40, 65, 30, 80, 55, 45, 70, 35];

export function SpeakingPractice({ prompt, submit }: { prompt: SpeakingPrompt; submit: (formData: FormData) => Promise<Result> }) {
  const router = useRouter();
  const recorder = useRef<MediaRecorder | null>(null);
  const stopRef = useRef<HTMLButtonElement>(null);
  const [seconds, setSeconds] = useState<number | null>(null); // null = not recording
  const [recording, setRecording] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isRecording = seconds !== null;

  // Count up while recording, and stop by itself at the limit.
  useEffect(() => {
    if (seconds === null) return;
    if (seconds >= MAX_RECORDING_SECONDS) {
      recorder.current?.stop();
      return;
    }
    const id = setTimeout(() => setSeconds(seconds + 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Release the microphone if the student leaves mid-recording.
  useEffect(() => () => recorder.current?.stream.getTracks().forEach((t) => t.stop()), []);

  // The start button leaves the DOM: move keyboard focus to the stop button.
  useEffect(() => {
    if (isRecording) stopRef.current?.focus();
  }, [isRecording]);

  async function start() {
    setError(null);
    if (recording) URL.revokeObjectURL(recording.url);
    setRecording(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Không dùng được micro. Hãy cho phép trang web truy cập micro rồi thử lại.");
      return;
    }
    // Low bitrate keeps two minutes of speech well under the upload limit.
    const rec = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setSeconds(null);
      // Firefox resets rec.mimeType to "" on stop, so take the type from the data; the server wants the bare container type.
      const type = (chunks[0]?.type || rec.mimeType).split(";")[0].trim();
      const file = new File(chunks, "answer", { type });
      setRecording({ file, url: URL.createObjectURL(file) });
    };
    recorder.current = rec;
    rec.start();
    setSeconds(0);
  }

  function send() {
    if (!recording) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("audio", recording.file);
      const result = await submit(formData);
      if ("id" in result) router.push(`/examiner/analysis/${result.id}`);
      else setError(result.error);
    });
  }

  const status = isRecording ? "Đang ghi âm" : pending ? "AI đang chấm điểm" : recording ? "Đã ghi xong, có thể nghe lại và nộp bài" : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="mr-auto text-3xl font-bold text-brand-ink">Speaking Practice</h1>
        <p className="flex items-center gap-2 rounded-full border-2 border-brand px-4 py-1.5 text-brand-ink" role="timer">
          <Clock className="size-5" aria-hidden />
          Thời gian: <span className="tabular-nums">{formatClock(seconds ?? 0)}</span> / {formatClock(MAX_RECORDING_SECONDS)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <p className="text-sm font-semibold text-muted">Part {prompt.part}</p>
            <h2 className="mt-1 text-xl font-semibold">{prompt.title}</h2>
            <p className="mt-2 whitespace-pre-line">{prompt.prompt}</p>
          </Card>

          <Card className="flex h-48 items-center justify-center gap-1.5" aria-hidden>
            {BARS.map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full bg-skill-writing ${isRecording ? "motion-safe:animate-wave" : "opacity-40"}`}
                style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.12}s` }}
              />
            ))}
          </Card>

          <div className="flex items-center gap-4">
            <Mic className={`size-10 shrink-0 ${isRecording ? "text-skill-writing" : "text-muted"}`} aria-hidden />
            {isRecording ? (
              <Button ref={stopRef} variant="outline" onClick={() => recorder.current?.stop()} className="flex-1 py-3 text-lg">
                <Square className="size-4" aria-hidden />
                Kết thúc ghi âm
              </Button>
            ) : (
              <Button variant={recording ? "outline" : "primary"} onClick={start} disabled={pending} className="flex-1 py-3 text-lg">
                {recording ? "Ghi lại từ đầu" : "Bắt đầu ghi âm"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {recording ? (
            <Card className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Bản ghi của bạn</h2>
              <audio controls src={recording.url} aria-label="Bản ghi âm của bạn" className="w-full" />
              <Button onClick={send} disabled={pending} className="self-start">
                <Send className="size-4" aria-hidden />
                Nộp bài để AI chấm
              </Button>
            </Card>
          ) : (
            <Card className="grid min-h-80 place-items-center text-center text-muted">
              <p>
                Chuẩn bị ý trước khi bấm “Bắt đầu ghi âm”. Bản ghi dài tối đa {MAX_RECORDING_SECONDS / 60} phút và tự dừng khi hết giờ.
              </p>
            </Card>
          )}
          {error && (
            <p role="alert" className="text-danger-ink">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Live region mounted from the start: screen readers often skip regions mounted with their content */}
      <p role="status" className="sr-only">
        {status}
      </p>
      {pending && (
        <p className="mx-auto flex items-center gap-3 rounded-xl border-2 border-skill-writing bg-skill-writing/30 px-6 py-3 text-lg">
          <Bot className="size-7" aria-hidden />
          AI đang chấm điểm và phân tích, có thể mất tới một phút…
        </p>
      )}
    </div>
  );
}
