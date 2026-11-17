import { AppShell } from "@/components/app-shell";
import { student } from "@/lib/mock/users";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell user={student}>{children}</AppShell>;
}
