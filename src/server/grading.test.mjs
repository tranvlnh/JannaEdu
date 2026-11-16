import assert from "node:assert/strict";
import { test } from "node:test";
import { isCorrect, latestBands, overallBand, toBand } from "./grading.ts";

test("latestBands takes the newest result per skill and needs all four for an overall", () => {
  const partial = latestBands([
    { skill: "reading", band: 7 },
    { skill: "reading", band: 5 },
    { skill: "writing", band: 6 },
  ]);
  assert.deepEqual(partial.bands, { reading: 7, listening: null, writing: 6, speaking: null });
  assert.equal(partial.overall, null);

  const full = latestBands([
    { skill: "reading", band: 7 },
    { skill: "listening", band: 6.5 },
    { skill: "writing", band: 6 },
    { skill: "speaking", band: 6 },
  ]);
  assert.equal(full.overall, 6.5); // 6.375 rounds to 6.5
});

test("isCorrect ignores case and extra whitespace", () => {
  assert.ok(isCorrect("  Not   Given ", ["NOT GIVEN"]));
  assert.ok(isCorrect("colour", ["color", "colour"]));
  assert.ok(!isCorrect("true", ["false"]));
  assert.ok(!isCorrect(null, ["true"]));
  assert.ok(!isCorrect("", ["true"]));
});

test("toBand follows the band boundaries", () => {
  assert.equal(toBand("reading", 40, 40), 9);
  assert.equal(toBand("reading", 30, 40), 7);
  assert.equal(toBand("reading", 29, 40), 6.5);
  assert.equal(toBand("listening", 32, 40), 7.5);
  assert.equal(toBand("reading", 32, 40), 7);
  assert.equal(toBand("listening", 0, 40), 0);
});

test("toBand scales tests that do not have 40 questions", () => {
  assert.equal(toBand("reading", 10, 13), 7); // 31/40
  assert.equal(toBand("reading", 0, 0), 0);
});

test("overallBand rounds the mean to the nearest half band", () => {
  assert.equal(overallBand([6, 6, 6, 7]), 6.5); // 6.25 rounds up
  assert.equal(overallBand([6, 7, 7, 7]), 7); // 6.75 rounds up
  assert.equal(overallBand([6.5, 6.5, 6, 6]), 6.5); // 6.25
  assert.equal(overallBand([6, 6, 6, 6.5]), 6); // 6.125 rounds down
  assert.equal(overallBand([7, 7, 7, 7]), 7);
});
