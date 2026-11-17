import { AppShell } from "@/components/app-shell";
import { parent } from "@/lib/mock/users";

export default function ParentLayout({ children }: LayoutProps<"/parent">) {
  return <AppShell user={parent}>{children}</AppShell>;
}
