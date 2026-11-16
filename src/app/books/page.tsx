import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { PathSkill } from "@/contracts/learning-path";
import { getLearningPath } from "@/server/learning-path";
import { getProfile } from "@/server/profile";

export const metadata: Metadata = { title: "Sách & tài liệu" };

// One book per skill, so the AI advice in the learning path refers to a book by its skill.
const BOOKS: Record<PathSkill, { title: string; tagline: string; contents: string[] }> = {
  reading: {
    title: "IELTS Reading",
    tagline: "Build Your Skills, Achieve Your Goals",
    contents: ["Strategies & Techniques", "Practice Tests", "Vocabulary Builder", "Detailed Explanations"],
  },
  listening: {
    title: "IELTS Listening",
    tagline: "Sharpen Your Ears, Boost Your Score",
    contents: ["Listening Strategies", "Real Test Practice", "Key Vocabulary", "Full Transcripts & Answers"],
  },
  writing: {
    title: "IELTS Writing",
    tagline: "Organise Your Ideas, Express Your Voice",
    contents: ["Task 1 & Task 2 Guidance", "Model Essays", "Useful Vocabulary & Phrases", "Sample Answers"],
  },
  speaking: {
    title: "IELTS Speaking",
    tagline: "Speak Confidently, Make an Impact",
    contents: ["Part 1, 2 & 3 Strategies", "Useful Vocabulary", "Sample Answers", "Pronunciation Tips"],
  },
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
        <Link href="/account" className="underline">
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
        <Link href="/learning-path" className="underline">
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
    <>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
        <header>
          <h1 className="text-3xl font-bold">Sách tự học IELTS</h1>
          <p className="mt-2">
            Hệ thống sách được thiết kế theo từng kỹ năng, từ cơ bản đến nâng cao, giúp người học hiểu sâu và tiến bộ.
          </p>
        </header>

        <section className="rounded-lg border border-orange-600 p-4">
          <h2 className="mb-2 font-semibold">Gợi ý từ AI cho bạn</h2>
          <Suspense fallback={<p>Loading...</p>}>
            <Advice />
          </Suspense>
        </section>

        <ul className="grid gap-4 sm:grid-cols-2">
          {Object.values(BOOKS).map((book) => (
            <li key={book.title} className="rounded-lg border p-4">
              <h2 className="font-semibold">{book.title}</h2>
              <p className="text-sm text-orange-600">Band 5.0 – 6.5</p>
              <p className="mt-1 text-sm" lang="en">
                {book.tagline}
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm" lang="en">
                {book.contents.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Mỗi cuốn sách có</h2>
          <ul className="list-disc pl-5">
            {BENEFITS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
