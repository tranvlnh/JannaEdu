"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MAX_RECORDING_SECONDS, type SpeakingPrompt } from "@/contracts/speaking";
import { Icon } from "@/app/icons";

type Result = { id: string } | { error: string };

// Decorative waveform bar heights (%).
const BARS = Array.from({ length: 48 }, (_, i) => 15 + ((i * 37) % 85));

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function Recorder({ prompt, submit }: { prompt: SpeakingPrompt; submit: (formData: FormData) => Promise<Result> }) {
  const router = useRouter();
  const recorder = useRef<MediaRecorder | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null); // null = not recording
  const [recording, setRecording] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      // Firefox resets rec.mimeType to "" on stop (per spec), so take the type from the recorded data.
      // Drop the ";codecs=..." suffix: the server accepts the bare container type.
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
      if ("id" in result) router.push(`/speaking/submissions/${result.id}`);
      else setError(result.error);
    });
  }

  const isRecording = seconds !== null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-brand">Speaking Practice</h1>
        {isRecording && (
          <span role="timer" className="flex items-center gap-2 rounded-full border border-brand bg-white px-4 py-1.5 text-lg text-brand">
            <Icon name="clock" /> Thời gian: {clock(seconds)} / {clock(MAX_RECORDING_SECONDS)}
          </span>
        )}
      </header>

      <section className="card">
        <h2 className="mb-2 text-xl font-bold">{prompt.title}</h2>
        <p className="whitespace-pre-line">{prompt.prompt}</p>
        <p className="mt-3 text-sm text-slate-600">
          Part {prompt.part}: hãy chuẩn bị ý trước khi bấm ghi âm. Bản ghi dài tối đa {MAX_RECORDING_SECONDS / 60} phút và
          tự dừng khi hết giờ.
        </p>
      </section>

      <div aria-hidden className={`card flex h-40 items-center justify-center gap-1 ${isRecording ? "" : "opacity-40"}`}>
        {BARS.map((height, i) => (
          <span
            key={i}
            className={`w-1 rounded-full bg-amber-400 ${isRecording ? "animate-pulse" : ""}`}
            style={{ height: `${height}%`, animationDelay: `${(i % 7) * 120}ms` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Icon name="mic" className={`size-12 ${isRecording ? "text-amber-500" : "text-slate-400"}`} />
        {isRecording ? (
          <button onClick={() => recorder.current?.stop()} className="btn-outline px-8 py-3 text-xl">
            Đang ghi âm · bấm để dừng
          </button>
        ) : (
          <button onClick={start} disabled={pending} className="btn px-8 py-3 text-xl">
            {recording ? "Ghi lại từ đầu" : "Bắt đầu ghi âm"}
          </button>
        )}
      </div>

      {recording && (
        <>
          <audio controls src={recording.url} aria-label="Bản ghi âm của bạn" className="w-full" />
          <button onClick={send} disabled={pending} className="btn self-start px-8 py-3 text-lg">
            Kết thúc &amp; nộp bài để AI chấm
          </button>
        </>
      )}

      {pending && (
        <p role="status" className="flex items-center gap-3 self-center rounded-xl bg-amber-200 px-6 py-3 text-lg">
          <Icon name="robot" className="size-8" /> AI đang chấm điểm và phân tích, có thể mất tới một phút...
        </p>
      )}

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
