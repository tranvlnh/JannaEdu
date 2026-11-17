import assert from "node:assert/strict";
import { test } from "node:test";
import { pathTimeline, weekRange } from "./path.ts";

const DAY = 24 * 60 * 60 * 1000;
const start = "2026-11-01T00:00:00Z";
const stages = [{ weeks: 2 }, { weeks: 3 }, { weeks: 1 }];

test("a new path starts in week 1 of the first stage", () => {
  const t = pathTimeline(stages, start, Date.parse(start));
  assert.deepEqual(t.stages.map((s) => s.status), ["current", "locked", "locked"]);
  assert.equal(t.currentWeek, 1);
  assert.equal(t.totalWeeks, 6);
});

test("stages finish as the weeks pass", () => {
  const t = pathTimeline(stages, start, Date.parse(start) + 17.5 * DAY); // 2.5 weeks in
  assert.deepEqual(t.stages.map((s) => s.status), ["done", "current", "locked"]);
  assert.deepEqual(t.stages.map((s) => [s.firstWeek, s.lastWeek]), [[1, 2], [3, 5], [6, 6]]);
  assert.equal(t.stages[1].progress, 17);
  assert.equal(t.currentWeek, 3);
});

test("past the end everything is done and the week stops at the last one", () => {
  const t = pathTimeline(stages, start, Date.parse(start) + 100 * DAY);
  assert.ok(t.stages.every((s) => s.status === "done" && s.progress === 100));
  assert.equal(t.currentWeek, 6);
});

test("weekRange", () => {
  assert.equal(weekRange(3, 3), "Tuần 3");
  assert.equal(weekRange(3, 5), "Tuần 3 – 5");
});
