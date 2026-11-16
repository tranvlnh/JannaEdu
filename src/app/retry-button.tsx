"use client";

import { useFormStatus } from "react-dom";

export function RetryButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded border px-4 py-2">
      {pending ? "Đang chấm bài, có thể mất tới một phút..." : "Chấm lại"}
    </button>
  );
}
