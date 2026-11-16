import Link from "next/link";

const FEATURES = [
  ["Giám khảo AI 24/7", "Chấm Writing và Speaking, phân tích lỗi chi tiết theo tiêu chí IELTS."],
  ["Phòng thi ảo", "Mô phỏng áp lực thời gian và cấu trúc đề thi Reading, Listening."],
  ["Lộ trình phù hợp", "AI phân tích điểm yếu từ kết quả thi và gợi ý việc cần luyện trước."],
  ["Phụ huynh theo dõi tiến độ", "Phụ huynh xem kết quả và lộ trình học tập của con."],
];

const WHY = [
  "Nội dung chuẩn quốc tế",
  "Cập nhật đề thi mới nhất",
  "Phương pháp học khoa học, linh hoạt",
  "Độc quyền chỉ có ở Janna Edu",
];

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-12 p-6">
        <section className="flex flex-col items-start gap-4 py-8">
          <h1 className="text-4xl font-bold leading-tight">
            Chinh phục IELTS cùng <span className="text-orange-600">Janna Edu</span>
          </h1>
          <p className="max-w-2xl text-lg">
            Nền tảng luyện thi IELTS của Janna Academy: phòng thi ảo, giám khảo AI và lộ trình học cho từng học sinh.
          </p>
          <Link href="/account" className="rounded-full bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700">
            Bắt đầu học ngay →
          </Link>
        </section>

        <section>
          <h2 className="sr-only">Tính năng</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(([title, text]) => (
              <li key={title} className="rounded-lg border p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">
            Janna <span className="text-orange-600">Academy</span>
          </h2>
          <p>
            Hệ thống các khóa học video trực tuyến, dòng sách tự học và bộ đề luyện thi độc quyền IELTS. Được biên soạn bởi
            đội ngũ chuyên gia IELTS, đồng hành cùng bạn từ nền tảng đến mục tiêu band điểm mong muốn.
          </p>
          <ul className="grid list-disc gap-1 pl-5 sm:grid-cols-2">
            {WHY.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="flex flex-wrap gap-4">
            <Link href="/courses" className="underline">
              Xem các khóa học
            </Link>
            <Link href="/books" className="underline">
              Xem sách &amp; tài liệu
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
