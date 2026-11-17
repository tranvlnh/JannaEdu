import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/app/icons";
import { LearningPathView } from "@/app/learning-path-view";
import { listAttempts } from "@/server/exam";
import { getLearningPath } from "@/server/learning-path";
import { getLinkedProfiles, getProfile } from "@/server/profile";
import { listSpeakingSubmissions } from "@/server/speaking";
import { listWritingSubmissions } from "@/server/writing";

type Activity = { href: string; title: string; submittedAt: string; score: string };

const band = (value: number | null) => (value === null ? "Chưa chấm" : `Band ${value.toFixed(1)}`);

async function Child({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent") redirect("/account");
  // The linked list is also what validates the id from the URL.
  const child = (await getLinkedProfiles()).find((p) => p.id === studentId);
  if (!child) return <p className="card">Không tìm thấy học sinh này trong danh sách con đã liên kết.</p>;

  const [path, attempts, essays, talks] = await Promise.all([
    getLearningPath(child.id),
    listAttempts(child.id),
    listWritingSubmissions(child.id),
    listSpeakingSubmissions(child.id),
  ]);

  const activities: Activity[] = [
    ...attempts.map((a) => ({
      href: `/attempts/${a.id}`,
      title: `Con hoàn thành bài thi ${a.testTitle}`,
      submittedAt: a.submittedAt,
      score: `${a.rawScore} câu đúng${a.band === null ? "" : ` · Band ${a.band.toFixed(1)}`}`,
    })),
    ...essays.map((s) => ({ href: `/writing/submissions/${s.id}`, title: `Con nộp bài Writing: ${s.promptTitle}`, submittedAt: s.submittedAt, score: band(s.band) })),
    ...talks.map((s) => ({ href: `/speaking/submissions/${s.id}`, title: `Con nộp bài Speaking: ${s.promptTitle}`, submittedAt: s.submittedAt, score: band(s.band) })),
  ].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const name = child.fullName ?? "(chưa có tên)";

  return (
    <>
      <section className="card flex flex-wrap items-center gap-6">
        <span aria-hidden className="grid size-28 place-items-center rounded-full bg-peach text-5xl font-bold text-brand">
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col gap-1 text-lg">
          <h2 className="text-3xl font-bold">{name}</h2>
          <p>
            Trình độ hiện tại: <strong>{path?.overall == null ? "chưa đủ 4 kỹ năng" : `Band ${path.overall.toFixed(1)}`}</strong>
          </p>
          <p className="self-start rounded-xl bg-emerald-50 px-4 py-1 font-semibold text-emerald-700">Đang học</p>
        </div>
      </section>

      {path ? (
        <LearningPathView path={path} forParent />
      ) : (
        <p className="card text-slate-600">Con chưa lập lộ trình học.</p>
      )}

      <section className="card">
        <h2 className="mb-2 text-2xl font-bold">Hoạt động gần đây</h2>
        {activities.length === 0 ? (
          <p className="text-slate-600">Con chưa nộp bài nào.</p>
        ) : (
          <ul className="divide-y">
            {activities.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand">
                  <span>
                    <span className="block font-semibold">{item.title}</span>
                    <span className="text-sm text-slate-600">
                      {new Date(item.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                    </span>
                  </span>
                  <span className="font-bold">{item.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function ChildPage({ params }: { params: Promise<{ studentId: string }> }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-extrabold">Tổng quan học tập của con</h1>
        <p className="mt-2 text-xl font-semibold">Xin chào, Anh/Chị!</p>
        <p className="text-lg">Dưới đây là tổng quan về tình hình học tập của con trong chương trình luyện thi IELTS tại Janna Edu.</p>
      </header>
      <Suspense fallback={<p>Loading...</p>}>
        <Child params={params} />
      </Suspense>
      <Link href="/account" className="flex items-center gap-1 font-medium text-brand hover:underline">
        <Icon name="back" className="size-5" /> Về trang tài khoản
      </Link>
    </main>
  );
}
