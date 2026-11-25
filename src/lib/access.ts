// Who may open which page. Pure, so the proxy stays thin and the rules are unit-tested.
// Server mutations check access again; this only decides where a page request lands.

export type AccessFacts = {
  role: "student" | "parent" | null;
  onboarded: boolean; // student: picked a goal band and a current band (or "Tôi chưa biết")
  needsPlacement: boolean;
  enrolled: boolean; // student: bought a course
  childEnrolled: boolean; // parent: at least one linked child bought a course
};

const isUnder = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
const anyOf = (path: string, exact: string[], prefixes: string[] = []) =>
  exact.includes(path) || prefixes.some((p) => isUnder(path, p));

// Sign-in pages: always reachable so a user can log in or out.
const AUTH = ["/login"];
const AUTH_PREFIXES = ["/auth"];

/** Where to send this request, or null to let it through. `facts` is null for anonymous users. */
export function accessRedirect(pathname: string, facts: AccessFacts | null): string | null {
  if (!facts) return anyOf(pathname, ["/", "/courses", ...AUTH], AUTH_PREFIXES) ? null : "/login";
  const open = (exact: string[], prefixes: string[] = []) => anyOf(pathname, [...exact, ...AUTH], [...prefixes, ...AUTH_PREFIXES]);

  if (!facts.role || (facts.role === "student" && !facts.onboarded)) {
    return open(["/", "/onboarding", "/account"]) ? null : "/onboarding";
  }
  if (facts.role === "parent") {
    return isUnder(pathname, "/parent") && !facts.childEnrolled ? "/account?locked=1" : null;
  }
  if (facts.needsPlacement) {
    return open(["/", "/onboarding", "/account", "/courses"], ["/placement"]) ? null : "/placement";
  }
  if (!facts.enrolled) {
    return open(["/", "/onboarding", "/account", "/courses"], ["/placement"]) ? null : "/courses?locked=1";
  }
  return null;
}
