// Mock data phía phụ huynh. Con = học sinh trong student.ts.
import type { Skill, SkillScores } from "@/lib/skills";
import { currentScores, goal } from "./student";
import { student } from "./users";

export const child = {
  name: student.name,
  course: "IELTS Intensive",
  startDate: "2025-12-01",
  months: 12,
  status: "Đang học" as const,
  scores: currentScores, // overall 6.0
  previousOverall: 5.5,
  goalBand: goal.band,
};

/** 12 tháng gần nhất. Overall tính bằng overallBand() khi render. */
export const monthlyScores = {
  labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
  values: {
    listening: [5.0, 5.0, 5.5, 5.5, 5.5, 6.0, 6.0, 6.0, 6.5, 6.5, 7.0, 7.0],
    reading: [5.0, 5.0, 5.0, 5.5, 5.5, 5.5, 6.0, 6.0, 6.0, 6.0, 6.5, 6.5],
    writing: [4.5, 4.5, 5.0, 5.0, 5.0, 5.0, 5.0, 5.5, 5.5, 5.5, 5.5, 5.5],
    speaking: [4.0, 4.5, 4.5, 4.5, 5.0, 5.0, 5.0, 5.0, 5.5, 5.5, 5.5, 5.5],
  } satisfies Record<Skill, number[]>,
};

export const activities = [
  { id: "a-1", text: "Con hoàn thành bài thi Listening", at: "2026-11-12T19:30:00+07:00" },
  { id: "a-2", text: "Con nhận được nhận xét từ AI (Writing)", at: "2026-11-15T21:30:00+07:00" },
  { id: "a-3", text: "Con hoàn thành bài tập Reading", at: "2026-11-16T20:00:00+07:00" },
  { id: "a-4", text: "Con hoàn thành bài tập Listening", at: "2026-11-17T20:00:00+07:00" },
];

export const monthlyReport = {
  month: 10,
  from: "2026-10-01",
  to: "2026-10-31",
  stats: { hours: 30, hoursDelta: 3, completed: 50, completedDelta: 12, mockTests: 6, mockTestsDelta: 3, vocab: 98, vocabDelta: 20 },
  scores: currentScores,
  previousScores: { listening: 6.5, reading: 6.0, writing: 5.0, speaking: 5.0 } satisfies SkillScores,
  teacherComment:
    "Con đã có tiến bộ ở Listening và Reading: khả năng nghe hiểu thông tin và đọc hiểu nội dung bài đã được cải thiện. Tuy nhiên, con cần tiếp tục trau dồi từ vựng, luyện tập thường xuyên và nâng cao khả năng xử lý thông tin để cải thiện kết quả trong thời gian tới.",
};

export const aiFeedback = {
  overview:
    "Con đang có tiến bộ ổn định, đặc biệt ở Listening và Reading. Tuy nhiên, cần chú ý cải thiện Writing và Speaking để đạt mục tiêu Band 7.0.",
  strengths: ["Nghe hiểu tốt, bắt được ý chính", "Đọc hiểu nhanh, chính xác", "Từ vựng phong phú, đa dạng"],
  improvements: ["Ngữ pháp (Writing)", "Độ trôi chảy (Speaking)", "Phát âm, ngữ điệu"],
  skills: {
    listening: ["Phát hiện keyword tốt", "Hiểu ý chính chính xác", "Cần luyện nghe dạng bản đồ"],
    reading: ["Đọc nhanh, hiểu nội dung", "Cần cải thiện suy luận", "Tăng vốn từ vựng học thuật"],
    writing: ["Bố cục chưa rõ ràng", "Ngữ pháp còn lỗi nhỏ", "Cần tăng độ đa dạng từ vựng"],
    speaking: ["Phát âm chưa ổn định", "Độ trôi chảy hạn chế", "Cần luyện phản xạ nhanh"],
  } satisfies Record<Skill, string[]>,
  parentTip:
    "Hãy khuyến khích con duy trì thói quen học mỗi ngày, đặc biệt là luyện bài về các chủ đề quen thuộc. Ngoài ra, có thể cho con tham khảo thêm sách Janna Books và các bài tập được AI gợi ý.",
};
