import { z } from "zod";

export const dailyTaskSchema = z.object({
  day: z.iso.date(),
  slot: z.int().min(0).max(2),
  title: z.string(),
  href: z.string().nullable(),
  done: z.boolean(),
});

export const updateDailyTaskInput = dailyTaskSchema.pick({ day: true, slot: true, done: true });
