"use client";

import { useFormStatus } from "react-dom";

export function RetryButton({
  label = "Chấm lại",
  pendingLabel = "Đang chấm bài, có thể mất tới một phút...",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded border px-4 py-2">
      {pending ? pendingLabel : label}
    </button>
  );
}
