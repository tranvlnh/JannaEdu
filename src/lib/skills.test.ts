import assert from "node:assert/strict";
import { test } from "node:test";
import { overallBand } from "./skills.ts";

test("overallBand làm tròn theo quy tắc IELTS", () => {
  assert.equal(overallBand({ listening: 7, reading: 6.5, writing: 5.5, speaking: 5.5 }), 6); // 6.125
  assert.equal(overallBand({ listening: 6.5, reading: 6.5, writing: 5, speaking: 7 }), 6.5); // 6.25 → 6.5
  assert.equal(overallBand({ listening: 7.5, reading: 7.5, writing: 6, speaking: 6 }), 7); // 6.75 → 7
  assert.equal(overallBand({ listening: 6, reading: 6, writing: 6, speaking: 6.5 }), 6); // 6.125
});
