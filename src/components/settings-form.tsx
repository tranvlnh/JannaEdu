"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { roleLabel, type User } from "@/lib/mock/users";

const NOTIFY = [
  { id: "reminder", label: "Nhắc lịch học hằng ngày" },
  { id: "result", label: "Thông báo khi có kết quả chấm AI" },
  { id: "weekly", label: "Báo cáo tiến độ hằng tuần qua email" },
];

// ponytail: chưa có API → submit chỉ báo "đã lưu" tại chỗ, không persist
export function SettingsForm({ user }: { user: User }) {
  const [saved, setSaved] = useState(false);
  const field = "mt-1 w-full rounded-xl border-2 border-navy/20 bg-white px-4 py-2.5 focus:border-skill-listening focus:outline-none";

  return (
    <form
      className="flex max-w-2xl flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
      onChange={() => setSaved(false)}
    >
      <Card className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Tài khoản</h2>
        <label>
          <span className="font-medium">Họ và tên</span>
          <input name="name" defaultValue={user.name} autoComplete="name" required className={field} />
        </label>
        <label>
          <span className="font-medium">Email</span>
          <input name="email" type="email" autoComplete="email" placeholder="ban@example.com" className={field} />
        </label>
        <p className="text-sm text-muted">Vai trò: {roleLabel[user.role]}</p>
      </Card>

      {user.role === "student" && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Mục tiêu học tập</h2>
          <label>
            <span className="font-medium">Band mục tiêu</span>
            <select name="goal" defaultValue="7.0" className={field}>
              {["5.5", "6.0", "6.5", "7.0", "7.5", "8.0"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </Card>
      )}

      <Card>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xl font-bold">Thông báo</legend>
          {NOTIFY.map((n) => (
            <label key={n.id} className="flex items-center gap-3">
              <input type="checkbox" name={n.id} defaultChecked className="size-5 accent-brand" />
              {n.label}
            </label>
          ))}
        </fieldset>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit">Lưu thay đổi</Button>
        <p role="status" className="text-sm text-success-ink">
          {saved && "Đã lưu (bản demo — chưa kết nối máy chủ)."}
        </p>
      </div>
    </form>
  );
}
