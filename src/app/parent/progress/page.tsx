import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgressView } from "@/app/(student)/progress/progress-view";
import { listActivity } from "@/server/activity";
import { childName, loadChild, NoChild } from "../child";

export const metadata: Metadata = { title: "Tiến độ học tập của con" };

export default function ParentProgressPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải tiến độ…</p>}>
      <Progress />
    </Suspense>
  );
}

async function Progress() {
  const child = await loadChild();
  if (!child) return <NoChild />;
  const activity = await listActivity(child.id);
  return (
    <ProgressView
      activity={activity}
      goal={child.goalBand}
      title="Tiến độ học tập của con"
      subtitle={`Kết quả và hoạt động của ${childName(child)} theo thời gian.`}
    />
  );
}
