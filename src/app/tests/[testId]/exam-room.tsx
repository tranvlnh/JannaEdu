"use client";

import Link from "next/link";
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
    <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center p-6">
      <div className="card flex flex-col gap-4 p-8">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <p className="text-slate-600">
          {test.durationSeconds
            ? `Thời gian làm bài: ${Math.round(test.durationSeconds / 60)} phút. Đồng hồ chạy ngay khi bạn bắt đầu và không dừng lại khi bạn thoát ra.`
            : "Bài này không giới hạn thời gian."}{" "}
          Nếu bạn đang làm dở, bài sẽ được mở lại.
        </p>
        <form action={startAction}>
          <button disabled={pending} className="btn px-6 py-3 text-lg">
            {pending ? "Đang mở bài..." : "Bắt đầu / Làm tiếp"}
          </button>
        </form>
      </div>
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
    <span
      role="timer"
      aria-label="Thời gian còn lại"
      className={`text-4xl font-bold tabular-nums ${left !== null && left < 60 ? "text-red-600" : ""}`}
    >
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
  const unit = test.skill === "reading" ? "Passage" : "Part";

  return (
    // 5rem = the layout header. On phones the page scrolls instead of each panel.
    <div className="flex flex-col gap-3 p-3 md:h-[calc(100dvh-5rem)] md:p-4">
      <header className="flex flex-wrap items-center gap-3">
        {test.sections.length > 1 && (
          <nav aria-label="Phần" className="flex gap-2">
            {test.sections.map((_, i) => (
              <button
                key={i}
                onClick={() => setSection(i)}
                aria-current={i === section}
                className={`rounded-full px-4 py-1 text-sm font-medium shadow ${i === section ? "bg-navy text-white" : "bg-white"}`}
              >
                {unit} {i + 1}
              </button>
            ))}
          </nav>
        )}
        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold italic">{test.title}</h1>
        <Link href="/tests" className="rounded-full bg-blue-500 px-5 py-1.5 font-medium text-white hover:bg-blue-600">
          Thoát
        </Link>
      </header>

      {/* Outside the section panel, so switching sections never restarts playback. */}
      {test.audioUrl && <audio controls preload="auto" src={test.audioUrl} aria-label="Bài nghe" className="w-full" />}

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[1fr_1fr_15rem]">
        <article className="card md:overflow-y-auto">
          <h2 className="mb-3 text-center text-2xl font-bold">{current.title}</h2>
          <p className="whitespace-pre-line leading-8">{current.passage}</p>
        </article>

        <section aria-label="Câu hỏi" className="card flex flex-col gap-5 md:overflow-y-auto">
          {test.questions
            .filter((q) => q.section === section)
            .map((q) => {
              const saved = answers[q.id];
              return (
                <div key={q.id} id={`q-${q.number}`} className="flex flex-col gap-2">
                  {q.instruction && <p className="rounded-lg bg-panel p-3 font-medium">{q.instruction}</p>}
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
                            className="accent-brand"
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
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                    )}
                  </fieldset>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={saved?.flagged ?? false}
                      onChange={(e) => update(q.id, { flagged: e.target.checked })}
                      className="accent-amber-500"
                    />
                    Đánh dấu để xem lại
                  </label>
                </div>
              );
            })}
        </section>

        <aside className="card order-first flex flex-col gap-4 md:order-none md:overflow-y-auto">
          {attempt.deadline && (
            <p className="flex flex-col">
              <span className="text-xl font-semibold">Thời gian còn lại</span>
              <Timer deadline={attempt.deadline} serverNow={serverNow} onExpire={finish} />
            </p>
          )}
          <button
            onClick={confirmSubmit}
            disabled={submitting}
            className="rounded-2xl bg-blue-500 py-3 text-2xl font-bold text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
          <p className="text-sm italic text-brand">
            Bài làm được tự động lưu. Bấm vào số câu để đi tới câu đó; câu đã đánh dấu có viền vàng.
          </p>

          <nav aria-label="Danh sách câu hỏi" className="flex flex-col gap-3">
            {test.sections.map((_, i) => (
              <div key={i}>
                <h2 className="mb-2 font-semibold">
                  {unit} {i + 1}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {test.questions
                    .filter((q) => q.section === i)
                    .map((q) => {
                      const flagged = answers[q.id]?.flagged ?? false;
                      return (
                        <button
                          key={q.id}
                          onClick={() => goTo(q)}
                          aria-label={`Câu ${q.number}${isAnswered(q) ? ", đã trả lời" : ", chưa trả lời"}${flagged ? ", đã đánh dấu" : ""}`}
                          className={`size-9 rounded border border-slate-400 text-sm ${isAnswered(q) ? "bg-navy text-white" : "bg-white"} ${flagged ? "outline outline-2 outline-offset-1 outline-amber-500" : ""}`}
                        >
                          {q.number}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
