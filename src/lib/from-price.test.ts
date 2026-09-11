import assert from "node:assert/strict";
import test from "node:test";

import { providers } from "../data/providers";
import { fromPrice } from "./from-price";
import { rateRange } from "./rates";

// Both instants are after DeepSeek V4.1 Flash's 2026-09-10T04:00:00Z
// transition. One lands inside a published peak window (01:00-04:00 UTC),
// the other outside it.
const OFF_PEAK_NOW = new Date("2026-09-11T12:00:00Z");
const PEAK_NOW = new Date("2026-09-11T02:00:00Z");

// The cheapest reachable DeepSeek input rate remains the Fireworks-hosted V4
// Flash Data Zone lane ($0.15), which undercuts the direct V4.1 Flash
// off-peak rate and the first-party Foundry lanes because these are different
// sellers rather than two tiers of one seller (see deepseek.ts).
const DEEPSEEK_FROM = 0.15;

test("DeepSeek's from-price is the cheapest reachable rate, not the legacy Direct base", () => {
  const price = fromPrice("deepseek", OFF_PEAK_NOW);

  assert.equal(price, DEEPSEEK_FROM);
  assert.notEqual(price, 0.14);
});

test("DeepSeek's from-price is identical at a peak hour and an off-peak hour", () => {
  // The whole point of resolving via rateRange() (which waives utcHourWindows,
  // see rates.ts) instead of resolveRate(): a statically-rendered "from" price
  // must not depend on what hour the build happens to run at.
  const offPeakPrice = fromPrice("deepseek", OFF_PEAK_NOW);
  const peakPrice = fromPrice("deepseek", PEAK_NOW);

  assert.equal(offPeakPrice, DEEPSEEK_FROM);
  assert.equal(peakPrice, DEEPSEEK_FROM);
  assert.equal(peakPrice, offPeakPrice);
});

test("regression guard: every provider's from-price matches the minimum minInputUsd rateRange reports reachable", () => {
  for (const now of [OFF_PEAK_NOW, PEAK_NOW]) {
    for (const provider of providers) {
      const expected = Math.min(...provider.entries.map((e) => rateRange(e, { now }).minInputUsd));
      const actual = fromPrice(provider.slug, now);

      assert.equal(
        actual,
        expected,
        `${provider.slug} at ${now.toISOString()}: from-price ($${actual}) does not match the minimum rate ` +
          `rateRange() reports reachable ($${expected}). This almost always means fromPrice() regressed to reading ` +
          `a row's flat inputUsd field directly instead of resolving it through rateRange() — a flat base field can ` +
          `be permanently superseded by an always-active variant (e.g. DeepSeek Direct's Peak/Off-peak pair, live ` +
          `since 2026-08-16), so it is not a safe stand-in for "the cheapest rate this row can currently charge".`,
      );
    }
  }
});
