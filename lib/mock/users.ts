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
