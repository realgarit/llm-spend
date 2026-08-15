import assert from "node:assert/strict";
import test from "node:test";

import { getProvider, providers } from "../data/providers";
import { computeCost } from "./calc";

function directDeepSeek(model: string) {
  const provider = getProvider("deepseek");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === model && candidate.host === "DeepSeek direct API",
  );

  assert.ok(entry, `Expected a direct DeepSeek ${model} entry`);
  return entry;
}

// Both direct DeepSeek entries now carry Peak/Off-peak variants effective
// 2026-08-16T16:00:00Z (see providers.ts), so computeCost's default `ctx.now`
// (the real clock) would otherwise make these two tests' expectations flip
// from base to variant pricing the moment that instant passes — a failure
// with nothing to do with any code change. Pin `now` to a date safely before
// that boundary so these stay the "base rate" assertions they're named for,
// forever, regardless of when the suite runs.
const BEFORE_DEEPSEEK_PEAK_SPLIT = { now: new Date("2026-08-15T00:00:00Z") };

test("uses DeepSeek's published V4 Pro direct cache-hit rate", () => {
  const result = computeCost(
    directDeepSeek("DeepSeek-V4 Pro"),
    {
      inputTokens: 60_000_000,
      outputTokens: 0,
      cacheHitRate: 0.9,
    },
    BEFORE_DEEPSEEK_PEAK_SPLIT,
  );

  assert.equal(result.cacheApplied, true);
  assert.equal(result.cachedInputUsd, 0.19575);
  assert.equal(result.freshInputUsd, 2.61);
  assert.ok(Math.abs(result.totalUsd - 2.80575) < 1e-12);
});

test("uses DeepSeek's published V4 Flash direct cache-hit rate", () => {
  const result = computeCost(
    directDeepSeek("DeepSeek-V4 Flash"),
    {
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheHitRate: 1,
    },
    BEFORE_DEEPSEEK_PEAK_SPLIT,
  );

  assert.equal(result.cacheApplied, true);
  assert.equal(result.totalUsd, 0.0028);
});

test("prices DeepSeek's direct V4 Pro at its Peak variant once that regime is in force", () => {
  // 2026-08-20T02:00Z is within the published 01:00-04:00 UTC peak window,
  // well after the 2026-08-16T16:00:00Z split takes effect.
  const result = computeCost(
    directDeepSeek("DeepSeek-V4 Pro"),
    { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 },
    { now: new Date("2026-08-20T02:00:00Z") },
  );

  // Peak input is $1.32/M (vs the base/off-peak $0.435 and $0.66), so this
  // only passes if computeCost actually resolves through the variant instead
  // of always pricing off the entry's flat fields.
  assert.equal(result.totalUsd, 1.32);
});

test("omits models that are no longer relevant to the catalog", () => {
  const removedModels = new Set([
    "GPT-5.4",
    "GPT-5.4 mini",
    "GPT-5.4 nano",
    "GPT-5.1",
    "GPT-5",
    "GPT-5 Pro",
    "DeepSeek V3",
    "DeepSeek V3.2",
    "DeepSeek-V3.1",
    "DeepSeek R1",
    "Kimi K2 Thinking",
    "Gemini 3 Pro",
    "Claude Opus 4.8 (Fast Mode)",
    "Claude Sonnet 5 (Intro)",
    "Claude Sonnet 5 (Standard)",
    "Claude Sonnet 5 (Foundry, Intro)",
    "Claude Sonnet 5 (Foundry, Standard)",
  ]);

  const listedModels = providers.flatMap((provider) => provider.entries.map((entry) => entry.model));

  assert.deepEqual(listedModels.filter((model) => removedModels.has(model)), []);
});

test("prices Kimi K3 direct cache hits at the published rate", () => {
  const kimi = getProvider("kimi");
  const entry = kimi?.entries.find(
    (candidate) => candidate.model === "Kimi K3" && candidate.host === "Kimi direct API",
  );

  assert.ok(entry, "Expected a Kimi K3 direct API entry");

  const result = computeCost(entry, {
    inputTokens: 1_000_000,
    outputTokens: 0,
    cacheHitRate: 1,
  });

  assert.equal(result.totalUsd, 0.3);
});

test("prices Grok 4.5 direct cache hits at xAI's published rate", () => {
  const xai = getProvider("xai");
  const entry = xai?.entries.find(
    (candidate) => candidate.model === "Grok 4.5" && candidate.host === "xAI direct API",
  );

  assert.ok(entry, "Expected a Grok 4.5 direct API entry");

  const result = computeCost(entry, {
    inputTokens: 1_000_000,
    outputTokens: 0,
    cacheHitRate: 1,
  });

  assert.equal(result.totalUsd, 0.3);
});
