import { test as base, expect, type Page } from "@playwright/test";
import { buildCompareRows } from "@/data/compare-data";

/**
 * What a guard caught. `kind` groups violations in the failure message so a
 * red run says *which* of the six checks tripped without reading the trace.
 */
export interface GuardViolation {
  kind: "console" | "pageerror" | "request" | "hydration" | "overflow" | "non-finite";
  detail: string;
}

export interface PageGuards {
  /** Everything recorded so far, in the order it happened. */
  readonly violations: readonly GuardViolation[];
  /**
   * Run the DOM-state checks (horizontal overflow, non-finite text) against the
   * page as it looks *right now* and record anything wrong. The event-driven
   * checks (console, page errors, requests) record continuously and need no
   * call. Safe to call repeatedly; a closed or navigating page is skipped
   * rather than treated as a violation.
   */
  inspect(): Promise<void>;
  /** Throw with every recorded violation if any were recorded. */
  assertClean(): void;
  /**
   * Drop violations whose detail matches `pattern`, for the rare case where the
   * failure *is* the thing under test — a spec that deliberately requests a
   * missing route, say. Keep the pattern as narrow as the expectation; a broad
   * one silently disarms the guard for the whole test.
   */
  allow(pattern: RegExp): void;
}

/**
 * Text that must never reach a rendered page. `undefined` is included because
 * a template hole (`${maybe}`) renders it verbatim, and `NaN`/`Infinity` are
 * the two ways a division or a cleared numeric input leaks arithmetic into the
 * UI — the exact class of bug an earlier task fixed in the budget planner.
 * Word boundaries keep `-Infinity` and `$NaN` in scope while ignoring
 * substrings inside longer identifiers.
 */
const NON_FINITE_TEXT = /\b(NaN|Infinity|undefined)\b/g;

/**
 * Console text that means React could not reconcile the server HTML with the
 * client's first render. These arrive as ordinary console errors too, but are
 * classified separately so the failure names the actual problem: this app is
 * `force-static` everywhere and resolves time-sensitive rates through a
 * pre-mount `buildAtMs` fallback specifically to avoid this, so a hydration
 * diagnostic is a real regression in that mechanism, not noise.
 */
const HYDRATION_PATTERNS = [
  /hydrat/i,
  /did not match/i,
  /text content does not match/i,
  /server rendered html/i,
  /server-rendered html/i,
];

/**
 * Install the page guards described in the task brief:
 *
 *  1. any console error,
 *  2. any uncaught page exception,
 *  3. any failed same-origin network request (transport failure or >= 400),
 *  4. document-level horizontal overflow at the current viewport
 *     (`documentElement.scrollWidth > documentElement.clientWidth`),
 *  5. any Next.js/React hydration-mismatch diagnostic, and
 *  6. visible `NaN` / `Infinity` / `undefined` text anywhere in the page.
 *
 * Checks 1-3 and 5 are event-driven and start recording immediately. Checks 4
 * and 6 read the DOM, so they run on {@link PageGuards.inspect} — which the
 * auto-fixture below calls at the end of every test, and which specs that walk
 * through several UI states should call again at each state worth pinning.
 *
 * Prefer importing `test` from this module (it installs and asserts these for
 * every test automatically) over calling this by hand; the export exists so a
 * spec can hold the handle and inspect mid-test.
 */
export function installPageGuards(page: Page): PageGuards {
  const violations: GuardViolation[] = [];
  const allowed: RegExp[] = [];
  const origin = new URL(baseUrl()).origin;

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    const kind = HYDRATION_PATTERNS.some((pattern) => pattern.test(text)) ? "hydration" : "console";
    const where = message.location().url;
    violations.push({ kind, detail: where ? `${text} (${where})` : text });
  });

  page.on("pageerror", (error) => {
    violations.push({ kind: "pageerror", detail: `${error.name}: ${error.message}` });
  });

  page.on("requestfailed", (request) => {
    if (!request.url().startsWith(origin)) return;
    // An aborted request is how a browser cancels work it no longer needs
    // (a navigation superseding an in-flight fetch, a prefetch dropped on
    // teardown). That is not a broken resource, so it is not a violation.
    const failure = request.failure()?.errorText ?? "unknown";
    if (failure === "net::ERR_ABORTED") return;
    violations.push({ kind: "request", detail: `${request.method()} ${request.url()} failed: ${failure}` });
  });

  page.on("response", (response) => {
    if (!response.url().startsWith(origin)) return;
    if (response.status() < 400) return;
    violations.push({ kind: "request", detail: `${response.status()} ${response.request().method()} ${response.url()}` });
  });

  return {
    violations,
    async inspect() {
      if (page.isClosed()) return;
      let state: { scrollWidth: number; clientWidth: number; nonFinite: string[]; url: string };
      try {
        state = await page.evaluate((pattern: string) => {
          const doc = document.documentElement;
          const text = document.body?.innerText ?? "";
          const matches = text.match(new RegExp(pattern, "g")) ?? [];
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            nonFinite: [...new Set(matches)],
            url: window.location.href,
          };
        }, NON_FINITE_TEXT.source);
      } catch {
        // Page closed or mid-navigation — nothing meaningful to measure.
        return;
      }

      if (state.scrollWidth > state.clientWidth) {
        violations.push({
          kind: "overflow",
          detail:
            `${state.url} overflows horizontally: documentElement.scrollWidth ${state.scrollWidth} > ` +
            `clientWidth ${state.clientWidth}`,
        });
      }
      if (state.nonFinite.length > 0) {
        violations.push({
          kind: "non-finite",
          detail: `${state.url} renders non-finite text: ${state.nonFinite.join(", ")}`,
        });
      }
    },
    assertClean() {
      const unexpected = violations.filter(
        (violation) => !allowed.some((pattern) => pattern.test(violation.detail)),
      );
      if (unexpected.length === 0) return;
      const lines = unexpected.map((violation) => `  [${violation.kind}] ${violation.detail}`);
      throw new Error(`Page guards caught ${unexpected.length} violation(s):\n${lines.join("\n")}`);
    },
    allow(pattern: RegExp) {
      allowed.push(pattern);
    },
  };
}

/**
 * `test` with the page guards wired in.
 *
 * The guards are an `auto` fixture rather than something each spec remembers to
 * call: a guard nobody installed is a guard that silently stops guarding, and
 * the whole point is that a future change cannot regress console cleanliness,
 * overflow or hydration without a red test.
 *
 * The teardown skips its own assertion when the test already failed, so a
 * genuine failure is not buried under the console noise it caused.
 */
export const test = base.extend<{ pageGuards: PageGuards }>({
  pageGuards: [
    async ({ page }, use, testInfo) => {
      const guards = installPageGuards(page);
      await use(guards);
      if (testInfo.errors.length > 0) return;
      await guards.inspect();
      guards.assertClean();
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Navigate and wait until the page is interactive.
 *
 * Every route is `force-static`, so the HTML arrives complete and the only
 * thing worth waiting for is hydration: React attaching listeners is what makes
 * the presets, filters and pin controls respond. `domcontentloaded` plus a
 * settled network is the cheapest reliable proxy — `load` alone can win the
 * race against the client bundle, and `networkidle` alone is slower without
 * being more correct here.
 */
export async function gotoGuarded(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
}

/** Assert no document-level horizontal overflow at whatever viewport is active. */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `document overflows horizontally at ${JSON.stringify(page.viewportSize())}`,
  ).toBeLessThanOrEqual(clientWidth);
}

/**
 * The origin the suite is testing, read from the Playwright config's `baseURL`
 * so the guards and the config can never disagree about what "same-origin"
 * means.
 */
export function baseUrl(): string {
  const configured = base.info().project.use.baseURL;
  if (!configured) throw new Error("playwright.config.ts must define use.baseURL");
  return configured;
}

/**
 * One real lane and one real provider, read from the catalog itself.
 *
 * The dynamic routes are tested with a single parameter each — the page
 * component is identical across all 66 lanes and 10 providers, so sweeping them
 * would multiply runtime without covering new code. Deriving the parameter from
 * `buildCompareRows()` rather than hard-coding an id keeps that choice valid
 * through the daily catalog edits this repo lives on: a hard-coded lane that
 * gets renamed or pruned would fail as a 404 that looks like a routing bug.
 *
 * Safe to import here: `compare-data` is plain data plus `lib/lane-id`, with no
 * React and no browser APIs.
 */
const catalogRows = buildCompareRows();
const sampleRow = catalogRows[0];

export const SAMPLE = {
  laneId: sampleRow.id,
  model: sampleRow.model,
  providerSlug: sampleRow.providerSlug,
  providerName: sampleRow.provider,
} as const;

/** Escape a catalog string (model names contain `.`, `/`, `+`) for use in a RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
