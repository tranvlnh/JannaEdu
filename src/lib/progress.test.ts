import assert from "node:assert/strict";
import { test } from "node:test";
import { activeMonths, bandSeries, lastSevenDays, bandsAt, monthOf, monthStats, overallOf, previousMonth, rangeStats, type Activity } from "./progress.ts";

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

test("the 7-day chart uses Vietnam midnight and stops at the current time", () => {
  const now = Date.parse("2026-12-01T17:05:00Z");
  const days = lastSevenDays(now);
  assert.equal(days.length, 7);
  assert.equal(days[0].day, "2026-11-26");
  assert.equal(days[5].end, Date.parse("2026-12-01T16:59:59.999Z"));
  assert.deepEqual(days[6], { day: "2026-12-02", end: now });

  const reading = [
    item("reading", 6, "2026-12-01T17:00:00Z"),
    item("reading", 5.5, "2026-12-01T16:59:00Z"),
  ];
  const series = bandSeries(reading, days.map(({ end }) => end));
  assert.deepEqual(series.reading.slice(-2), [5.5, 6]);
  assert.ok(series.overall.every((value) => value === null));
});
