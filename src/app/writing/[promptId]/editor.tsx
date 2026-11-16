"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { WritingPrompt } from "@/contracts/writing";

const MIN_WORDS = { 1: 150, 2: 250 };
const SUGGESTED_MINUTES = { 1: 20, 2: 40 };

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const noSubscribe = () => () => {};

type Result = { id: string } | { error: string };

export function Editor({ prompt, submit }: { prompt: WritingPrompt; submit: (essay: string) => Promise<Result> }) {
  const router = useRouter();
  const draftKey = `writing-draft:${prompt.id}`;
  // The draft lives in this browser only. Read it after hydration: the server has no localStorage.
  const draft = useSyncExternalStore(noSubscribe, () => localStorage.getItem(draftKey) ?? "", () => "");
  const [edited, setEdited] = useState<string | null>(null);
  const essay = edited ?? draft;

  const [result, formAction, pending] = useActionState(async (): Promise<Result | null> => {
    const r = await submit(essay);
    if ("id" in r) {
      localStorage.removeItem(draftKey);
      router.push(`/writing/submissions/${r.id}`);
    }
    return r;
  }, null);

  const words = countWords(essay);
  const min = MIN_WORDS[prompt.task];

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">{prompt.title}</h1>
      <p className="whitespace-pre-line rounded bg-zinc-100 p-3 text-zinc-900">{prompt.prompt}</p>
      <p className="text-sm text-zinc-600">
        Task {prompt.task}: viết ít nhất {min} từ, nên làm trong khoảng {SUGGESTED_MINUTES[prompt.task]} phút. Bài đang
        viết được lưu tạm trên máy này.
      </p>

      <label htmlFor="essay" className="font-medium">
        Bài viết
      </label>
      <textarea
        id="essay"
        value={essay}
        onChange={(e) => {
          setEdited(e.target.value);
          localStorage.setItem(draftKey, e.target.value);
        }}
        required
        maxLength={10000}
        rows={18}
        spellCheck={false}
        disabled={pending}
        className="rounded border p-3 leading-7"
      />

      <div className="flex items-center justify-between gap-4">
        <span className={`text-sm ${words < min ? "text-zinc-600" : "text-green-700"}`}>
          {words} từ {words < min && `(còn thiếu ${min - words})`}
        </span>
        <button disabled={pending || words === 0} className="rounded border px-4 py-2">
          {pending ? "Đang chấm bài, có thể mất tới một phút..." : "Nộp bài để AI chấm"}
        </button>
      </div>

      {result && "error" in result && (
        <p role="alert" className="text-red-600">
          {result.error}
        </p>
      )}
    </form>
  );
}
