import assert from "node:assert/strict";
import test from "node:test";

import { compareNullsLast, compareRows, type SortableRow } from "./compare-sort";

/** Minimal fixture builder — only the fields `compareRows` reads. */
function row(
  overrides: Partial<{
    provider: string;
    model: string;
    tier: string;
    inputUsd: number;
    cachedUsd: number | null;
    outputUsd: number;
    blended: number;
    total: number;
  }> = {},
): SortableRow {
  const {
    provider = "Provider",
    model = "Model",
    tier = "Direct",
    inputUsd = 1,
    cachedUsd = 0.1,
    outputUsd = 2,
    blended = 1,
    total = 10,
  } = overrides;
  return {
    row: { provider, model, tier },
    resolved: { inputUsd, cachedUsd, outputUsd },
    cost: { blendedInputPerMUsd: blended, totalUsd: total },
  };
}

test("compareNullsLast: a null value sorts after a real number ascending", () => {
  assert.ok(compareNullsLast(null, 5, 1) > 0, "null after real");
  assert.ok(compareNullsLast(5, null, 1) < 0, "real before null");
});

test("compareNullsLast: a null value STILL sorts after a real number descending", () => {
  // This is the exact bug: substituting Infinity for null and flipping the
  // sign via `dir` used to put null first once `dir` went negative.
  assert.ok(compareNullsLast(null, 5, -1) > 0, "null after real");
  assert.ok(compareNullsLast(5, null, -1) < 0, "real before null");
});

test("compareNullsLast: two nulls are equal in either direction", () => {
  assert.equal(compareNullsLast(null, null, 1), 0);
  assert.equal(compareNullsLast(null, null, -1), 0);
});

test("compareNullsLast: two real numbers reverse order with dir, like a plain numeric compare", () => {
  assert.ok(compareNullsLast(1, 2, 1) < 0, "asc: lower first");
  assert.ok(compareNullsLast(1, 2, -1) > 0, "desc: higher first");
});

test("compareRows('cachedUsd'): no-cache-meter rows sort last both ascending and descending", () => {
  // Fixture named after the real rows that surfaced this bug on /compare.
  const mistral = row({ model: "Mistral Medium 3.5", cachedUsd: null });
  const grok = row({ model: "Grok 4.1 Fast", cachedUsd: null });
  const cheapCache = row({ model: "Cheap cache", cachedUsd: 0.1 });
  const pricedCache = row({ model: "Genuine $1/M cache", cachedUsd: 1.0 });
  const rows = [mistral, cheapCache, grok, pricedCache];

  const asc = [...rows].sort((a, b) => compareRows(a, b, "cachedUsd", "asc"));
  assert.deepEqual(
    asc.map((r) => r.resolved.cachedUsd),
    [0.1, 1.0, null, null],
    "ascending: real values low-to-high, both null rows trail",
  );

  const desc = [...rows].sort((a, b) => compareRows(a, b, "cachedUsd", "desc"));
  assert.deepEqual(
    desc.map((r) => r.resolved.cachedUsd),
    [1.0, 0.1, null, null],
    "descending: real values high-to-low, null rows STILL trail (the reported bug)",
  );
});

test("compareRows('total'): unaffected numeric column still reverses with direction (regression guard)", () => {
  const cheap = row({ total: 5 });
  const mid = row({ total: 10 });
  const pricey = row({ total: 20 });
  const rows = [pricey, cheap, mid];

  assert.deepEqual(
    [...rows].sort((a, b) => compareRows(a, b, "total", "asc")).map((r) => r.cost.totalUsd),
    [5, 10, 20],
  );
  assert.deepEqual(
    [...rows].sort((a, b) => compareRows(a, b, "total", "desc")).map((r) => r.cost.totalUsd),
    [20, 10, 5],
  );
});

test("compareRows('provider'): string column still reverses with direction (regression guard)", () => {
  const alpha = row({ provider: "Alpha" });
  const beta = row({ provider: "Beta" });
  const gamma = row({ provider: "Gamma" });
  const rows = [gamma, alpha, beta];

  assert.deepEqual(
    [...rows].sort((a, b) => compareRows(a, b, "provider", "asc")).map((r) => r.row.provider),
    ["Alpha", "Beta", "Gamma"],
  );
  assert.deepEqual(
    [...rows].sort((a, b) => compareRows(a, b, "provider", "desc")).map((r) => r.row.provider),
    ["Gamma", "Beta", "Alpha"],
  );
});
