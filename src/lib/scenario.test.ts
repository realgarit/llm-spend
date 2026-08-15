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
  type Scenario,
  compareRowUnderScenario,
  effectivePreviewContext,
  isScenarioPriced,
  isTimeOfDayPriced,
  resolveScenarioTime,
  scenarioContexts,
  scenarioToRateContext,
  scheduledPreview,
} from "./scenario";

/** A DeepSeek-shaped row: a peak/off-peak pair gated behind a start instant. */
const PEAK_STARTS = "2026-08-16T16:00:00Z";

function peakPairEntry(overrides: Partial<PricingEntry> = {}): PricingEntry {
  return {
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
        conditions: { from: PEAK_STARTS, utcHourWindows: [{ startHourUtc: 1, endHourUtc: 4 }] },
        inputUsd: 4,
        cachedUsd: 0.4,
        outputUsd: 8,
      },
      { label: "Off-peak", conditions: { from: PEAK_STARTS }, inputUsd: 2, cachedUsd: 0.2, outputUsd: 4 },
    ],
    ...overrides,
  };
}

function peakScenario(): Scenario {
  return { time: { mode: "peak" }, serviceTier: "standard" };
}

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

test("overriding the hour alone never fires a `from` gate early — the schedule gate is a separate, explicit opt-in", () => {
  // Mirrors DeepSeek-V4 Pro (Direct)'s real shape: peak/off-peak only start
  // 2026-08-16T16:00:00Z. Selecting a peak *hour* moves only the hour-of-day;
  // it must not, on its own, fool the resolver's `from` gate into firing.
  const entry = peakPairEntry();
  const liveNow = new Date("2026-08-15T12:00:00Z"); // before the variant starts
  const ctx = scenarioToRateContext(peakScenario(), liveNow, 1000);

  // The scenario instant is still 15 Aug — only the hour moved.
  assert.equal(ctx.now.getUTCDate(), 15);
  assert.equal(ctx.now.getUTCHours(), PEAK_HOUR_UTC);

  // ...and with the gate enforced, that instant resolves to the base rate.
  assert.equal(resolveRate(entry, { ...ctx, previewScheduledRates: false }).label, null);
});

test("the schedule-gate opt-in reveals the not-yet-started variant at that same instant", () => {
  // The other half of the invariant above: the SAME row at the SAME instant
  // resolves to Peak once the caller explicitly opts in. This is what makes a
  // deliberate "show me peak pricing" click useful before the start date,
  // without changing what any default/"Now" caller sees.
  const entry = peakPairEntry();
  const liveNow = new Date("2026-08-15T12:00:00Z");
  const ctx = scenarioToRateContext(peakScenario(), liveNow, 1000);

  assert.equal(ctx.previewScheduledRates, true); // set by the non-"now" mode
  const resolved = resolveRate(entry, ctx);
  assert.equal(resolved.label, "Peak");
  assert.equal(resolved.inputUsd, 4);
  assert.equal(resolved.outputUsd, 8);
});

test("'now' never sets the schedule-gate opt-in, so the default scenario can only show billable rates", () => {
  const liveNow = new Date("2026-08-15T02:00:00Z"); // a peak hour, before the start date
  const ctx = scenarioToRateContext(DEFAULT_SCENARIO, liveNow, 1000);

  assert.equal(ctx.previewScheduledRates, false);
  assert.equal(resolveRate(peakPairEntry(), ctx).label, null);
});

test("the opt-in waives the from/until comparison but never the parse check — a typo'd instant still drops the variant", () => {
  const entry = peakPairEntry({
    variants: [
      { label: "Typo", conditions: { from: "not-a-date" }, inputUsd: 9, cachedUsd: 0.9, outputUsd: 9 },
    ],
  });
  const ctx = { now: new Date("2026-08-15T02:00:00Z"), previewScheduledRates: true };

  assert.equal(resolveRate(entry, ctx).label, null);
});

test("the opt-in also reveals an already-expired variant (an `until` in the past)", () => {
  const entry = peakPairEntry({
    variants: [
      {
        label: "Lapsed promo",
        conditions: { until: "2026-08-01T00:00:00Z" },
        inputUsd: 0.5,
        cachedUsd: 0.05,
        outputUsd: 1,
      },
    ],
  });
  const now = new Date("2026-08-15T02:00:00Z");

  assert.equal(resolveRate(entry, { now }).label, null);
  assert.equal(resolveRate(entry, { now, previewScheduledRates: true }).label, "Lapsed promo");
});

test("scheduledPreview flags a not-yet-started variant, and reports when it starts", () => {
  const entry = peakPairEntry();
  const liveNow = new Date("2026-08-15T09:43:30Z"); // before PEAK_STARTS
  const ctxs = scenarioContexts(peakScenario(), liveNow, 1000);

  const preview = scheduledPreview(entry, ctxs.preview, ctxs.live);
  assert.ok(preview, "expected a scheduled preview");
  assert.equal(preview.variant.label, "Peak");
  assert.equal(preview.startsAt?.toISOString(), new Date(PEAK_STARTS).toISOString());
});

test("scheduledPreview reports nothing once the variant's schedule has genuinely started", () => {
  // Self-correcting: nothing about the row changes, only the real clock.
  const entry = peakPairEntry();
  const liveNow = new Date("2026-08-18T09:43:30Z"); // after PEAK_STARTS
  const ctxs = scenarioContexts(peakScenario(), liveNow, 1000);

  assert.equal(resolveRate(entry, ctxs.preview).label, "Peak"); // still resolves to Peak...
  assert.equal(scheduledPreview(entry, ctxs.preview, ctxs.live), null); // ...but it is real now
});

test("scheduledPreview does not call a different hour of an already-live schedule a preview", () => {
  // 20:00 live (off-peak) while previewing 02:00 (peak), the day the split
  // starts. Peak is genuinely billable — it is simply not this hour — so
  // comparing against the live *resolution* would wrongly flag it. The check
  // is against the live *schedule*, ignoring hour of day.
  const entry = peakPairEntry();
  const liveNow = new Date("2026-08-16T20:00:00Z"); // same day, after 16:00Z
  const ctxs = scenarioContexts(peakScenario(), liveNow, 1000);

  assert.equal(resolveRate(entry, ctxs.preview).label, "Peak");
  assert.equal(resolveRate(entry, ctxs.live).label, "Off-peak");
  assert.equal(scheduledPreview(entry, ctxs.preview, ctxs.live), null);
});

test("scheduledPreview reports nothing when the base rate resolved", () => {
  const entry: PricingEntry = {
    model: "Test",
    tier: "Direct",
    inputUsd: 1,
    cachedUsd: 0.1,
    outputUsd: 2,
    confidence: "official",
    effectiveDate: "2026-08-14",
  };
  const ctxs = scenarioContexts(peakScenario(), new Date("2026-08-15T12:00:00Z"), 1000);

  assert.equal(scheduledPreview(entry, ctxs.preview, ctxs.live), null);
});

test("isTimeOfDayPriced separates an hour-scoped row from a plain date reversion", () => {
  assert.equal(isTimeOfDayPriced(peakPairEntry()), true);
  assert.equal(
    isTimeOfDayPriced(
      peakPairEntry({
        variants: [
          { label: "List price (from 2027)", conditions: { from: "2027-01-01T00:00:00Z" }, inputUsd: 3, cachedUsd: 0.3, outputUsd: 6 },
        ],
      }),
    ),
    false,
  );
  assert.equal(isTimeOfDayPriced(peakPairEntry({ variants: undefined })), false);
});

test("effectivePreviewContext withholds the opt-in from rows that are not priced by hour of day", () => {
  // Picking an hour is not a request to see next year's list price. A Gemini-
  // or Qwen-shaped date reversion must stay gated, or a Time click would
  // silently reprice unrelated rows and reorder the table.
  const reversion = peakPairEntry({
    variants: [
      { label: "List price (from 2027)", conditions: { from: "2027-01-01T00:00:00Z" }, inputUsd: 3, cachedUsd: 0.3, outputUsd: 6 },
    ],
  });
  const ctxs = scenarioContexts(peakScenario(), new Date("2026-08-15T12:00:00Z"), 1000);

  assert.equal(effectivePreviewContext(reversion, ctxs.preview).previewScheduledRates, false);
  assert.equal(resolveRate(reversion, effectivePreviewContext(reversion, ctxs.preview)).label, null);

  // The hour-scoped row keeps it.
  assert.equal(effectivePreviewContext(peakPairEntry(), ctxs.preview).previewScheduledRates, true);
});

test("effectivePreviewContext is a no-op when the scenario never asked for a preview", () => {
  const ctxs = scenarioContexts(DEFAULT_SCENARIO, new Date("2026-08-15T02:00:00Z"), 1000);
  assert.equal(effectivePreviewContext(peakPairEntry(), ctxs.preview).previewScheduledRates, false);
});

test("the whole row is opened up, so Off-peak (which carries no hour window) previews too", () => {
  const entry = peakPairEntry();
  const liveNow = new Date("2026-08-15T09:43:30Z");
  const ctxs = scenarioContexts({ time: { mode: "off-peak" }, serviceTier: "standard" }, liveNow, 1000);
  const ctx = effectivePreviewContext(entry, ctxs.preview);

  assert.equal(resolveRate(entry, ctx).label, "Off-peak");
  assert.equal(scheduledPreview(entry, ctx, ctxs.live)?.variant.label, "Off-peak");
});

test("scenarioContexts's live context is the real clock with the gate enforced", () => {
  const liveNow = new Date("2026-08-15T09:43:30Z");
  const { live } = scenarioContexts(peakScenario(), liveNow, 1234);

  assert.equal(live.now.getTime(), liveNow.getTime());
  assert.equal(live.previewScheduledRates, false);
  assert.equal(live.contextTokens, 1234);
  assert.equal(live.serviceTier, "standard");
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

  const result = compareRowUnderScenario(row, DEFAULT_WORKLOAD, { preview: ctx, live: ctx });

  assert.equal(result.resolved.label, "Promo");
  assert.equal(result.resolved.inputUsd, 0.5);
  assert.equal(result.scenarioPriced, true);
  assert.equal(result.preview, null); // an unconditional variant is never a preview

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
  const ctx = { now: new Date("2026-08-20T00:00:00Z") };
  const result = compareRowUnderScenario(row, DEFAULT_WORKLOAD, { preview: ctx, live: ctx });

  assert.equal(result.resolved.variant, null);
  assert.equal(result.scenarioPriced, false);
  assert.equal(result.preview, null);
});

test("compareRowUnderScenario labels a DeepSeek-shaped row as a preview before its start instant, and stops once it starts", () => {
  const row = testRow({ variants: peakPairEntry().variants });

  const before = scenarioContexts(peakScenario(), new Date("2026-08-15T09:43:30Z"), DEFAULT_WORKLOAD.inputTokens);
  const previewed = compareRowUnderScenario(row, DEFAULT_WORKLOAD, before);
  assert.equal(previewed.resolved.label, "Peak");
  assert.equal(previewed.scenarioPriced, true);
  assert.equal(previewed.preview?.variant.label, "Peak");
  assert.equal(previewed.preview?.startsAt?.toISOString(), new Date(PEAK_STARTS).toISOString());

  const after = scenarioContexts(peakScenario(), new Date("2026-08-18T09:43:30Z"), DEFAULT_WORKLOAD.inputTokens);
  const live = compareRowUnderScenario(row, DEFAULT_WORKLOAD, after);
  assert.equal(live.resolved.label, "Peak");
  assert.equal(live.preview, null);
});

test("compareRowUnderScenario leaves a date-reversion row on its base rate under a time scenario", () => {
  // The Gemini/Qwen shape. Picking an hour must not reprice it, and it must
  // therefore also carry no preview label.
  const row = testRow({
    variants: [
      { label: "List price (from 2027)", conditions: { from: "2027-01-01T00:00:00Z" }, inputUsd: 3, cachedUsd: 0.3, outputUsd: 6 },
    ],
  });
  const ctxs = scenarioContexts(peakScenario(), new Date("2026-08-15T09:43:30Z"), DEFAULT_WORKLOAD.inputTokens);
  const result = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctxs);

  assert.equal(result.resolved.variant, null);
  assert.equal(result.resolved.inputUsd, 1);
  assert.equal(result.scenarioPriced, false);
  assert.equal(result.preview, null);
});

test("regression: every compare row costs the same under the default scenario at today's date as it did from base rates alone", () => {
  const today = new Date("2026-08-15T12:00:00Z");
  const rows = buildCompareRows();
  assert.ok(rows.length > 0);
  const ctxs = scenarioContexts(DEFAULT_SCENARIO, today, DEFAULT_WORKLOAD.inputTokens);

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
    const compared = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctxs);
    const actual = compared.cost;

    assert.equal(compared.preview, null, `${row.id} previewed a rate under the default "Now" scenario`);
    assert.equal(actual.totalUsd, expected.totalUsd, row.id);
    assert.equal(actual.freshInputUsd, expected.freshInputUsd, row.id);
    assert.equal(actual.cachedInputUsd, expected.cachedInputUsd, row.id);
    assert.equal(actual.outputUsd, expected.outputUsd, row.id);
    assert.equal(actual.blendedInputPerMUsd, expected.blendedInputPerMUsd, row.id);
  }
});

/**
 * The exact set of real catalog rows that publish a serviceTier-scoped
 * variant, keyed by (providerSlug, model, tier, host) since several models
 * (e.g. GPT-5.6 Sol) have both a Global and a DataZone row sharing the same
 * model name and no host — tier alone disambiguates them here. Each entry's
 * `tiers` map is the exact published numbers for that ServiceTier, asserted
 * below against the live resolver so this test fails the moment a variant's
 * numbers drift from what was verified against the official source (see
 * providers.ts for the sourceNotes) — not just whether *a* variant matched.
 */
const TIERED_ROWS: {
  providerSlug: string;
  model: string;
  tier: string;
  host?: string;
  tiers: Partial<Record<"batch" | "flex" | "priority" | "highspeed", { inputUsd: number; cachedUsd: number | null; outputUsd: number }>>;
}[] = [
  {
    providerSlug: "kimi",
    model: "Kimi K2.7 Code",
    tier: "Global",
    tiers: { highspeed: { inputUsd: 1.9, cachedUsd: 0.38, outputUsd: 8.0 } },
  },
  {
    providerSlug: "gemini",
    model: "Gemini 3.7 Flash",
    tier: "Global",
    tiers: {
      batch: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
      flex: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
      priority: { inputUsd: 1.35, cachedUsd: 0.135, outputUsd: 6.75 },
    },
  },
  {
    providerSlug: "gemini",
    model: "Gemini 3.6 Flash",
    tier: "Global",
    tiers: {
      batch: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
      flex: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
      priority: { inputUsd: 1.35, cachedUsd: 0.135, outputUsd: 6.75 },
    },
  },
  {
    providerSlug: "minimax",
    model: "MiniMax M3",
    tier: "Direct",
    host: "MiniMax direct API",
    tiers: { priority: { inputUsd: 0.45, cachedUsd: 0.09, outputUsd: 1.8 } },
  },
  {
    providerSlug: "openai-azure",
    model: "GPT-5.6 Sol",
    tier: "Global",
    tiers: { priority: { inputUsd: 10.0, cachedUsd: 1.0, outputUsd: 60.0 } },
  },
  {
    providerSlug: "openai-azure",
    model: "GPT-5.6 Terra",
    tier: "Global",
    tiers: { priority: { inputUsd: 5.0, cachedUsd: 0.5, outputUsd: 30.0 } },
  },
  {
    providerSlug: "openai-azure",
    model: "GPT-5.6 Luna",
    tier: "Global",
    tiers: { priority: { inputUsd: 2.0, cachedUsd: 0.2, outputUsd: 12.0 } },
  },
];

function findTieredRow(row: CompareRow) {
  return TIERED_ROWS.find(
    (t) => t.providerSlug === row.providerSlug && t.model === row.model && t.tier === row.tier && t.host === row.host,
  );
}

test("a service tier resolves real numbers only on the rows that publish it, and degrades every other row to its base rate", () => {
  const rows = buildCompareRows();
  const today = new Date("2026-08-15T12:00:00Z");

  for (const tier of ["batch", "flex", "priority", "highspeed"] as const) {
    const ctxs = scenarioContexts({ time: { mode: "now" }, serviceTier: tier }, today, DEFAULT_WORKLOAD.inputTokens);
    for (const row of rows) {
      const { resolved } = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctxs);
      const expected = findTieredRow(row)?.tiers[tier];

      if (expected) {
        assert.notEqual(resolved.variant, null, `${row.id} should match tier "${tier}"`);
        assert.equal(resolved.inputUsd, expected.inputUsd, `${row.id} ${tier} inputUsd`);
        assert.equal(resolved.cachedUsd, expected.cachedUsd, `${row.id} ${tier} cachedUsd`);
        assert.equal(resolved.outputUsd, expected.outputUsd, `${row.id} ${tier} outputUsd`);
      } else {
        assert.equal(resolved.variant, null, `${row.id} unexpectedly matched a variant under tier "${tier}"`);
      }
    }
  }
});

test("every row that publishes a service-tier variant still resolves to its own base rate under the default 'standard' tier", () => {
  const rows = buildCompareRows();
  const today = new Date("2026-08-15T12:00:00Z");
  const ctxs = scenarioContexts(DEFAULT_SCENARIO, today, DEFAULT_WORKLOAD.inputTokens);

  const tieredRows = rows.filter((row) => findTieredRow(row));
  assert.ok(tieredRows.length >= TIERED_ROWS.length, "expected to find every catalog row listed in TIERED_ROWS");

  for (const row of tieredRows) {
    const { resolved } = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctxs);

    assert.equal(resolved.variant, null, `${row.id} should resolve to its base rate under "standard"`);
    assert.equal(resolved.inputUsd, row.inputUsd, `${row.id} standard inputUsd`);
    assert.equal(resolved.cachedUsd, row.cachedUsd, `${row.id} standard cachedUsd`);
    assert.equal(resolved.outputUsd, row.outputUsd, `${row.id} standard outputUsd`);
  }
});

test("guard: the preview opt-in never leaks into the default 'Now' scenario, for any catalog row at any hour", () => {
  // The invariant the whole feature hangs on, checked against the real
  // catalog: with "Now" selected, every row must resolve to a literally
  // billable rate — never a preview — whatever hour of the day it is.
  const rows = buildCompareRows();
  assert.ok(rows.length > 0);

  for (let hour = 0; hour < 24; hour += 1) {
    const liveNow = new Date(Date.UTC(2026, 7, 15, hour, 30, 0));
    const ctxs = scenarioContexts(DEFAULT_SCENARIO, liveNow, DEFAULT_WORKLOAD.inputTokens);
    assert.equal(ctxs.preview.previewScheduledRates, false);

    for (const row of rows) {
      const result = compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctxs);
      assert.equal(result.preview, null, `${row.id} previewed a scheduled rate at ${hour}:30 UTC under "Now"`);
    }
  }
});

test("the real DeepSeek catalog rows preview their peak rate before the split starts, and only they do", () => {
  // Ties the abstract fixtures above to the actual catalog: today (15 Aug,
  // before the 16 Aug 16:00Z start) picking "Peak" must reveal DeepSeek's
  // peak numbers, labelled as a preview, and must leave every other row alone.
  const rows = buildCompareRows();
  const ctxs = scenarioContexts(peakScenario(), new Date("2026-08-15T09:43:30Z"), DEFAULT_WORKLOAD.inputTokens);
  const previewing = rows
    .map((row) => compareRowUnderScenario(row, DEFAULT_WORKLOAD, ctxs))
    .filter((c) => c.preview !== null);

  assert.ok(previewing.length > 0, "expected at least DeepSeek's direct rows to preview");
  for (const c of previewing) {
    assert.equal(c.preview?.variant.label, "Peak");
    assert.equal(c.preview?.startsAt?.toISOString(), "2026-08-16T16:00:00.000Z");
    assert.equal(c.resolved.label, "Peak");
    assert.equal(c.scenarioPriced, true);
  }

  const pro = previewing.find((c) => c.row.model === "DeepSeek-V4 Pro" && c.row.host === "DeepSeek direct API");
  assert.ok(pro, "expected DeepSeek-V4 Pro (direct) among the previewed rows");
  assert.equal(pro.resolved.inputUsd, 1.32);
  assert.equal(pro.resolved.cachedUsd, 0.044);
  assert.equal(pro.resolved.outputUsd, 3.96);
});
