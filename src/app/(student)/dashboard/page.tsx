import { Suspense } from "react";
import { HomeContent } from "@/components/home-content";
import { Button } from "@/components/ui";
import { band } from "@/lib/format";
import { requireLearningAccess } from "@/server/profile";

async function Dashboard() {
  const profile = await requireLearningAccess();
  return (
    <>
      {profile.baselineBand === null ? (
        <Button href="/onboarding" className="mb-4">Thiết lập mục tiêu và band đầu vào</Button>
      ) : (
        <p className="mb-4 font-medium">
          {profile.baselineSource === "self" ? "Band tự khai" : "Band đầu vào ước tính"}: {band(profile.baselineBand)}
        </p>
      )}
      <HomeContent />
    </>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<p>Đang tải…</p>}><Dashboard /></Suspense>;
}
