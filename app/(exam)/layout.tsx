import { Header, SkipLink } from "@/components/app-shell";
import { student } from "@/lib/mock/users";

// Màn thi: chỉ Header, không sidebar — tập trung làm bài.
export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Header user={student} />
      <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">{children}</main>
    </div>
  );
}
