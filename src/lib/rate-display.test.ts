import assert from "node:assert/strict";
import test from "node:test";

import type { PricingEntry, RateVariant } from "../data/types";
import { getProvider } from "../data/providers";
import { describeNextChange, formatDuration, formatUtcInstant } from "./rate-display";

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

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

test("formatDuration renders sub-minute gaps as <1m", () => {
  assert.equal(formatDuration(0), "<1m");
  assert.equal(formatDuration(59_000), "<1m");
});

test("formatDuration renders whole minutes under an hour", () => {
  assert.equal(formatDuration(60_000), "1m");
  assert.equal(formatDuration(59 * 60_000), "59m");
});

test("formatDuration renders hours and minutes under a day", () => {
  assert.equal(formatDuration(60 * 60_000), "1h 0m");
  assert.equal(formatDuration(90 * 60_000), "1h 30m");
  assert.equal(formatDuration(23 * 60 * 60_000 + 59 * 60_000), "23h 59m");
});

test("formatDuration renders days and hours at or beyond a day", () => {
  assert.equal(formatDuration(24 * 60 * 60_000), "1d");
  assert.equal(formatDuration(24 * 60 * 60_000 + 4 * 60 * 60_000), "1d 4h");
  assert.equal(formatDuration(100 * 60 * 60_000), "4d 4h");
});

test("formatDuration floors rather than rounds, so it never overpromises", () => {
  // 2h59m50s left should read 2h 59m, not round up to 3h 0m.
  assert.equal(formatDuration(2 * 60 * 60_000 + 59 * 60_000 + 50_000), "2h 59m");
});

test("formatDuration clamps negative input to zero", () => {
  assert.equal(formatDuration(-5_000), "<1m");
});

// ---------------------------------------------------------------------------
// formatUtcInstant
// ---------------------------------------------------------------------------

test("formatUtcInstant omits the year when it matches the reference year", () => {
  const text = formatUtcInstant(new Date("2026-08-16T16:00:00Z"), new Date("2026-08-15T00:00:00Z"));
  assert.equal(text, "16 Aug, 16:00 UTC");
});

test("formatUtcInstant shows the year when it differs from the reference year", () => {
  const text = formatUtcInstant(new Date("2027-01-01T00:00:00Z"), new Date("2026-08-15T00:00:00Z"));
  assert.equal(text, "1 Jan 2027 UTC");
});

test("formatUtcInstant omits the time-of-day at exact UTC midnight", () => {
  const text = formatUtcInstant(new Date("2026-09-01T00:00:00Z"), new Date("2026-08-15T00:00:00Z"));
  assert.equal(text, "1 Sep UTC");
});

test("formatUtcInstant pads single-digit hours and minutes", () => {
  const text = formatUtcInstant(new Date("2026-08-16T06:05:00Z"), new Date("2026-08-15T00:00:00Z"));
  assert.equal(text, "16 Aug, 06:05 UTC");
});

// ---------------------------------------------------------------------------
// describeNextChange — synthetic fixtures (mirrors src/lib/rates.test.ts's
// DeepSeek-shaped peak/off-peak fixture, numbers swapped for 1/0.5 stand-ins).
// ---------------------------------------------------------------------------

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

test("describeNextChange announces a not-yet-started regime by every variant that activates at once", () => {
  const result = describeNextChange(peakEntry, at("2026-08-15T00:00:00Z"));

  assert.deepEqual(result, {
    kind: "scheduled",
    text: "Peak / Off-peak begins 16 Aug, 16:00 UTC",
  });
});

test("describeNextChange counts down once the regime has started", () => {
  const result = describeNextChange(peakEntry, at("2026-08-20T00:30:00Z"));

  assert.deepEqual(result, { kind: "countdown", text: "Changes in 30m" });
});

test("describeNextChange returns null when the row has no variants", () => {
  assert.equal(describeNextChange(entry(), at("2026-08-20T12:00:00Z")), null);
});

test("describeNextChange returns null once nothing further is scheduled", () => {
  const promo = entry({
    variants: [
      {
        label: "Promo",
        conditions: { until: "2026-09-01T00:00:00Z" },
        inputUsd: 0.5,
        cachedUsd: null,
        outputUsd: 1,
      },
    ],
  });

  // The only boundary is `until`, and it is already in the past relative to
  // `now` — nothing left to schedule, and the row has fallen back to base.
  assert.equal(describeNextChange(promo, at("2026-09-02T00:00:00Z")), null);
});

// ---------------------------------------------------------------------------
// describeNextChange — real catalog rows, cross-checking the design doc's own
// "peak/off-peak pricing begins 16 Aug" example against live data.
// ---------------------------------------------------------------------------

function directDeepSeekPro(): PricingEntry {
  const provider = getProvider("deepseek");
  const entryRow = provider?.entries.find(
    (candidate) => candidate.model === "DeepSeek-V4 Pro" && candidate.host === "DeepSeek direct API",
  );
  assert.ok(entryRow, "Expected a direct DeepSeek-V4 Pro entry");
  return entryRow;
}

function qwenMaxPromo(): PricingEntry {
  const provider = getProvider("qwen");
  const entryRow = provider?.entries.find((candidate) => candidate.model === "Qwen3.7 Max (Promo)");
  assert.ok(entryRow, "Expected the Qwen3.7 Max (Promo) entry");
  return entryRow;
}

test("describeNextChange on the real DeepSeek-V4 Pro (Direct) row reads like the design doc's example", () => {
  const result = describeNextChange(directDeepSeekPro(), at("2026-08-15T12:00:00Z"));

  assert.deepEqual(result, {
    kind: "scheduled",
    text: "Peak / Off-peak begins 16 Aug, 16:00 UTC",
  });
});

test("describeNextChange on the real Qwen3.7 Max (Promo) row announces the September reversion", () => {
  const result = describeNextChange(qwenMaxPromo(), at("2026-08-15T12:00:00Z"));

  assert.deepEqual(result, {
    kind: "scheduled",
    text: "List price (from September) begins 1 Sep UTC",
  });
});
