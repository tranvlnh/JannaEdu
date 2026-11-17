import assert from "node:assert/strict";
import { test } from "node:test";
import { formatClock, grade, parseDraft } from "./exam-draft.ts";

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

test("grade chuẩn hóa khoảng trắng + hoa thường", () => {
  const r = grade({ 1: "iv", 2: "  Reaction   Times ", 3: "" }, { 1: "iv", 2: "reaction times", 3: "TRUE" });
  assert.deepEqual(r.map((x) => x.ok), [true, true, false]);
});
