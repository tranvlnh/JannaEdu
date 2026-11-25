import assert from "node:assert/strict";
import { test } from "node:test";
import { accessRedirect, type AccessFacts } from "./access.ts";

const student: AccessFacts = { role: "student", onboarded: true, needsPlacement: false, enrolled: true, childEnrolled: false };
const parent: AccessFacts = { role: "parent", onboarded: true, needsPlacement: false, enrolled: false, childEnrolled: true };

test("khách: chỉ trang công khai, còn lại về /login", () => {
  for (const p of ["/", "/login", "/courses", "/auth/callback"]) assert.equal(accessRedirect(p, null), null, p);
  for (const p of ["/home", "/account", "/placement", "/parent", "/onboarding"]) assert.equal(accessRedirect(p, null), "/login", p);
});

test("chưa chọn vai trò: về /onboarding", () => {
  const facts = { ...student, role: null };
  for (const p of ["/", "/onboarding", "/account", "/login", "/auth/callback"]) assert.equal(accessRedirect(p, facts), null, p);
  for (const p of ["/home", "/courses", "/parent", "/placement"]) assert.equal(accessRedirect(p, facts), "/onboarding", p);
});

test("học sinh chưa trả lời band hiện tại: về /onboarding", () => {
  const facts = { ...student, onboarded: false };
  assert.equal(accessRedirect("/home", facts), "/onboarding");
  assert.equal(accessRedirect("/onboarding", facts), null);
});

test("học sinh cần thi xếp lớp: chỉ /placement và vài trang mở", () => {
  const facts = { ...student, needsPlacement: true };
  for (const p of ["/placement", "/placement/test/x", "/onboarding", "/account", "/courses", "/"]) assert.equal(accessRedirect(p, facts), null, p);
  for (const p of ["/home", "/mock-test", "/examiner", "/path", "/placementx"]) assert.equal(accessRedirect(p, facts), "/placement", p);
});

test("học sinh chưa mua khóa: trang học bị khóa", () => {
  const facts = { ...student, enrolled: false };
  for (const p of ["/", "/courses", "/account", "/onboarding", "/placement", "/placement/writing/x"]) assert.equal(accessRedirect(p, facts), null, p);
  for (const p of ["/home", "/mock-test", "/mock-test/abc", "/examiner", "/path", "/progress", "/academy"]) {
    assert.equal(accessRedirect(p, facts), "/courses?locked=1", p);
  }
});

test("học sinh đã mua: vào hết", () => {
  for (const p of ["/home", "/mock-test/abc", "/examiner", "/path", "/placement"]) assert.equal(accessRedirect(p, student), null, p);
});

test("phụ huynh: /parent theo con", () => {
  assert.equal(accessRedirect("/parent", parent), null);
  assert.equal(accessRedirect("/parent/report", parent), null);
  const locked = { ...parent, childEnrolled: false };
  assert.equal(accessRedirect("/parent", locked), "/account?locked=1");
  assert.equal(accessRedirect("/parent/path", locked), "/account?locked=1");
  assert.equal(accessRedirect("/account", locked), null);
});
