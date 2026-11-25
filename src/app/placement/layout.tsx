import { Header, SkipLink } from "@/components/app-shell";

// Bài kiểm tra xếp lớp: chỉ Header, không sidebar — học sinh chưa mua khóa chưa vào được các trang khác.
export default function PlacementLayout({ children }: LayoutProps<"/placement">) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Header role="student" />
      <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">{children}</main>
    </div>
  );
}
