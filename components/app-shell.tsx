import { Suspense } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { ActiveSidebarNav, SidebarNav } from "@/components/sidebar-nav";
import { roleLabel, type User } from "@/lib/mock/users";

export function Header({ user }: { user: User }) {
  const isStudent = user.role === "student";
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 bg-white px-4 lg:gap-6 lg:px-6 print:hidden">
      <div className="shrink-0 lg:w-56">
        <Logo href={isStudent ? "/" : "/parent"} />
      </div>

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
        <button type="button" aria-label="Thông báo" className="rounded-full p-2 hover:bg-surface">
          <Bell className="size-6" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Tài khoản: ${user.name}, ${roleLabel[user.role]}`}
          className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 hover:bg-surface"
        >
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-brand-soft font-bold text-brand"
          >
            {user.name.split(" ").at(-1)?.[0]}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block font-semibold">{user.name}</span>
            <span className="block text-sm text-muted">{roleLabel[user.role]}</span>
          </span>
          <ChevronDown className="size-5" aria-hidden />
        </button>
      </div>
    </header>
  );
}

// ponytail: sidebar ẩn dưới lg, drawer mobile nằm ở mục Polish trong BOARD
export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        <nav aria-label="Điều hướng chính" className="hidden w-64 shrink-0 flex-col px-4 pt-2 pb-6 lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:self-start lg:overflow-y-auto">
          {/* usePathname suspend ở route có param động (cacheComponents) */}
          <Suspense fallback={<SidebarNav role={user.role} pathname={null} />}>
            <ActiveSidebarNav role={user.role} />
          </Suspense>
        </nav>
        <main className="min-w-0 flex-1 rounded-tl-3xl bg-linear-to-br from-surface to-surface-deep p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
