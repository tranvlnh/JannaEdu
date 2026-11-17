import assert from "node:assert/strict";
import { test } from "node:test";
import { overallBand } from "../skills.ts";
import { questionCount, readingTest } from "./exam.ts";
import { mockTestResults, speakingSession } from "./student.ts";

test("đề Reading: số câu liên tục 1..N và có đủ đáp án", () => {
  const ns = readingTest.passages.flatMap((p) => p.groups.flatMap((g) => g.questions.map((q) => q.n)));
  assert.deepEqual(ns, Array.from({ length: questionCount(readingTest) }, (_, i) => i + 1));
  assert.deepEqual(Object.keys(readingTest.answers).map(Number), ns);
});

test("số liệu mock khớp với mockup", () => {
  assert.equal(overallBand(mockTestResults[0].scores), 7);
  const avg = speakingSession.criteria.reduce((s, c) => s + c.score, 0) / speakingSession.criteria.length;
  assert.equal(Math.round(avg * 2) / 2, 7.5);
});
