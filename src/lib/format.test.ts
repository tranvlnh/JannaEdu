import assert from "node:assert/strict";
import { test } from "node:test";
import { band, formatDate, formatTime } from "./format.ts";

test("format theo giờ VN", () => {
  assert.equal(formatDate("2026-11-10"), "10/11/2026");
  assert.equal(formatTime("2026-11-17T12:30:00Z"), "19:30");
  assert.equal(band(7), "7.0");
});
