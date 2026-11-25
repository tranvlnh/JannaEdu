import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { Button, Card, ProgressBar } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { dayStart, shiftDay, vietnamDay } from "@/lib/progress";
import { requestTime } from "@/server/activity";
import { getDailyTasks, updateDailyTask } from "@/server/daily-tasks";

export const metadata: Metadata = { title: "Nhiệm vụ hằng ngày" };

async function toggle(day: string, slot: number, done: boolean) {
  "use server";
  await updateDailyTask({ day, slot, done });
  redirect(`/daily-tasks?day=${day}`);
}

export default function DailyTasksPage({ searchParams }: PageProps<"/daily-tasks">) {
  return <Suspense fallback={<p>Đang tải nhiệm vụ…</p>}><DailyTasks searchParams={searchParams} /></Suspense>;
}

async function DailyTasks({ searchParams }: Pick<PageProps<"/daily-tasks">, "searchParams">) {
  const { day: requested } = await searchParams;
  const today = vietnamDay(requestTime());
  const parsed = z.iso.date().safeParse(requested);
  const day = parsed.success ? parsed.data : today;
  const monday = shiftDay(day, -((new Date(day).getUTCDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => shiftDay(monday, i));
  const { tasks, hasPath } = await getDailyTasks(day);
  const done = tasks.filter((task) => task.done).length;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl font-bold">Nhiệm vụ hằng ngày</h1>
      <div className="flex flex-wrap gap-2">
        <Button href={`/daily-tasks?day=${shiftDay(day, -7)}`} variant="outline">Tuần trước</Button>
        <Button href="/daily-tasks" variant="outline">Về hôm nay</Button>
        <Button href={`/daily-tasks?day=${shiftDay(day, 7)}`} variant="outline">Tuần sau</Button>
      </div>
      <nav aria-label="Chọn ngày trong tuần" className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {week.map((date, i) => (
          <Link key={date} href={`/daily-tasks?day=${date}`} aria-current={date === day ? "date" : undefined}
            className={`rounded-xl px-3 py-2 text-center font-medium ${date === day ? "bg-navy text-white" : "bg-white hover:bg-brand-tint"}`}>
            <span className="block">{date === today ? "Hôm nay" : i === 6 ? "Chủ nhật" : `Thứ ${i + 2}`}</span>
            <span className="text-sm">{date.slice(8)}/{date.slice(5, 7)}</span>
          </Link>
        ))}
      </nav>
      <Card>
        <h2 className="text-xl font-bold">{formatDate(new Date(dayStart(day)).toISOString())}</h2>
        {!hasPath ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p>Hãy tạo lộ trình để nhận nhiệm vụ hằng ngày.</p>
            <Button href="/path">Đến lộ trình học</Button>
          </div>
        ) : tasks.length === 0 ? (
          <p className="mt-3 text-muted">Không có nhiệm vụ được ghi nhận cho ngày này.</p>
        ) : (
          <>
            <p className="mt-3 mb-2">{done}/{tasks.length} nhiệm vụ đã hoàn thành</p>
            <ProgressBar value={done} max={tasks.length} label={`Đã hoàn thành ${done} trên ${tasks.length} nhiệm vụ`} />
            {day > today && <p className="mt-3 text-sm text-muted">Nhiệm vụ dự kiến. Bạn có thể đánh dấu khi đến ngày học.</p>}
            <ul className="mt-3 divide-y divide-navy/10">
              {tasks.map((task) => (
                <li key={task.slot} className="flex flex-wrap items-center gap-3 py-4">
                  <form action={toggle.bind(null, day, task.slot, !task.done)}>
                    <Button type="submit" variant="outline" disabled={day > today}
                      aria-label={`${task.done ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành"}: ${task.title}`}>
                      {task.done ? "✓ Đã xong" : "Đánh dấu xong"}
                    </Button>
                  </form>
                  <span className="min-w-40 flex-1">{task.title}</span>
                  {task.href && <Button href={task.href} variant="outline">Xem bài tập</Button>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
