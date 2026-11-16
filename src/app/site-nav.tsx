import Link from "next/link";

// Header of the public pages.
export function SiteNav() {
  return (
    <header className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 p-6">
      <Link href="/" className="text-lg font-bold">
        JANNA <span className="text-orange-600">EDU</span>
      </Link>
      <nav aria-label="Chính" className="flex flex-1 flex-wrap gap-x-5 gap-y-2">
        <Link href="/courses" className="hover:underline">
          Khóa học
        </Link>
        <Link href="/books" className="hover:underline">
          Sách &amp; tài liệu
        </Link>
      </nav>
      <Link href="/account" className="rounded-full bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700">
        Tài khoản
      </Link>
    </header>
  );
}
