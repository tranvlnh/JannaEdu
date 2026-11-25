import { Suspense } from "react";
import { HomeContent } from "@/components/home-content";
import { band } from "@/lib/format";
import { requireLearningReady } from "@/server/profile";

async function Dashboard() {
  const profile = await requireLearningReady();
  return (
    <>
      <p className="mb-4 font-medium">
        {profile.baselineSource === "self" ? "Band tự khai" : "Band đầu vào ước tính"}: {band(profile.baselineBand)}
      </p>
      <HomeContent />
    </>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<p>Đang tải…</p>}><Dashboard /></Suspense>;
}
