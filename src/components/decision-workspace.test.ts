import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sitemap from "@/app/sitemap";
import { buildCompareRows } from "@/data/compare-data";
import { RESULTS_PREVIEW_LIMIT } from "@/lib/compare-insights";
import { encodeCompareState } from "@/lib/compare-state";
import { nav, site } from "@/lib/site";
import { CompareExplorer, DEFAULT_DECISION_STATE } from "@/components/compare-explorer";

/**
 * These render the real `/compare` client component the way the static build
 * does: no `window`, no effects, no `localStorage`. That is exactly the state
 * the server HTML must be in — see the hydration note in compare-explorer.tsx —
 * so anything asserted here is also an assertion that the pre-mount client
 * render (which must be byte-identical) is correct.
 */
const rows = buildCompareRows();

function renderExplorer(): string {
  return renderToStaticMarkup(
    createElement(CompareExplorer, { rows, buildAtMs: Date.parse("2026-09-01T12:00:00Z") }),
  );
}

test("the compare workspace offers share and export actions by name", () => {
  const html = renderExplorer();
  assert.match(html, /Copy scenario link/);
  assert.match(html, /Export CSV/);
});

test("share and export feedback lands in a non-blocking live region", () => {
  const html = renderExplorer();
  const region = html.match(/<[a-z]+[^>]*class="[^"]*\bshare-status\b[^"]*"[^>]*>/);
  assert.ok(region, "expected a .share-status feedback region");
  assert.match(region[0], /aria-live="polite"/);
  assert.match(region[0], /role="status"/);
});

test("every visible result row carries an unpressed pin control with an explicit accessible name", () => {
  const html = renderExplorer();
  assert.equal((html.match(/class="pin-button"/g) ?? []).length, RESULTS_PREVIEW_LIMIT);
  // Nothing is pinned in the build-time render, so every control is unpressed
  // and reads as an action to take, never as one already taken.
  assert.equal(
    (html.match(/class="pin-button" aria-pressed="false"/g) ?? []).length,
    RESULTS_PREVIEW_LIMIT,
  );
  assert.equal((html.match(/aria-label="Pin [^"]+ to shortlist"/g) ?? []).length, RESULTS_PREVIEW_LIMIT);
  assert.doesNotMatch(html, /aria-label="Unpin /);
});

test("result rows still link to their lane cost-anatomy page", () => {
  const html = renderExplorer();
  const links = html.match(/href="\/models\/[^"]+"/g) ?? [];
  assert.equal(links.length, RESULTS_PREVIEW_LIMIT);
  assert.ok(rows.some((row) => links.includes(`href="/models/${row.id}"`)));
});

test("the decision spine is mounted even with nothing pinned, so a late message is never lost", () => {
  const html = renderExplorer();
  assert.match(html, /class="shortlist-tray"/);
  assert.match(html, /class="shortlist-live"/);
  // Nothing pinned yet: no chips, no expand action.
  assert.doesNotMatch(html, /Compare shortlist/);
});

test("the workspace never calls a lane better, best, or recommended", () => {
  const html = renderExplorer();
  assert.doesNotMatch(html, /\bbest\b/i);
  assert.doesNotMatch(html, /\brecommended\b/i);
});

test("the exported default decision state is the URL codec's own default, so /compare stays canonical", () => {
  assert.equal(encodeCompareState(DEFAULT_DECISION_STATE), "");
  assert.deepEqual(DEFAULT_DECISION_STATE.selectedLaneIds, []);
});

test("primary navigation reaches the budget planner and the freshness command center", () => {
  const hrefs = nav.map((item) => item.href);
  assert.ok(hrefs.includes("/budget"), `expected /budget in primary nav, got ${hrefs.join(", ")}`);
  assert.ok(hrefs.includes("/freshness"), `expected /freshness in primary nav, got ${hrefs.join(", ")}`);
  for (const item of nav) assert.ok(item.label.trim().length > 0);
});

test("the sitemap lists the budget and freshness routes exactly once each", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.filter((url) => url === `${site.url}/budget`).length, 1);
  assert.equal(urls.filter((url) => url === `${site.url}/freshness`).length, 1);
  // Task 4's lane detail routes must survive untouched.
  assert.ok(urls.includes(`${site.url}/models/${rows[0].id}`));
});
