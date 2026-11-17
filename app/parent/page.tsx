import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DonutChart, LineChart } from "@/components/charts";
import { Card, CardTitle, Pill, ProgressBar } from "@/components/ui";
import { band, formatDate, formatTime } from "@/lib/format";
import { activities, child, monthlyScores } from "@/lib/mock/parent";
import { SKILLS, overallBand, skillStyle } from "@/lib/skills";

export default function ParentHomePage() {
  const overall = overallBand(child.scores);
  const delta = overall - child.previousOverall;
  const overallSeries = monthlyScores.labels.map((_, i) =>
    overallBand({
      listening: monthlyScores.values.listening[i],
      reading: monthlyScores.values.reading[i],
      writing: monthlyScores.values.writing[i],
      speaking: monthlyScores.values.speaking[i],
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Tổng quan học tập của con</h1>
        <p className="mt-3 text-lg font-semibold">Xin chào, Anh/Chị!</p>
        <p className="text-lg">Dưới đây là tổng quan về tình hình học tập của con trong chương trình luyện thi IELTS tại Janna Edu.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr_0.8fr]">
        <Card className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <span aria-hidden className="grid size-28 place-items-center rounded-full bg-brand-soft text-4xl font-bold text-brand">
              {child.name.split(" ").at(-1)?.[0]}
            </span>
            <Pill tone="success" className="px-5 py-1.5 text-base">
              {child.status}
            </Pill>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">{child.name}</h2>
            <p>Khóa học {child.course}</p>
            <p>
              Trình độ hiện tại: <strong>Band {band(overall)}</strong>
            </p>
            <p>
              Thời gian học: {child.months} tháng (từ {formatDate(child.startDate)})
            </p>
          </div>
        </Card>

        <Card>
          <CardTitle>Điểm IELTS hiện tại</CardTitle>
          <div className="flex flex-wrap items-center gap-6">
            <DonutChart
              size={150}
              label={`Overall ${band(overall)}`}
              segments={SKILLS.map((s) => ({ value: child.scores[s], color: skillStyle[s].color }))}
            >
              <p className="text-3xl font-bold">{band(overall)}</p>
            </DonutChart>
            <dl className="flex flex-1 flex-col gap-2">
              {SKILLS.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`size-3.5 rounded-full ${skillStyle[s].bg}`} aria-hidden />
                  <dt className="flex-1">{skillStyle[s].label}</dt>
                  <dd className="font-bold tabular-nums">{band(child.scores[s])}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-sm">
            <span className="font-semibold text-success">↑ +{band(delta)}</span> so với lần thi trước
          </p>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Mục tiêu của con</h2>
          <Link
            href="/parent/path"
            className="flex flex-1 items-center gap-3 rounded-2xl bg-surface p-5 transition-colors hover:bg-surface-deep focus-visible:outline-2 focus-visible:outline-brand"
          >
            <div className="flex-1">
              <p className="text-3xl font-bold">BAND {band(child.goalBand)}</p>
              <ProgressBar value={overall} max={child.goalBand} label={`Đạt ${band(overall)} trên mục tiêu ${band(child.goalBand)}`} className="mt-3 h-4" />
              <p className="mt-2 text-sm text-muted">Xem lộ trình của con</p>
            </div>
            <ChevronRight className="size-8" aria-hidden />
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardTitle>Tiến độ học tập 12 tháng gần nhất</CardTitle>
          <LineChart
            title="Band theo tháng"
            labels={monthlyScores.labels}
            domain={[4, 8]}
            series={[
              { name: "Overall", color: "var(--color-navy)", values: overallSeries },
              ...SKILLS.map((s) => ({ name: skillStyle[s].label, color: skillStyle[s].color, values: monthlyScores.values[s] })),
            ]}
          />
        </Card>

        <Card>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <ol className="flex flex-col divide-y divide-navy/10">
            {[...activities].reverse().map((a) => (
              <li key={a.id} className="py-3">
                <p className="font-semibold">{a.text}</p>
                <time dateTime={a.at} className="text-sm text-muted">
                  {formatDate(a.at)} · {formatTime(a.at)}
                </time>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
