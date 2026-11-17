import type { ReactNode } from "react";
import { Caveat } from "next/font/google";
import type { Skill } from "@/lib/skills";

const hand = Caveat({ subsets: ["latin"], weight: "600" });

const NAVY = "#0b2a5b";
const ORANGE = "#f15a2b";

type Cover = {
  label: string;
  color: string; // skill name
  wave: string;
  blob: string;
  tagline: [string, string];
  bullets: string[];
  note: string[];
  ink: string; // handwritten note
  art: ReactNode;
};

const COVERS: Record<Skill, Cover> = {
  reading: {
    label: "READING",
    color: ORANGE,
    wave: "#1d4f9c",
    blob: "#c9daf3",
    tagline: ["Build Your Skills", "Achieve Your Goals"],
    bullets: ["Strategy & Techniques", "Practice Tests", "Vocabulary Builder", "Detailed Explanations"],
    note: ["More practice", "Higher score!"],
    ink: "#1d4f9c",
    art: (
      <g strokeLinejoin="round">
        {[
          [300, ORANGE],
          [282, ORANGE],
          [264, "#1d4f9c"],
          [246, "#2f6bff"],
        ].map(([y, c]) => (
          <g key={y} transform={`rotate(-4 245 ${y})`}>
            <rect x="186" y={Number(y) - 2} width="112" height="18" rx="3" fill={String(c)} />
            <rect x="196" y={Number(y) + 1} width="98" height="11" fill="#fff" />
          </g>
        ))}
        <path d="M180 236q34-16 64 2v24q-30-16-64-2z" fill="#fff" stroke={NAVY} strokeWidth="2" />
        <path d="M244 238q30-18 62-6v24q-32-12-62 6z" fill="#fff" stroke={NAVY} strokeWidth="2" />
        <path d="M192 236q20-8 42-1m-42 8q20-8 42-1m20-5q18-10 40-6m-40 14q18-10 40-6" stroke="#2f6bff" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  listening: {
    label: "LISTENING",
    color: ORANGE,
    wave: "#f26522",
    blob: "#fbdccb",
    tagline: ["Sharpen Your Ears", "Boost Your Score"],
    bullets: ["Listening Strategies", "Real Test Practice", "Key Vocabulary", "Full Transcripts & Answers"],
    note: ["Listen", "Understand", "Achieve!"],
    ink: "#e8601c",
    art: (
      <g>
        <path d="M194 280v-14a56 56 0 0 1 112 0v14" fill="none" stroke="#1d4f9c" strokeWidth="11" strokeLinecap="round" />
        {[186, 290].map((x) => (
          <g key={x}>
            <rect x={x} y="262" width="26" height="54" rx="12" fill={ORANGE} />
            <rect x={x + (x < 250 ? 4 : 0)} y="266" width="22" height="46" rx="10" fill="#1d4f9c" />
          </g>
        ))}
        {[8, 16, 26, 36, 22, 30, 14, 8].map((h, i) => (
          <rect key={i} x={226 + i * 6.5} y={289 - h / 2} width="3" height={h} rx="1.5" fill={NAVY} />
        ))}
      </g>
    ),
  },
  writing: {
    label: "WRITING",
    color: "#2a7a5a",
    wave: "#2a7a5a",
    blob: "#cfe3da",
    tagline: ["Organise Your Ideas", "Express Your Voice"],
    bullets: ["Task 1 & Task 2 Guidance", "Model Essays", "Useful Vocabulary & Phrases", "Sample Answers"],
    note: ["Better Writing", "Higher Band!"],
    ink: "#2a7a5a",
    art: (
      <g>
        <g transform="rotate(10 245 270)">
          <rect x="204" y="214" width="82" height="106" rx="6" fill="#fff" stroke="#1d4f9c" strokeWidth="4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M216 ${240 + i * 13}h58`} stroke="#c3cfe0" strokeWidth="2" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={214 + i * 10.5} cy="214" r="4.5" fill="none" stroke={NAVY} strokeWidth="2.5" />
          ))}
        </g>
        <g transform="rotate(28 290 270)">
          <rect x="284" y="222" width="12" height="80" rx="6" fill="#1d4f9c" />
          <path d="M284 302h12l-6 14z" fill={NAVY} />
          <rect x="284" y="236" width="12" height="4" fill="#9fb6dc" />
        </g>
      </g>
    ),
  },
  speaking: {
    label: "SPEAKING",
    color: "#7a3fc6",
    wave: "#7a4ac8",
    blob: "#e6ddf5",
    tagline: ["Speak Confidently", "Make an Impact"],
    bullets: ["Part 1, 2 & 3 Strategies", "Useful Vocabulary", "Sample Answers", "Pronunciation Tips"],
    note: ["Speak More", "Be Better!"],
    ink: "#7a3fc6",
    art: (
      <g>
        <path d="M200 252c0-26 22-42 48-42s48 16 48 42-22 42-48 42c-6 0-12-1-18-3l-20 14 4-20c-9-8-14-19-14-33z" fill="#7a5fd6" />
        {[226, 248, 270].map((x) => (
          <circle key={x} cx={x} cy="252" r="6" fill="#fff" />
        ))}
        <path d="M262 300c0-15 13-25 28-25s28 10 28 25-13 25-28 25l-2 0 6 14-18-12c-9-4-14-15-14-27z" fill="#f47552" />
        {[280, 290, 300].map((x) => (
          <circle key={x} cx={x} cy="300" r="3.5" fill="#fff" />
        ))}
        <path d="M296 200l-6 14m18-4l-12 8m16 6l-12 2m-104 50l12-4m-12 16l12-8" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
};

export const BOOK_ORDER: Skill[] = ["reading", "listening", "writing", "speaking"];

/** Bìa sách tự học, vẽ bằng SVG để luôn nét. */
export function BookCover({ skill }: { skill: Skill }) {
  const c = COVERS[skill];
  return (
    <svg
      viewBox="0 0 320 360"
      role="img"
      aria-label={`Sách IELTS ${c.label} Band 5.0 – 6.5`}
      className="block h-auto w-full shadow-[6px_8px_16px_rgb(11_42_91/0.28)]"
    >
      <rect width="320" height="360" fill="#f7f7f5" />
      <path d="M7 0v360" stroke="#e2e2de" strokeWidth="2" />
      <circle cx="252" cy="262" r="66" fill={c.blob} />
      <path d="M118 360C190 330 260 300 320 250V360z" fill={c.wave} />
      {c.art}

      {/* Logo mark cropped from the brand logo */}
      <svg x="20" y="16" width="20" height="24" viewBox="0 0 160 193">
        <image href="/ref/logo.png" width="623" height="193" />
      </svg>
      <text x="44" y="34" fontSize="12.5" fontWeight="800" fill={NAVY}>
        JANNA <tspan fill={ORANGE}>BOOK</tspan>
      </text>
      <text x="300" y="32" fontSize="7" fontWeight="500" textAnchor="end" fill={NAVY}>
        Better English <tspan fill={ORANGE}>•</tspan> Brighter Future
      </text>

      <text x="18" y="94" fontSize="44" fontWeight="900" fill={NAVY}>
        IELTS
      </text>
      <text x="18" y="136" fontSize="38" fontWeight="900" fill={c.color}>
        {c.label}
      </text>

      <g transform="rotate(-12 268 92)" className={hand.className} fill={c.ink} color={c.ink}>
        {c.note.map((line, i) => (
          <text key={line} x="268" y={78 + i * 14 - (c.note.length - 2) * 7} fontSize="14" textAnchor="middle">
            {line}
          </text>
        ))}
        <path d="M238 112c18-2 36-6 58-12" stroke="currentColor" fill="none" />
      </g>

      <rect x="18" y="148" width="132" height="26" rx="13" fill={NAVY} />
      <text x="84" y="166" fontSize="14.5" fontWeight="700" textAnchor="middle" fill="#fff">
        Band 5.0 – 6.5
      </text>

      <text fontSize="11" fontWeight="500" fill={NAVY}>
        <tspan x="20" y="198">
          {c.tagline[0]}
        </tspan>
        <tspan x="20" y="212">
          {c.tagline[1]}
        </tspan>
      </text>

      {c.bullets.map((b, i) => (
        <g key={b}>
          <circle cx="26" cy={238 + i * 17} r="5.5" fill={NAVY} />
          <path d={`M23.5 ${238 + i * 17}l2 2 3.5-3.5`} stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <text x="37" y={241 + i * 17} fontSize="8.5" fill={NAVY}>
            {b}
          </text>
        </g>
      ))}

      <g transform="rotate(-7 60 322)" className={hand.className}>
        <text fontSize="13" fill={NAVY}>
          <tspan x="20" y="318">
            Small steps
          </tspan>
          <tspan x="20" y="332">
            make big progress.
          </tspan>
        </text>
        <path d="M20 340c30-2 56-5 82-9" stroke={skill === "writing" ? c.color : ORANGE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
