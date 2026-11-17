"use client";

import Link from "next/link";
import { useActionState, useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { Flag, LogOut, Timer } from "lucide-react";
import type { Question, SaveAnswersInput, SaveAnswersOutput, SavedAnswer, StartAttemptOutput, TestSummary } from "@/contracts/exam";
import { Button } from "@/components/ui";
import { formatClock } from "@/lib/format";

const AUTOSAVE_MS = 5000;
const HIGHLIGHT = "exam-highlight";

type Actions = {
  save: (input: SaveAnswersInput) => Promise<SaveAnswersOutput>;
  submit: (attemptId: string) => Promise<void>;
};

/** Start screen. The attempt (and its timer) starts on the button, never on page load or prefetch. */
export function ExamRoom({ test, start, ...actions }: { test: TestSummary; start: () => Promise<StartAttemptOutput> } & Actions) {
  const [data, startAction, pending] = useActionState(start, null);
  if (data) return <Room data={data} {...actions} />;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-6 sm:p-10">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <p className="flex items-center gap-2 font-medium">
          <Timer className="size-5" aria-hidden />
          {test.durationSeconds ? `${Math.round(test.durationSeconds / 60)} phút` : "Không giới hạn thời gian"}
        </p>
        <p className="text-muted">
          {test.durationSeconds && "Đồng hồ chạy ngay khi bạn bắt đầu và không dừng khi bạn thoát ra. "}
          Nếu bạn đang làm dở, bài sẽ được mở lại.
        </p>
        <form action={startAction}>
          <Button type="submit" disabled={pending} className="px-8 py-3 text-lg">
            {pending ? "Đang mở bài…" : "Bắt đầu / Làm tiếp"}
          </Button>
        </form>
        <Link href="/mock-test" className="text-sm text-muted underline hover:text-navy">
          Quay lại Phòng thi ảo
        </Link>
      </div>
    </div>
  );
}

/** Counts against the server clock: the device clock may be wrong. */
function useRemaining(deadline: string | null, serverNow: string, onExpire: () => void) {
  const [left, setLeft] = useState<number | null>(null);
  const expire = useEffectEvent(onExpire);
  useEffect(() => {
    if (!deadline) return;
    const offset = Date.parse(serverNow) - Date.now();
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((Date.parse(deadline) - Date.now() - offset) / 1000));
      setLeft(seconds);
      if (seconds === 0) {
        clearInterval(id);
        expire();
      }
    };
    const id = setInterval(tick, 1000);
    const first = setTimeout(tick); // show the clock now, not after a second
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, [deadline, serverNow]);
  return left;
}

function Room({ data, save, submit }: { data: StartAttemptOutput } & Actions) {
  const { attempt, test, serverNow } = data;
  const [answers, setAnswers] = useState<Record<string, SavedAnswer>>(() => Object.fromEntries(data.answers.map((a) => [a.questionId, a])));
  const [section, setSection] = useState(0);
  const [highlightOn, setHighlightOn] = useState(false);
  const [highlightCount, setHighlightCount] = useState(0);
  const [gridOpen, setGridOpen] = useState(false); // < lg only; desktop always shows it
  const [submitting, startSubmit] = useTransition();
  const dirty = useRef(new Map<string, SavedAnswer>()); // changed since the last autosave
  const finished = useRef(false);
  const passageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // The highlight registry is global: clear it when leaving the room.
  useEffect(() => () => void globalThis.CSS?.highlights?.delete(HIGHLIGHT), []);

  function update(questionId: string, patch: Partial<SavedAnswer>) {
    const next = { ...(answers[questionId] ?? { questionId, answer: null, flagged: false }), ...patch };
    dirty.current.set(questionId, next);
    setAnswers((a) => ({ ...a, [questionId]: next }));
  }

  async function flush() {
    if (dirty.current.size === 0) return;
    const batch = [...dirty.current.values()];
    dirty.current.clear();
    try {
      const { locked } = await save({ attemptId: attempt.id, answers: batch });
      if (locked) finish();
    } catch {
      // Network error: retry on the next tick, unless the answer was edited again meanwhile.
      for (const a of batch) if (!dirty.current.has(a.questionId)) dirty.current.set(a.questionId, a);
    }
  }

  function finish() {
    if (finished.current) return;
    finished.current = true;
    startSubmit(async () => {
      await flush();
      await submit(attempt.id); // redirects to the result page
    });
  }

  const autosave = useEffectEvent(flush);
  useEffect(() => {
    const id = setInterval(autosave, AUTOSAVE_MS);
    return () => clearInterval(id);
  }, []);

  const left = useRemaining(attempt.deadline, serverNow, finish);
  const isAnswered = (q: Question) => Boolean(answers[q.id]?.answer);
  const answered = test.questions.filter(isAnswered).length;
  const unanswered = test.questions.length - answered;
  const unit = test.skill === "reading" ? "Passage" : "Part";
  const milestone = left === null ? "" : left <= 60 ? "Còn 1 phút" : left <= 300 ? "Còn 5 phút" : "";

  function goTo(q: Question) {
    // flushSync: the section must be visible before scrolling and focusing.
    flushSync(() => setSection(q.section));
    const el = document.getElementById(`q-${q.number}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
  }

  // CSS Custom Highlight API: marks text without touching the DOM React owns.
  function onPassageMouseUp() {
    if (!highlightOn || !("highlights" in CSS)) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passageRef.current?.contains(sel.anchorNode)) return;
    const hl = CSS.highlights.get(HIGHLIGHT) ?? new Highlight();
    hl.add(sel.getRangeAt(0).cloneRange());
    CSS.highlights.set(HIGHLIGHT, hl);
    setHighlightCount(hl.size);
    sel.removeAllRanges();
  }

  function clearHighlights() {
    CSS.highlights?.delete(HIGHLIGHT);
    setHighlightCount(0);
  }

  return (
    <div className="grid gap-4 p-4 lg:h-[calc(100dvh-5rem)] lg:grid-cols-[1fr_1fr_17rem] lg:grid-rows-[auto_auto_1fr] lg:p-6">
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm italic">
          <input type="checkbox" role="switch" checked={highlightOn} onChange={(e) => setHighlightOn(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden
            className="relative h-6 w-11 rounded-full bg-navy/20 transition-colors peer-checked:bg-skill-listening peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
          />
          Highlight nội dung
        </label>
        {highlightCount > 0 && (
          <button type="button" onClick={clearHighlights} className="text-sm text-muted underline hover:text-navy">
            Xóa highlight ({highlightCount})
          </button>
        )}
        {test.sections.length > 1 && (
          <div role="group" aria-label={`Chọn ${unit}`} className="flex gap-2">
            {test.sections.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={i === section}
                onClick={() => setSection(i)}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium shadow-card aria-pressed:bg-navy aria-pressed:text-white"
              >
                {unit} {i + 1}
              </button>
            ))}
          </div>
        )}
        <h1 className="order-first w-full text-xl font-bold italic sm:order-none sm:w-auto sm:min-w-0 sm:flex-1 sm:truncate sm:text-2xl">{test.title}</h1>
        <Link href="/mock-test" className="flex items-center gap-1.5 rounded-full bg-skill-listening/20 px-4 py-1.5 font-medium hover:bg-skill-listening/30">
          <LogOut className="size-4" aria-hidden />
          Thoát
        </Link>
      </div>

      {/* Outside the section panels, so switching sections never restarts playback. */}
      {test.audioUrl ? (
        <audio controls preload="auto" src={test.audioUrl} aria-label="Bài nghe" className="w-full lg:col-span-2" />
      ) : (
        <div className="hidden lg:col-span-2 lg:block" />
      )}

      <aside className="sticky top-20 z-10 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card lg:row-span-3 lg:row-start-1 lg:col-start-3 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
          {attempt.deadline && (
            <div>
              <p className="text-sm font-medium lg:text-lg">Thời gian còn lại</p>
              <p role="timer" className={`text-3xl font-bold tabular-nums lg:text-4xl ${left !== null && left < 300 ? "text-danger-ink" : ""}`}>
                {left === null ? "--:--" : formatClock(left)}
              </p>
              <p role="status" className="sr-only">
                {milestone}
              </p>
            </div>
          )}
          <button
            type="button"
            disabled={submitting}
            onClick={() => dialogRef.current?.showModal()}
            className="rounded-xl bg-skill-listening px-6 py-2.5 text-lg font-bold text-white hover:bg-skill-listening/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 lg:w-full"
          >
            {submitting ? "Đang nộp…" : "Nộp bài"}
          </button>
        </div>
        <p className="text-sm text-success-ink">✓ Bài làm được tự động lưu</p>
        <button
          type="button"
          onClick={() => setGridOpen((o) => !o)}
          aria-expanded={gridOpen}
          aria-controls="question-grid"
          className="text-left text-sm font-semibold lg:hidden"
        >
          {gridOpen ? "▾" : "▸"} Danh sách câu hỏi ({answered}/{test.questions.length} đã làm)
        </button>
        <div id="question-grid" className={gridOpen ? "" : "hidden lg:block"}>
          <p className="mt-2 text-sm text-brand-ink italic">
            Bấm <Flag className="inline size-3.5" aria-hidden /> cạnh số câu để đánh dấu xem lại.
          </p>
          {test.sections.map((s, i) => (
            <div key={i} className="mt-3">
              <h2 className="mb-2 font-bold">
                {unit} {i + 1}
              </h2>
              <ul className="grid grid-cols-5 gap-1.5">
                {test.questions
                  .filter((q) => q.section === i)
                  .map((q) => {
                    const done = isAnswered(q);
                    const flagged = answers[q.id]?.flagged ?? false;
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => goTo(q)}
                          aria-label={`Câu ${q.number}${done ? ", đã trả lời" : ""}${flagged ? ", đánh dấu xem lại" : ""}`}
                          className={`grid aspect-square w-full place-items-center rounded-md border-2 text-sm font-semibold ${
                            done ? "border-navy bg-navy text-white" : "border-navy/30 bg-white"
                          } ${flagged ? "ring-2 ring-brand ring-offset-1" : ""}`}
                        >
                          {q.number}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Every section stays in the DOM so highlights survive switching. */}
      <div
        ref={passageRef}
        onMouseUp={onPassageMouseUp}
        className={`rounded-2xl bg-white p-5 shadow-card lg:overflow-y-auto ${highlightOn ? "selection:bg-highlight" : ""}`}
      >
        {test.sections.map((s, i) => (
          <article key={i} hidden={i !== section} aria-label={`${unit} ${i + 1}`}>
            <h2 className="mb-5 text-center text-2xl font-bold">{s.title}</h2>
            <p className="leading-relaxed whitespace-pre-line">{s.passage}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card lg:overflow-y-auto">
        {test.sections.map((s, i) => (
          <div key={i} hidden={i !== section} className="flex flex-col gap-6">
            {test.questions
              .filter((q) => q.section === i)
              .map((q) => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  saved={answers[q.id]}
                  onAnswer={(answer) => update(q.id, { answer })}
                  onFlag={() => update(q.id, { flagged: !(answers[q.id]?.flagged ?? false) })}
                />
              ))}
          </div>
        ))}
      </div>

      {/* Native <dialog>: focus trap, Esc to close, backdrop for free */}
      <dialog ref={dialogRef} aria-labelledby="submit-title" className="m-auto max-w-sm rounded-2xl p-6 text-navy shadow-card backdrop:bg-navy/40">
        <h2 id="submit-title" className="text-xl font-bold">
          Nộp bài?
        </h2>
        <p className="mt-2">
          {unanswered ? `Bạn còn ${unanswered} câu chưa làm. Sau khi nộp sẽ không sửa được.` : "Bạn đã trả lời tất cả câu hỏi."}
        </p>
        <form method="dialog" className="mt-6 flex justify-end gap-3">
          <Button type="submit" variant="outline" autoFocus>
            Làm tiếp
          </Button>
          <Button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              finish();
            }}
          >
            Nộp bài
          </Button>
        </form>
      </dialog>
    </div>
  );
}

function QuestionRow({
  q,
  saved,
  onAnswer,
  onFlag,
}: {
  q: Question;
  saved: SavedAnswer | undefined;
  onAnswer: (answer: string | null) => void;
  onFlag: () => void;
}) {
  const flagged = saved?.flagged ?? false;
  return (
    <div id={`q-${q.number}`} className="flex scroll-mt-24 flex-col gap-3">
      {q.instruction && <p className="rounded-xl bg-surface p-4 leading-relaxed whitespace-pre-line">{q.instruction}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onFlag}
          aria-pressed={flagged}
          aria-label={`Đánh dấu xem lại câu ${q.number}`}
          title="Đánh dấu xem lại"
          className={`flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-sm font-bold ${flagged ? "bg-brand text-white" : "bg-surface hover:bg-brand-soft"}`}
        >
          {q.number}
          <Flag className="size-3.5" aria-hidden />
        </button>
        <fieldset className="min-w-0 flex-1">
          <legend className="mb-2 leading-relaxed">{q.prompt}</legend>
          {q.options ? (
            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => (
                <label
                  key={option}
                  className="cursor-pointer rounded-lg border-2 border-navy/20 px-3 py-1 text-sm font-medium has-checked:border-skill-listening has-checked:bg-skill-listening/10 has-focus-visible:outline-2 has-focus-visible:outline-brand"
                >
                  <input type="radio" name={q.id} value={option} checked={saved?.answer === option} onChange={() => onAnswer(option)} className="sr-only" />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <input
              aria-label={`Câu trả lời câu ${q.number}`}
              value={saved?.answer ?? ""}
              onChange={(e) => onAnswer(e.target.value || null)}
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
              className="w-full max-w-xs border-b-2 border-navy/30 bg-transparent px-1 py-1 focus:border-skill-listening focus:outline-none"
            />
          )}
        </fieldset>
      </div>
    </div>
  );
}
