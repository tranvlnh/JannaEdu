"use client";

import { useActionState, useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import type {
  Question,
  SaveAnswersInput,
  SaveAnswersOutput,
  SavedAnswer,
  StartAttemptOutput,
  TestSummary,
} from "@/contracts/exam";

const AUTOSAVE_MS = 5000;

type Actions = {
  save: (input: SaveAnswersInput) => Promise<SaveAnswersOutput>;
  submit: (attemptId: string) => Promise<void>;
};

export function ExamRoom({
  test,
  start,
  ...actions
}: { test: TestSummary; start: () => Promise<StartAttemptOutput> } & Actions) {
  const [data, startAction, pending] = useActionState(start, null);
  if (data) return <Room data={data} {...actions} />;

  return (
    <main className="mx-auto flex flex-1 max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">{test.title}</h1>
      <p className="text-sm text-zinc-600">
        {test.durationSeconds
          ? `Thời gian làm bài: ${Math.round(test.durationSeconds / 60)} phút. Đồng hồ chạy ngay khi bạn bắt đầu và không dừng lại khi bạn thoát ra.`
          : "Bài này không giới hạn thời gian."}{" "}
        Nếu bạn đang làm dở, bài sẽ được mở lại.
      </p>
      <form action={startAction}>
        <button disabled={pending} className="rounded border px-4 py-2">
          {pending ? "Đang mở bài..." : "Bắt đầu / Làm tiếp"}
        </button>
      </form>
    </main>
  );
}

function Timer({ deadline, serverNow, onExpire }: { deadline: string; serverNow: string; onExpire: () => void }) {
  const [left, setLeft] = useState<number | null>(null);
  const expire = useEffectEvent(onExpire);

  useEffect(() => {
    // Count against the server's clock: the device clock may be wrong.
    const offset = Date.parse(serverNow) - Date.now();
    const id = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((Date.parse(deadline) - Date.now() - offset) / 1000));
      setLeft(seconds);
      if (seconds === 0) {
        clearInterval(id);
        expire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, serverNow]);

  const text =
    left === null ? "--:--" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  return (
    <span role="timer" aria-label="Thời gian còn lại" className={`font-mono text-lg ${left !== null && left < 60 ? "text-red-600" : ""}`}>
      {text}
    </span>
  );
}

function Room({ data, save, submit }: { data: StartAttemptOutput } & Actions) {
  const { attempt, test, serverNow } = data;
  const [answers, setAnswers] = useState<Record<string, SavedAnswer>>(() =>
    Object.fromEntries(data.answers.map((a) => [a.questionId, a])),
  );
  const [section, setSection] = useState(0);
  const [submitting, startSubmit] = useTransition();
  const dirty = useRef(new Map<string, SavedAnswer>()); // changed since the last autosave
  const finished = useRef(false);

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

  const isAnswered = (q: Question) => Boolean(answers[q.id]?.answer);
  const unanswered = test.questions.filter((q) => !isAnswered(q)).length;

  function confirmSubmit() {
    const warning = unanswered > 0 ? `Còn ${unanswered} câu chưa trả lời. ` : "";
    if (confirm(`${warning}Nộp bài? Sau khi nộp sẽ không sửa được.`)) finish();
  }

  function goTo(q: Question) {
    setSection(q.section);
    // Wait for the section to render before scrolling to the question.
    requestAnimationFrame(() => document.getElementById(`q-${q.number}`)?.scrollIntoView({ block: "center" }));
  }

  const current = test.sections[section];

  return (
    // shortcut: 4.5rem = one-row SiteNav height; on narrow screens the nav wraps and the page scrolls a bit
    <div className="flex h-[calc(100dvh-4.5rem)] flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <h1 className="truncate font-semibold">{test.title}</h1>
        <div className="flex items-center gap-4">
          {attempt.deadline && <Timer deadline={attempt.deadline} serverNow={serverNow} onExpire={finish} />}
          <button onClick={confirmSubmit} disabled={submitting} className="rounded border px-4 py-2">
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </header>

      {/* Outside the section panel, so switching sections never restarts playback. */}
      {test.audioUrl && (
        <audio controls preload="auto" src={test.audioUrl} aria-label="Bài nghe" className="w-full border-b px-4 py-2" />
      )}

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <article className="overflow-y-auto border-b p-4 md:border-r md:border-b-0">
          {test.sections.length > 1 && (
            <nav aria-label="Phần" className="mb-4 flex gap-2">
              {test.sections.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSection(i)}
                  aria-current={i === section}
                  className={`rounded border px-3 py-1 text-sm ${i === section ? "bg-zinc-900 text-white" : ""}`}
                >
                  Phần {i + 1}
                </button>
              ))}
            </nav>
          )}
          <h2 className="mb-2 text-lg font-semibold">{current.title}</h2>
          <p className="whitespace-pre-line leading-7">{current.passage}</p>
        </article>

        <section aria-label="Câu hỏi" className="flex flex-col gap-5 overflow-y-auto p-4">
          {test.questions
            .filter((q) => q.section === section)
            .map((q) => {
              const saved = answers[q.id];
              return (
                <div key={q.id} id={`q-${q.number}`} className="flex flex-col gap-2">
                  {q.instruction && <p className="rounded bg-zinc-100 p-2 text-sm font-medium text-zinc-900">{q.instruction}</p>}
                  <fieldset className="flex flex-col gap-1">
                    <legend className="mb-1">
                      <strong>{q.number}.</strong> {q.prompt}
                    </legend>
                    {q.options ? (
                      q.options.map((option) => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={q.id}
                            checked={saved?.answer === option}
                            onChange={() => update(q.id, { answer: option })}
                          />
                          {option}
                        </label>
                      ))
                    ) : (
                      <input
                        aria-label={`Câu trả lời cho câu ${q.number}`}
                        value={saved?.answer ?? ""}
                        onChange={(e) => update(q.id, { answer: e.target.value || null })}
                        maxLength={200}
                        autoComplete="off"
                        spellCheck={false}
                        className="rounded border px-3 py-2"
                      />
                    )}
                  </fieldset>
                  <label className="flex items-center gap-2 text-sm text-zinc-600">
                    <input
                      type="checkbox"
                      checked={saved?.flagged ?? false}
                      onChange={(e) => update(q.id, { flagged: e.target.checked })}
                    />
                    Đánh dấu để xem lại
                  </label>
                </div>
              );
            })}
        </section>
      </div>

      <nav aria-label="Danh sách câu hỏi" className="flex flex-wrap gap-1 border-t px-4 py-2">
        {test.questions.map((q) => {
          const flagged = answers[q.id]?.flagged ?? false;
          return (
            <button
              key={q.id}
              onClick={() => goTo(q)}
              aria-label={`Câu ${q.number}${isAnswered(q) ? ", đã trả lời" : ", chưa trả lời"}${flagged ? ", đã đánh dấu" : ""}`}
              className={`h-8 min-w-8 rounded border px-1 text-sm ${isAnswered(q) ? "bg-zinc-900 text-white" : ""} ${flagged ? "outline outline-2 outline-offset-1 outline-amber-500" : ""}`}
            >
              {q.number}
              {flagged && "⚑"}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
