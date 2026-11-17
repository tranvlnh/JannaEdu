import Link from "next/link";
import { GraduationCap } from "lucide-react";

// ponytail: logo tạm bằng icon + chữ, thay bằng public/logo.svg khi có file gốc từ design
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-2xl font-black tracking-tight">
      <GraduationCap className="size-9 text-navy" aria-hidden />
      <span>
        JANNA <span className="text-brand">EDU</span>
      </span>
    </Link>
  );
}
