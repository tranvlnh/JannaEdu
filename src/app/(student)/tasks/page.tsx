import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, Clock, ListTodo, Sparkles, Square, SquareCheck, Star } from "lucide-react";
import { DonutChart } from "@/components/charts";
import { PrintButton } from "@/components/print-button";
import { Button, Card, Pill } from "@/components/ui";
import { dailyTasks, vnDay, weekDays } from "@/lib/daily-tasks";
import { formatDate, formatTime } from "@/lib/format";
import { SKILLS, skillStyle } from "@/lib/skills";
import { listActivity, requestTime } from "@/server/activity";
import { getMyLearningPath } from "@/server/learning-path";

export const metadata: Metadata = { title: "Nhiệm vụ hằng ngày" };

const WEEKDAY = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
const iso = (ms: number) => new Date(ms).toISOString();

function hours(min: number) {
  const h = Math.floor(min / 60);
  return h ? `${h} giờ${min % 60 ? ` ${min % 60} phút` : ""}` : `${min} phút`;
}

async function Tasks({ searchParams }: Pick<PageProps<"/tasks">, "searchParams">) {
  const [{ d }, { path }, activity] = await Promise.all([searchParams, getMyLearningPath(), listActivity()]);
  const now = requestTime();
  const week = weekDays(now);
  const todayIdx = week.findIndex((ms) => vnDay(ms) === vnDay(now));
  const n = Number(d);
  const sel = Number.isInteger(n) && n >= 0 && n < 7 ? n : todayIdx;
  const isToday = sel === todayIdx;
  const dayLabel = `${WEEKDAY[sel]}, ${formatDate(iso(week[sel]))}`;

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-4xl font-bold">Nhiệm vụ hằng ngày</h1>
      <p className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium shadow-card">
        <CalendarDays className="size-5" aria-hidden />
        Hôm nay: {WEEKDAY[todayIdx]}, {formatDate(iso(now))}
      </p>
    </div>
  );

  if (!path) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card className="flex flex-col items-start gap-3">
          <p className="text-muted">Tạo lộ trình học để nhận nhiệm vụ mỗi ngày theo đúng điểm yếu của bạn.</p>
          <Button href="/path">Tạo lộ trình học</Button>
        </Card>
      </div>
    );
  }

  const tasks = dailyTasks(path, activity, isToday ? now : week[sel]);
  const done = tasks.filter((t) => t.done);
  const pct = Math.round((done.length / tasks.length) * 100);
  const total = tasks.reduce((sum, t) => sum + t.minutes, 0);
  const priority = tasks.find((t) => !t.done);
  const when = isToday ? "hôm nay" : "trong ngày";
  const ranked = SKILLS.filter((s) => path.bands[s] != null).sort((a, b) => path.bands[b]! - path.bands[a]!);
  const weakest = [...SKILLS].sort((a, b) => (path.bands[a] ?? -1) - (path.bands[b] ?? -1))[0];

  return (
    <div className="flex flex-col gap-6">
      {header}

      <nav aria-label="Chọn ngày trong tuần" className="overflow-x-auto print:hidden">
        <ul className="grid min-w-2xl grid-cols-7 gap-1 rounded-2xl bg-white p-1 shadow-card">
          {week.map((ms, i) => (
            <li key={ms}>
              <Link
                href={i === todayIdx ? "/tasks" : `/tasks?d=${i}`}
                aria-current={i === sel ? "date" : undefined}
                className={`flex flex-col items-center rounded-xl px-2 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                  i === sel ? "bg-navy text-white" : "hover:bg-surface"
                }`}
              >
                <span className="font-semibold">{WEEKDAY[i]}</span>
                <span className="text-sm">
                  {formatDate(iso(ms)).slice(0, 5)}
                  {i === todayIdx && " (Hôm nay)"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <ListTodo className="size-5" aria-hidden />
            Tiến độ To-Do {when}
          </h2>
          <div className="flex items-center gap-4">
            <DonutChart
              size={56}
              label={`Đã hoàn thành ${pct}%`}
              segments={[
                { value: done.length, color: "var(--color-success)" },
                { value: tasks.length - done.length, color: "var(--color-surface)" },
              ]}
            />
            <div>
              <p className="text-lg font-bold">
                {done.length}/{tasks.length} Đã hoàn thành ({pct}%)
              </p>
              <p className="text-sm text-muted">Còn {tasks.length - done.length} nhiệm vụ cần làm</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <Clock className="size-5" aria-hidden />
            Thời gian học dự kiến
          </h2>
          <p className="text-lg font-bold">Khoảng {hours(total)}</p>
          <p className="text-sm text-muted">Đã hoàn thành {hours(done.reduce((sum, t) => sum + t.minutes, 0))}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <Star className="size-5 text-yellow-500" aria-hidden />
            Ưu tiên {when}
          </h2>
          <p className="text-lg font-bold">{priority ? priority.label : "Đã xong hết nhiệm vụ, tuyệt vời!"}</p>
        </Card>
      </div>

      <Card aria-labelledby="todo-list">
        <h2 id="todo-list" className="mb-4 flex items-center gap-2 text-lg font-bold uppercase">
          <ListTodo className="size-5" aria-hidden />
          Danh sách To-Do hằng ngày – {dayLabel}
        </h2>
        <ul className="divide-y divide-navy/10">
          {tasks.map((t) => {
            const past = !isToday && sel < todayIdx;
            const future = !isToday && sel > todayIdx;
            const style = skillStyle[t.skill];
            return (
              <li
                key={t.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 py-3 md:grid-cols-[auto_1fr_11rem_6rem_9rem_7rem]"
              >
                {t.done ? (
                  <SquareCheck className="size-5 text-skill-listening" aria-hidden />
                ) : (
                  <Square className="size-5 text-muted" aria-hidden />
                )}
                <span className="font-medium">{t.label}</span>
                <span className="col-start-2 text-sm text-muted md:col-start-auto">
                  {t.doneBy ? `${formatTime(t.doneBy.submittedAt)} - Đã nộp` : `Thời lượng: ${t.minutes} phút`}
                </span>
                <Pill tone="none" className={`col-start-2 justify-self-start md:col-start-auto md:justify-self-center ${style.soft} ${style.text}`}>
                  {style.label}
                </Pill>
                <Pill
                  tone={t.done ? "success" : past ? "danger" : "neutral"}
                  className="col-start-2 justify-self-start md:col-start-auto md:justify-self-center"
                >
                  {t.done ? "Đã hoàn thành" : past ? "Chưa hoàn thành" : future ? "Sắp tới" : "Chưa làm"}
                </Pill>
                <span className="col-start-3 row-span-4 row-start-1 justify-self-end md:col-start-auto md:row-span-1 md:row-start-auto print:hidden">
                  {t.doneBy ? (
                    <Button href={t.doneBy.href} variant="outline" className="px-4! py-1! text-sm">
                      Xem lại
                    </Button>
                  ) : (
                    !future && (
                      <Button href={t.href} variant="navy" className="px-4! py-1! text-sm">
                        Làm ngay
                      </Button>
                    )
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-2 text-sm">
          <p className="flex gap-2">
            <Sparkles className="size-5 shrink-0 text-yellow-500" aria-hidden />
            <span>
              <strong>Nhắc nhở từ AI:</strong> Hoàn thành To-Do hôm nay giúp bạn duy trì mạch học đều đặn và bám sát lộ trình học tập hằng ngày.
            </span>
          </p>
          <p className="flex gap-2">
            <Sparkles className="size-5 shrink-0 text-brand" aria-hidden />
            <span>
              <strong>Gợi ý từ AI:</strong>{" "}
              {ranked.length && ranked[0] !== weakest ? `Bạn đang làm tốt ${skillStyle[ranked[0]].label}. ` : ""}
              Hãy dành thêm 15–20 phút mỗi ngày cho {skillStyle[weakest].label} – kỹ năng cần cải thiện nhất.
            </span>
          </p>
        </div>
        <PrintButton label="Tải báo cáo PDF" variant="outline" />
      </Card>
    </div>
  );
}

export default function TasksPage({ searchParams }: PageProps<"/tasks">) {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải nhiệm vụ…</p>}>
      <Tasks searchParams={searchParams} />
    </Suspense>
  );
}
