import assert from "node:assert/strict";
import { test } from "node:test";
import { band, formatClock, formatDate, formatTime } from "./format.ts";

test("format theo giờ VN", () => {
  assert.equal(formatDate("2026-11-10"), "10/11/2026");
  assert.equal(formatTime("2026-11-17T12:30:00Z"), "19:30");
  assert.equal(band(7), "7.0");
});

test("formatClock", () => {
  assert.equal(formatClock(2400), "40:00");
  assert.equal(formatClock(154), "02:34");
  assert.equal(formatClock(3661), "1:01:01");
  assert.equal(formatClock(-5), "00:00");
});
