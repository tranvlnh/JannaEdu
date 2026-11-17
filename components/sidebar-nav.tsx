"use client";

import Link from "next/link";
import { Suspense } from "react";
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
  Users,
  X,
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
    { href: "/parent/academy", label: "Tài liệu & Tài nguyên", icon: FileText },
  ],
};

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
  const settings: NavItem = { href: role === "parent" ? "/parent/settings" : "/settings", label: "Cài đặt", icon: Settings };
  return (
    <>
      <ul className="flex flex-col gap-1">
        {NAV[role].map((item) => (
          <li key={item.href}>
            <NavLink item={item} active={isActive(pathname, item.href)} />
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-4 pt-6">
        {role === "parent" && (
          <div className="rounded-2xl bg-surface p-4">
            <Users className="mb-2 size-9" strokeWidth={1.5} aria-hidden />
            <p className="leading-snug">
              <strong>Đồng hành cùng con</strong> trên hành trình chinh phục <strong>IELTS</strong>
            </p>
          </div>
        )}
        <NavLink item={settings} active={isActive(pathname, settings.href)} />
      </div>
    </>
  );
}

export function ActiveSidebarNav({ role }: { role: Role }) {
  return <SidebarNav role={role} pathname={usePathname()} />;
}

/** Menu mobile (< lg): popover trượt từ trái, đóng khi bấm link. Mở bằng nút popoverTarget="mobile-nav" ở Header. */
export function MobileNav({ role }: { role: Role }) {
  return (
    <nav
      id="mobile-nav"
      popover="auto"
      aria-label="Điều hướng chính"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) e.currentTarget.hidePopover();
      }}
      className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-72 flex-col bg-white px-4 py-6 shadow-card backdrop:bg-navy/40 open:flex lg:hidden"
    >
      <button
        type="button"
        popoverTarget="mobile-nav"
        popoverTargetAction="hide"
        aria-label="Đóng menu"
        className="mb-4 self-end rounded-full p-2 hover:bg-surface"
      >
        <X className="size-6" aria-hidden />
      </button>
      <Suspense fallback={<SidebarNav role={role} pathname={null} />}>
        <ActiveSidebarNav role={role} />
      </Suspense>
    </nav>
  );
}
