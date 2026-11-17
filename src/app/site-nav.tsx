"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/app/icons";

// [href, label, icon, other sections that highlight this tab]
const LINKS: [string, string, IconName, string[]][] = [
  ["/", "Trang chủ", "home", []],
  ["/courses", "Khóa học", "course", []],
  ["/tests", "Luyện đề", "test", ["/writing", "/speaking", "/attempts"]],
  ["/ai-review", "AI nhận xét", "robot", ["/writing/submissions", "/speaking/submissions"]],
  ["/learning-path", "Lộ trình học", "path", []],
  ["/account", "Phụ huynh & tài khoản", "users", []],
  ["/books", "Sách & tài liệu", "file", []],
];

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

// The tab whose matching section is the most specific, so /writing/submissions/x is "AI nhận xét", not "Luyện đề".
function activeHref(pathname: string) {
  let best: [string, number] = ["", -1];
  for (const [href, , , extra] of LINKS)
    for (const section of [href, ...extra])
      if (isActive(section, pathname) && section.length > best[1]) best = [href, section.length];
  return best[0];
}

// Left sidebar on desktop, a scrolling row on phones.
export function NavLinks({ active }: { active: string | null }) {
  const currentHref = active === null ? null : activeHref(active);
  return (
    <nav aria-label="Chính" className="shrink-0 overflow-x-auto px-3 pb-3 md:w-60 md:overflow-visible md:py-4">
      <ul className="flex gap-1 md:sticky md:top-4 md:flex-col md:gap-2">
        {LINKS.map(([href, label, icon]) => {
          const current = href === currentHref;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 font-medium ${current ? "bg-peach text-brand" : "hover:bg-panel"}`}
              >
                <Icon name={icon} className="size-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  // The exam room (/tests/<id>) uses the full width, like the real computer-based test.
  if (/^\/tests\/[^/]+$/.test(pathname)) return null;
  return <NavLinks active={pathname} />;
}
