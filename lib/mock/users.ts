export type Role = "student" | "parent";

export type User = {
  name: string;
  role: Role;
};

export const student: User = { name: "Đặng Trà Giang", role: "student" };
export const parent: User = { name: "Đỗ Lan Anh", role: "parent" };

export const roleLabel: Record<Role, string> = {
  student: "Học sinh",
  parent: "Phụ huynh",
};

export const notifications: Record<Role, { id: string; text: string; href: string }[]> = {
  student: [
    { id: "n1", text: "Giám khảo AI đã chấm xong bài Speaking của bạn", href: "/examiner/analysis" },
    { id: "n2", text: "Lịch học: Practice Listening – Part 3 lúc 19:30 hôm nay", href: "/progress" },
    { id: "n3", text: "Có 2 bài tập mới được AI gợi ý", href: "/path/exercises" },
  ],
  parent: [
    { id: "n1", text: "Báo cáo học tập tháng 10 của con đã sẵn sàng", href: "/parent/report" },
    { id: "n2", text: "Con vừa nhận nhận xét AI cho bài Writing", href: "/parent/ai-feedback" },
  ],
};
