import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademyContent, BookAdvice } from "@/app/(student)/academy/academy-content";
import { getLearningPath } from "@/server/learning-path";
import { childName, loadChild } from "../child";

export const metadata: Metadata = { title: "Janna Academy" };

export default function AcademyPage() {
  return (
    <AcademyContent
      showCourses={false}
      advice={
        <Suspense fallback={null}>
          <ChildBookAdvice />
        </Suspense>
      }
    />
  );
}

async function ChildBookAdvice() {
  const child = await loadChild();
  if (!child) return null;
  const path = await getLearningPath(child.id);
  return <BookAdvice title={`AI gợi ý sách cho ${childName(child)}`} advice={path?.bookAdvice} />;
}
