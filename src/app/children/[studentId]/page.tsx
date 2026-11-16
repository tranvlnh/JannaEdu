import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LearningPathView } from "@/app/learning-path-view";
import { listAttempts } from "@/server/exam";
import { getLearningPath } from "@/server/learning-path";
import { getLinkedProfiles, getProfile } from "@/server/profile";
import { listSpeakingSubmissions } from "@/server/speaking";
import { listWritingSubmissions } from "@/server/writing";

type Item = { id: string; title: string; submittedAt: string; score: string };

function Results({ heading, href, items }: { heading: string; href: string; items: Item[] }) {
  return (
    <section>
      <h2 className="font-semibold">{heading}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Chưa có bài nào.</p>
      ) : (
        <ul className="mt-2 list-disc pl-5">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`${href}/${item.id}`} className="underline">
                {item.title}
              </Link>{" "}
              <span className="text-sm text-zinc-600">
                {new Date(item.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · {item.score}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const band = (value: number | null) => (value === null ? "Chưa chấm" : `Band ${value.toFixed(1)}`);

async function Child({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent") redirect("/account");
  // The linked list is also what validates the id from the URL.
  const child = (await getLinkedProfiles()).find((p) => p.id === studentId);
  if (!child) return <p>Không tìm thấy học sinh này trong danh sách con đã liên kết.</p>;

  const [path, attempts, essays, talks] = await Promise.all([
    getLearningPath(child.id),
    listAttempts(child.id),
    listWritingSubmissions(child.id),
    listSpeakingSubmissions(child.id),
  ]);

  return (
    <>
      <h1 className="text-xl font-semibold">{child.fullName ?? "(chưa có tên)"}</h1>

      {path ? (
        <LearningPathView path={path} forParent />
      ) : (
        <p className="text-sm text-zinc-600">Con chưa lập lộ trình học.</p>
      )}

      <Results
        heading="Bài thi Reading / Listening"
        href="/attempts"
        items={attempts.map((a) => ({
          id: a.id,
          title: a.testTitle,
          submittedAt: a.submittedAt,
          score: `${a.rawScore} câu đúng${a.band === null ? "" : ` · Band ${a.band.toFixed(1)}`}`,
        }))}
      />
      <Results
        heading="Bài Writing"
        href="/writing/submissions"
        items={essays.map((s) => ({ id: s.id, title: s.promptTitle, submittedAt: s.submittedAt, score: band(s.band) }))}
      />
      <Results
        heading="Bài Speaking"
        href="/speaking/submissions"
        items={talks.map((s) => ({ id: s.id, title: s.promptTitle, submittedAt: s.submittedAt, score: band(s.band) }))}
      />

      <Link href="/account" className="underline">
        Về trang tài khoản
      </Link>
    </>
  );
}

export default function ChildPage({ params }: { params: Promise<{ studentId: string }> }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Child params={params} />
      </Suspense>
    </main>
  );
}
