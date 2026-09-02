import { expect, SAMPLE, test } from "./helpers";
import type { Page } from "@playwright/test";

/**
 * Performance budgets, measured against the production standalone build.
 *
 * ## How each number is obtained
 *
 * **LCP and CLS** come from the browser's own Web Vitals instrumentation via
 * `PerformanceObserver` with `buffered: true`, so entries emitted before the
 * observer was created are still delivered — no third-party library, and no
 * risk of measuring a different thing than a real-user monitor would. LCP is
 * the last `largest-contentful-paint` entry's `renderTime || loadTime`; CLS is
 * the sum of `layout-shift` values with `hadRecentInput === false`, which is
 * the standard definition minus the session-window grouping (this page settles
 * long before any window boundary matters, and the un-grouped sum can only
 * over-report, so the budget stays conservative).
 *
 * **Transfer sizes** come from the Resource Timing API rather than from
 * Playwright's response events, because `encodedBodySize` is exactly "bytes on
 * the wire after content-encoding" — what a compressed-JS budget means — while
 * reconstructing that from response bodies would measure the decoded size.
 * `transferSize` (body + headers, and 0 for a cache hit) is reported alongside
 * for context but not asserted on, so a future CDN header change cannot move
 * the gate.
 *
 * Both are sampled at the `load` event and again after the network settles;
 * the assertions use the **load-time** figures, so Next's App Router
 * prefetching of other routes — work that happens after the page is usable, on
 * idle — is not charged to the route under test. The post-settle totals are
 * attached to the report so a prefetch explosion would still be visible.
 *
 * ## What these numbers are and are not
 *
 * They are measured on localhost against a warm server, so they are a
 * *regression* signal — "this route did not suddenly gain 300KB of JavaScript"
 * — not a field measurement. That is the right thing for a build gate: it is
 * stable, and the budgets below are the brief's.
 */
const BUDGET = {
  lcpMs: 4_000,
  cls: 0.1,
  jsBytes: 500 * 1024,
  totalBytes: 1.5 * 1024 * 1024,
} as const;

const ROUTES = ["/", "/compare", "/budget", "/freshness", `/models/${SAMPLE.laneId}`];

interface Sample {
  jsBytes: number;
  totalBytes: number;
  transferBytes: number;
  resourceCount: number;
}

interface Vitals {
  lcpMs: number;
  cls: number;
  atLoad: Sample;
  settled: Sample;
}

/**
 * Installed before any document script runs, so the observers exist for the
 * whole page lifetime and `buffered: true` cannot miss the first paint.
 */
const INSTRUMENT = `
  window.__vitals = { lcp: 0, cls: 0 };
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__vitals.lcp = entry.renderTime || entry.loadTime || entry.startTime;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch (error) {
    window.__vitals.error = String(error);
  }
  window.addEventListener("load", () => {
    window.__vitalsAtLoad = window.__sampleTransfer();
  });
  window.__sampleTransfer = function () {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const isScript = (entry) => entry.initiatorType === "script" || /\\.js(\\?|$)/.test(entry.name);
    const sum = (list, field) => list.reduce((total, entry) => total + (entry[field] || 0), 0);
    return {
      jsBytes: sum(resources.filter(isScript), "encodedBodySize"),
      totalBytes: (nav ? nav.encodedBodySize || 0 : 0) + sum(resources, "encodedBodySize"),
      transferBytes: (nav ? nav.transferSize || 0 : 0) + sum(resources, "transferSize"),
      resourceCount: resources.length,
    };
  };
`;

async function measure(page: Page, path: string): Promise<Vitals> {
  await page.addInitScript(INSTRUMENT);
  await page.goto(path, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  // LCP is only final once the page has stopped painting; a short settle is
  // enough on a static page and keeps the suite fast.
  await page.waitForTimeout(500);

  return page.evaluate(() => {
    const w = window as unknown as {
      __vitals: { lcp: number; cls: number };
      __vitalsAtLoad?: Sample;
      __sampleTransfer: () => Sample;
    };
    const settled = w.__sampleTransfer();
    return {
      lcpMs: w.__vitals.lcp,
      cls: w.__vitals.cls,
      atLoad: w.__vitalsAtLoad ?? settled,
      settled,
    };
  }) as Promise<Vitals>;
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)}KB`;

for (const path of ROUTES) {
  test(`${path} meets the performance budget`, async ({ page }, testInfo) => {
    const vitals = await measure(page, path);

    await testInfo.attach(`perf-${path.replace(/\W+/g, "_")}.txt`, {
      contentType: "text/plain",
      body: [
        `route            ${path}`,
        `LCP              ${vitals.lcpMs.toFixed(0)}ms (budget ${BUDGET.lcpMs}ms)`,
        `CLS              ${vitals.cls.toFixed(4)} (budget ${BUDGET.cls})`,
        `JS at load       ${kb(vitals.atLoad.jsBytes)} (budget ${kb(BUDGET.jsBytes)})`,
        `payload at load  ${kb(vitals.atLoad.totalBytes)} (budget ${kb(BUDGET.totalBytes)})`,
        `JS settled       ${kb(vitals.settled.jsBytes)}`,
        `payload settled  ${kb(vitals.settled.totalBytes)}`,
        `wire settled     ${kb(vitals.settled.transferBytes)} over ${vitals.settled.resourceCount} resources`,
      ].join("\n"),
    });

    // A zero LCP would mean the observer never fired, which makes the budget
    // vacuous — assert it actually measured something before comparing it.
    expect(vitals.lcpMs, `${path}: no LCP entry was recorded`).toBeGreaterThan(0);
    expect(vitals.lcpMs, `${path}: LCP ${vitals.lcpMs.toFixed(0)}ms`).toBeLessThanOrEqual(BUDGET.lcpMs);
    expect(vitals.cls, `${path}: CLS ${vitals.cls.toFixed(4)}`).toBeLessThanOrEqual(BUDGET.cls);
    expect(
      vitals.atLoad.jsBytes,
      `${path}: ${kb(vitals.atLoad.jsBytes)} of compressed JS`,
    ).toBeLessThanOrEqual(BUDGET.jsBytes);
    expect(
      vitals.atLoad.totalBytes,
      `${path}: ${kb(vitals.atLoad.totalBytes)} of total payload`,
    ).toBeLessThanOrEqual(BUDGET.totalBytes);

    // Closes the obvious loophole in an at-load budget: deferring the bundle
    // past `load` would make the assertions above pass while shipping exactly
    // as much JavaScript. Currently ~160KB against a 500KB budget, so this has
    // room to absorb ordinary prefetching without becoming flaky.
    expect(
      vitals.settled.jsBytes,
      `${path}: ${kb(vitals.settled.jsBytes)} of compressed JS once the network settled`,
    ).toBeLessThanOrEqual(BUDGET.jsBytes);
  });
}

test("the compare page does not shift layout while it is being used", async ({ page }) => {
  // CLS at load says nothing about the interactions this page is built around:
  // filtering, disclosure and pinning all rewrite the table, and the fixed
  // shortlist spine appears over the content. None of it may move the page
  // under the reader.
  await page.addInitScript(INSTRUMENT);
  await page.goto("/compare", { waitUntil: "load" });
  await page.waitForLoadState("networkidle");

  const baseline = await page.evaluate(() => (window as unknown as { __vitals: { cls: number } }).__vitals.cls);

  await page.getByRole("button", { name: /RAG-heavy/ }).click();
  await page.getByLabel("Search provider, model, or host").fill("deepseek");
  await page.locator("table.decision-table tbody tr").first().locator("button.pin-button").click();
  await expect(page.locator(".shortlist-chip-label")).toHaveCount(1);
  await page.waitForTimeout(500);

  const after = await page.evaluate(() => (window as unknown as { __vitals: { cls: number } }).__vitals.cls);
  // Shifts caused by the visitor's own click are excluded by `hadRecentInput`,
  // so what is left here is unattributed movement.
  expect(after - baseline, `interaction added ${(after - baseline).toFixed(4)} of layout shift`).toBeLessThanOrEqual(
    BUDGET.cls,
  );
});
