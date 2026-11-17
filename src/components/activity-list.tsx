import Link from "next/link";
import { FileText } from "lucide-react";
import { Pill } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/format";
import type { Activity } from "@/lib/progress";
import { skillStyle } from "@/lib/skills";

/** Newest-first list of handed-in work, each row linking to its result. */
export function ActivityList({ activity, empty }: { activity: Activity[]; empty: string }) {
  if (activity.length === 0) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="flex flex-col gap-4">
      {activity.map((a) => {
        const tone = skillStyle[a.skill];
        return (
          <li key={a.id}>
            <Link href={a.href} className="flex items-center gap-4 rounded-xl hover:bg-surface/60">
              <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone.soft}`}>
                <FileText className={`size-6 ${tone.text}`} aria-hidden />
              </span>
              <span className="mr-auto min-w-0">
                <span className="block font-semibold">{a.title}</span>
                <time dateTime={a.submittedAt} className="text-sm text-muted">
                  {tone.label} · {formatDate(a.submittedAt)} · {formatTime(a.submittedAt)}
                </time>
              </span>
              {a.band === null ? <Pill>{a.detail}</Pill> : <Pill tone="success">Band {a.band.toFixed(1)}</Pill>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
