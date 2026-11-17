"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Flag, LogOut } from "lucide-react";
import { formatClock, useExamDraft } from "@/lib/exam-draft";
import type { Question, ReadingTest } from "@/lib/mock/exam";

type PublicTest = Omit<ReadingTest, "answers">;

const HIGHLIGHT = "exam-highlight";

export function ReadingExam({ test }: { test: PublicTest }) {
  const router = useRouter();
  const { draft, update } = useExamDraft(test.id);
  const [passageIdx, setPassageIdx] = useState(0);
  const [highlightOn, setHighlightOn] = useState(false);
  const [gridOpen, setGridOpen] = useState(false); // chỉ dùng < lg; desktop luôn hiện
  // null tới khi effect chạy — Date.now() lúc render sẽ chặn prerender (cacheComponents).
  const [now, setNow] = useState<number | null>(null);
  const passageRef = useRef<HTMLDivElement>(null);

  const allQuestions = test.passages.flatMap((p) => p.groups.flatMap((g) => g.questions));
  const durationMs = test.minutes * 60_000;
  const remainingSec = draft.startedAt && now ? (draft.startedAt + durationMs - now) / 1000 : test.minutes * 60;

  // Lần đầu vào đề → ghi giờ bắt đầu (reload vẫn giữ giờ cũ).
  useEffect(() => {
    if (!draft.startedAt && !draft.submittedAt) update((d) => ({ ...d, startedAt: Date.now() }));
  }, [draft.startedAt, draft.submittedAt, update]);

  function submit() {
    update((d) => ({ ...d, submittedAt: Date.now() }));
    router.push(`/mock-test/${test.id}/result`);
  }

  // Đồng hồ + tự nộp khi hết giờ.
  useEffect(() => {
    if (!draft.startedAt || draft.submittedAt) return;
    const deadline = draft.startedAt + durationMs;
    const tick = () => {
      setNow(Date.now());
      if (Date.now() >= deadline) {
        update((d) => ({ ...d, submittedAt: Date.now() }));
        router.push(`/mock-test/${test.id}/result`);
      }
    };
    const t = setInterval(tick, 1000);
    const first = setTimeout(tick); // cập nhật ngay, không chờ 1s
    return () => {
      clearInterval(t);
      clearTimeout(first);
    };
  }, [draft.startedAt, draft.submittedAt, durationMs, update, router, test.id]);

  function confirmSubmit() {
    const left = allQuestions.length - Object.values(draft.answers).filter(Boolean).length;
    if (confirm(left ? `Còn ${left} câu chưa làm. Nộp bài?` : "Nộp bài?")) submit();
  }

  function setAnswer(n: number, value: string) {
    update((d) => ({ ...d, answers: { ...d.answers, [n]: value } }));
  }

  function toggleFlag(n: number) {
    update((d) => ({
      ...d,
      flagged: d.flagged.includes(n) ? d.flagged.filter((x) => x !== n) : [...d.flagged, n],
    }));
  }

  function goTo(n: number) {
    const idx = test.passages.findIndex((p) => p.groups.some((g) => g.questions.some((q) => q.n === n)));
    // flushSync: panel phải hiện (bỏ hidden) trước khi cuộn/focus.
    flushSync(() => setPassageIdx(idx));
    const el = document.getElementById(`q-${n}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>("input, select")?.focus({ preventScroll: true });
  }

  // Highlight bằng CSS Custom Highlight API — không sửa DOM do React quản lý.
  function onPassageMouseUp() {
    if (!highlightOn || !("highlights" in CSS)) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passageRef.current?.contains(sel.anchorNode)) return;
    const hl = CSS.highlights.get(HIGHLIGHT) ?? new Highlight();
    hl.add(sel.getRangeAt(0).cloneRange());
    CSS.highlights.set(HIGHLIGHT, hl);
    sel.removeAllRanges();
  }

  const lowTime = remainingSec < 5 * 60;

  return (
    <div className="grid gap-4 p-4 lg:h-[calc(100dvh-5rem)] lg:grid-cols-[1fr_1fr_17rem] lg:grid-rows-[auto_1fr] lg:p-6">
      {/* Thanh trên: highlight, passage tabs, tiêu đề, thoát */}
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm italic">
          <input
            type="checkbox"
            role="switch"
            checked={highlightOn}
            onChange={(e) => setHighlightOn(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-11 rounded-full bg-navy/20 transition-colors peer-checked:bg-skill-listening peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
          />
          Highlight nội dung
        </label>
        <div role="tablist" aria-label="Passage" className="flex gap-2">
          {test.passages.map((p, i) => (
            <button
              key={p.title}
              role="tab"
              aria-selected={i === passageIdx}
              onClick={() => setPassageIdx(i)}
              className="rounded-full bg-white px-4 py-1.5 text-sm font-medium shadow-card aria-selected:bg-navy aria-selected:text-white"
            >
              Passage {i + 1}
            </button>
          ))}
        </div>
        <h1 className="order-first w-full text-xl font-bold italic sm:order-none sm:w-auto sm:min-w-0 sm:flex-1 sm:truncate sm:text-2xl">{test.title}</h1>
        <Link
          href="/mock-test"
          className="flex items-center gap-1.5 rounded-full bg-skill-listening/20 px-4 py-1.5 font-medium hover:bg-skill-listening/30"
        >
          <LogOut className="size-4" aria-hidden />
          Thoát
        </Link>
      </div>

      {/* Bảng điều khiển: timer, nộp, lưới câu — sticky trên mobile */}
      <aside className="sticky top-0 z-10 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card lg:row-span-2 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
          <div>
            <p className="text-sm font-medium lg:text-lg">Thời gian còn lại</p>
            <p
              role="timer"
              aria-live={lowTime ? "polite" : "off"}
              className={`text-3xl font-bold tabular-nums lg:text-4xl ${lowTime ? "text-danger" : ""}`}
            >
              {formatClock(remainingSec)}
            </p>
          </div>
          <button
            type="button"
            onClick={confirmSubmit}
            className="rounded-xl bg-skill-listening px-6 py-2.5 text-lg font-bold text-white hover:bg-skill-listening/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-full"
          >
            Nộp bài
          </button>
        </div>
        <p className="text-sm text-success">✓ Bài làm được tự động lưu</p>
        <button
          type="button"
          onClick={() => setGridOpen((o) => !o)}
          aria-expanded={gridOpen}
          aria-controls="question-grid"
          className="text-left text-sm font-semibold lg:hidden"
        >
          {gridOpen ? "▾" : "▸"} Danh sách câu hỏi ({Object.values(draft.answers).filter(Boolean).length}/{allQuestions.length} đã làm)
        </button>
        <div id="question-grid" className={gridOpen ? "" : "hidden lg:block"}>
          <p className="mt-2 text-sm text-brand italic">
            Bấm <Flag className="inline size-3.5" aria-hidden /> cạnh số câu để đánh dấu xem lại.
          </p>
          {test.passages.map((p, i) => {
            const qs = p.groups.flatMap((g) => g.questions);
            return (
              <div key={p.title} className="mt-3">
                <h2 className="mb-2 font-bold">Passage {i + 1}</h2>
                <ul className="grid grid-cols-5 gap-1.5">
                  {qs.map((q) => {
                    const answered = Boolean(draft.answers[q.n]);
                    const flagged = draft.flagged.includes(q.n);
                    return (
                      <li key={q.n}>
                        <button
                          type="button"
                          onClick={() => goTo(q.n)}
                          aria-label={`Câu ${q.n}${answered ? ", đã trả lời" : ""}${flagged ? ", đánh dấu xem lại" : ""}`}
                          className={`relative grid aspect-square w-full place-items-center rounded-md border-2 text-sm font-semibold ${
                            answered ? "border-navy bg-navy text-white" : "border-navy/30 bg-white"
                          } ${flagged ? "ring-2 ring-brand ring-offset-1" : ""}`}
                        >
                          {q.n}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Bài đọc — giữ mọi passage trong DOM để highlight không mất khi đổi tab */}
      <div
        ref={passageRef}
        onMouseUp={onPassageMouseUp}
        className={`rounded-2xl bg-white p-5 shadow-card lg:overflow-y-auto ${highlightOn ? "selection:bg-highlight" : ""}`}
      >
        {test.passages.map((p, i) => (
          <article key={p.title} hidden={i !== passageIdx} aria-label={`Passage ${i + 1}`}>
            <p className="text-muted">
              You should spend about 20 minutes on the questions which are based on Reading Passage {i + 1} below.
            </p>
            <h2 className="my-5 text-center text-2xl font-bold">{p.title}</h2>
            {p.paragraphs.map((para) => (
              <section key={para.label} className="mb-4">
                <h3 className="text-xl font-bold">{para.label}.</h3>
                <p className="leading-relaxed text-justify">{para.text}</p>
              </section>
            ))}
          </article>
        ))}
      </div>

      {/* Câu hỏi */}
      <div className="rounded-2xl bg-white p-5 shadow-card lg:overflow-y-auto">
        {test.passages.map((p, i) => (
          <div key={p.title} hidden={i !== passageIdx} className="flex flex-col gap-8">
            {p.groups.map((g) => (
              <fieldset key={g.instructions} className="flex flex-col gap-4">
                <legend className="mb-3 leading-relaxed">{g.instructions}</legend>
                {g.headings && (
                  <div className="rounded-xl bg-surface p-4">
                    <p className="mb-2 font-semibold">List of headings</p>
                    <ul className="flex flex-col gap-1.5">
                      {g.headings.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {g.questions.map((q) => (
                  <QuestionRow
                    key={q.n}
                    q={q}
                    headings={g.headings}
                    value={draft.answers[q.n] ?? ""}
                    flagged={draft.flagged.includes(q.n)}
                    onChange={(v) => setAnswer(q.n, v)}
                    onFlag={() => toggleFlag(q.n)}
                  />
                ))}
              </fieldset>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const TFNG = ["TRUE", "FALSE", "NOT GIVEN"];

function QuestionRow({
  q,
  headings,
  value,
  flagged,
  onChange,
  onFlag,
}: {
  q: Question;
  headings?: string[];
  value: string;
  flagged: boolean;
  onChange: (v: string) => void;
  onFlag: () => void;
}) {
  const inputId = `q-${q.n}-input`;
  const field = (() => {
    switch (q.type) {
      case "heading":
        return (
          <label htmlFor={inputId} className="flex flex-wrap items-center gap-3">
            Paragraph {q.paragraph}
            <select
              id={inputId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-lg border-2 border-navy/20 bg-white px-3 py-1.5 focus:border-skill-listening focus:outline-none"
            >
              <option value="">—</option>
              {headings?.map((h) => {
                const num = h.split(" ")[0];
                return (
                  <option key={num} value={num}>
                    {num}
                  </option>
                );
              })}
            </select>
          </label>
        );
      case "tfng":
        return (
          <div role="radiogroup" aria-labelledby={`${inputId}-label`}>
            <p id={`${inputId}-label`} className="mb-2">
              {q.statement}
            </p>
            <div className="flex flex-wrap gap-2">
              {TFNG.map((opt) => (
                <label
                  key={opt}
                  className="cursor-pointer rounded-lg border-2 border-navy/20 px-3 py-1 text-sm font-medium has-checked:border-skill-listening has-checked:bg-skill-listening/10 has-focus-visible:outline-2 has-focus-visible:outline-brand"
                >
                  <input
                    type="radio"
                    name={`q-${q.n}`}
                    value={opt}
                    checked={value === opt}
                    onChange={() => onChange(opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        );
      case "gap": {
        const [before, after] = q.sentence.split("___");
        return (
          <p className="leading-loose">
            {before}
            <input
              id={inputId}
              aria-label={`Câu ${q.n}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mx-1 w-40 border-b-2 border-navy/30 bg-transparent px-1 focus:border-skill-listening focus:outline-none"
            />
            {after}
          </p>
        );
      }
    }
  })();

  return (
    <div id={`q-${q.n}`} className="flex scroll-mt-24 gap-3">
      <button
        type="button"
        onClick={onFlag}
        aria-pressed={flagged}
        aria-label={`Đánh dấu xem lại câu ${q.n}`}
        title="Đánh dấu xem lại"
        className={`flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-sm font-bold ${
          flagged ? "bg-brand text-white" : "bg-surface hover:bg-brand-soft"
        }`}
      >
        {q.n}
        <Flag className="size-3.5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">{field}</div>
    </div>
  );
}
