import { ActivityList } from "@/components/activity-list";
import { LineChart } from "@/components/charts";
import { Card, CardTitle } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { bandSeries, bandsAt, overallOf, periodEnds, rangeStats, type Activity } from "@/lib/progress";
import { SKILLS, skillStyle } from "@/lib/skills";
import { requestTime } from "@/server/activity";
import { ProgressOverview, RANGES } from "./overview";

const WEEKS = 8;

/** Progress page body, shared by the student and the parent views. */
export function ProgressView({ activity, goal, title, subtitle }: { activity: Activity[]; goal: number | null; title: string; subtitle: string }) {
  const now = requestTime();
  const ends = periodEnds(now, WEEKS, 7);
  const series = bandSeries(activity, ends);
  const stats = Object.fromEntries(RANGES.map((r) => [r, rangeStats(activity, now, r)])) as Record<(typeof RANGES)[number], ReturnType<typeof rangeStats>>;

  return (
    <div className="flex flex-col gap-6">
      <ProgressOverview title={title} subtitle={subtitle} stats={stats} overall={overallOf(bandsAt(activity))} goal={goal} />

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardTitle>Tiến độ theo kỹ năng</CardTitle>
          {activity.some((a) => a.band !== null) ? (
            <LineChart
              title={`Band từng kỹ năng trong ${WEEKS} tuần gần nhất`}
              labels={ends.map((e) => formatDate(new Date(e).toISOString()).slice(0, 5))}
              domain={[3, 9]}
              step={1}
              showValues
              series={SKILLS.map((s) => ({ name: skillStyle[s].label, color: skillStyle[s].color, values: series[s] }))}
            />
          ) : (
            <p className="text-muted">Chưa có bài nào được chấm band.</p>
          )}
        </Card>

        <Card>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <ActivityList activity={activity.slice(0, 6)} empty="Chưa có bài nào được nộp." />
        </Card>
      </div>
    </div>
  );
}
