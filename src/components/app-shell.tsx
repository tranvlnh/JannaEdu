import { Suspense } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Repeat, Search, Settings } from "lucide-react";
import { Logo } from "@/components/logo";
import { PopoverPanel } from "@/components/popover-panel";
import { ActiveSidebarNav, MobileNav, SidebarNav } from "@/components/sidebar-nav";
import { notifications, roleLabel, type User } from "@/lib/mock/users";

const POPOVER =
  "fixed inset-auto top-20 right-4 m-0 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-3 text-navy shadow-card backdrop:bg-transparent";

export function Header({ user, menu = false }: { user: User; menu?: boolean }) {
  const isStudent = user.role === "student";
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 bg-white px-4 lg:gap-6 lg:px-6 print:hidden">
      <div className="shrink-0 lg:w-56">
        <Logo href={isStudent ? "/" : "/parent"} />
      </div>

      {isStudent && <p className="hidden shrink-0 font-semibold xl:block">Xin chào, Anh/Chị!</p>}
      {isStudent && (
        <form role="search" className="hidden flex-1 md:block" action="/courses">
          <label className="flex max-w-xl items-center gap-3 rounded-full bg-surface px-4 py-2.5">
            <Search className="size-5 text-muted" aria-hidden />
            <input
              name="q"
              type="search"
              placeholder="Tìm kiếm"
              aria-label="Tìm kiếm"
              className="w-full bg-transparent outline-none placeholder:text-muted"
            />
          </label>
        </form>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-5">
        <button type="button" popoverTarget="notifications" aria-label="Thông báo" className="relative rounded-full p-2 hover:bg-surface">
          <Bell className="size-6" aria-hidden />
          <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-brand" aria-hidden />
        </button>
        <button
          type="button"
          popoverTarget="account-menu"
          aria-label={`Tài khoản: ${user.name}, ${roleLabel[user.role]}`}
          className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 hover:bg-surface"
        >
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-brand-tint font-bold text-brand-ink"
          >
            {user.name.split(" ").at(-1)?.[0]}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block font-semibold">{user.name}</span>
            <span className="block text-sm text-muted">{roleLabel[user.role]}</span>
          </span>
          <ChevronDown className="size-5" aria-hidden />
        </button>
        {menu && (
          <button type="button" popoverTarget="mobile-nav" aria-label="Mở menu" className="rounded-full p-2 hover:bg-surface lg:hidden">
            <Menu className="size-6" aria-hidden />
          </button>
        )}
      </div>

      {/* Popover API gốc: tự đóng khi bấm ra ngoài / Esc, không cần JS */}
      <PopoverPanel id="notifications" className={POPOVER}>
        <p className="mb-2 font-bold">Thông báo</p>
        <ul className="flex flex-col">
          {notifications[user.role].map((n) => (
            <li key={n.id}>
              <Link href={n.href} className="block rounded-lg px-2 py-2 hover:bg-surface">
                {n.text}
              </Link>
            </li>
          ))}
        </ul>
      </PopoverPanel>
      <PopoverPanel id="account-menu" className={`${POPOVER} w-64`}>
        <p className="px-2 font-bold">{user.name}</p>
        <p className="mb-2 px-2 text-sm text-muted">{roleLabel[user.role]}</p>
        <ul className="flex flex-col border-t border-navy/10 pt-2">
          <li>
            <Link href={isStudent ? "/settings" : "/parent/settings"} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface">
              <Settings className="size-4" aria-hidden />
              Cài đặt
            </Link>
          </li>
          <li>
            {/* ponytail: chưa có auth → đổi vai trò bằng URL để xem demo */}
            <Link href={isStudent ? "/parent" : "/"} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface">
              <Repeat className="size-4" aria-hidden />
              Xem giao diện {isStudent ? "phụ huynh" : "học sinh"}
            </Link>
          </li>
        </ul>
      </PopoverPanel>
    </header>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-30 rounded-full bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Bỏ qua đến nội dung chính
    </a>
  );
}

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Header user={user} menu />
      <MobileNav role={user.role} />
      <div className="flex flex-1">
        <nav aria-label="Điều hướng chính" className="hidden w-64 shrink-0 flex-col px-4 pt-2 pb-6 lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:self-start lg:overflow-y-auto">
          {/* usePathname suspend ở route có param động (cacheComponents) */}
          <Suspense fallback={<SidebarNav role={user.role} pathname={null} />}>
            <ActiveSidebarNav role={user.role} />
          </Suspense>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 rounded-tl-3xl outline-none bg-linear-to-br from-surface to-surface-deep p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
