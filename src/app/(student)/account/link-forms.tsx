"use client";

import { useActionState } from "react";
import type { LinkCode } from "@/contracts/profile";

export function CreateCodeForm({ action }: { action: (prev: LinkCode | null) => Promise<LinkCode> }) {
  const [code, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button disabled={pending} className="btn self-start">
        {code ? "Tạo mã mới" : "Tạo mã liên kết cho phụ huynh"}
      </button>
      {code && (
        <p aria-live="polite">
          Mã: <strong className="font-mono text-xl tracking-widest">{code.code}</strong>
          <br />
          <span className="text-sm text-muted">
            Hết hạn lúc {new Date(code.expiresAt).toLocaleTimeString("vi-VN")}. Tạo mã mới sẽ huỷ mã này.
          </span>
        </p>
      )}
    </form>
  );
}

export function RedeemCodeForm({
  action,
}: {
  action: (prev: string | null, formData: FormData) => Promise<string | null>;
}) {
  const [error, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="code">Nhập mã liên kết của con</label>
      <div className="flex gap-2">
        <input
          id="code"
          name="code"
          required
          maxLength={8}
          autoComplete="off"
          className="rounded-lg border border-navy/20 bg-white px-3 py-2 font-mono uppercase tracking-widest"
        />
        <button disabled={pending} className="btn">
          Liên kết
        </button>
      </div>
      {error && (
        <p role="alert" className="text-danger-ink">
          {error}
        </p>
      )}
    </form>
  );
}
