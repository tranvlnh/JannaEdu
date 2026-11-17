// Mock data phía học sinh. Thay bằng API khi có BE — giữ nguyên type.
import type { Skill, SkillScores } from "@/lib/skills";

export const goal = { band: 7.0, totalWeeks: 12, currentWeek: 4 };

/** Điểm hiện tại — dùng chung cho mọi màn tổng quan (overall = 6.0). */
export const currentScores: SkillScores = { listening: 7.0, reading: 6.5, writing: 5.5, speaking: 5.5 };

export type Course = {
  id: string;
  title: string;
  range: string;
  description: string;
  lessons: number;
  weeks: number;
};

export const featuredCourses: Course[] = [
  { id: "foundation", title: "IELTS Foundation", range: "Band 4.0 – 5.0", description: "Xây nền ngữ pháp, từ vựng và làm quen 4 kỹ năng IELTS.", lessons: 36, weeks: 8 },
  { id: "intensive", title: "IELTS Intensive", range: "Band 5.5 – 7.0", description: "Chiến lược làm bài từng dạng câu hỏi, luyện đề có chấm chữa.", lessons: 48, weeks: 12 },
  { id: "advanced", title: "IELTS Advanced", range: "Band 7.0+", description: "Nâng band Writing/Speaking với từ vựng học thuật và lập luận chặt.", lessons: 40, weeks: 10 },
  { id: "practice", title: "Luyện đề toàn diện", range: "Mọi trình độ", description: "Bộ đề mô phỏng thi thật, chấm điểm và phân tích lỗi bằng AI.", lessons: 30, weeks: 6 },
];

// --- Mock test ---------------------------------------------------------------

export type MockTestResult = {
  id: string;
  title: string;
  date: string; // ISO
  scores: SkillScores;
  previousOverall: number;
  strengths: string[];
  improvements: string[];
  aiComment: string;
  /** Kế hoạch cải thiện theo tuần (band report). */
  plan: { skill: Skill; text: string; weeks: string }[];
};

export const mockTestResults: MockTestResult[] = [
  {
    id: "mt-08",
    title: "IELTS Academic Mock Test 8",
    date: "2026-11-10",
    scores: { listening: 7.5, reading: 7.5, writing: 6.0, speaking: 6.0 }, // overall 7.0
    previousOverall: 6.5,
    strengths: ["Nghe hiểu các thông tin chính", "Đọc hiểu các dạng bài đơn giản", "Sử dụng từ vựng phù hợp"],
    improvements: ["Diễn đạt ý tưởng chưa mạch lạc", "Phát âm chưa rõ một số âm", "Thiếu từ vựng học thuật"],
    aiComment:
      "Bạn đã thể hiện tốt ở kỹ năng Listening và Reading. Tuy nhiên, Writing và Speaking cần cải thiện thêm về sự mạch lạc và phát âm. Hãy luyện tập thêm 1–2 tuần với lộ trình cá nhân để đạt điểm cao hơn!",
    plan: [
      { skill: "writing", text: "Ôn tập ngữ pháp và cấu trúc câu", weeks: "Tuần 1 – 2" },
      { skill: "speaking", text: "Luyện phát âm và mở rộng từ vựng", weeks: "Tuần 2 – 3" },
      { skill: "reading", text: "Tăng tốc độ đọc và kỹ năng scan", weeks: "Tuần 3 – 4" },
    ],
  },
];

// --- Giám khảo AI (Speaking) -------------------------------------------------

export type Criterion = { name: string; score: number };
export type SpeakingError = { category: string; issue: string; suggestion: string };

export const speakingSession = {
  id: "sp-01",
  part: "Part 1",
  question: "Do you prefer studying alone or with other people? Why?",
  durationSec: 154,
  criteria: [
    { name: "Fluency & Coherence", score: 7.5 },
    { name: "Lexical Resource", score: 7.0 },
    { name: "Grammatical Range & Accuracy", score: 7.0 },
    { name: "Pronunciation", score: 8.0 },
  ] satisfies Criterion[], // band 7.5
  errors: [
    {
      category: "Phát âm",
      issue: "Âm /θ/ trong từ “think” chưa chính xác.",
      suggestion: "Luyện phát âm với video mẫu và bài tập luyện âm.",
    },
    {
      category: "Từ vựng",
      issue: "Dùng “very good” quá nhiều (3 lần).",
      suggestion: "Thay bằng các cụm đa dạng hơn như “excellent”, “outstanding”.",
    },
    {
      category: "Ngữ pháp",
      issue: "“I am liking this kind of topic” → nên dùng “I like” (hiện tại đơn).",
      suggestion: "Ôn lại cách dùng thì hiện tại đơn với động từ chỉ trạng thái.",
    },
    {
      category: "Cấu trúc câu",
      issue: "Câu trả lời còn thiếu liên kết giữa các ý.",
      suggestion: "Dùng từ nối như “Moreover”, “In addition”, “As a result”.",
    },
  ] satisfies SpeakingError[],
};

// --- Lộ trình ------------------------------------------------------------------

export type PathStage = {
  weeks: string;
  title: string;
  description: string;
  progress: number; // 0–100
  status: "done" | "current" | "locked";
  skill?: Skill; // màu card; undefined = foundation / full practice
};

export const pathStages: PathStage[] = [
  { weeks: "Tuần 1 – 2", title: "Foundation", description: "Xây dựng nền tảng ngữ pháp & từ vựng", progress: 100, status: "done" },
  { weeks: "Tuần 3 – 4", title: "Listening & Reading", description: "Luyện kỹ năng nghe – đọc", progress: 60, status: "current", skill: "listening" },
  { weeks: "Tuần 5 – 7", title: "Writing", description: "Phát triển kỹ năng viết", progress: 0, status: "locked", skill: "writing" },
  { weeks: "Tuần 8 – 10", title: "Speaking", description: "Tăng phản xạ và sự trôi chảy", progress: 0, status: "locked", skill: "speaking" },
  { weeks: "Tuần 11 – 12", title: "Full Practice", description: "Luyện đề tổng hợp", progress: 0, status: "locked" },
];

export type WeekTask = { day: string; task: string; skill: Skill; minutes: number; done: boolean };

/** Kế hoạch tuần hiện tại (tuần 4). */
export const weekPlan: WeekTask[] = [
  { day: "Thứ 2", task: "Listening Part 3 – Multiple choice", skill: "listening", minutes: 30, done: true },
  { day: "Thứ 3", task: "Reading – Matching headings", skill: "reading", minutes: 40, done: true },
  { day: "Thứ 4", task: "Từ vựng chủ đề Environment (20 từ)", skill: "reading", minutes: 20, done: true },
  { day: "Thứ 5", task: "Listening Part 4 – Note completion", skill: "listening", minutes: 30, done: false },
  { day: "Thứ 6", task: "Reading – True / False / Not Given", skill: "reading", minutes: 40, done: false },
  { day: "Thứ 7", task: "Mini test Listening + Reading", skill: "listening", minutes: 60, done: false },
];

export const resources = [
  { title: "IELTS Listening Band 5.0 – 6.5 (Janna Book)", type: "Sách", href: "/academy" },
  { title: "IELTS Reading Band 5.0 – 6.5 (Janna Book)", type: "Sách", href: "/academy" },
  { title: "Video: Chiến lược Matching headings", type: "Video", href: "/academy" },
  { title: "Bộ 300 từ vựng học thuật thường gặp", type: "PDF", href: "/academy" },
];

export type Exercise = {
  id: string;
  skill: Skill;
  part: string;
  title: string;
  description: string;
  minutes: number;
  /** Màn làm bài; undefined = chưa có (UI hiện "Sắp có"). */
  href?: string;
};

export const exercises: Exercise[] = [
  { id: "ex-1", skill: "listening", part: "Part 4", title: "Listening Part 4: Environment", description: "Trả lời câu hỏi dạng Multiple choice, Note completion", minutes: 10 },
  { id: "ex-2", skill: "writing", part: "Task 1", title: "Writing Task 1: Bar chart", description: "Mô tả biểu đồ theo đúng cấu trúc", minutes: 20 },
  { id: "ex-3", skill: "speaking", part: "Part 2", title: "Speaking Part 2: Describe an event", description: "Luyện nói theo chủ đề trong 2 phút", minutes: 15, href: "/examiner" },
  { id: "ex-4", skill: "reading", part: "Passage 2", title: "Reading: Matching headings", description: "Chọn tiêu đề phù hợp cho từng đoạn văn", minutes: 20, href: "/mock-test/reading-01" },
  { id: "ex-5", skill: "writing", part: "Task 2", title: "Writing Task 2: Opinion essay", description: "Lập dàn ý và viết bài luận nêu quan điểm", minutes: 40 },
];

// --- Tiến độ -------------------------------------------------------------------

export type ProgressStats = {
  studyHours: number;
  studyHoursDelta: number;
  completed: number;
  completedDelta: number;
  mockTests: number;
  mockTestsDelta: number;
};

/** Thống kê theo khoảng thời gian (ngày); delta so với kỳ trước cùng độ dài. */
export const progressByRange: Record<7 | 30 | 90, ProgressStats> = {
  7: { studyHours: 8, studyHoursDelta: 2, completed: 14, completedDelta: 3, mockTests: 2, mockTestsDelta: 1 },
  30: { studyHours: 29, studyHoursDelta: 8, completed: 52, completedDelta: 10, mockTests: 8, mockTestsDelta: 2 },
  90: { studyHours: 78, studyHoursDelta: 15, completed: 140, completedDelta: 25, mockTests: 20, mockTestsDelta: 5 },
};

export const weeklyGoal = { done: 5, total: 7 };

export const weeklyScores = {
  labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
  values: {
    listening: [5.0, 6.0, 6.5, 7.5],
    reading: [5.5, 6.0, 6.5, 7.0],
    writing: [5.0, 5.5, 5.5, 6.0],
    speaking: [5.5, 5.5, 6.0, 6.5],
  } satisfies Record<Skill, number[]>,
};

export type ScheduleItem = {
  id: string;
  title: string;
  skill?: Skill;
  start: string; // ISO
  end?: string;
  status: "upcoming" | "registered";
};

export const schedule: ScheduleItem[] = [
  { id: "s-1", title: "Practice Listening – Part 3", skill: "listening", start: "2026-11-17T19:30:00+07:00", end: "2026-11-17T21:00:00+07:00", status: "upcoming" },
  { id: "s-2", title: "Writing Task 1: Line graph", skill: "writing", start: "2026-11-18T19:30:00+07:00", end: "2026-11-18T21:00:00+07:00", status: "registered" },
  { id: "s-3", title: "Mock test 9", start: "2026-11-22T08:00:00+07:00", status: "registered" },
];
