import Link from "next/link";
import { getProfile } from "@/server/profile";

const ROLE = { student: "Học sinh", parent: "Phụ huynh" };

// Top-right corner of the header: who is signed in, or a sign-in button.
export async function UserChip() {
  const profile = await getProfile();
  if (!profile) {
    return (
      <Link href="/login" className="btn">
        Đăng nhập
      </Link>
    );
  }
  const name = profile.fullName ?? "Tài khoản";
  return (
    <Link href="/account" className="flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-panel">
      <span aria-hidden className="grid size-11 place-items-center rounded-full bg-peach text-lg font-bold text-brand">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-semibold">{name}</span>
        <span className="text-sm">{profile.role ? ROLE[profile.role] : "Chưa chọn vai trò"}</span>
      </span>
    </Link>
  );
}
