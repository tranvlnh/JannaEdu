import assert from "node:assert/strict";
import { test } from "node:test";
import { activeMonths, bandSeries, bandsAt, lastDays, monthOf, monthStats, overallOf, previousMonth, rangeStats, type Activity } from "./progress.ts";

const item = (skill: Activity["skill"], band: number | null, submittedAt: string, kind: Activity["kind"] = "exam"): Activity => ({
  id: submittedAt + skill,
  skill,
  kind,
  title: "",
  submittedAt,
  band,
  detail: "",
  href: "",
});

// Newest first, like listActivity returns it.
const activity = [
  item("speaking", 6, "2026-11-15T10:00:00Z", "speaking"),
  item("writing", 5.5, "2026-11-12T10:00:00Z", "writing"),
  item("reading", 7, "2026-11-10T10:00:00Z"),
  item("listening", null, "2026-11-09T10:00:00Z", "practice"),
  item("listening", 6.5, "2026-10-20T10:00:00Z"),
  item("reading", 6, "2026-10-05T10:00:00Z"),
];

test("bandsAt takes the latest graded result per skill up to a time", () => {
  assert.deepEqual(bandsAt(activity), { listening: 6.5, reading: 7, writing: 5.5, speaking: 6 });
  assert.deepEqual(bandsAt(activity, Date.parse("2026-10-31T00:00:00Z")), { listening: 6.5, reading: 6, writing: null, speaking: null });
});

test("overall needs all four skills and rounds to the half band", () => {
  assert.equal(overallOf(bandsAt(activity)), 6.5); // 6.25 rounds up
  assert.equal(overallOf({ listening: 7, reading: null, writing: 6, speaking: 6 }), null);
});

test("bandSeries leaves gaps before a skill has a result", () => {
  const ends = [Date.parse("2026-10-10T00:00:00Z"), Date.parse("2026-11-20T00:00:00Z")];
  const s = bandSeries(activity, ends);
  assert.deepEqual(s.reading, [6, 7]);
  assert.deepEqual(s.writing, [null, 5.5]);
  assert.deepEqual(s.overall, [null, 6.5]);
});

test("rangeStats counts the window and the change against the window before", () => {
  const s = rangeStats(activity, Date.parse("2026-11-16T00:00:00Z"), 7);
  assert.deepEqual(s.completed, { value: 4, delta: 4 });
  assert.deepEqual(s.exams, { value: 1, delta: 1 });
  assert.deepEqual(s.graded, { value: 2, delta: 2 });
});

test("months follow Vietnam time and wrap at January", () => {
  assert.equal(monthOf(Date.parse("2026-10-31T18:00:00Z")).key, "2026-11"); // 01:00 on 1 Nov in Vietnam
  assert.equal(previousMonth(monthOf(Date.parse("2026-01-10T00:00:00Z"))).key, "2025-12");
  assert.deepEqual(activeMonths(activity, Date.parse("2026-11-18T00:00:00Z")).map((m) => m.key), ["2026-11", "2026-10"]);
  assert.deepEqual(monthStats(activity, monthOf(Date.parse("2026-11-18T00:00:00Z"))).completed, { value: 4, delta: 2 });
});

test("lastDays gives 7 Vietnam-time days ending today, oldest first", () => {
  const now = Date.parse("2026-11-24T18:30:00Z"); // 01:30 on Wed 25 Nov in Vietnam
  const days = lastDays(now, 7);
  assert.equal(days.length, 7);
  assert.deepEqual(days.map((d) => d.label), ["T5 19/11", "T6 20/11", "T7 21/11", "CN 22/11", "T2 23/11", "T3 24/11", "T4 25/11"]);
  assert.equal(days.at(-1)!.key, "2026-11-25");
  assert.equal(days.at(-1)!.from, Date.parse("2026-11-24T17:00:00Z")); // midnight in Vietnam
  assert.ok(days.at(-1)!.from <= now && now < days.at(-1)!.to);
  assert.equal(lastDays(Date.parse("2026-11-24T16:59:59Z"), 1)[0].key, "2026-11-24"); // 23:59:59 in Vietnam
});
