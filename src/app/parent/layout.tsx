import { AppShell } from "@/components/app-shell";

export default function ParentLayout({ children }: LayoutProps<"/parent">) {
  return <AppShell role="parent">{children}</AppShell>;
}
