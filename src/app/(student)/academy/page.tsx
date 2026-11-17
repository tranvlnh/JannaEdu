import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademyContent, BookAdvice } from "@/app/(student)/academy/academy-content";
import { getLearningPath } from "@/server/learning-path";
import { getProfile } from "@/server/profile";

export const metadata: Metadata = { title: "Janna Academy" };

export default function AcademyPage() {
  return (
    <AcademyContent
      advice={
        <Suspense fallback={null}>
          <MyBookAdvice />
        </Suspense>
      }
    />
  );
}

async function MyBookAdvice() {
  const profile = await getProfile();
  const path = profile && (await getLearningPath(profile.id));
  return <BookAdvice title="AI gợi ý cho bạn từ kết quả thi" advice={path?.bookAdvice} />;
}
