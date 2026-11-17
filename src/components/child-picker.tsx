"use client";

import type { Profile } from "@/contracts/profile";

/** Parent header: switch which linked child the /parent pages show. Submits on change. */
export function ChildPicker({ list, current, action }: { list: Profile[]; current: string; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <label className="flex items-center gap-2 text-sm">
        <span className="hidden font-medium lg:inline">Con:</span>
        <select
          name="child"
          defaultValue={current}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          aria-label="Chọn con"
          className="max-w-40 rounded-full border-2 border-navy/20 bg-white px-3 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-brand"
        >
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName ?? "(chưa có tên)"}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
