import assert from "node:assert/strict";
import { test } from "node:test";
import { dailyTasks, vnDay, weekDays } from "./daily-tasks.ts";
import type { Activity } from "./progress.ts";

const DAY = 24 * 60 * 60 * 1000;
const start = "2026-11-01T00:00:00Z";
const path = {
  generatedAt: start,
  bands: { reading: 6, listening: 6.5, writing: 5, speaking: null },
  stages: [
    { weeks: 1, skills: ["writing" as const], tasks: ["Viết 1 bài Writing Task 2", "Ôn ngữ pháp", "Học 20 từ mới", "Đọc bài mẫu Reading"] },
    { weeks: 2, skills: ["listening" as const], tasks: ["Nghe podcast"] },
  ],
};
const act = (skill: Activity["skill"], submittedAt: string): Activity => ({
  id: submittedAt + skill,
  skill,
  kind: "practice",
  title: "",
  submittedAt,
  band: null,
  detail: "",
  href: "",
});

test("vnDay flips at midnight Vietnam time", () => {
  assert.equal(vnDay(Date.parse("2026-11-01T16:59:00Z")), vnDay(Date.parse("2026-11-01T01:00:00Z")));
  assert.equal(vnDay(Date.parse("2026-11-01T17:00:00Z")), vnDay(Date.parse("2026-11-01T01:00:00Z")) + 1);
});

test("day 0: three stage tasks plus the weakest skill", () => {
  const tasks = dailyTasks(path, [], Date.parse(start));
  assert.deepEqual(tasks.map((t) => t.label), ["Viết 1 bài Writing Task 2", "Ôn ngữ pháp", "Học 20 từ mới", "Làm 1 bài Speaking"]);
  assert.ok(tasks.every((t) => !t.done));
  assert.equal(tasks[3].href, "/examiner");
});

test("tasks rotate by day and the practice skill cycles weakest first", () => {
  const tasks = dailyTasks(path, [], Date.parse(start) + DAY);
  assert.deepEqual(tasks.map((t) => t.label), ["Ôn ngữ pháp", "Học 20 từ mới", "Đọc bài mẫu Reading", "Làm 1 bài Writing"]);
  assert.equal(tasks[2].href, "/mock-test");
});

test("today's submissions tick off tasks of their skill; yesterday's do not", () => {
  const now = Date.parse(start) + 2 * DAY + 3600_000;
  const tasks = dailyTasks(path, [act("writing", new Date(now - 1000).toISOString()), act("reading", new Date(now - DAY).toISOString())], now);
  // day 2: "Học 20 từ mới", "Đọc bài mẫu Reading", "Viết 1 bài Writing Task 2", practice Reading
  assert.deepEqual(tasks.map((t) => [t.label, t.done]), [
    ["Học 20 từ mới", true], // falls back to the stage skill (writing) and takes today's essay first
    ["Đọc bài mẫu Reading", false],
    ["Viết 1 bài Writing Task 2", false],
    ["Làm 1 bài Reading", false],
  ]);
});

test("a stage with one task gives one stage task; past the end uses the last stage", () => {
  const tasks = dailyTasks(path, [], Date.parse(start) + 30 * DAY);
  assert.deepEqual(tasks.map((t) => t.label).slice(0, 1), ["Nghe podcast"]);
  assert.equal(tasks.length, 2);
});

test("weekDays: Monday to Sunday of the Vietnam week, each a time inside that day", () => {
  // Thu 26/11/2026 01:00 in Vietnam = Wed 25/11 18:00 UTC
  const days = weekDays(Date.parse("2026-11-25T18:00:00Z"));
  assert.equal(days.length, 7);
  assert.equal(new Date(days[0]).toISOString(), "2026-11-23T05:00:00.000Z"); // Mon 23/11 noon VN
  assert.equal(new Date(days[6]).toISOString(), "2026-11-29T05:00:00.000Z");
  // Sunday belongs to the week that started the Monday before
  assert.deepEqual(weekDays(days[6]), days);
});

test("doneBy is the matching submission, earliest first", () => {
  const now = Date.parse(start) + 3600_000;
  const late = act("writing", new Date(now - 1000).toISOString());
  const early = act("writing", new Date(now - 2000).toISOString());
  const tasks = dailyTasks(path, [late, early], now);
  assert.equal(tasks[0].doneBy, early);
  assert.equal(tasks[1].doneBy, late);
  assert.equal(tasks[2].doneBy, null);
  assert.equal(tasks[3].minutes, 15); // practice Speaking
});
