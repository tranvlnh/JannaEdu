import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";
import { student } from "@/lib/mock/users";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold">Cài đặt</h1>
      <SettingsForm user={student} />
    </div>
  );
}
