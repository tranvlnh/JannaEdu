import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-br from-surface to-surface-deep p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <p className="text-8xl font-black text-brand-ink">404</p>
        <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="text-muted">Trang bạn tìm có thể đã bị đổi địa chỉ hoặc không tồn tại.</p>
        <Button href="/">Về trang chủ</Button>
      </div>
    </main>
  );
}
