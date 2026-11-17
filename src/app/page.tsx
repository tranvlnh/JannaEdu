import Image from "next/image";
import Link from "next/link";
import { CourseList } from "@/app/courses/course-list";
import { Icon, type IconName } from "@/app/icons";

const FEATURES: [string, string, string, string][] = [
  ["Giám khảo AI 24/7", "Chấm điểm, phân tích lỗi chi tiết theo chuẩn quốc tế trong vài giây.", "/writing", "/ref/icon-robot.png"],
  ["Phòng thi ảo", "Mô phỏng áp lực thời gian, giao diện và cấu trúc đề thi thật.", "/tests", "/ref/icon-bulb.png"],
  ["Lộ trình phù hợp", "AI phân tích điểm yếu, gợi ý bài tập trọng tâm, tối ưu hóa thời gian.", "/learning-path", "/ref/icon-target.png"],
  ["Phụ huynh theo dõi tiến độ", "Theo dõi kết quả, báo cáo tiến độ học tập của con.", "/account", "/ref/icon-parents.png"],
];

const WHY: [string, IconName][] = [
  ["Nội dung chuẩn quốc tế", "book"],
  ["Cập nhật đề thi mới nhất", "check"],
  ["Phương pháp học khoa học, linh hoạt", "bulb"],
  ["Độc quyền chỉ có ở Janna Edu", "target"],
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 p-4 md:p-8">
      {/* The banner image already carries the headline and the button, as in the design. */}
      <Link href="/tests" aria-label="Bắt đầu học ngay" className="block overflow-hidden rounded-3xl border-b-4 border-lime-600/70 shadow-md">
        <h1 className="sr-only">Chinh phục IELTS cùng Janna Edu</h1>
        <Image src="/ref/hero.jpg" alt="" width={1097} height={221} priority className="w-full" />
      </Link>

      <section>
        <h2 className="sr-only">Tính năng nổi bật</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([title, text, href, icon]) => (
            <li key={title}>
              <Link href={href} className="card flex h-full flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="flex items-center gap-3">
                  <Image src={icon} alt="" width={64} height={64} className="size-14 shrink-0 object-contain" />
                  <span className="text-lg font-bold leading-snug">{title}</span>
                </span>
                <span className="text-sm">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold text-brand">Khóa học nổi bật</h2>
          <Link href="/courses" className="flex items-center gap-1 font-medium text-brand hover:underline">
            Xem tất cả <Icon name="arrow" className="size-4" />
          </Link>
        </div>
        <CourseList />
      </section>

      <section className="grid items-center gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col items-start gap-5">
        <span className="rounded-full bg-blue-500 px-5 py-1.5 font-medium text-white">Hệ sinh thái sản phẩm</span>
        <h2 className="text-4xl font-extrabold">
          Janna <span className="text-brand">Academy</span>
        </h2>
        <p className="max-w-2xl text-xl font-semibold">
          Hệ thống các khóa học video trực tuyến, dòng sách tự học và bộ đề luyện thi độc quyền IELTS
        </p>
        <p className="max-w-2xl">
          Được biên soạn bởi đội ngũ chuyên gia IELTS, đồng hành cùng bạn từ nền tảng đến mục tiêu band điểm mong muốn.
        </p>
        <ul className="grid w-full grid-cols-2 gap-5 md:grid-cols-4">
          {WHY.map(([item, icon]) => (
            <li key={item} className="flex flex-col items-center gap-3 text-center font-medium">
              <span className="card grid size-20 place-items-center p-0">
                <Icon name={icon} className="size-10" />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="btn px-8 py-3 text-lg font-bold uppercase">
            Khám phá Janna Academy <Icon name="arrow" className="size-5" />
          </Link>
          <Link href="/books" className="btn-outline px-8 py-3 text-lg">
            Sách &amp; tài liệu
          </Link>
        </div>
        </div>
        <Image src="/ref/academy-book.jpg" alt="Bộ sách IELTS Practice Tests của Janna Edu" width={1158} height={1120} className="mx-auto w-full max-w-md" />
      </section>
    </main>
  );
}
