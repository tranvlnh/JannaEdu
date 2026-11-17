"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChartLine,
  ClipboardList,
  FileText,
  House,
  Library,
  NotebookPen,
  Route,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/mock/users";

type NavItem = { href: string; label: string; icon: LucideIcon };

// Định nghĩa ở client vì icon là component, không truyền được từ Server Component.
const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: "/", label: "Trang chủ", icon: House },
    { href: "/courses", label: "Khóa học", icon: Library },
    { href: "/mock-test", label: "Luyện đề", icon: NotebookPen },
    { href: "/examiner", label: "Giám khảo AI", icon: Bot },
    { href: "/path", label: "Lộ trình học", icon: Route },
    { href: "/progress", label: "Tiến độ", icon: ChartLine },
    { href: "/academy", label: "Sách & tài liệu", icon: FileText },
  ],
  parent: [
    { href: "/parent", label: "Trang chủ", icon: House },
    { href: "/parent/report", label: "Báo cáo", icon: ClipboardList },
    { href: "/parent/progress", label: "Tiến độ học tập", icon: ChartLine },
    { href: "/parent/ai-feedback", label: "Nhận xét AI", icon: Bot },
    { href: "/parent/path", label: "Lộ trình học", icon: Route },
    { href: "/academy", label: "Tài liệu & Tài nguyên", icon: FileText },
  ],
};

const SETTINGS: NavItem = { href: "/settings", label: "Cài đặt", icon: Settings };

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  // Trang gốc của mỗi role chỉ active khi khớp chính xác.
  if (href === "/" || href === "/parent") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
        active ? "bg-brand-soft text-brand" : "hover:bg-surface"
      }`}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

// pathname = null → render không active (fallback Suspense khi route có param động).
export function SidebarNav({ role, pathname }: { role: Role; pathname: string | null }) {
  return (
    <>
      <ul className="flex flex-col gap-1">
        {NAV[role].map((item) => (
          <li key={item.href}>
            <NavLink item={item} active={isActive(pathname, item.href)} />
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <NavLink item={SETTINGS} active={isActive(pathname, SETTINGS.href)} />
      </div>
    </>
  );
}

export function ActiveSidebarNav({ role }: { role: Role }) {
  return <SidebarNav role={role} pathname={usePathname()} />;
}
