import { Header } from "@/components/app-shell";
import { student } from "@/lib/mock/users";

// Màn thi: chỉ Header, không sidebar — tập trung làm bài.
export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={student} />
      <main className="flex-1 bg-surface">{children}</main>
    </div>
  );
}
