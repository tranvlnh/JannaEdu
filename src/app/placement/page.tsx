import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { PlacementPart } from "@/contracts/profile";
import { Button, Card, Pill, SKILL_ICON } from "@/components/ui";
import { band } from "@/lib/format";
import { skillStyle } from "@/lib/skills";
import { homeOf } from "@/server/auth";
import { completePlacement, getPlacement } from "@/server/placement";
import { getProfile } from "@/server/profile";
import { gradeSpeaking } from "@/server/speaking";
import { gradeWriting } from "@/server/writing";

export const metadata: Metadata = { title: "Kiểm tra xếp lớp" };

const ROUTE: Record<PlacementPart["skill"], string> = {
  reading: "/placement/test",
  listening: "/placement/test",
  writing: "/placement/writing",
  speaking: "/placement/speaking",
};

async function retryGrading(formData: FormData) {
  "use server";
  const input = { submissionId: formData.get("submissionId") };
  if (formData.get("skill") === "writing") await gradeWriting(input);
  else await gradeSpeaking(input);
  await completePlacement();
  redirect("/placement");
}

async function finish() {
  "use server";
  await completePlacement();
  redirect("/courses");
}

function Status({ part }: { part: PlacementPart }) {
  if (part.status === "done") return <Pill tone="success">Xong · Band {band(part.band!)}</Pill>;
  if (part.status === "grading") return <Pill tone="warning">Đang chấm</Pill>;
  return <Pill>Chưa làm</Pill>;
}

async function Hub() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeOf(profile.role));
  const { parts, overall } = await getPlacement();

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">Kiểm tra xếp lớp</h1>
        <p className="mt-2 text-lg">
          Làm đủ 4 phần để biết band hiện tại của bạn. Bài kiểm tra miễn phí, không cần mua khóa học.
        </p>
      </div>

      {overall !== null && (
        <Card className="flex flex-col items-start gap-3">
          <h2 className="text-xl font-bold">Band hiện tại của bạn: IELTS {band(overall)}</h2>
          <p>Dựa trên kết quả 4 kỹ năng. Hãy chọn khóa học phù hợp để bắt đầu lộ trình.</p>
          {profile.needsPlacement ? (
            <form action={finish}>
              <Button type="submit">
                Xem khóa học phù hợp <ArrowRight className="size-5" aria-hidden />
              </Button>
            </form>
          ) : (
            <Button href="/courses">
              Xem khóa học phù hợp <ArrowRight className="size-5" aria-hidden />
            </Button>
          )}
        </Card>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {parts.map((part) => {
          const Icon = SKILL_ICON[part.skill];
          return (
            <li key={part.skill}>
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className={`flex items-center gap-2 text-xl font-bold ${skillStyle[part.skill].text}`}>
                    <Icon className="size-6" aria-hidden />
                    {skillStyle[part.skill].label}
                  </h2>
                  <Status part={part} />
                </div>
                <p className="flex-1 text-navy/80">{part.title}</p>
                {part.status === "grading" && part.ungradedId && (
                  <form action={retryGrading}>
                    <input type="hidden" name="skill" value={part.skill} />
                    <input type="hidden" name="submissionId" value={part.ungradedId} />
                    <Button type="submit" variant="outline">
                      <RotateCcw className="size-5" aria-hidden />
                      Chấm lại
                    </Button>
                  </form>
                )}
                {part.status !== "done" && (
                  <Button href={`${ROUTE[part.skill]}/${part.itemId}`} variant={part.status === "todo" ? "primary" : "ghost"}>
                    {part.status === "todo" ? "Làm bài" : "Làm lại"}
                  </Button>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function PlacementPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-8">
      <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
        <Hub />
      </Suspense>
    </div>
  );
}
