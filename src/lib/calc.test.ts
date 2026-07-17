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

test("uses DeepSeek's published V4 Pro direct cache-hit rate", () => {
  const result = computeCost(directDeepSeek("DeepSeek-V4 Pro"), {
    inputTokens: 60_000_000,
    outputTokens: 0,
    cacheHitRate: 0.9,
  });

  assert.equal(result.cacheApplied, true);
  assert.equal(result.cachedInputUsd, 0.19575);
  assert.equal(result.freshInputUsd, 2.61);
  assert.ok(Math.abs(result.totalUsd - 2.80575) < 1e-12);
});

test("uses DeepSeek's published V4 Flash direct cache-hit rate", () => {
  const result = computeCost(directDeepSeek("DeepSeek-V4 Flash"), {
    inputTokens: 1_000_000,
    outputTokens: 0,
    cacheHitRate: 1,
  });

  assert.equal(result.cacheApplied, true);
  assert.equal(result.totalUsd, 0.0028);
});

test("omits models that are no longer relevant to the catalog", () => {
  const removedModels = new Set([
    "GPT-5.4",
    "GPT-5.4 mini",
    "GPT-5.4 nano",
    "GPT-5.1",
    "GPT-5",
    "GPT-5 Pro",
    "DeepSeek V3.2",
    "DeepSeek-V3.1",
    "DeepSeek R1",
    "Kimi K2 Thinking",
    "Gemini 3 Pro",
    "Claude Opus 4.8 (Fast Mode)",
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
