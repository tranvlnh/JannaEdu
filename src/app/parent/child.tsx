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
      <h1 className="text-2xl font-bold">Chưa liên kết với con</h1>
      <p>Nhờ con tạo mã liên kết trong trang Tài khoản của con, rồi nhập mã đó ở trang Tài khoản của bạn.</p>
      <Button href="/account">Nhập mã liên kết</Button>
    </Card>
  );
}

export const childName = (child: { fullName: string | null }) => child.fullName ?? "Con";
