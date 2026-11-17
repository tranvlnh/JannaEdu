import assert from "node:assert/strict";
import { test } from "node:test";
import { formatClock, parseDraft } from "./exam-draft.ts";

test("formatClock", () => {
  assert.equal(formatClock(2400), "40:00");
  assert.equal(formatClock(154), "02:34");
  assert.equal(formatClock(3661), "1:01:01");
  assert.equal(formatClock(-5), "00:00");
});

test("parseDraft chịu được dữ liệu hỏng", () => {
  assert.deepEqual(parseDraft(null).answers, {});
  assert.deepEqual(parseDraft("{not json").flagged, []);
  assert.equal(parseDraft('{"answers":{"1":"iv"}}').answers[1], "iv");
  assert.equal(parseDraft('{"answers":{}}').startedAt, null);
});
