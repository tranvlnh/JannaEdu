import Link from "next/link";

const LINKS = [
  ["/tests", "Phòng thi"],
  ["/writing", "Writing"],
  ["/speaking", "Speaking"],
  ["/learning-path", "Lộ trình"],
  ["/courses", "Khóa học"],
  ["/books", "Sách & tài liệu"],
] as const;

// Header shown on every page (rendered by the root layout).
export function SiteNav() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <Link href="/" className="text-lg font-bold">
          JANNA <span className="text-orange-600">EDU</span>
        </Link>
        <nav aria-label="Chính" className="flex flex-1 flex-wrap gap-x-5 gap-y-2">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/account" className="rounded-full bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700">
          Tài khoản
        </Link>
      </div>
    </header>
  );
}
