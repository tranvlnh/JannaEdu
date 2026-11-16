import assert from "node:assert/strict";
import { test } from "node:test";
import { isCorrect, toBand } from "./grading.ts";

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
