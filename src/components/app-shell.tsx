import { Suspense } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import type { Role } from "@/contracts/profile";
import { ChildPicker } from "@/components/child-picker";
import { Logo } from "@/components/logo";
import { PopoverPanel } from "@/components/popover-panel";
import { ActiveSidebarNav, MobileNav, SidebarNav } from "@/components/sidebar-nav";
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { listActivity, requestTime } from "@/server/activity";
import { signOut } from "@/server/auth";
import { getProfile, getSelectedChild, selectChild } from "@/server/profile";

const POPOVER =
  "fixed inset-auto top-20 right-4 m-0 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-3 text-navy shadow-card backdrop:bg-transparent";

const ROLE_LABEL: Record<Role, string> = { student: "Học sinh", parent: "Phụ huynh" };
const NEW_FOR_MS = 3 * 24 * 60 * 60 * 1000;

async function pickChild(formData: FormData) {
  "use server";
  await selectChild(formData.get("child"));
}

/** `role` is the section's default; a signed-in user always gets the shell of their own role. */
export function Header({ role, menu = false }: { role: Role; menu?: boolean }) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 bg-white px-4 lg:gap-6 lg:px-6 print:hidden">
      <div className="shrink-0 lg:w-56">
        <Logo href={role === "student" ? "/" : "/parent"} />
      </div>
      <Suspense fallback={<div className="ml-auto" />}>
        <HeaderUser role={role} menu={menu} />
      </Suspense>
    </header>
  );
}

async function HeaderUser({ role: fallbackRole, menu }: { role: Role; menu: boolean }) {
  const profile = await getProfile();
  const role = profile?.role ?? fallbackRole;
  const isStudent = role === "student";
  const family = role === "parent" ? await getSelectedChild() : null;
  // Students see their own work; parents their selected child's.
  const activity = profile?.role ? (await listActivity(family ? family.child?.id ?? profile.id : undefined)).slice(0, 5) : [];
  const now = requestTime();
  const unread = activity.some((a) => now - Date.parse(a.submittedAt) < NEW_FOR_MS);
  const name = profile?.fullName ?? "Tài khoản";

  return (
    <>
      {isStudent && <p className="hidden shrink-0 font-semibold xl:block">Xin chào, {profile?.fullName ?? "bạn"}!</p>}
      {isStudent && (
        <form role="search" className="hidden flex-1 md:block" action="/courses">
          <label className="flex max-w-xl items-center gap-3 rounded-full bg-surface px-4 py-2.5">
            <Search className="size-5 text-muted" aria-hidden />
            <input name="q" type="search" placeholder="Tìm kiếm" aria-label="Tìm kiếm" className="w-full bg-transparent outline-none placeholder:text-muted" />
          </label>
        </form>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-5">
        {family?.child && family.children.length > 1 && (
          <ChildPicker list={family.children} current={family.child.id} action={pickChild} />
        )}
        {profile ? (
          <>
            <button type="button" popoverTarget="notifications" aria-label="Thông báo" className="relative rounded-full p-2 hover:bg-surface">
              <Bell className="size-6" aria-hidden />
              {unread && <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-brand" aria-hidden />}
            </button>
            <button
              type="button"
              popoverTarget="account-menu"
              aria-label={`Tài khoản: ${name}${profile.role ? `, ${ROLE_LABEL[profile.role]}` : ""}`}
              className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 hover:bg-surface"
            >
              <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-brand-tint font-bold text-brand-ink">
                {name.split(" ").at(-1)?.[0]}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block font-semibold">{name}</span>
                {profile.role && <span className="block text-sm text-muted">{ROLE_LABEL[profile.role]}</span>}
              </span>
              <ChevronDown className="size-5" aria-hidden />
            </button>
          </>
        ) : (
          <Button href="/login">Đăng nhập</Button>
        )}
        {menu && (
          <button type="button" popoverTarget="mobile-nav" aria-label="Mở menu" className="rounded-full p-2 hover:bg-surface lg:hidden">
            <Menu className="size-6" aria-hidden />
          </button>
        )}
      </div>

      {menu && <MobileNav role={role} />}

      {/* Popover API gốc: tự đóng khi bấm ra ngoài / Esc, không cần JS */}
      {profile && (
        <PopoverPanel id="notifications" className={POPOVER}>
          <p className="mb-2 font-bold">Hoạt động gần đây{family?.child ? ` của ${family.child.fullName ?? "con"}` : ""}</p>
          {activity.length === 0 ? (
            <p className="px-2 py-2 text-muted">Chưa có hoạt động nào.</p>
          ) : (
            <ul className="flex flex-col">
              {activity.map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="block rounded-lg px-2 py-2 hover:bg-surface">
                    <span className="block font-medium">{a.title}</span>
                    <span className="text-sm text-muted">
                      {formatDate(a.submittedAt)} · {a.band === null ? a.detail : `Band ${a.band.toFixed(1)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PopoverPanel>
      )}
      {profile && (
        <PopoverPanel id="account-menu" className={`${POPOVER} w-64`}>
          <p className="px-2 font-bold">{name}</p>
          {profile.role && <p className="mb-2 px-2 text-sm text-muted">{ROLE_LABEL[profile.role]}</p>}
          <ul className="flex flex-col border-t border-navy/10 pt-2">
            <li>
              <Link href="/account" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface">
                <UserRound className="size-4" aria-hidden />
                Tài khoản & cài đặt
              </Link>
            </li>
            <li>
              <form action={signOut}>
                <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface">
                  <LogOut className="size-4" aria-hidden />
                  Đăng xuất
                </button>
              </form>
            </li>
          </ul>
        </PopoverPanel>
      )}
    </>
  );
}

export function SkipLink() {
  return (
    <a href="#main" className="sr-only z-30 rounded-full bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
      Bỏ qua đến nội dung chính
    </a>
  );
}

async function UserSidebar({ role }: { role: Role }) {
  const profile = await getProfile();
  return <ActiveSidebarNav role={profile?.role ?? role} />;
}

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Header role={role} menu />
      <div className="flex flex-1">
        <nav aria-label="Điều hướng chính" className="hidden w-64 shrink-0 flex-col px-4 pt-2 pb-6 lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:self-start lg:overflow-y-auto">
          <Suspense fallback={<SidebarNav role={role} pathname={null} />}>
            <UserSidebar role={role} />
          </Suspense>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 rounded-tl-3xl outline-none bg-linear-to-br from-surface to-surface-deep p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
