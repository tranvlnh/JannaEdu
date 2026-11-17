"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Bot, Clock, Send } from "lucide-react";
import type { WritingPrompt } from "@/contracts/writing";
import { Button, Card } from "@/components/ui";
import { formatClock } from "@/lib/format";

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
  const [seconds, setSeconds] = useState(0);

  const [result, formAction, pending] = useActionState(async (): Promise<Result | null> => {
    const r = await submit(essay);
    if ("id" in r) {
      writeDraft(draftKey, null);
      router.push(`/examiner/writing/analysis/${r.id}`);
    }
    return r;
  }, null);

  // Elapsed time on this page; stops once the essay is sent.
  useEffect(() => {
    if (pending) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [pending]);

  const words = countWords(essay);
  const min = MIN_WORDS[prompt.task];
  const suggested = SUGGESTED_MINUTES[prompt.task];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="mr-auto text-3xl font-bold text-brand-ink">Writing Practice</h1>
        <p className="flex items-center gap-2 rounded-full border-2 border-brand px-4 py-1.5 text-brand-ink">
          <Clock className="size-5" aria-hidden />
          Thời gian: <span className="tabular-nums">{formatClock(seconds)}</span> / {formatClock(suggested * 60)}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <Card className="lg:sticky lg:top-6">
          <p className="text-sm font-semibold text-muted">Writing Task {prompt.task}</p>
          <h2 className="mt-1 text-xl font-semibold">{prompt.title}</h2>
          <p className="mt-2 whitespace-pre-line">{prompt.prompt}</p>
          <p className="mt-3 text-sm text-muted">
            Viết ít nhất {min} từ, nên làm trong khoảng {suggested} phút. Bài đang viết được lưu tạm trên máy này.
          </p>
        </Card>

        <Card className="flex flex-col gap-4">
          <label htmlFor="essay" className="text-xl font-bold">
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
            className="rounded-xl border-2 border-navy/15 p-4 leading-7 outline-skill-listening"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className={`text-sm ${words < min ? "text-muted" : "text-success-ink"}`}>
              {words} từ {words < min && `(còn thiếu ${min - words})`}
            </span>
            <Button type="submit" disabled={pending || words === 0} className="py-3 text-lg">
              <Send className="size-4" aria-hidden />
              Nộp bài để AI chấm
            </Button>
          </div>
          {result && "error" in result && (
            <p role="alert" className="text-danger-ink">
              {result.error}
            </p>
          )}
        </Card>
      </div>

      {/* Live region mounted from the start: screen readers often skip regions mounted with their content */}
      <p role="status" className="sr-only">
        {pending ? "AI đang chấm điểm" : ""}
      </p>
      {pending && (
        <p className="mx-auto flex items-center gap-3 rounded-xl border-2 border-skill-writing bg-skill-writing/30 px-6 py-3 text-lg">
          <Bot className="size-7" aria-hidden />
          AI đang chấm điểm và phân tích, có thể mất tới một phút…
        </p>
      )}
    </form>
  );
}
