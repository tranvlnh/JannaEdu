"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MAX_RECORDING_SECONDS, type SpeakingPrompt } from "@/contracts/speaking";

type Result = { id: string } | { error: string };

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
      // Drop the ";codecs=..." suffix: the server accepts the bare container type.
      const file = new File(chunks, "answer", { type: rec.mimeType.split(";")[0] });
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
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">{prompt.title}</h1>
      <p className="whitespace-pre-line rounded bg-zinc-100 p-3 text-zinc-900">{prompt.prompt}</p>
      <p className="text-sm text-zinc-600">
        Part {prompt.part}: hãy chuẩn bị ý trước khi bấm ghi âm. Bản ghi dài tối đa {MAX_RECORDING_SECONDS / 60} phút và
        tự dừng khi hết giờ.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {isRecording ? (
          <button onClick={() => recorder.current?.stop()} className="rounded border px-4 py-2">
            Dừng ghi âm
          </button>
        ) : (
          <button onClick={start} disabled={pending} className="rounded border px-4 py-2">
            {recording ? "Ghi lại từ đầu" : "Bắt đầu ghi âm"}
          </button>
        )}
        {isRecording && (
          <span role="timer" className="font-mono text-red-600">
            ● {clock(seconds)} / {clock(MAX_RECORDING_SECONDS)}
          </span>
        )}
      </div>

      {recording && (
        <>
          <audio controls src={recording.url} aria-label="Bản ghi âm của bạn" className="w-full" />
          <button onClick={send} disabled={pending} className="self-start rounded border px-4 py-2">
            {pending ? "Đang chấm bài, có thể mất tới một phút..." : "Nộp bài để AI chấm"}
          </button>
        </>
      )}

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
