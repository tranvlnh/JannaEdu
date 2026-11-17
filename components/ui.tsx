import Link from "next/link";
import { BookOpen, Bot, ChevronDown, CircleAlert, CircleCheck, Headphones, Mic, PenLine, type LucideIcon } from "lucide-react";
import { skillStyle, type Skill } from "@/lib/skills";

export const SKILL_ICON: Record<Skill, LucideIcon> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

export function Card({
  className = "",
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={`min-w-0 rounded-2xl bg-white p-5 shadow-card sm:p-6 ${className}`} {...props}>
      {children}
    </section>
  );
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold">{children}</h2>
      {action}
    </div>
  );
}

const BUTTON = {
  primary: "bg-brand text-white hover:bg-brand/90",
  outline: "border-2 border-brand text-brand hover:bg-brand-soft/40",
  navy: "bg-navy text-white hover:bg-navy/90",
  ghost: "text-brand hover:bg-brand-soft/40",
};

type ButtonProps = {
  variant?: keyof typeof BUTTON;
  className?: string;
  children: React.ReactNode;
} & (({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">) | ({ href?: undefined } & Omit<React.ComponentProps<"button">, "className">));

/** Có `href` → Link, không → button. */
export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full text-center px-6 py-2.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${BUTTON[variant]} ${className}`;
  if (props.href !== undefined) {
    return (
      <Link className={cls} {...props}>
        {children}
      </Link>
    );
  }
  const { type = "button", ...rest } = props as Omit<React.ComponentProps<"button">, "className">;
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}

const PILL = {
  neutral: "bg-surface text-navy",
  brand: "bg-brand-soft text-brand",
  success: "bg-success/15 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-yellow-300/80 text-navy",
};

export function Pill({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: keyof typeof PILL;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${PILL[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  barClass = "bg-skill-listening",
  label,
  className = "",
}: {
  value: number;
  max?: number;
  barClass?: string;
  label: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2.5 overflow-hidden rounded-full bg-navy/10 ${className}`}
    >
      <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** "+3 giờ so với tháng trước" — dấu quyết định màu. */
export function Delta({ value, suffix }: { value: number; suffix: string }) {
  const up = value >= 0;
  return (
    <p className="text-sm">
      <span className={`font-semibold ${up ? "text-success" : "text-danger"}`}>
        {up ? "↑ +" : "↓ "}
        {value}
      </span>{" "}
      {suffix}
    </p>
  );
}

export function StatCard({
  icon: Icon,
  iconClass = "bg-surface text-navy",
  label,
  value,
  unit,
  children,
}: {
  icon: LucideIcon;
  iconClass?: string;
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Dòng dưới: Delta, ProgressBar… */
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="font-medium">{label}</h3>
      </div>
      <p className="text-4xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-2 text-xl font-semibold">{unit}</span>}
      </p>
      {children}
    </Card>
  );
}

export function SkillScoreCard({
  skill,
  score,
  max = 9,
}: {
  skill: Skill;
  score: number;
  max?: number;
}) {
  const s = skillStyle[skill];
  const Icon = SKILL_ICON[skill];
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${s.border} ${s.soft}`}>
      <div className={`flex items-center gap-2 font-semibold ${s.text}`}>
        <Icon className="size-5" aria-hidden />
        {s.label}
      </div>
      <p className="text-4xl font-bold tabular-nums">{score.toFixed(1)}</p>
      <ProgressBar value={score} max={max} barClass={s.bg} label={`${s.label} ${score}/${max}`} />
    </div>
  );
}

const CHECK = {
  good: { icon: CircleCheck, color: "text-success" },
  bad: { icon: CircleAlert, color: "text-danger" },
};

/** Điểm mạnh (good) / Cần cải thiện (bad). */
export function CheckList({
  tone,
  title,
  items,
  className = "",
}: {
  tone: keyof typeof CHECK;
  title: string;
  items: string[];
  className?: string;
}) {
  const { icon: Icon, color } = CHECK[tone];
  return (
    <div className={className}>
      <h3 className={`mb-3 flex items-center gap-2 text-xl font-bold ${color}`}>
        <Icon className="size-6" aria-hidden />
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AIComment({
  title = "Nhận xét từ AI",
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface">
        <Bot className="size-7" aria-hidden />
      </span>
      <div className="flex flex-1 flex-col gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="leading-relaxed text-navy/90">{children}</div>
        {action}
      </div>
    </Card>
  );
}

/** <select> gốc của trình duyệt, chỉ thêm style. `icon` hiện bên trái. */
export function Select({
  icon: Icon,
  className = "",
  children,
  ...props
}: { icon?: LucideIcon } & React.ComponentProps<"select">) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {Icon && <Icon className="pointer-events-none absolute left-4 size-6" aria-hidden />}
      <select
        className={`w-full appearance-none rounded-2xl border-2 border-navy/80 bg-white py-2.5 pr-12 text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${Icon ? "pl-14" : "pl-4"}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 size-5" aria-hidden />
    </span>
  );
}
