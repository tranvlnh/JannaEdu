import type { Metadata } from "next";
import { Clock, FileText, NotebookPen, Target } from "lucide-react";
import { LineChart } from "@/components/charts";
import { Card, CardTitle, Delta, ProgressBar, StatCard } from "@/components/ui";
import { monthlyReports } from "@/lib/mock/parent";
import { progressByRange, weeklyGoal, weeklyScores } from "@/lib/mock/student";
import { SKILLS, skillStyle } from "@/lib/skills";
import { SkillPerformance } from "../skill-performance";

export const metadata: Metadata = { title: "Tiến độ học tập của con" };

export default function ParentProgressPage() {
  const s = progressByRange[30];
  const latest = monthlyReports[0];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Tiến độ học tập của con</h1>
        <p className="mt-2 text-lg">Số liệu 30 ngày gần nhất</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} iconClass="bg-brand text-white" label="Tổng thời gian học" value={s.studyHours} unit="giờ">
          <Delta value={s.studyHoursDelta} suffix="giờ so với 30 ngày trước" />
        </StatCard>
        <StatCard icon={NotebookPen} iconClass="bg-skill-reading text-white" label="Số bài hoàn thành" value={s.completed} unit="bài">
          <Delta value={s.completedDelta} suffix="bài so với 30 ngày trước" />
        </StatCard>
        <StatCard icon={FileText} iconClass="bg-skill-listening/20 text-skill-listening" label="Mock test đã làm" value={s.mockTests} unit="bài">
          <Delta value={s.mockTestsDelta} suffix="bài so với 30 ngày trước" />
        </StatCard>
        <StatCard icon={Target} iconClass="bg-skill-speaking/20 text-skill-speaking" label="Mục tiêu tuần này" value={`${weeklyGoal.done}/${weeklyGoal.total}`} unit="bài">
          <ProgressBar value={weeklyGoal.done} max={weeklyGoal.total} label="Mục tiêu tuần này" />
        </StatCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Tiến độ theo tuần</CardTitle>
          <LineChart
            title="Band từng kỹ năng theo tuần"
            labels={weeklyScores.labels}
            domain={[4.5, 8]}
            step={0.5}
            series={SKILLS.map((k) => ({ name: skillStyle[k].label, color: skillStyle[k].color, values: weeklyScores.values[k] }))}
          />
        </Card>
        <SkillPerformance scores={latest.scores} previous={latest.previousScores} title={`Điểm kỹ năng tháng ${latest.month}`} />
      </div>
    </div>
  );
}
