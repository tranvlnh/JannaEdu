import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { homeOf } from "@/server/auth";
import { getProfile, getSelectedChild } from "@/server/profile";

/** The linked child the /parent pages show, or null when none is linked yet. Parents only. */
export async function loadChild() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent") redirect(homeOf(profile.role));
  return (await getSelectedChild()).child;
}

export function NoChild() {
  return (
    <Card className="flex flex-col items-start gap-4">
      <Users className="size-10" aria-hidden />
      <h1 className="text-2xl font-bold">Chưa có hồ sơ học tập của con</h1>
      <p>Sau khi Janna Academy mở quyền học cho con, hãy nhập mã liên kết từ trang Tài khoản của con.</p>
      <Button href="/account">Nhập mã liên kết</Button>
    </Card>
  );
}

export const childName = (child: { fullName: string | null }) => child.fullName ?? "Con";
