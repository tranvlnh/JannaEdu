// Outline icons used across the UI (24x24, stroke = currentColor). Decorative: always aria-hidden.
const PATHS = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  course: "M3 4h18v12H3z M8 21h8 M12 16v5 M10 8l5 2.5-5 2.5z",
  test: "M9 3h6v3H9z M7 4.5H5V21h14V4.5h-2 M8.5 11h7 M8.5 15h5",
  pen: "M4 20h4L19 9l-4-4L4 16z M14 6l4 4",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3",
  headphones: "M4 15v-3a8 8 0 0 1 16 0v3 M4 15h3v5H4z M17 15h3v5h-3z",
  book: "M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3z M21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z",
  path: "M5 21V4 M5 4h12l-2.5 4L17 12H5",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M16 3.5a4 4 0 0 1 0 7 M18 14.5a7 7 0 0 1 4 6.5",
  file: "M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h8",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  robot: "M12 3v3 M5 8h14v11H5z M9 13h.01 M15 13h.01 M9.5 16h5 M2 12v3 M22 12v3",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12l7-7",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  bulb: "M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z",
  check: "M5 12.5l4.5 4.5L19 7",
  alert: "M12 7v6 M12 17h.01 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  back: "M19 12H5 M11 6l-6 6 6 6",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
