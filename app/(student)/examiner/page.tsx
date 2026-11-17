import type { Metadata } from "next";
import { speakingSession } from "@/lib/mock/student";
import { SpeakingPractice } from "./speaking-practice";

export const metadata: Metadata = { title: "Giám khảo AI – Speaking" };

export default function ExaminerPage() {
  return (
    <SpeakingPractice question={speakingSession.question} part={speakingSession.part} criteria={speakingSession.criteria} />
  );
}
