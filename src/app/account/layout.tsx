import { AppShell } from "@/components/app-shell";

// Students and parents share this page; the shell switches to the signed-in user's role.
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return <AppShell role="student">{children}</AppShell>;
}
