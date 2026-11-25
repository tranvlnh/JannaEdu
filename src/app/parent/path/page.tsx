import type { Metadata } from "next";
import { Suspense } from "react";
import { Circle } from "lucide-react";
import { StageCard } from "@/app/(student)/path/stage-card";
import { AIComment, Card, CardTitle, ProgressBar } from "@/components/ui";
import { band, formatDate } from "@/lib/format";
import { pathTimeline } from "@/lib/path";
import { requestTime } from "@/server/activity";
import { getLearningPath } from "@/server/learning-path";
import { childName, loadChild, NoChild } from "../child";

export const metadata: Metadata = { title: "Lộ trình học của con" };

export default function ParentPathPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải lộ trình…</p>}>
      <ChildPath />
    </Suspense>
  );
}

async function ChildPath() {
  const child = await loadChild();
  if (!child) return <NoChild />;
  const path = await getLearningPath(child.id);
  const name = childName(child);

  if (!path) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold sm:text-5xl">Lộ trình học của con</h1>
        <Card>
          <p>{name} chưa lập lộ trình học. Con có thể lập lộ trình sau khi thiết lập band đầu vào và mục tiêu.</p>
        </Card>
      </div>
    );
  }

  const timeline = pathTimeline(path.stages, path.startedAt ?? path.generatedAt, requestTime());
  const pct = Math.round((timeline.currentWeek / timeline.totalWeeks) * 100);
  const current = timeline.stages.find((s) => s.status === "current");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Lộ trình học của con</h1>
        <p className="mt-2 text-lg">
          {child.goalBand !== null && (
            <>
              Mục tiêu <strong>IELTS {band(child.goalBand)}+</strong> ·{" "}
            </>
          )}
          {timeline.totalWeeks} tuần · đang ở tuần {timeline.currentWeek} ({pct}%) · lập ngày {formatDate(path.generatedAt)}
        </p>
        <ProgressBar value={pct} label={`Tiến độ lộ trình ${pct}%`} className="mt-3 max-w-xl" />
      </div>

      <AIComment title={`Nhận xét về ${name}`}>
        <p>{path.parentComment}</p>
      </AIComment>

      <h2 className="sr-only">Các giai đoạn</h2>
      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {timeline.stages.map((s, i) => (
          <li key={i}>
            <StageCard stage={s} />
          </li>
        ))}
      </ol>

      {current && (
        <Card>
          <CardTitle>
            Tuần {timeline.currentWeek} · giai đoạn “{current.title}”
          </CardTitle>
          <ul className="flex flex-col gap-2">
            {current.tasks.map((task, i) => (
              <li key={i} className="flex items-center gap-3">
                <Circle className="size-5 shrink-0 text-muted" aria-hidden />
                <span className="flex-1">{task}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
