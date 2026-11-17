// Course catalogue: static marketing content, not per-user data.
export type Course = {
  id: string;
  title: string;
  range: string;
  description: string;
  lessons: number;
  weeks: number;
  image: string;
};

export const featuredCourses: Course[] = [
  { id: "foundation", image: "/ref/course-foundation.jpg", title: "IELTS Foundation", range: "Band 4.0 – 5.0", description: "Xây nền ngữ pháp, từ vựng và làm quen 4 kỹ năng IELTS.", lessons: 36, weeks: 8 },
  { id: "intensive", image: "/ref/course-intensive.jpg", title: "IELTS Intensive", range: "Band 5.5 – 7.0", description: "Chiến lược làm bài từng dạng câu hỏi, luyện đề có chấm chữa.", lessons: 48, weeks: 12 },
  { id: "advanced", image: "/ref/course-advanced.jpg", title: "IELTS Advanced", range: "Band 7.0+", description: "Nâng band Writing/Speaking với từ vựng học thuật và lập luận chặt.", lessons: 40, weeks: 10 },
  { id: "practice", image: "/ref/course-practice.jpg", title: "Luyện đề toàn diện", range: "Mọi trình độ", description: "Bộ đề mô phỏng thi thật, chấm điểm và phân tích lỗi bằng AI.", lessons: 30, weeks: 6 },
];
