import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { LineChart } from "@/components/charts";
import { Card, CardTitle, Pill } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/format";
import { schedule, weeklyScores } from "@/lib/mock/student";
import { SKILLS, skillStyle } from "@/lib/skills";
import { ProgressOverview } from "./overview";

export const metadata: Metadata = { title: "Theo dõi tiến độ" };

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-6">
      <ProgressOverview />

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardTitle>Tiến độ theo kỹ năng</CardTitle>
          <LineChart
            title="Band từng kỹ năng theo tuần"
            labels={weeklyScores.labels}
            domain={[4.5, 8]}
            step={0.5}
            showValues
            series={SKILLS.map((s) => ({ name: skillStyle[s].label, color: skillStyle[s].color, values: weeklyScores.values[s] }))}
          />
        </Card>

        <Card>
          <CardTitle
            action={
              <Link href="/path" className="font-semibold hover:underline">
                Xem tất cả
              </Link>
            }
          >
            Lịch học sắp tới
          </CardTitle>
          <ul className="flex flex-col gap-4">
            {schedule.map((item) => {
              const tone = item.skill ? skillStyle[item.skill] : skillStyle.listening;
              return (
                <li key={item.id} className="flex items-center gap-4">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone.soft}`}>
                    <FileText className={`size-6 ${tone.text}`} aria-hidden />
                  </span>
                  <div className="mr-auto min-w-0">
                    <p className="text-lg font-semibold">{item.title}</p>
                    <p className="text-sm">
                      <time dateTime={item.start}>
                        {formatDate(item.start)} · {formatTime(item.start)}
                        {item.end && ` – ${formatTime(item.end)}`}
                      </time>
                    </p>
                  </div>
                  {item.status === "upcoming" ? <Pill tone="warning">Sắp diễn ra</Pill> : <Pill tone="success">Đã đăng ký</Pill>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
