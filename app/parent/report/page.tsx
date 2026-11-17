import type { Metadata } from "next";
import { child, monthlyReports } from "@/lib/mock/parent";
import { ReportView } from "./report-view";

export const metadata: Metadata = { title: "Báo cáo học tập" };

export default function ParentReportPage() {
  return <ReportView reports={monthlyReports} goalBand={child.goalBand} />;
}
