import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { PathSkill } from "@/contracts/learning-path";
import { getLearningPath } from "@/server/learning-path";
import { getProfile } from "@/server/profile";
import { Icon } from "@/app/icons";

export const metadata: Metadata = { title: "Sách & tài liệu" };

// One book per skill, so the AI advice in the learning path refers to a book by its skill.
const BOOKS: Record<PathSkill, { title: string; cover: string }> = {
  reading: { title: "IELTS Reading", cover: "/ref/book-reading.jpg" },
  listening: { title: "IELTS Listening", cover: "/ref/book-listening.jpg" },
  writing: { title: "IELTS Writing", cover: "/ref/book-writing.jpg" },
  speaking: { title: "IELTS Speaking", cover: "/ref/book-speaking.jpg" },
};

const BENEFITS = [
  "Giải thích chi tiết đáp án",
  "Chiến lược làm bài hiệu quả",
  "Bài tập thực hành phong phú",
  "Tài liệu bổ trợ (audio, video, file PDF)",
];

async function Advice() {
  const profile = await getProfile();
  if (profile?.role !== "student") {
    return (
      <p>
        <Link href="/account" className="font-medium text-brand underline">
          Đăng nhập bằng tài khoản học sinh
        </Link>{" "}
        và lập lộ trình học để AI gợi ý cuốn sách nên học trước.
      </p>
    );
  }
  const advice = (await getLearningPath(profile.id))?.bookAdvice;
  if (!advice) {
    return (
      <p>
        Gợi ý sách đi kèm{" "}
        <Link href="/learning-path" className="font-medium text-brand underline">
          lộ trình học
        </Link>
        : bạn sẽ thấy gợi ý ở đây sau lần lập lộ trình tiếp theo.
      </p>
    );
  }
  if (advice.length === 0) return <p>Theo kết quả gần nhất, trình độ của bạn đã vượt mức band 5.0 – 6.5 của bộ sách này.</p>;
  return (
    <ol className="list-decimal pl-5">
      {advice.map(({ skill, reason }) => (
        <li key={skill}>
          <strong>{BOOKS[skill].title}</strong>: {reason}
        </li>
      ))}
    </ol>
  );
}

export default function BooksPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-extrabold">Sách tự học IELTS</h1>
        <p className="mt-3 max-w-3xl text-xl">
          Hệ thống sách được thiết kế theo từng kỹ năng, từ cơ bản đến nâng cao, giúp người học hiểu sâu và tiến bộ.
        </p>
      </header>

      <section className="card border-2 border-brand">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-brand">
          <Icon name="robot" /> Gợi ý từ AI cho bạn
        </h2>
        <Suspense fallback={<p>Loading...</p>}>
          <Advice />
        </Suspense>
      </section>

      <div className="grid items-center gap-6 rounded-3xl bg-white/60 p-5 lg:grid-cols-[1fr_17rem]">
        <ul className="grid grid-cols-2 items-start gap-5 xl:grid-cols-4">
          {(Object.keys(BOOKS) as PathSkill[]).map((skill) => (
            <li key={skill}>
              <Image
                src={BOOKS[skill].cover}
                alt={`Sách ${BOOKS[skill].title}, Band 5.0 – 6.5`}
                width={400}
                height={466}
                className="w-full rounded-sm shadow-[4px_6px_14px_rgba(15,23,42,0.25)]"
              />
            </li>
          ))}
        </ul>

        <section>
          <h2 className="mb-3 text-xl font-bold">Mỗi cuốn sách có</h2>
          <ul className="flex flex-col gap-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-center gap-3 font-medium">
                <span className="grid size-14 shrink-0 place-items-center rounded-full border-4 border-white bg-navy text-white shadow">
                  <Icon name="check" className="size-6" />
                </span>
                <span className="flex-1 rounded-full bg-white px-5 py-3 shadow-[3px_4px_0_#c7d7f3]">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
