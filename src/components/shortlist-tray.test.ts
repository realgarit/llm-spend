import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComparedRow } from "@/lib/scenario";
import { SHORTLIST_COMPARE_MIN, SHORTLIST_LIMIT } from "@/lib/shortlist";
import { ShortlistTray } from "@/components/shortlist-tray";

/** Full-shaped `ComparedRow` fixture, mirroring `row()` in decision-cockpit.test.ts. */
function row(id: string, model: string, totalUsd: number): ComparedRow {
  return {
    row: {
      id,
      provider: "Qwen",
      providerSlug: "qwen",
      model,
      tier: "Direct",
      inputUsd: 1,
      cachedUsd: 0.1,
      outputUsd: 4,
      confidence: "official",
      cachedConfidence: "official",
      effectiveDate: "2026-08-30",
    },
    resolved: {
      inputUsd: 1,
      cachedUsd: 0.1,
      outputUsd: 4,
      confidence: "official",
      cachedConfidence: "official",
      variant: null,
      label: null,
    },
    cost: {
      freshInputUsd: totalUsd * 0.4,
      cachedInputUsd: totalUsd * 0.1,
      outputUsd: totalUsd * 0.5,
      totalUsd,
      cacheApplied: true,
      blendedInputPerMUsd: 0.2,
    },
    scenarioPriced: false,
    preview: null,
  };
}

const baseProps = {
  message: null as string | null,
  expanded: false,
  onToggleExpanded: () => undefined,
  onRemove: () => undefined,
  onReset: () => undefined,
  workloadSummary: "60M in / 210K out @ 90% cache",
};

function render(props: Partial<Parameters<typeof ShortlistTray>[0]> & { rows: ComparedRow[] }) {
  return renderToStaticMarkup(createElement(ShortlistTray, { ...baseProps, ...props }));
}

test("an empty shortlist renders no chips, actions, or comparison", () => {
  const html = render({ rows: [] });
  assert.doesNotMatch(html, /Compare shortlist/);
  assert.doesNotMatch(html, /Reset shortlist/);
  assert.doesNotMatch(html, /aria-pressed/);
});

test("names every pinned lane and gives each remove control an explicit pressed state and accessible name", () => {
  const rows = [row("a", "Qwen3.8 Max", 5), row("b", "GPT-5.6 Luna", 3)];
  const html = render({ rows });

  assert.match(html, /Qwen3\.8 Max/);
  assert.match(html, /GPT-5\.6 Luna/);
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
  assert.match(html, /aria-label="Unpin Qwen3\.8 Max from shortlist"/);
  assert.match(html, /aria-label="Unpin GPT-5\.6 Luna from shortlist"/);
});

test("shows the pinned count against the cap and the active workload summary", () => {
  const html = render({ rows: [row("a", "Model A", 1), row("b", "Model B", 2)] });
  assert.match(html, new RegExp(`2/${SHORTLIST_LIMIT}`));
  assert.match(html, /60M in \/ 210K out @ 90% cache/);
});

test("the expand action is disabled below SHORTLIST_COMPARE_MIN pinned lanes, with an accessible explanation", () => {
  assert.equal(SHORTLIST_COMPARE_MIN, 2);
  const html = render({ rows: [row("a", "Only One", 1)] });
  assert.match(html, /Compare shortlist/);
  assert.match(html, /<button[^>]*disabled[^>]*>\s*Compare shortlist/);
});

test("the expand action is enabled at or above SHORTLIST_COMPARE_MIN pinned lanes", () => {
  const html = render({ rows: [row("a", "One", 1), row("b", "Two", 2)] });
  assert.doesNotMatch(html, /<button[^>]*disabled[^>]*>\s*Compare shortlist/);
});

test("expanding with fewer than SHORTLIST_COMPARE_MIN lanes shows an explicit unavailable state, not a broken comparison", () => {
  const html = render({ rows: [row("a", "Solo Lane", 1)], expanded: true });
  assert.match(html, /at least 2/i);
  assert.match(html, /Currently 1 pinned/i);
  assert.doesNotMatch(html, /Lowest cost in this shortlist/);
});

test("the expanded comparison names the cheapest lane as the shortlist baseline, never as best or better", () => {
  const rows = [row("expensive", "Pricey Model", 10), row("cheap", "Bargain Model", 4)];
  const html = render({ rows, expanded: true });

  assert.match(html, /Lowest cost in this shortlist/);
  assert.doesNotMatch(html, /\bbest\b/i);
  assert.doesNotMatch(html, /\bbetter\b/i);
});

test("the expanded comparison shows every other lane's currency and percent delta from the baseline", () => {
  const rows = [row("expensive", "Pricey Model", 10), row("cheap", "Bargain Model", 4)];
  const html = render({ rows, expanded: true });

  // (10 - 4) / 4 * 100 = 150%
  assert.match(html, /\+\$6\.00/);
  assert.match(html, /\+150%/);
});

test("the expanded comparison renders resolved input/cached/output, blended input, tier, host, and total USD/CHF", () => {
  const rows = [row("a", "Alpha Model", 8), row("b", "Beta Model", 4)];
  const html = render({ rows, expanded: true });

  assert.match(html, /Input \/ 1M/);
  assert.match(html, /Cached \/ 1M/);
  assert.match(html, /Output \/ 1M/);
  assert.match(html, /Blended input/);
  assert.match(html, /Direct API/); // TierBadge label for tier: "Direct"
  assert.match(html, /CHF/);
});

test("the expand toggle exposes aria-expanded and reflects the collapsed/expanded state", () => {
  const rows = [row("a", "One", 1), row("b", "Two", 2)];
  assert.match(render({ rows, expanded: false }), /aria-expanded="false"/);
  assert.match(render({ rows, expanded: true }), /aria-expanded="true"/);
});

test("the reset control has a plain, readable accessible name", () => {
  const html = render({ rows: [row("a", "One", 1)] });
  assert.match(html, />\s*Reset shortlist\s*</);
});

test("a rejection message is surfaced in an aria-live region", () => {
  const html = render({
    rows: [row("a", "One", 1), row("b", "Two", 2), row("c", "Three", 3), row("d", "Four", 4)],
    message: "Shortlist is full (4 max) — remove a lane before pinning another.",
  });

  const liveRegionMatch = html.match(/<div[^>]*aria-live="polite"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(liveRegionMatch, "expected an aria-live region in the markup");
  assert.match(liveRegionMatch![0], /role="status"/);
  assert.match(liveRegionMatch![1], /Shortlist is full \(4 max\)/);
});

test("an aria-live region is always present, even with nothing pinned, so a late message is never lost", () => {
  const html = render({ rows: [] });
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="status"/);
});

test("doubles the pressed remove controls when expanded (strip chip + comparison card, both real controls)", () => {
  const rows = [row("a", "One", 1), row("b", "Two", 2), row("c", "Three", 3)];
  assert.equal((render({ rows, expanded: false }).match(/aria-pressed="true"/g) ?? []).length, 3);
  assert.equal((render({ rows, expanded: true }).match(/aria-pressed="true"/g) ?? []).length, 6);
});
