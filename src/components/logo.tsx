import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="block shrink-0">
      <Image src="/ref/logo.png" alt="Janna Edu" width={623} height={193} preload className="h-14 w-auto" />
    </Link>
  );
}
