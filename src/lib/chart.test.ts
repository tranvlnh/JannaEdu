import assert from "node:assert/strict";
import { test } from "node:test";
import { arcPath, conicGradient, polar, scale } from "./chart.ts";

test("conicGradient chia theo tỉ lệ", () => {
  assert.equal(
    conicGradient([
      { value: 1, color: "red" },
      { value: 3, color: "blue" },
    ]),
    "conic-gradient(red 0% 25%, blue 25% 100%)",
  );
  assert.match(conicGradient([]), /surface/);
});

test("scale map + clamp", () => {
  assert.equal(scale(6, [4, 8], [200, 0]), 100); // trục y lật
  assert.equal(scale(10, [4, 8], [0, 100]), 100);
  assert.equal(scale(5, [5, 5], [0, 100]), 0);
});

test("polar + arcPath", () => {
  assert.deepEqual(polar(50, 50, 40, 0), { x: 50, y: 10 }); // 12 giờ
  assert.deepEqual(polar(50, 50, 40, 90), { x: 90, y: 50 }); // 3 giờ
  assert.match(arcPath(50, 50, 40, 0, 270), / 0 1 1 /); // large-arc khi > 180°
});
