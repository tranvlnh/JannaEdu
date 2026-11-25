import Link from "next/link";
import { ChevronRight, Circle, CircleCheck } from "lucide-react";
import { Button, Card, CardTitle, ProgressBar } from "@/components/ui";
import { dailyTasks } from "@/lib/daily-tasks";
import { listActivity, requestTime } from "@/server/activity";
import { getMyLearningPath } from "@/server/learning-path";

/** "Nhiệm vụ hôm nay" on the student home. Async: wrap in Suspense. */
export async function DailyTasks() {
  const [{ path }, activity] = await Promise.all([getMyLearningPath(), listActivity()]);

  if (!path) {
    return (
      <Card aria-labelledby="daily-tasks" className="flex flex-col items-start gap-3">
        <h2 id="daily-tasks" className="text-xl font-bold">
          Nhiệm vụ hôm nay
        </h2>
        <p className="text-muted">Tạo lộ trình học để nhận nhiệm vụ mỗi ngày theo đúng điểm yếu của bạn.</p>
        <Button href="/path">Tạo lộ trình học</Button>
      </Card>
    );
  }

  const tasks = dailyTasks(path, activity, requestTime());
  const done = tasks.filter((t) => t.done).length;
  return (
    <Card aria-labelledby="daily-tasks">
      <CardTitle
        action={
          <span className="font-semibold tabular-nums">
            {done}/{tasks.length}
          </span>
        }
      >
        <span id="daily-tasks">Nhiệm vụ hôm nay</span>
      </CardTitle>
      <ProgressBar value={done} max={tasks.length} label={`Đã xong ${done}/${tasks.length} nhiệm vụ`} className="mb-4" />
      <ul className="flex flex-col gap-1">
        {tasks.map((t) => (
          <li key={t.id}>
            <Link
              href={t.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
            >
              {t.done ? (
                <CircleCheck className="size-5 shrink-0 text-success-ink" aria-hidden />
              ) : (
                <Circle className="size-5 shrink-0 text-muted" aria-hidden />
              )}
              <span className={`flex-1 ${t.done ? "text-muted line-through" : ""}`}>{t.label}</span>
              <span className="sr-only">{t.done ? "(đã xong)" : "(chưa làm)"}</span>
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
