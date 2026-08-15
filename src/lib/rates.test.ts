import assert from "node:assert/strict";
import test from "node:test";

import type { PricingEntry, RateVariant } from "../data/types";
import {
  BASE_RATE_LABEL,
  applicableVariants,
  matchesConditions,
  nextRateChange,
  rateRange,
  resolveRate,
} from "./rates";

function entry(overrides: Partial<PricingEntry> = {}): PricingEntry {
  return {
    model: "Test model",
    tier: "Direct",
    inputUsd: 1,
    cachedUsd: 0.1,
    outputUsd: 2,
    confidence: "official",
    effectiveDate: "2026-08-14",
    ...overrides,
  };
}

const at = (iso: string) => ({ now: new Date(iso) });

/**
 * DeepSeek's published shape from 2026-08-16T16:00Z: peak 01:00-04:00 and
 * 06:00-10:00 UTC, off-peak everywhere else at exactly half. Numbers here are
 * fixture stand-ins (1 / 2 vs 0.5 / 1), not catalog rates.
 */
const PEAK: RateVariant = {
  label: "Peak",
  conditions: {
    from: "2026-08-16T16:00:00Z",
    utcHourWindows: [
      { startHourUtc: 1, endHourUtc: 4 },
      { startHourUtc: 6, endHourUtc: 10 },
    ],
  },
  inputUsd: 1,
  cachedUsd: 0.1,
  outputUsd: 2,
};

const OFF_PEAK: RateVariant = {
  label: "Off-peak",
  conditions: { from: "2026-08-16T16:00:00Z" },
  inputUsd: 0.5,
  cachedUsd: 0.05,
  outputUsd: 1,
};

const peakEntry = entry({ variants: [PEAK, OFF_PEAK] });

test("resolves DeepSeek-style peak hours inside both published windows", () => {
  for (const iso of ["2026-08-20T01:30:00Z", "2026-08-20T06:00:00Z", "2026-08-20T09:59:59Z"]) {
    assert.equal(resolveRate(peakEntry, at(iso)).label, "Peak", iso);
  }
});

test("resolves off-peak outside the published peak windows", () => {
  for (const iso of [
    "2026-08-20T00:30:00Z",
    "2026-08-20T04:00:00Z",
    "2026-08-20T05:59:59Z",
    "2026-08-20T10:00:00Z",
    "2026-08-20T23:00:00Z",
  ]) {
    assert.equal(resolveRate(peakEntry, at(iso)).label, "Off-peak", iso);
  }
});

test("treats hour windows as half-open on the exact boundaries", () => {
  assert.equal(resolveRate(peakEntry, at("2026-08-20T01:00:00Z")).label, "Peak");
  assert.equal(resolveRate(peakEntry, at("2026-08-20T04:00:00Z")).label, "Off-peak");
  assert.equal(resolveRate(peakEntry, at("2026-08-20T06:00:00Z")).label, "Peak");
  assert.equal(resolveRate(peakEntry, at("2026-08-20T10:00:00Z")).label, "Off-peak");
});

test("carries the matched variant's numbers, not the row's base rate", () => {
  const resolved = resolveRate(peakEntry, at("2026-08-20T00:30:00Z"));

  assert.equal(resolved.inputUsd, 0.5);
  assert.equal(resolved.cachedUsd, 0.05);
  assert.equal(resolved.outputUsd, 1);
  assert.equal(resolved.variant, OFF_PEAK);
});

test("flips at the exact instant a `from` boundary is crossed", () => {
  assert.equal(resolveRate(peakEntry, at("2026-08-16T15:59:59Z")).label, null);
  assert.equal(resolveRate(peakEntry, at("2026-08-16T16:00:00Z")).label, "Off-peak");
});

test("keeps a promo active to its last instant and drops it at `until`", () => {
  const promo = entry({
    inputUsd: 1.5,
    cachedUsd: 0.15,
    outputUsd: 9,
    variants: [
      {
        label: "Promo",
        conditions: { until: "2027-01-01T00:00:00Z" },
        inputUsd: 0.75,
        cachedUsd: 0.075,
        outputUsd: 3.75,
      },
    ],
  });

  assert.equal(resolveRate(promo, at("2026-12-31T23:59:00Z")).label, "Promo");
  assert.equal(resolveRate(promo, at("2026-12-31T23:59:00Z")).inputUsd, 0.75);
  assert.equal(resolveRate(promo, at("2027-01-01T00:00:00Z")).label, null);
  assert.equal(resolveRate(promo, at("2027-01-01T00:00:00Z")).inputUsd, 1.5);
});

test("matches an hour window that wraps past midnight", () => {
  const night = { utcHourWindows: [{ startHourUtc: 22, endHourUtc: 2 }] };

  for (const iso of ["2026-08-20T22:00:00Z", "2026-08-20T23:30:00Z", "2026-08-20T01:59:59Z"]) {
    assert.equal(matchesConditions(night, at(iso)), true, iso);
  }
  for (const iso of ["2026-08-20T02:00:00Z", "2026-08-20T12:00:00Z", "2026-08-20T21:59:59Z"]) {
    assert.equal(matchesConditions(night, at(iso)), false, iso);
  }
});

const banded = entry({
  variants: [
    {
      label: "0-32K",
      conditions: { contextBand: { maxTokens: 32_000 } },
      inputUsd: 0.03,
      cachedUsd: null,
      outputUsd: 0.13,
    },
    {
      label: "32K-256K",
      conditions: { contextBand: { minTokens: 32_000, maxTokens: 256_000 } },
      inputUsd: 0.1,
      cachedUsd: null,
      outputUsd: 0.4,
    },
    {
      label: "256K-1M",
      conditions: { contextBand: { minTokens: 256_000 } },
      inputUsd: 0.2,
      cachedUsd: null,
      outputUsd: 0.8,
    },
  ],
});

test("selects the context band containing the prompt size", () => {
  const now = new Date("2026-08-20T12:00:00Z");

  assert.equal(resolveRate(banded, { now, contextTokens: 0 }).label, "0-32K");
  assert.equal(resolveRate(banded, { now, contextTokens: 31_999 }).label, "0-32K");
  assert.equal(resolveRate(banded, { now, contextTokens: 32_000 }).label, "32K-256K");
  assert.equal(resolveRate(banded, { now, contextTokens: 255_999 }).label, "32K-256K");
  assert.equal(resolveRate(banded, { now, contextTokens: 256_000 }).label, "256K-1M");
  assert.equal(resolveRate(banded, { now, contextTokens: 5_000_000 }).label, "256K-1M");
});

test("refuses to pick a band when the prompt size is unknown", () => {
  const resolved = resolveRate(banded, at("2026-08-20T12:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 1);
  assert.deepEqual(applicableVariants(banded, at("2026-08-20T12:00:00Z")), []);
});

const tiered = entry({
  variants: [
    {
      label: "Batch",
      conditions: { serviceTier: "batch" },
      inputUsd: 0.5,
      cachedUsd: 0.05,
      outputUsd: 1,
    },
    {
      label: "Priority",
      conditions: { serviceTier: "priority" },
      inputUsd: 1.8,
      cachedUsd: 0.18,
      outputUsd: 3.6,
    },
  ],
});

test("selects a variant by exact service tier", () => {
  const now = new Date("2026-08-20T12:00:00Z");

  assert.equal(resolveRate(tiered, { now, serviceTier: "batch" }).label, "Batch");
  assert.equal(resolveRate(tiered, { now, serviceTier: "priority" }).label, "Priority");
  assert.equal(resolveRate(tiered, { now, serviceTier: "flex" }).label, null);
});

test("never applies a batch variant to the standard tier", () => {
  const now = new Date("2026-08-20T12:00:00Z");

  assert.equal(resolveRate(tiered, { now, serviceTier: "standard" }).label, null);
  assert.equal(resolveRate(tiered, { now }).label, null);
  assert.equal(resolveRate(tiered, { now }).inputUsd, 1);
});

test("treats an untiered variant as standard-only", () => {
  const now = new Date("2026-08-20T12:00:00Z");
  const untiered = entry({
    variants: [
      { label: "Promo", conditions: {}, inputUsd: 0.4, cachedUsd: null, outputUsd: 0.8 },
    ],
  });

  assert.equal(resolveRate(untiered, { now }).label, "Promo");
  assert.equal(resolveRate(untiered, { now, serviceTier: "standard" }).label, "Promo");
  assert.equal(resolveRate(untiered, { now, serviceTier: "batch" }).label, null);
});

test("takes the first matching variant when several match", () => {
  const now = new Date("2026-08-20T12:00:00Z");
  const overlapping = entry({
    variants: [
      { label: "First", conditions: {}, inputUsd: 7, cachedUsd: null, outputUsd: 8 },
      { label: "Second", conditions: {}, inputUsd: 9, cachedUsd: null, outputUsd: 10 },
    ],
  });

  const resolved = resolveRate(overlapping, { now });

  assert.equal(resolved.label, "First");
  assert.equal(resolved.inputUsd, 7);
});

test("falls back to the base rate when nothing matches", () => {
  const resolved = resolveRate(peakEntry, at("2026-01-01T00:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.label, null);
  assert.equal(resolved.inputUsd, 1);
  assert.equal(resolved.cachedUsd, 0.1);
  assert.equal(resolved.outputUsd, 2);
  assert.equal(resolved.confidence, "official");
});

test("inherits the row's confidence unless the variant restates it", () => {
  const mixed = entry({
    confidence: "official",
    cachedConfidence: "derived",
    variants: [
      {
        label: "Estimated promo",
        conditions: {},
        inputUsd: 0.4,
        cachedUsd: 0.04,
        outputUsd: 0.8,
        confidence: "estimate",
      },
    ],
  });

  const resolved = resolveRate(mixed, at("2026-08-20T12:00:00Z"));

  assert.equal(resolved.confidence, "estimate");
  assert.equal(resolved.cachedConfidence, "derived");
});

test("lists both halves of a peak/off-peak pair regardless of the hour", () => {
  const daytime = applicableVariants(peakEntry, at("2026-08-20T12:00:00Z"));

  assert.deepEqual(daytime.map((variant) => variant.label), ["Peak", "Off-peak"]);
  assert.deepEqual(applicableVariants(peakEntry, at("2026-01-01T00:00:00Z")), []);
});

test("reports the spread across applicable variants", () => {
  const range = rateRange(peakEntry, at("2026-08-20T12:00:00Z"));

  assert.deepEqual(range, {
    minInputUsd: 0.5,
    maxInputUsd: 1,
    minOutputUsd: 1,
    maxOutputUsd: 2,
    varies: true,
  });
});

test("reports varies:false for a row with no variants", () => {
  const range = rateRange(entry(), at("2026-08-20T12:00:00Z"));

  assert.deepEqual(range, {
    minInputUsd: 1,
    maxInputUsd: 1,
    minOutputUsd: 2,
    maxOutputUsd: 2,
    varies: false,
  });
});

test("reports the base rate as the range before any variant starts", () => {
  const range = rateRange(peakEntry, at("2026-01-01T00:00:00Z"));

  assert.equal(range.minInputUsd, 1);
  assert.equal(range.maxInputUsd, 1);
  assert.equal(range.varies, false);
});

test("finds the next peak/off-peak boundary", () => {
  assert.deepEqual(nextRateChange(peakEntry, at("2026-08-20T00:30:00Z")), {
    at: new Date("2026-08-20T01:00:00Z"),
    label: "Peak",
  });
  assert.deepEqual(nextRateChange(peakEntry, at("2026-08-20T01:30:00Z")), {
    at: new Date("2026-08-20T04:00:00Z"),
    label: "Off-peak",
  });
  assert.deepEqual(nextRateChange(peakEntry, at("2026-08-20T10:00:00Z")), {
    at: new Date("2026-08-21T01:00:00Z"),
    label: "Peak",
  });
});

test("counts down to the instant conditional pricing begins", () => {
  assert.deepEqual(nextRateChange(peakEntry, at("2026-08-15T00:00:00Z")), {
    at: new Date("2026-08-16T16:00:00Z"),
    label: "Off-peak",
  });
});

test("counts down to a promo expiry and reports the base rate taking over", () => {
  const promo = entry({
    variants: [
      {
        label: "Promo",
        conditions: { until: "2027-01-01T00:00:00Z" },
        inputUsd: 0.75,
        cachedUsd: null,
        outputUsd: 3.75,
      },
    ],
  });

  assert.deepEqual(nextRateChange(promo, at("2026-12-31T23:00:00Z")), {
    at: new Date("2027-01-01T00:00:00Z"),
    label: BASE_RATE_LABEL,
  });
});

test("reports no scheduled change for a row with no variants or no boundaries", () => {
  assert.equal(nextRateChange(entry(), at("2026-08-20T12:00:00Z")), null);
  assert.equal(
    nextRateChange(
      entry({
        variants: [
          { label: "Batch", conditions: { serviceTier: "batch" }, inputUsd: 0.5, cachedUsd: null, outputUsd: 1 },
        ],
      }),
      at("2026-08-20T12:00:00Z"),
    ),
    null,
  );
});
