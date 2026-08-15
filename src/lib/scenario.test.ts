import assert from "node:assert/strict";
import test from "node:test";

import { buildCompareRows, type CompareRow } from "../data/compare-data";
import type { PricingEntry } from "../data/types";
import { DEFAULT_WORKLOAD, computeCost } from "./calc";
import { resolveRate } from "./rates";
import {
  DEFAULT_CUSTOM_HOUR_UTC,
  DEFAULT_SCENARIO,
  OFF_PEAK_HOUR_UTC,
  PEAK_HOUR_UTC,
  compareRowUnderScenario,
  isScenarioPriced,
  resolveScenarioTime,
  scenarioToRateContext,
} from "./scenario";

test("'now' passes the live clock straight through", () => {
  const liveNow = new Date("2026-08-20T13:37:00Z");
  assert.equal(resolveScenarioTime({ mode: "now" }, liveNow).getTime(), liveNow.getTime());
});

test("'peak' and 'off-peak' keep the calendar date and only override the UTC hour", () => {
  const liveNow = new Date("2026-08-20T13:37:42.123Z");

  const peak = resolveScenarioTime({ mode: "peak" }, liveNow);
  assert.equal(peak.getUTCFullYear(), 2026);
  assert.equal(peak.getUTCMonth(), 7); // August, 0-indexed
  assert.equal(peak.getUTCDate(), 20);
  assert.equal(peak.getUTCHours(), PEAK_HOUR_UTC);
  assert.equal(peak.getUTCMinutes(), 0);
  assert.equal(peak.getUTCSeconds(), 0);

  const offPeak = resolveScenarioTime({ mode: "off-peak" }, liveNow);
  assert.equal(offPeak.getUTCDate(), 20);
  assert.equal(offPeak.getUTCHours(), OFF_PEAK_HOUR_UTC);
});

test("'custom' uses the requested UTC hour, defaulting to a fixed hour (not the live one) when unset", () => {
  const liveNow = new Date("2026-08-20T13:37:00Z");

  assert.equal(resolveScenarioTime({ mode: "custom", customHourUtc: 5 }, liveNow).getUTCHours(), 5);
  // Deliberately NOT liveNow's hour (13): the hour <select> in scenario-controls.tsx
  // falls back to this same constant for its displayed value, so the display and
  // the actual resolved instant can never silently disagree before a user picks
  // an hour explicitly. See DEFAULT_CUSTOM_HOUR_UTC's doc comment.
  assert.equal(resolveScenarioTime({ mode: "custom" }, liveNow).getUTCHours(), DEFAULT_CUSTOM_HOUR_UTC);
});

test("picking 'Peak' before a variant's `from` date still resolves to the base rate — not a time machine", () => {
  // Mirrors DeepSeek-V4 Pro (Direct)'s real shape: peak/off-peak only start
  // 2026-08-16T16:00:00Z. Overriding just the hour-of-day must not fool the
  // resolver's `from` gate into firing early.
  const entry: PricingEntry = {
    model: "Test",
    tier: "Direct",
    inputUsd: 1,
    cachedUsd: 0.1,
    outputUsd: 2,
    confidence: "official",
    effectiveDate: "2026-08-14",
    variants: [
      {
        label: "Peak",
        conditions: { from: "2026-08-16T16:00:00Z", utcHourWindows: [{ startHourUtc: 1, endHourUtc: 4 }] },
        inputUsd: 2,
        cachedUsd: 0.2,
        outputUsd: 4,
      },
    ],
  };

  const liveNow = new Date("2026-08-15T12:00:00Z"); // before the variant starts
  const ctx = scenarioToRateContext({ time: { mode: "peak" }, serviceTier: "standard" }, liveNow, 1000);

  assert.equal(resolveRate(entry, ctx).label, null);
});

test("scenarioToRateContext carries the service tier and context tokens through untouched", () => {
  const liveNow = new Date("2026-08-20T00:00:00Z");
  const ctx = scenarioToRateContext({ time: { mode: "now" }, serviceTier: "batch" }, liveNow, 42_000);

  assert.equal(ctx.now.getTime(), liveNow.getTime());
  assert.equal(ctx.serviceTier, "batch");
  assert.equal(ctx.contextTokens, 42_000);
});

test("isScenarioPriced is false when the resolved rate matches the row's base rate", () => {
  const base = { inputUsd: 1, cachedUsd: 0.1, outputUsd: 2 };
  const entry: PricingEntry = {
    model: "Test",
    tier: "Direct",
    ...base,
    confidence: "official",
    effectiveDate: "2026-08-14",
  };
  const resolved = resolveRate(entry, { now: new Date("2026-08-20T00:00:00Z") });

  assert.equal(isScenarioPriced(base, resolved), false);
});

test("isScenarioPriced is true when a matched variant changes any one dimension", () => {
  const base = { inputUsd: 1, cachedUsd: 0.1, outputUsd: 2 };
  const entry: PricingEntry = {
    model: "Test",
    tier: "Direct",
    ...base,
    confidence: "official",
    effectiveDate: "2026-08-14",
    variants: [{ label: "Promo", conditions: {}, inputUsd: 0.5, cachedUsd: 0.1, outputUsd: 2 }],
  };
  const resolved = resolveRate(entry, { now: new Date("2026-08-20T00:00:00Z") });

  assert.equal(resolved.inputUsd, 0.5); // sanity: the variant did match
  assert.equal(isScenarioPriced(base, resolved), true);
});

function testRow(overrides: Partial<CompareRow> = {}): CompareRow {
  return {
    id: "test-row",
    provider: "Test",
    providerSlug: "test",
    model: "Test model",
    tier: "Direct",
    inputUsd: 1,
    cachedUsd: 0.1,
    outputUsd: 2,
    confidence: "official",
    cachedConfidence: "official",
    ...overrides,
  };
}

test("compareRowUnderScenario resolves a row's carried variants, matching resolveRate + computeCost run directly", () => {
  const row = testRow({
    variants: [{ label: "Promo", conditions: {}, inputUsd: 0.5, cachedUsd: 0.05, outputUsd: 1 }],
  });
  const ctx = { now: new Date("2026-08-20T00:00:00Z") };

  const result = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctx);

  assert.equal(result.resolved.label, "Promo");
  assert.equal(result.resolved.inputUsd, 0.5);
  assert.equal(result.scenarioPriced, true);

  const directEntry: PricingEntry = {
    model: row.model,
    tier: row.tier,
    inputUsd: row.inputUsd,
    cachedUsd: row.cachedUsd,
    outputUsd: row.outputUsd,
    confidence: row.confidence,
    cachedConfidence: row.cachedConfidence,
    effectiveDate: "",
    variants: row.variants,
  };
  assert.equal(result.cost.totalUsd, computeCost(directEntry, DEFAULT_WORKLOAD, ctx).totalUsd);
});

test("compareRowUnderScenario reports scenarioPriced: false for a row with no variants", () => {
  const row = testRow();
  const result = compareRowUnderScenario(row, DEFAULT_WORKLOAD, { now: new Date("2026-08-20T00:00:00Z") });

  assert.equal(result.resolved.variant, null);
  assert.equal(result.scenarioPriced, false);
});

test("regression: every compare row costs the same under the default scenario at today's date as it did from base rates alone", () => {
  const today = new Date("2026-08-15T12:00:00Z");
  const rows = buildCompareRows();
  assert.ok(rows.length > 0);
  const ctx = scenarioToRateContext(DEFAULT_SCENARIO, today, DEFAULT_WORKLOAD.inputTokens);

  for (const row of rows) {
    // Deliberately drop `variants` — this reproduces exactly what computeCost
    // did before this change (straight arithmetic against the flat fields).
    const baseOnly: PricingEntry = {
      model: row.model,
      tier: row.tier,
      inputUsd: row.inputUsd,
      cachedUsd: row.cachedUsd,
      outputUsd: row.outputUsd,
      confidence: row.confidence,
      cachedConfidence: row.cachedConfidence,
      effectiveDate: "",
    };
    const expected = computeCost(baseOnly, DEFAULT_WORKLOAD);
    const actual = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctx).cost;

    assert.equal(actual.totalUsd, expected.totalUsd, row.id);
    assert.equal(actual.freshInputUsd, expected.freshInputUsd, row.id);
    assert.equal(actual.cachedInputUsd, expected.cachedInputUsd, row.id);
    assert.equal(actual.outputUsd, expected.outputUsd, row.id);
    assert.equal(actual.blendedInputPerMUsd, expected.blendedInputPerMUsd, row.id);
  }
});

test("an unsupported service tier degrades every row to its base rate (no catalog row defines a tiered variant yet)", () => {
  const rows = buildCompareRows();
  const today = new Date("2026-08-15T12:00:00Z");

  for (const tier of ["batch", "flex", "priority", "highspeed"] as const) {
    const ctx = scenarioToRateContext({ time: { mode: "now" }, serviceTier: tier }, today, DEFAULT_WORKLOAD.inputTokens);
    for (const row of rows) {
      const { resolved } = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctx);
      assert.equal(resolved.variant, null, `${row.id} unexpectedly matched a variant under tier "${tier}"`);
    }
  }
});
