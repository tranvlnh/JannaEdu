import type { Metadata } from "next";
import { AcademyContent } from "@/app/(student)/academy/academy-content";

export const metadata: Metadata = { title: "Janna Academy" };

export default function AcademyPage() {
  return <AcademyContent />;
}
