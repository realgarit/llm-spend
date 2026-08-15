import assert from "node:assert/strict";
import test from "node:test";

import { resolveRate } from "../lib/rates";
import type { PricingEntry } from "./types";
import { getProvider, providers } from "./providers";

/**
 * Migration tests for the rate variants added to the DeepSeek, Gemini and Qwen
 * rows (see docs/superpowers/specs/2026-08-14-rate-variants-design.md). These
 * assert against the real catalog data in providers.ts, not fixtures — the
 * generic resolver semantics (matching order, half-open windows, etc.) are
 * already pinned by src/lib/rates.test.ts against synthetic entries.
 */

function directDeepSeek(model: string): PricingEntry {
  const provider = getProvider("deepseek");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === model && candidate.host === "DeepSeek direct API",
  );

  assert.ok(entry, `Expected a direct DeepSeek ${model} entry`);
  return entry;
}

function geminiFlash(model: string): PricingEntry {
  const provider = getProvider("gemini");
  const entry = provider?.entries.find((candidate) => candidate.model === model);

  assert.ok(entry, `Expected a Gemini ${model} entry`);
  return entry;
}

function qwenMaxPromo(): PricingEntry {
  const provider = getProvider("qwen");
  const entry = provider?.entries.find((candidate) => candidate.model === "Qwen3.7 Max (Promo)");

  assert.ok(entry, "Expected the Qwen3.7 Max (Promo) entry");
  return entry;
}

const at = (iso: string) => ({ now: new Date(iso) });

// ---------------------------------------------------------------------------
// DeepSeek-V4 Pro (Direct)
// ---------------------------------------------------------------------------

test("DeepSeek-V4 Pro (Direct) resolves to today's base rate before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-15T12:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.435);
  assert.equal(resolved.cachedUsd, 0.003625);
  assert.equal(resolved.outputUsd, 0.87);
});

test("DeepSeek-V4 Pro (Direct) stays on the base rate one second before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-16T15:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.435);
});

test("DeepSeek-V4 Pro (Direct) flips to a variant at the exact switch instant", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-16T16:00:00Z"));

  // 16:00 UTC falls outside both peak windows (01:00-04:00, 06:00-10:00), so
  // this is specifically the Off-peak variant, not just "not base".
  assert.notEqual(resolved.variant, null);
  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.66);
  assert.equal(resolved.cachedUsd, 0.022);
  assert.equal(resolved.outputUsd, 1.98);
});

test("DeepSeek-V4 Pro (Direct) resolves Peak inside a peak window", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-17T02:00:00Z"));

  assert.equal(resolved.label, "Peak");
  assert.equal(resolved.inputUsd, 1.32);
  assert.equal(resolved.cachedUsd, 0.044);
  assert.equal(resolved.outputUsd, 3.96);
  assert.equal(resolved.confidence, "official");
});

test("DeepSeek-V4 Pro (Direct) resolves Off-peak outside the peak windows", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-17T12:00:00Z"));

  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.66);
  assert.equal(resolved.cachedUsd, 0.022);
  assert.equal(resolved.outputUsd, 1.98);
  assert.equal(resolved.confidence, "official");
});

// ---------------------------------------------------------------------------
// DeepSeek-V4 Flash (Direct)
// ---------------------------------------------------------------------------

test("DeepSeek-V4 Flash (Direct) resolves to today's base rate before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-15T12:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.14);
  assert.equal(resolved.cachedUsd, 0.0028);
  assert.equal(resolved.outputUsd, 0.28);
});

test("DeepSeek-V4 Flash (Direct) stays on the base rate one second before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-16T15:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.14);
});

test("DeepSeek-V4 Flash (Direct) flips to a variant at the exact switch instant", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-16T16:00:00Z"));

  assert.notEqual(resolved.variant, null);
  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.22);
  assert.equal(resolved.cachedUsd, 0.007);
  assert.equal(resolved.outputUsd, 0.66);
});

test("DeepSeek-V4 Flash (Direct) resolves Peak inside a peak window", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-17T02:00:00Z"));

  assert.equal(resolved.label, "Peak");
  assert.equal(resolved.inputUsd, 0.44);
  assert.equal(resolved.cachedUsd, 0.014);
  assert.equal(resolved.outputUsd, 1.32);
});

test("DeepSeek-V4 Flash (Direct) resolves Off-peak outside the peak windows", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-17T12:00:00Z"));

  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.22);
  assert.equal(resolved.cachedUsd, 0.007);
  assert.equal(resolved.outputUsd, 0.66);
});

// ---------------------------------------------------------------------------
// Peak is exactly 2x off-peak, on every dimension, for both DeepSeek rows.
// ---------------------------------------------------------------------------

test("DeepSeek peak rates are exactly 2x their matching off-peak rates", () => {
  for (const model of ["DeepSeek-V4 Pro", "DeepSeek-V4 Flash"]) {
    const variants = directDeepSeek(model).variants ?? [];
    const peak = variants.find((v) => v.label === "Peak");
    const offPeak = variants.find((v) => v.label === "Off-peak");

    assert.ok(peak, `${model} is missing a Peak variant`);
    assert.ok(offPeak, `${model} is missing an Off-peak variant`);
    assert.equal(peak.inputUsd, offPeak.inputUsd * 2, `${model} input`);
    assert.equal(peak.cachedUsd, (offPeak.cachedUsd as number) * 2, `${model} cached`);
    assert.equal(peak.outputUsd, offPeak.outputUsd * 2, `${model} output`);
  }
});

// ---------------------------------------------------------------------------
// Gemini 3.6 / 3.7 Flash promo reversion
// ---------------------------------------------------------------------------

for (const model of ["Gemini 3.6 Flash", "Gemini 3.7 Flash"]) {
  test(`${model} stays at the promo rate through the last instant of 2026`, () => {
    const resolved = resolveRate(geminiFlash(model), at("2026-12-31T23:59:59Z"));

    assert.equal(resolved.variant, null);
    assert.equal(resolved.inputUsd, 0.75);
    assert.equal(resolved.cachedUsd, 0.075);
    assert.equal(resolved.outputUsd, 3.75);
  });

  test(`${model} reverts to list price at the first instant of 2027`, () => {
    const resolved = resolveRate(geminiFlash(model), at("2027-01-01T00:00:00Z"));

    assert.equal(resolved.label, "Standard (from 2027)");
    assert.equal(resolved.inputUsd, 1.5);
    assert.equal(resolved.cachedUsd, 0.15);
    assert.equal(resolved.outputUsd, 7.5);
    assert.equal(resolved.confidence, "official");
  });
}

// ---------------------------------------------------------------------------
// Qwen3.7 Max (Promo) expiry
// ---------------------------------------------------------------------------

test("Qwen3.7 Max (Promo) stays at the discounted rate through the last instant of August", () => {
  const resolved = resolveRate(qwenMaxPromo(), at("2026-08-31T23:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 1.25);
  assert.equal(resolved.cachedUsd, 0.125);
  assert.equal(resolved.outputUsd, 3.75);
});

test("Qwen3.7 Max (Promo) reverts to list price at the first instant of September", () => {
  const resolved = resolveRate(qwenMaxPromo(), at("2026-09-01T00:00:00Z"));

  assert.equal(resolved.label, "List price (from September)");
  assert.equal(resolved.inputUsd, 2.5);
  assert.equal(resolved.cachedUsd, 0.25);
  assert.equal(resolved.outputUsd, 7.5);
  assert.equal(resolved.confidence, "official");
  // The row's cachedConfidence ("derived") is mirrored onto the variant rather
  // than left to fall back to the row's overall (official) confidence.
  assert.equal(resolved.cachedConfidence, "derived");
});

// ---------------------------------------------------------------------------
// Guard: this migration must not change what the site shows today. Rendering
// still reads the flat inputUsd/cachedUsd/outputUsd fields directly (variants
// are not consumed until Phase 3), so every row's resolved rate "now" must
// equal its base rate exactly.
// ---------------------------------------------------------------------------

test("guard: every catalog row resolves to its own base rate as of today", () => {
  const now = new Date("2026-08-14T12:00:00Z");

  for (const provider of providers) {
    for (const row of provider.entries) {
      const resolved = resolveRate(row, { now });
      const label = `${provider.slug} / ${row.model}${row.host ? ` (${row.host})` : ""}`;

      assert.equal(resolved.variant, null, `${label} should have no matching variant today`);
      assert.equal(resolved.inputUsd, row.inputUsd, `${label} inputUsd`);
      assert.equal(resolved.cachedUsd, row.cachedUsd, `${label} cachedUsd`);
      assert.equal(resolved.outputUsd, row.outputUsd, `${label} outputUsd`);
    }
  }
});
