import { useCallback, useMemo, useSyncExternalStore } from "react";

// Bài làm lưu localStorage — nguồn sự thật duy nhất, đọc qua useSyncExternalStore
// (server snapshot = null → không lệch hydration). Thay bằng API khi có BE.

export type Draft = {
  answers: Record<number, string>;
  flagged: number[];
  startedAt: number | null;
  submittedAt: number | null;
};

const EMPTY: Draft = { answers: {}, flagged: [], startedAt: null, submittedAt: null };

export function parseDraft(raw: string | null): Draft {
  if (!raw) return EMPTY;
  try {
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

/** Giây → "mm:ss" (hoặc "h:mm:ss"). Âm → 00:00. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const mmss = `${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return h ? `${h}:${mmss}` : mmss;
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // đồng bộ giữa các tab
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private mode / storage bị chặn
  }
}

export function useExamDraft(testId: string) {
  const key = `janna:exam:${testId}`;
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const draft = useMemo(() => parseDraft(raw), [raw]);

  const update = useCallback(
    (fn: (d: Draft) => Draft) => {
      try {
        localStorage.setItem(key, JSON.stringify(fn(parseDraft(read(key)))));
      } catch {
        // ponytail: storage đầy/bị chặn → bài làm chỉ mất khi reload, chấp nhận cho bản mock
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    listeners.forEach((l) => l());
  }, [key]);

  return { draft, update, reset };
}

export type GradedAnswer = { n: number; given: string; correct: string; ok: boolean };

/** Chấm: bỏ khoảng trắng thừa, không phân biệt hoa thường. */
export function grade(answers: Record<number, string>, key: Record<number, string>): GradedAnswer[] {
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  return Object.entries(key).map(([n, correct]) => {
    const given = answers[Number(n)] ?? "";
    return { n: Number(n), given, correct, ok: given !== "" && norm(given) === norm(correct) };
  });
}
