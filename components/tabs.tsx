"use client";

import { useId, useRef, useState } from "react";

export type Tab = { id: string; label: string; content: React.ReactNode };

/** Tabs theo WAI-ARIA: ←/→/Home/End chuyển tab, chỉ tab đang chọn nằm trong tab order. */
export function Tabs({
  tabs,
  defaultTab = tabs[0]?.id,
  variant = "pill",
}: {
  tabs: Tab[];
  defaultTab?: string;
  variant?: "pill" | "underline";
}) {
  const [active, setActive] = useState(defaultTab);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const last = tabs.length - 1;
    const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[
      e.key
    ];
    if (next === undefined) return;
    e.preventDefault();
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        className={`flex gap-2 overflow-x-auto ${variant === "underline" ? "border-b-2 border-skill-listening/40" : ""}`}
      >
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`shrink-0 rounded-xl px-5 py-2 font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                selected ? "bg-brand-soft text-brand" : "hover:bg-white/60"
              } ${variant === "underline" ? "mb-1" : ""}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          tabIndex={0}
          className="pt-6 focus-visible:outline-none"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
