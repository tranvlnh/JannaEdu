"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { WritingPrompt } from "@/contracts/writing";

const MIN_WORDS = { 1: 150, 2: 250 };
const SUGGESTED_MINUTES = { 1: 20, 2: 40 };

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const noSubscribe = () => () => {};

// localStorage throws when storage is blocked or full; the draft then lives only in memory.
function readDraft(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
function writeDraft(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

type Result = { id: string } | { error: string };

export function Editor({ prompt, submit }: { prompt: WritingPrompt; submit: (essay: string) => Promise<Result> }) {
  const router = useRouter();
  const draftKey = `writing-draft:${prompt.id}`;
  // The draft lives in this browser only. Read it after hydration: the server has no localStorage.
  const draft = useSyncExternalStore(noSubscribe, () => readDraft(draftKey), () => "");
  const [edited, setEdited] = useState<string | null>(null);
  const essay = edited ?? draft;

  const [result, formAction, pending] = useActionState(async (): Promise<Result | null> => {
    const r = await submit(essay);
    if ("id" in r) {
      writeDraft(draftKey, null);
      router.push(`/writing/submissions/${r.id}`);
    }
    return r;
  }, null);

  const words = countWords(essay);
  const min = MIN_WORDS[prompt.task];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-brand-ink">Writing Practice</h1>
      <section className="card">
      <h2 className="mb-2 text-xl font-bold">{prompt.title}</h2>
      <p className="whitespace-pre-line">{prompt.prompt}</p>
      <p className="mt-3 text-sm text-muted">
        Task {prompt.task}: viết ít nhất {min} từ, nên làm trong khoảng {SUGGESTED_MINUTES[prompt.task]} phút. Bài đang
        viết được lưu tạm trên máy này.
      </p>
      </section>

      <label htmlFor="essay" className="text-lg font-semibold">
        Bài viết
      </label>
      <textarea
        id="essay"
        value={essay}
        onChange={(e) => {
          setEdited(e.target.value);
          writeDraft(draftKey, e.target.value);
        }}
        required
        maxLength={10000}
        rows={18}
        spellCheck={false}
        disabled={pending}
        className="card leading-7 outline-skill-listening"
      />

      <div className="flex items-center justify-between gap-4">
        <span className={`text-sm ${words < min ? "text-muted" : "text-success-ink"}`}>
          {words} từ {words < min && `(còn thiếu ${min - words})`}
        </span>
        <button disabled={pending || words === 0} className="btn px-6 py-3 text-lg">
          {pending ? "Đang chấm bài, có thể mất tới một phút..." : "Nộp bài để AI chấm"}
        </button>
      </div>

      {result && "error" in result && (
        <p role="alert" className="text-danger-ink">
          {result.error}
        </p>
      )}
    </form>
  );
}
