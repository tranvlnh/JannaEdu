import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { listActivity } from "@/server/activity";
import { getProfile } from "@/server/profile";
import { ProgressView } from "./progress-view";

export const metadata: Metadata = { title: "Theo dõi tiến độ" };

export default function ProgressPage() {
  return (
    <Suspense fallback={<p className="text-muted">Đang tải tiến độ…</p>}>
      <Progress />
    </Suspense>
  );
}

async function Progress() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const activity = await listActivity();
  return (
    <ProgressView
      activity={activity}
      goal={profile.goalBand}
      title="Theo dõi tiến độ học tập"
      subtitle="Cùng xem hành trình chinh phục IELTS của bạn nhé!"
    />
  );
}
