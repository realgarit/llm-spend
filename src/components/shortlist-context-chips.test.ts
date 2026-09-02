import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComparedRow } from "@/lib/scenario";
import { SHORTLIST_LIMIT } from "@/lib/shortlist";
import { ShortlistContextChips } from "@/components/shortlist-context-chips";

/** Full-shaped `ComparedRow` fixture, mirroring `row()` in shortlist-tray.test.ts. */
function row(
  id: string,
  model: string,
  totalUsd: number,
  overrides: Partial<ComparedRow["row"]> = {},
): ComparedRow {
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
      ...overrides,
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

function render(props: { rows: ComparedRow[]; onRemove?: (id: string) => void }) {
  return renderToStaticMarkup(createElement(ShortlistContextChips, props));
}

test("renders nothing when the shortlist is empty — no chips, no wrapper, no empty-state copy", () => {
  assert.equal(render({ rows: [] }), "");
});

test("renders one chip per pinned row with a provider/model label, tier badge, and workload price", () => {
  const rows = [row("qwen--qwen3-8-max--direct", "Qwen3.8 Max", 12.34)];
  const html = render({ rows });

  assert.match(html, /Qwen · Qwen3\.8 Max/);
  assert.match(html, /Direct API/); // TierBadge label for tier: "Direct"
  assert.match(html, /\$12\.34/);
});

test("links each chip to /models/{laneId} — the same stable lane id used everywhere else", () => {
  const rows = [row("qwen--qwen3-8-max--direct", "Qwen3.8 Max", 1)];
  const html = render({ rows });
  assert.match(html, /href="\/models\/qwen--qwen3-8-max--direct"/);
});

test("appends the host, when present, to the chip label", () => {
  const rows = [row("id-1", "GLM-5.2", 3, { host: "Fireworks" })];
  const html = render({ rows });
  assert.match(html, /GLM-5\.2 — Fireworks/);
});

test("omits the host suffix when the row has no host", () => {
  const rows = [row("id-1", "Solo Model", 3)];
  const html = render({ rows });
  const labelMatch = html.match(/<a[^>]*shortlist-chip-label[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(labelMatch, "expected a chip label link in the markup");
  assert.equal(labelMatch![1], "Qwen · Solo Model");
});

test("renders chips in the given (pin) order, not re-sorted", () => {
  const rows = [row("b", "Beta Model", 2), row("a", "Alpha Model", 1)];
  const html = render({ rows });
  assert.ok(
    html.indexOf("Beta Model") < html.indexOf("Alpha Model"),
    "expected Beta Model (pinned first) to appear before Alpha Model in the markup",
  );
});

test("shows the pinned count against the shortlist cap", () => {
  const rows = [row("a", "A", 1), row("b", "B", 2)];
  const html = render({ rows });
  assert.match(html, new RegExp(`2/${SHORTLIST_LIMIT}`));
});

test("the strip is an accessible, labeled region", () => {
  const rows = [row("a", "A", 1)];
  const html = render({ rows });
  assert.match(html, /aria-label="Pinned shortlist"/);
});

test("is read-only by default: no aria-pressed remove control anywhere", () => {
  const rows = [row("a", "A", 1), row("b", "B", 2)];
  const html = render({ rows });
  assert.doesNotMatch(html, /aria-pressed/);
});

test("when onRemove is provided, every chip gets an explicit pressed state and accessible unpin name", () => {
  const rows = [row("a", "Alpha Model", 1), row("b", "Beta Model", 2)];
  const html = render({ rows, onRemove: () => undefined });

  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
  assert.match(html, /aria-label="Unpin Alpha Model from shortlist"/);
  assert.match(html, /aria-label="Unpin Beta Model from shortlist"/);
});

test("multiple pinned lanes each render their own price, not a shared/aggregate figure", () => {
  const rows = [row("a", "Cheap Model", 1.5), row("b", "Pricey Model", 42)];
  const html = render({ rows });
  assert.match(html, /\$1\.50/);
  assert.match(html, /\$42\.00/);
});
