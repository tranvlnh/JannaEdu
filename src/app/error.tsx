"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // ponytail: chỉ log console; gửi Sentry/… khi có hạ tầng
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
      <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
      <p className="text-muted">Vui lòng thử lại. Nếu lỗi tiếp diễn, hãy tải lại trang.</p>
      <Button onClick={() => retry()}>Thử lại</Button>
    </div>
  );
}
