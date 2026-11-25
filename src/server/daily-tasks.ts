import { dailyTaskSchema, updateDailyTaskInput } from "@/contracts/daily-tasks";
import { pathTimeline } from "@/lib/path";
import { dayStart, vietnamDay } from "@/lib/progress";
import { requestTime } from "@/server/activity";
import { getLearningPath } from "@/server/learning-path";
import { requireLearningReady } from "@/server/profile";
import { createAdminClient } from "@/server/supabase/admin";
import { createClient } from "@/server/supabase/server";

export async function getDailyTasks(day: string) {
  const profile = await requireLearningReady();
  const supabase = await createClient();
  const load = async () => {
    const { data, error } = await supabase.from("daily_tasks").select("day, slot, title, href, done")
      .eq("student_id", profile.id).eq("day", day).order("slot");
    if (error) throw new Error(error.message);
    return dailyTaskSchema.array().parse(data);
  };

  const saved = await load();
  if (saved.length) return { tasks: saved, hasPath: true };
  const path = await getLearningPath(profile.id);
  if (!path) return { tasks: [], hasPath: false };
  const today = vietnamDay(requestTime());
  const startedAt = path.startedAt ?? path.generatedAt;
  const firstDay = vietnamDay(Date.parse(startedAt));
  if (day < today || day < firstDay) return { tasks: [], hasPath: true };

  const timeline = pathTimeline(path.stages, new Date(dayStart(firstDay)).toISOString(), dayStart(day));
  const stage = timeline.stages.find((stage) => stage.status === "current");
  if (!stage) return { tasks: [], hasPath: true };
  const week = timeline.currentWeek === 1 ? path.weekDetails?.week1
    : timeline.currentWeek === 2 ? path.weekDetails?.week2 : undefined;
  const candidates = week?.lessons.map((lesson) => ({
    title: lesson.activity,
    href: lesson.exerciseId
      ? `${lesson.skill === "writing" ? "/examiner/writing" : lesson.skill === "speaking" ? "/examiner" : "/mock-test"}/${lesson.exerciseId}`
      : `/path/exercises?skill=${lesson.skill}`,
  })) ?? stage.tasks.map((title) => ({ title, href: "/path/exercises" }));
  // Rotate through the week's activities in order, with no duplicate on the same day.
  const dayIndex = (new Date(day).getUTCDay() + 6) % 7;
  const dayCount = Math.min(2, candidates.length);
  const tasks = Array.from({ length: dayCount }, (_, slot) => ({
    ...candidates[(dayIndex * dayCount + slot) % candidates.length],
    day, slot, done: false,
  }));
  if (day !== today) return { tasks, hasPath: true };

  const { error } = await createAdminClient().from("daily_tasks")
    .upsert(tasks.map((task) => ({ ...task, student_id: profile.id })), { ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  return { tasks: await load(), hasPath: true };
}

export async function updateDailyTask(input: unknown) {
  const { day, slot, done } = updateDailyTaskInput.parse(input);
  const profile = await requireLearningReady();
  if (day > vietnamDay(requestTime())) return;
  const { error } = await createAdminClient().from("daily_tasks").update({ done })
    .eq("student_id", profile.id).eq("day", day).eq("slot", slot);
  if (error) throw new Error(error.message);
}
