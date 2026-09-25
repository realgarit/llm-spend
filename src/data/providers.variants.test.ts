import assert from "node:assert/strict";
import test from "node:test";

import { resolveRate } from "../lib/rates";
import type { PricingEntry } from "./types";
import { getProvider, providers } from "./providers";

/**
 * Catalog integration tests for scheduled, calendar-scoped, and service-tier
 * rates. These assert against real provider data; generic resolver semantics
 * are pinned by src/lib/rates.test.ts against synthetic entries.
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

function glm53Flash(): PricingEntry {
  const provider = getProvider("glm");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === "GLM-5.3-Flash" && candidate.tier === "Direct",
  );

  assert.ok(entry, "Expected the GLM-5.3-Flash entry");
  return entry;
}

function qwen38Flash(): PricingEntry {
  const provider = getProvider("qwen");
  const entry = provider?.entries.find((candidate) => candidate.model === "Qwen3.8 Flash");

  assert.ok(entry, "Expected the Qwen3.8 Flash entry");
  return entry;
}

function qwen38Max(): PricingEntry {
  const provider = getProvider("qwen");
  const entry = provider?.entries.find((candidate) => candidate.model === "Qwen3.8 Max");

  assert.ok(entry, "Expected the Qwen3.8 Max entry");
  return entry;
}

function qwen37TextEmbedding(): PricingEntry {
  const provider = getProvider("embeddings");
  const entry = provider?.entries.find((candidate) => candidate.model === "Qwen3.7 text embedding");

  assert.ok(entry, "Expected the Qwen3.7 text embedding entry");
  return entry;
}

function kimiK27Code(): PricingEntry {
  const provider = getProvider("kimi");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === "Kimi K2.7 Code" && candidate.tier === "Direct",
  );

  assert.ok(entry, "Expected the Kimi K2.7 Code Direct entry");
  return entry;
}

function kimiK26Direct(): PricingEntry {
  const provider = getProvider("kimi");
  const entry = provider?.entries.find((candidate) => candidate.model === "Kimi K2.6" && candidate.tier === "Direct");

  assert.ok(entry, "Expected the Kimi K2.6 Direct entry");
  return entry;
}

function minimaxM3(): PricingEntry {
  const provider = getProvider("minimax");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === "MiniMax M3" && candidate.host === "MiniMax direct API",
  );

  assert.ok(entry, "Expected the MiniMax M3 (direct API) entry");
  return entry;
}

function claudeDirect(model: string): PricingEntry {
  const provider = getProvider("claude");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === model && candidate.tier === "Direct",
  );

  assert.ok(entry, `Expected a direct Claude ${model} entry`);
  return entry;
}

function gpt56Global(model: string): PricingEntry {
  const provider = getProvider("openai-azure");
  const entry = provider?.entries.find((candidate) => candidate.model === model && candidate.tier === "Global");

  assert.ok(entry, `Expected a Global ${model} entry`);
  return entry;
}

function gpt56Tier(model: string, tier: "Global" | "DataZone"): PricingEntry {
  const provider = getProvider("openai-azure");
  const entry = provider?.entries.find((candidate) => candidate.model === model && candidate.tier === tier);

  assert.ok(entry, `Expected a ${tier} ${model} entry`);
  return entry;
}

function gpt6AstraDirect(model: string): PricingEntry {
  const provider = getProvider("openai-azure");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === model && candidate.host === "OpenAI direct API" && candidate.tier === "Direct",
  );

  assert.ok(entry, `Expected a direct OpenAI ${model} entry`);
  return entry;
}

function gptRosalindResearch(): PricingEntry {
  const provider = getProvider("openai-azure");
  const entry = provider?.entries.find(
    (candidate) =>
      candidate.model === "GPT-Rosalind Research" &&
      candidate.host === "OpenAI direct API" &&
      candidate.tier === "Direct",
  );

  assert.ok(entry, "Expected a direct GPT-Rosalind Research entry");
  return entry;
}

function grokDirect(model: string): PricingEntry {
  const provider = getProvider("xai");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === model && candidate.host === "xAI direct API" && candidate.tier === "Direct",
  );

  assert.ok(entry, `Expected a direct xAI ${model} entry`);
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
// DeepSeek-V4.1 Flash (Direct)
// ---------------------------------------------------------------------------

test("DeepSeek-V4.1 Flash (Direct) resolves to the legacy base rate before the V4.1 switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-08-15T12:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.14);
  assert.equal(resolved.cachedUsd, 0.0028);
  assert.equal(resolved.outputUsd, 0.28);
});

test("DeepSeek-V4.1 Flash (Direct) stays on the legacy base rate one second before the old schedule", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-08-16T15:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.14);
});

test("DeepSeek-V4.1 Flash (Direct) enters the legacy off-peak schedule at its old switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-08-16T16:00:00Z"));

  assert.notEqual(resolved.variant, null);
  assert.equal(resolved.label, "Off-peak (legacy V4 Flash)");
  assert.equal(resolved.inputUsd, 0.22);
  assert.equal(resolved.cachedUsd, 0.007);
  assert.equal(resolved.outputUsd, 0.66);
});

test("DeepSeek-V4.1 Flash (Direct) resolves the legacy Peak inside a peak window", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-08-17T02:00:00Z"));

  assert.equal(resolved.label, "Peak (legacy V4 Flash)");
  assert.equal(resolved.inputUsd, 0.44);
  assert.equal(resolved.cachedUsd, 0.014);
  assert.equal(resolved.outputUsd, 1.32);
});

test("DeepSeek-V4.1 Flash (Direct) resolves legacy Off-peak outside the peak windows", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-08-17T12:00:00Z"));

  assert.equal(resolved.label, "Off-peak (legacy V4 Flash)");
  assert.equal(resolved.inputUsd, 0.22);
  assert.equal(resolved.cachedUsd, 0.007);
  assert.equal(resolved.outputUsd, 0.66);
});

test("DeepSeek-V4.1 Flash (Direct) switches to the new off-peak rate at 04:00 UTC", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-09-10T04:00:00Z"));

  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.15);
  assert.equal(resolved.cachedUsd, 0.003);
  assert.equal(resolved.outputUsd, 0.6);
});

test("DeepSeek-V4.1 Flash (Direct) resolves the new Peak schedule", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4.1 Flash"), at("2026-09-10T06:00:00Z"));

  assert.equal(resolved.label, "Peak");
  assert.equal(resolved.inputUsd, 0.3);
  assert.equal(resolved.cachedUsd, 0.006);
  assert.equal(resolved.outputUsd, 1.2);
});

test("DeepSeek V4.1 Flash Direct from Azure stays on Microsoft's flat published rate", () => {
  const entry = getProvider("deepseek")?.entries.find(
    (candidate) => candidate.model === "DeepSeek-V4.1 Flash" && candidate.host === "Direct from Azure",
  );

  assert.ok(entry);
  assert.equal(entry.tier, "Global");
  assert.equal(entry.effectiveDate, "2026-09-24");
  assert.equal(entry.variants, undefined);

  const resolved = resolveRate(entry, { now: new Date("2026-09-24T02:00:00Z") });
  assert.equal(resolved.inputUsd, 0.3);
  assert.equal(resolved.cachedUsd, 0.006);
  assert.equal(resolved.outputUsd, 1.2);
  assert.equal(resolved.variant, null);
});

test("DeepSeek direct Peak schedule falls back on 2026 Chinese public holidays", () => {
  for (const model of ["DeepSeek-V4 Pro", "DeepSeek-V4.1 Flash"]) {
    const holiday = resolveRate(directDeepSeek(model), at("2026-09-25T02:00:00Z"));
    assert.equal(holiday.label, "Off-peak", model);

    const nationalDay = resolveRate(directDeepSeek(model), at("2026-10-01T06:30:00Z"));
    assert.equal(nationalDay.label, "Off-peak", model);

    const ordinaryWeekday = resolveRate(directDeepSeek(model), at("2026-09-24T02:00:00Z"));
    assert.equal(ordinaryWeekday.label, "Peak", model);

    // September 20 is a Sunday make-up workday, but the provider's rule is
    // Monday-Friday, not China's adjusted work schedule.
    const makeUpWorkday = resolveRate(directDeepSeek(model), at("2026-09-20T02:00:00Z"));
    assert.equal(makeUpWorkday.label, "Off-peak", model);
  }
});

// ---------------------------------------------------------------------------
// Peak is exactly 2x off-peak, on every dimension, for both DeepSeek rows.
// ---------------------------------------------------------------------------

test("DeepSeek peak rates are exactly 2x their matching off-peak rates", () => {
  for (const model of ["DeepSeek-V4 Pro", "DeepSeek-V4.1 Flash"]) {
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

test("GPT-6 Astra Foundry rows match Microsoft's published Standard table", () => {
  const provider = getProvider("openai-azure");
  const rows = provider?.entries.filter((entry) => entry.model.startsWith("GPT-6 Astra") && entry.tier !== "Direct");

  assert.ok(rows);
  assert.deepEqual(
    rows.map(({ model, tier, inputUsd, cachedUsd, outputUsd }) => ({
      model,
      tier,
      inputUsd,
      cachedUsd,
      outputUsd,
    })),
    [
      { model: "GPT-6 Astra", tier: "Global", inputUsd: 10, cachedUsd: 1, outputUsd: 50 },
      { model: "GPT-6 Astra Long Context", tier: "Global", inputUsd: 20, cachedUsd: 2, outputUsd: 75 },
      { model: "GPT-6 Astra", tier: "DataZone", inputUsd: 11, cachedUsd: 1.1, outputUsd: 55 },
      { model: "GPT-6 Astra Long Context", tier: "DataZone", inputUsd: 22, cachedUsd: 2.2, outputUsd: 82.5 },
    ],
  );
});

test("GPT-6 Astra Foundry rows are backed by the current retail feed", () => {
  const provider = getProvider("openai-azure");
  const rows = provider?.entries.filter((entry) => entry.model.startsWith("GPT-6 Astra") && entry.tier !== "Direct");

  assert.ok(rows);
  assert.equal(rows.length, 4);
  assert.ok(rows.every((entry) => entry.sourceNote?.includes("Azure OpenAI GPT6")));
  assert.ok(rows.every((entry) => entry.sourceNote?.includes("captured 2026-09-10")));
  assert.ok(rows.every((entry) => !entry.sourceNote?.includes("pending retail")));
});

test("GPT-6 Sol and Luna direct and Foundry rows match the published rates", () => {
  const rows = getProvider("openai-azure")?.entries.filter((entry) => entry.model.startsWith("GPT-6 Sol") || entry.model.startsWith("GPT-6 Luna"));

  assert.ok(rows);
  assert.deepEqual(
    rows.map(({ model, tier, inputUsd, cachedUsd, outputUsd, effectiveDate }) => ({
      model,
      tier,
      inputUsd,
      cachedUsd,
      outputUsd,
      effectiveDate,
    })),
    [
      { model: "GPT-6 Sol", tier: "Direct", inputUsd: 2, cachedUsd: 0.2, outputUsd: 10, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Sol Long Context", tier: "Direct", inputUsd: 4, cachedUsd: 0.4, outputUsd: 15, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Luna", tier: "Direct", inputUsd: 0.1, cachedUsd: 0.01, outputUsd: 0.5, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Luna Long Context", tier: "Direct", inputUsd: 0.2, cachedUsd: 0.02, outputUsd: 0.75, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Sol", tier: "Global", inputUsd: 2, cachedUsd: 0.2, outputUsd: 10, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Sol Long Context", tier: "Global", inputUsd: 4, cachedUsd: 0.4, outputUsd: 15, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Sol", tier: "DataZone", inputUsd: 2.2, cachedUsd: 0.22, outputUsd: 11, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Sol Long Context", tier: "DataZone", inputUsd: 4.4, cachedUsd: 0.44, outputUsd: 16.5, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Luna", tier: "Global", inputUsd: 0.1, cachedUsd: 0.01, outputUsd: 0.5, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Luna Long Context", tier: "Global", inputUsd: 0.2, cachedUsd: 0.02, outputUsd: 0.75, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Luna", tier: "DataZone", inputUsd: 0.11, cachedUsd: 0.011, outputUsd: 0.55, effectiveDate: "2026-09-22" },
      { model: "GPT-6 Luna Long Context", tier: "DataZone", inputUsd: 0.22, cachedUsd: 0.022, outputUsd: 0.825, effectiveDate: "2026-09-22" },
    ],
  );
  assert.ok(rows.every((entry) => entry.confidence === "official"));
  assert.ok(
    rows.filter((entry) => entry.tier !== "Direct").every((entry) => entry.sourceNote?.includes("captured 2026-09-25")),
  );
  assert.ok(rows.every((entry) => !entry.sourceNote?.includes("pending retail-meter publication")));
});

test("GPT-6 Sol and Luna direct variants use published Batch, Flex and Fast prices", () => {
  const provider = getProvider("openai-azure");
  const sol = provider?.entries.find((entry) => entry.model === "GPT-6 Sol" && entry.tier === "Direct");
  const lunaLong = provider?.entries.find((entry) => entry.model === "GPT-6 Luna Long Context" && entry.tier === "Direct");

  assert.ok(sol);
  assert.ok(lunaLong);
  const flex = resolveRate(sol, { ...at("2026-09-23T12:00:00Z"), serviceTier: "flex" });
  const fast = resolveRate(lunaLong, { ...at("2026-09-23T12:00:00Z"), serviceTier: "priority" });
  assert.deepEqual(
    { inputUsd: flex.inputUsd, cachedUsd: flex.cachedUsd, outputUsd: flex.outputUsd, label: flex.label },
    { inputUsd: 1, cachedUsd: 0.1, outputUsd: 5, label: "Flex" },
  );
  assert.deepEqual(
    { inputUsd: fast.inputUsd, cachedUsd: fast.cachedUsd, outputUsd: fast.outputUsd, label: fast.label },
    { inputUsd: 0.4, cachedUsd: 0.04, outputUsd: 1.5, label: "Fast mode" },
  );
});

test("GPT-6 Sol Foundry Priority rates match the retail meters and Luna has no Priority meter", () => {
  const entries = getProvider("openai-azure")?.entries;
  const globalShort = entries?.find((entry) => entry.model === "GPT-6 Sol" && entry.tier === "Global");
  const globalLong = entries?.find((entry) => entry.model === "GPT-6 Sol Long Context" && entry.tier === "Global");
  const dataZoneShort = entries?.find((entry) => entry.model === "GPT-6 Sol" && entry.tier === "DataZone");
  const dataZoneLong = entries?.find((entry) => entry.model === "GPT-6 Sol Long Context" && entry.tier === "DataZone");
  const luna = entries?.find((entry) => entry.model === "GPT-6 Luna" && entry.tier === "Global");

  assert.ok(globalShort);
  assert.ok(globalLong);
  assert.ok(dataZoneShort);
  assert.ok(dataZoneLong);
  assert.ok(luna);

  const resolved = [globalShort, globalLong, dataZoneShort, dataZoneLong].map((entry) =>
    resolveRate(entry, { ...at("2026-09-25T12:00:00Z"), serviceTier: "priority" }),
  );
  assert.deepEqual(
    resolved.map(({ inputUsd, cachedUsd, outputUsd, label, confidence }) => ({ inputUsd, cachedUsd, outputUsd, label, confidence })),
    [
      { inputUsd: 4, cachedUsd: 0.4, outputUsd: 20, label: "Priority", confidence: "official" },
      { inputUsd: 8, cachedUsd: 0.8, outputUsd: 30, label: "Priority", confidence: "official" },
      { inputUsd: 4.4, cachedUsd: 0.44, outputUsd: 22, label: "Priority", confidence: "official" },
      { inputUsd: 8.8, cachedUsd: 0.88, outputUsd: 33, label: "Priority", confidence: "official" },
    ],
  );
  const solFoundryEntries = [globalShort, globalLong, dataZoneShort, dataZoneLong];
  assert.ok(
    solFoundryEntries.every((entry) =>
      entry.variants?.some(
        (variant) =>
          variant.conditions.serviceTier === "priority" &&
          variant.sourceNote?.includes("captured 2026-09-25"),
      ),
    ),
  );
  assert.ok(
    dataZoneShort.variants?.some((variant) => variant.sourceNote?.includes("EU-region PP meters")),
  );

  const lunaPriority = resolveRate(luna, { ...at("2026-09-25T12:00:00Z"), serviceTier: "priority" });
  assert.equal(lunaPriority.variant, null);
  assert.equal(lunaPriority.inputUsd, 0.1);
});

test("Claude Opus 5.5 direct and Foundry rows reflect CCU and data-zone pricing", () => {
  const entries = getProvider("claude")?.entries;
  const direct = entries?.find((entry) => entry.model === "Claude Opus 5.5" && entry.tier === "Direct");
  const global = entries?.find((entry) => entry.model === "Claude Opus 5.5" && entry.tier === "Global");
  const dataZone = entries?.find((entry) => entry.model === "Claude Opus 5.5" && entry.tier === "DataZone");
  const sonnetFoundry = entries?.find((entry) => entry.model.includes("Sonnet 5") && entry.tier === "Global");

  assert.ok(direct);
  assert.ok(global);
  assert.ok(dataZone);
  assert.ok(sonnetFoundry);
  assert.deepEqual(
    [direct, global, dataZone].map(({ inputUsd, cachedUsd, outputUsd, confidence }) => ({
      inputUsd,
      cachedUsd,
      outputUsd,
      confidence,
    })),
    [
      { inputUsd: 4, cachedUsd: 0.2, outputUsd: 20, confidence: "official" },
      { inputUsd: 4, cachedUsd: 0.2, outputUsd: 20, confidence: "official" },
      { inputUsd: 4.4, cachedUsd: 0.22, outputUsd: 22, confidence: "official" },
    ],
  );
  assert.equal(sonnetFoundry.confidence, "official");
  assert.equal(resolveRate(direct, { ...at("2026-09-23T12:00:00Z"), serviceTier: "batch" }).cachedUsd, 0.1);
  assert.equal(resolveRate(direct, { ...at("2026-09-23T12:00:00Z"), serviceTier: "priority" }).cachedUsd, 0.4);
});

test("MAI-Thinking-1 matches the named commercial Foundry meters", () => {
  const provider = getProvider("microsoft-ai");
  const [entry] = provider?.entries ?? [];

  assert.ok(entry);
  assert.deepEqual(
    {
      model: entry.model,
      tier: entry.tier,
      inputUsd: entry.inputUsd,
      cachedUsd: entry.cachedUsd,
      outputUsd: entry.outputUsd,
      contextWindow: entry.contextWindow,
      maxOutput: entry.maxOutput,
      effectiveDate: entry.effectiveDate,
    },
    {
      model: "MAI-Thinking-1",
      tier: "Global",
      inputUsd: 2,
      cachedUsd: 0.2,
      outputUsd: 8,
      contextWindow: 256_000,
      maxOutput: 64_000,
      effectiveDate: "2026-08-01",
    },
  );
  assert.equal(entry.confidence, "official");
  assert.ok(entry.sourceNote?.includes("MAI-Thinking-1 Inp glbl 1M Tokens"));
  assert.ok(entry.sourceNote?.includes("captured 2026-09-16"));
});

test("MAI-Code-1.1-Flash matches the new commercial Foundry meters", () => {
  const provider = getProvider("microsoft-ai");
  const entry = provider?.entries.find((candidate) => candidate.model === "MAI-Code-1.1-Flash");

  assert.ok(entry);
  assert.deepEqual(
    {
      tier: entry.tier,
      inputUsd: entry.inputUsd,
      cachedUsd: entry.cachedUsd,
      outputUsd: entry.outputUsd,
      effectiveDate: entry.effectiveDate,
    },
    {
      tier: "Global",
      inputUsd: 0.2,
      cachedUsd: 0.02,
      outputUsd: 1.2,
      effectiveDate: "2026-09-01",
    },
  );
  assert.equal(entry.confidence, "official");
  assert.ok(entry.sourceNote?.includes("Code 1.1 Flash Input glbl 1M Tokens"));
  assert.ok(entry.sourceNote?.includes("captured 2026-09-17"));
});

test("new Fireworks Global lanes match the September 1 retail meters", () => {
  const deepseek = getProvider("deepseek")?.entries.find(
    (entry) => entry.model === "DeepSeek-V4.1 Flash" && entry.host === "Fireworks-hosted" && entry.tier === "Global",
  );
  const glm = getProvider("glm")?.entries.find(
    (entry) => entry.model === "GLM-5.3-Flash" && entry.host === "Fireworks-hosted" && entry.tier === "Global",
  );
  const kimi = getProvider("kimi")?.entries.find(
    (entry) => entry.model === "Kimi K3" && entry.host === "Fireworks-hosted" && entry.tier === "Global",
  );

  assert.ok(deepseek);
  assert.ok(glm);
  assert.ok(kimi);
  assert.deepEqual(
    [deepseek, glm, kimi].map(({ inputUsd, cachedUsd, outputUsd, effectiveDate }) => ({
      inputUsd,
      cachedUsd,
      outputUsd,
      effectiveDate,
    })),
    [
      { inputUsd: 0.375, cachedUsd: 0.008, outputUsd: 1.5, effectiveDate: "2026-09-01" },
      { inputUsd: 0.188, cachedUsd: 0.038, outputUsd: 0.625, effectiveDate: "2026-09-01" },
      { inputUsd: 3, cachedUsd: 0.3, outputUsd: 15, effectiveDate: "2026-09-01" },
    ],
  );
  assert.ok(deepseek.sourceNote?.includes("FW DS-V4.1-Flash Gl Inp Tokens"));
  assert.ok(glm.sourceNote?.includes("FW GLM-5.3-Flash Gl Inp Tokens"));
  assert.ok(kimi.sourceNote?.includes("FW Kimi-K3 Gl Inp Tokens"));
});

test("GLM-5.3 Foundry rows match the current Fireworks retail meters", () => {
  const provider = getProvider("glm");
  const rows = provider?.entries.filter(
    (entry) => entry.model === "GLM 5.3" && entry.host === "Fireworks-hosted",
  );

  assert.ok(rows);
  assert.deepEqual(
    rows.map(({ tier, inputUsd, cachedUsd, outputUsd, contextWindow, maxOutput }) => ({
      tier,
      inputUsd,
      cachedUsd,
      outputUsd,
      contextWindow,
      maxOutput,
    })),
    [
      {
        tier: "Global",
        inputUsd: 1.75,
        cachedUsd: 0.325,
        outputUsd: 5.5,
        contextWindow: 1_000_000,
        maxOutput: 128_000,
      },
      {
        tier: "DataZone",
        inputUsd: 2.1,
        cachedUsd: 0.39,
        outputUsd: 6.6,
        contextWindow: 1_000_000,
        maxOutput: 128_000,
      },
    ],
  );
  assert.ok(rows.every((entry) => entry.sourceNote?.includes("captured 2026-09-10")));
});

test("GLM-5.3-FlashX carries Z.ai's official direct rate and limits", () => {
  const entry = getProvider("glm")?.entries.find(
    (candidate) => candidate.model === "GLM-5.3-FlashX" && candidate.tier === "Direct",
  );

  assert.ok(entry);
  assert.deepEqual(
    {
      inputUsd: entry.inputUsd,
      cachedUsd: entry.cachedUsd,
      outputUsd: entry.outputUsd,
      contextWindow: entry.contextWindow,
      maxOutput: entry.maxOutput,
      effectiveDate: entry.effectiveDate,
    },
    {
      inputUsd: 0.37,
      cachedUsd: 0.075,
      outputUsd: 1.25,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      effectiveDate: "2026-09-18",
    },
  );
  assert.ok(entry.sourceNote?.includes("glm-5.3-flashx"));
  assert.ok(entry.sourceNote?.includes("no FlashX meter"));
});

test("Grok 4.6 Foundry rows use the official Global meters only", () => {
  const provider = getProvider("xai");
  const rows = provider?.entries.filter((entry) => entry.model.startsWith("Grok 4.6") && entry.tier !== "Direct");

  assert.ok(rows);
  assert.deepEqual(
    rows.map(({ model, tier, inputUsd, cachedUsd, outputUsd, contextWindow, maxOutput }) => ({
      model,
      tier,
      inputUsd,
      cachedUsd,
      outputUsd,
      contextWindow,
      maxOutput,
    })),
    [
      {
        model: "Grok 4.6",
        tier: "Global",
        inputUsd: 2,
        cachedUsd: 0.5,
        outputUsd: 6,
        contextWindow: 200_000,
        maxOutput: 128_000,
      },
      {
        model: "Grok 4.6 Long Context",
        tier: "Global",
        inputUsd: 4,
        cachedUsd: 1,
        outputUsd: 12,
        contextWindow: 200_000,
        maxOutput: 128_000,
      },
    ],
  );
  assert.ok(rows.every((entry) => entry.sourceNote?.includes("captured 2026-09-11")));
});

test("Grok 4.7 uses xAI's official direct pricing and has no Foundry lane", () => {
  const provider = getProvider("xai");
  const entry = grokDirect("Grok 4.7");

  assert.deepEqual(
    {
      inputUsd: entry.inputUsd,
      cachedUsd: entry.cachedUsd,
      outputUsd: entry.outputUsd,
      contextWindow: entry.contextWindow,
      effectiveDate: entry.effectiveDate,
    },
    {
      inputUsd: 2,
      cachedUsd: 0.5,
      outputUsd: 6,
      contextWindow: 500_000,
      effectiveDate: "2026-09-21",
    },
  );

  const standard = resolveRate(entry, { now: new Date("2026-09-21T12:00:00Z") });
  assert.equal(standard.variant, null);
  assert.deepEqual(
    { inputUsd: standard.inputUsd, cachedUsd: standard.cachedUsd, outputUsd: standard.outputUsd },
    { inputUsd: 2, cachedUsd: 0.5, outputUsd: 6 },
  );

  const long = grokDirect("Grok 4.7 Long Context");
  assert.equal(long.variants, undefined);
  assert.deepEqual(
    { inputUsd: long.inputUsd, cachedUsd: long.cachedUsd, outputUsd: long.outputUsd, contextWindow: long.contextWindow },
    { inputUsd: 4, cachedUsd: 1, outputUsd: 12, contextWindow: 500_000 },
  );

  assert.equal(
    provider?.entries.some((candidate) => candidate.model.startsWith("Grok 4.7") && candidate.tier !== "Direct"),
    false,
  );
  assert.match(entry.sourceNote ?? "", /zero Foundry meters containing 4\.7/);
  assert.match(long.sourceNote ?? "", /zero Foundry meters containing 4\.7/);
});

test("GPT-6 Astra direct rows match OpenAI's published Standard API pricing", () => {
  const provider = getProvider("openai-azure");
  const rows = provider?.entries.filter(
    (entry) => entry.model.startsWith("GPT-6 Astra") && entry.host === "OpenAI direct API" && entry.tier === "Direct",
  );

  assert.ok(rows);
  assert.deepEqual(
    rows.map(({ model, tier, host, inputUsd, cachedUsd, outputUsd, contextWindow, maxOutput }) => ({
      model,
      tier,
      host,
      inputUsd,
      cachedUsd,
      outputUsd,
      contextWindow,
      maxOutput,
    })),
    [
      {
        model: "GPT-6 Astra",
        tier: "Direct",
        host: "OpenAI direct API",
        inputUsd: 10,
        cachedUsd: 1,
        outputUsd: 50,
        contextWindow: 1_050_000,
        maxOutput: 128_000,
      },
      {
        model: "GPT-6 Astra Long Context",
        tier: "Direct",
        host: "OpenAI direct API",
        inputUsd: 20,
        cachedUsd: 2,
        outputUsd: 75,
        contextWindow: 1_050_000,
        maxOutput: 128_000,
      },
    ],
  );
});

test("GPT-6 Astra direct rows resolve OpenAI's Batch, Flex and Fast schedules", () => {
  const expected = [
    {
      model: "GPT-6 Astra",
      standard: { inputUsd: 10, cachedUsd: 1, outputUsd: 50 },
      batch: { inputUsd: 5, cachedUsd: 0.5, outputUsd: 25 },
      flex: { inputUsd: 5, cachedUsd: 0.5, outputUsd: 25 },
      priority: { inputUsd: 20, cachedUsd: 2, outputUsd: 100 },
    },
    {
      model: "GPT-6 Astra Long Context",
      standard: { inputUsd: 20, cachedUsd: 2, outputUsd: 75 },
      batch: { inputUsd: 10, cachedUsd: 1, outputUsd: 37.5 },
      flex: { inputUsd: 10, cachedUsd: 1, outputUsd: 37.5 },
      priority: { inputUsd: 40, cachedUsd: 4, outputUsd: 150 },
    },
  ] as const;

  for (const { model, standard, batch, flex, priority } of expected) {
    const entry = gpt6AstraDirect(model);
    const standardResolved = resolveRate(entry, at("2026-09-07T12:00:00Z"));
    assert.deepEqual(
      {
        inputUsd: standardResolved.inputUsd,
        cachedUsd: standardResolved.cachedUsd,
        outputUsd: standardResolved.outputUsd,
      },
      standard,
      `${model} standard`,
    );

    for (const [serviceTier, rates] of Object.entries({ batch, flex, priority })) {
      const resolved = resolveRate(entry, {
        now: new Date("2026-09-07T12:00:00Z"),
        serviceTier: serviceTier as "batch" | "flex" | "priority",
      });
      assert.deepEqual(
        {
          inputUsd: resolved.inputUsd,
          cachedUsd: resolved.cachedUsd,
          outputUsd: resolved.outputUsd,
        },
        rates,
        `${model} ${serviceTier}`,
      );
    }
  }
});

test("GPT-Rosalind Research carries OpenAI's future billing date and specialist rate", () => {
  const entry = gptRosalindResearch();

  assert.deepEqual(
    {
      model: entry.model,
      host: entry.host,
      tier: entry.tier,
      inputUsd: entry.inputUsd,
      cachedUsd: entry.cachedUsd,
      outputUsd: entry.outputUsd,
      confidence: entry.confidence,
      effectiveDate: entry.effectiveDate,
    },
    {
      model: "GPT-Rosalind Research",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 5,
      cachedUsd: 0.5,
      outputUsd: 25,
      confidence: "official",
      effectiveDate: "2026-10-05",
    },
  );
  assert.match(entry.notes ?? "", /approved internal research/i);
  assert.match(entry.notes ?? "", /2026-10-05/);
  assert.match(entry.sourceNote ?? "", /gpt-rosalind-research/);
  assert.match(entry.sourceNote ?? "", /no Rosalind token meter/i);
});

test("Gemini 3.8 Flash carries its published model limits", () => {
  const entry = geminiFlash("Gemini 3.8 Flash");

  assert.equal(entry.contextWindow, 1_048_576);
  assert.equal(entry.maxOutput, 65_536);
  assert.equal(entry.confidence, "official");
});

// ---------------------------------------------------------------------------
// Gemini 3.6 / 3.7 / 3.8 Flash promo reversion
// ---------------------------------------------------------------------------

for (const model of ["Gemini 3.6 Flash", "Gemini 3.7 Flash", "Gemini 3.8 Flash"]) {
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
// New direct model and cache rates
// ---------------------------------------------------------------------------

test("GLM-5.3-Flash resolves its current promo and dated list-price reversion", () => {
  const beforeExpiry = resolveRate(glm53Flash(), at("2026-09-09T15:59:59Z"));
  const afterExpiry = resolveRate(glm53Flash(), at("2026-09-09T16:00:00Z"));

  assert.equal(beforeExpiry.inputUsd, 0.075);
  assert.equal(beforeExpiry.cachedUsd, 0.015);
  assert.equal(beforeExpiry.outputUsd, 0.25);
  assert.equal(beforeExpiry.variant, null);
  assert.equal(afterExpiry.label, "List price (from September 10)");
  assert.equal(afterExpiry.inputUsd, 0.15);
  assert.equal(afterExpiry.cachedUsd, 0.03);
  assert.equal(afterExpiry.outputUsd, 0.5);
});

test("Qwen3.8 rows use the official cache rates and Qwen3.7 embedding is input-only", () => {
  const qwen38FlashRate = resolveRate(qwen38Flash(), at("2026-08-28T12:00:00Z"));
  const qwen38MaxRate = resolveRate(qwen38Max(), at("2026-08-28T12:00:00Z"));
  const embedding = qwen37TextEmbedding();

  assert.deepEqual(
    {
      inputUsd: qwen38FlashRate.inputUsd,
      cachedUsd: qwen38FlashRate.cachedUsd,
      outputUsd: qwen38FlashRate.outputUsd,
    },
    { inputUsd: 0.15, cachedUsd: 0.016, outputUsd: 0.47 },
  );
  assert.equal(qwen38FlashRate.confidence, "official");
  assert.equal(qwen38MaxRate.cachedUsd, 0.17);
  assert.equal(qwen38MaxRate.cachedConfidence, "official");
  assert.deepEqual(
    {
      inputUsd: embedding.inputUsd,
      cachedUsd: embedding.cachedUsd,
      outputUsd: embedding.outputUsd,
      contextWindow: embedding.contextWindow,
    },
    { inputUsd: 0.07, cachedUsd: null, outputUsd: 0, contextWindow: 128_000 },
  );
});

// ---------------------------------------------------------------------------
// Claude Fable/Mythos 5.1 direct lanes
// ---------------------------------------------------------------------------

for (const model of ["Claude Fable 5.1", "Claude Mythos 5.1"]) {
  test(`${model} uses Anthropic's published cache-read rate`, () => {
    const entry = claudeDirect(model);

    assert.deepEqual(
      {
        inputUsd: entry.inputUsd,
        cachedUsd: entry.cachedUsd,
        outputUsd: entry.outputUsd,
        contextWindow: entry.contextWindow,
        maxOutput: entry.maxOutput,
        confidence: entry.confidence,
        effectiveDate: entry.effectiveDate,
      },
      {
        inputUsd: 10,
        cachedUsd: 0.25,
        outputUsd: 50,
        contextWindow: 1_000_000,
        maxOutput: 128_000,
        confidence: "official",
        effectiveDate: "2026-09-01",
      },
    );
  });
}

// ---------------------------------------------------------------------------
// Kimi K2.7 Code — Highspeed service tier (Moonshot's naming; 2x standard)
// ---------------------------------------------------------------------------

test("Kimi K2.7 Code resolves the Highspeed variant under the highspeed service tier", () => {
  const resolved = resolveRate(kimiK27Code(), { now: new Date("2026-08-20T12:00:00Z"), serviceTier: "highspeed" });

  assert.equal(resolved.label, "Highspeed");
  assert.equal(resolved.inputUsd, 1.9);
  assert.equal(resolved.cachedUsd, 0.38);
  assert.equal(resolved.outputUsd, 8.0);
  assert.equal(resolved.confidence, "official");
});

test("Kimi K2.7 Code stays on its base rate without a service tier (defaults to standard)", () => {
  const standard = resolveRate(kimiK27Code(), { now: new Date("2026-08-20T12:00:00Z") });
  const explicitStandard = resolveRate(kimiK27Code(), {
    now: new Date("2026-08-20T12:00:00Z"),
    serviceTier: "standard",
  });

  for (const resolved of [standard, explicitStandard]) {
    assert.equal(resolved.variant, null);
    assert.equal(resolved.inputUsd, 0.95);
    assert.equal(resolved.cachedUsd, 0.19);
    assert.equal(resolved.outputUsd, 4.0);
  }
});

test("Kimi K2.6 and K2.7 Code Direct Batch rates match the official BatchJob table", () => {
  const k26 = resolveRate(kimiK26Direct(), { now: new Date("2026-09-24T12:00:00Z"), serviceTier: "batch" });
  const k27 = resolveRate(kimiK27Code(), { now: new Date("2026-09-24T12:00:00Z"), serviceTier: "batch" });

  assert.deepEqual(
    { inputUsd: k26.inputUsd, cachedUsd: k26.cachedUsd, outputUsd: k26.outputUsd, label: k26.label },
    { inputUsd: 0.57, cachedUsd: 0.1, outputUsd: 2.4, label: "Batch" },
  );
  assert.deepEqual(
    { inputUsd: k27.inputUsd, cachedUsd: k27.cachedUsd, outputUsd: k27.outputUsd, label: k27.label },
    { inputUsd: 0.57, cachedUsd: 0.114, outputUsd: 2.4, label: "Batch" },
  );
});

// ---------------------------------------------------------------------------
// Gemini 3.6 / 3.7 / 3.8 Flash — Batch, Flex, Priority, each combined with the
// existing 2027-01-01 promo-reversion date. Batch and Flex are numerically
// identical (both exactly 50% of Standard) but are distinct ServiceTier
// values, so both are asserted independently rather than assumed equal.
// ---------------------------------------------------------------------------

const GEMINI_TIER_CASES = [
  {
    tier: "batch" as const,
    label: "Batch",
    labelAfter: "Batch (from 2027)",
    before: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
    after: { inputUsd: 0.75, cachedUsd: 0.075, outputUsd: 3.75 },
  },
  {
    tier: "flex" as const,
    label: "Flex",
    labelAfter: "Flex (from 2027)",
    before: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
    after: { inputUsd: 0.75, cachedUsd: 0.075, outputUsd: 3.75 },
  },
  {
    tier: "priority" as const,
    label: "Priority",
    labelAfter: "Priority (from 2027)",
    before: { inputUsd: 1.35, cachedUsd: 0.135, outputUsd: 6.75 },
    after: { inputUsd: 2.7, cachedUsd: 0.27, outputUsd: 13.5 },
  },
];

for (const model of ["Gemini 3.6 Flash", "Gemini 3.7 Flash", "Gemini 3.8 Flash"]) {
  for (const { tier, label, labelAfter, before, after } of GEMINI_TIER_CASES) {
    test(`${model} resolves ${label}'s promo-period numbers before 2027`, () => {
      const resolved = resolveRate(geminiFlash(model), {
        now: new Date("2026-12-31T23:59:59Z"),
        serviceTier: tier,
      });

      assert.equal(resolved.label, label);
      assert.equal(resolved.inputUsd, before.inputUsd);
      assert.equal(resolved.cachedUsd, before.cachedUsd);
      assert.equal(resolved.outputUsd, before.outputUsd);
      assert.equal(resolved.confidence, "official");
    });

    test(`${model} resolves ${label}'s post-reversion numbers from 2027-01-01`, () => {
      const resolved = resolveRate(geminiFlash(model), {
        now: new Date("2027-01-01T00:00:00Z"),
        serviceTier: tier,
      });

      assert.equal(resolved.label, labelAfter);
      assert.equal(resolved.inputUsd, after.inputUsd);
      assert.equal(resolved.cachedUsd, after.cachedUsd);
      assert.equal(resolved.outputUsd, after.outputUsd);
      assert.equal(resolved.confidence, "official");
    });
  }

  test(`${model} is unaffected by the new tier variants when no service tier is given`, () => {
    const before = resolveRate(geminiFlash(model), { now: new Date("2026-12-31T23:59:59Z") });
    assert.equal(before.variant, null);
    assert.equal(before.inputUsd, 0.75);
    assert.equal(before.cachedUsd, 0.075);
    assert.equal(before.outputUsd, 3.75);

    const after = resolveRate(geminiFlash(model), { now: new Date("2027-01-01T00:00:00Z") });
    assert.equal(after.label, "Standard (from 2027)");
    assert.equal(after.inputUsd, 1.5);
    assert.equal(after.cachedUsd, 0.15);
    assert.equal(after.outputUsd, 7.5);
  });
}

// ---------------------------------------------------------------------------
// MiniMax M3 (Direct) — Priority service tier (exactly 1.5x standard)
// ---------------------------------------------------------------------------

test("MiniMax M3 (Direct) resolves the Priority variant under the priority service tier", () => {
  const resolved = resolveRate(minimaxM3(), { now: new Date("2026-08-20T12:00:00Z"), serviceTier: "priority" });

  assert.equal(resolved.label, "Priority");
  assert.equal(resolved.inputUsd, 0.45);
  assert.equal(resolved.cachedUsd, 0.09);
  assert.equal(resolved.outputUsd, 1.8);
  assert.equal(resolved.confidence, "official");
});

test("MiniMax M3 (Direct) stays on its base rate without a service tier", () => {
  const resolved = resolveRate(minimaxM3(), { now: new Date("2026-08-20T12:00:00Z") });

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.3);
  assert.equal(resolved.cachedUsd, 0.06);
  assert.equal(resolved.outputUsd, 1.2);
});

// ---------------------------------------------------------------------------
// GPT-5.6 Sol / Terra / Luna (Global) — Priority ("PP" in Azure's own meter
// names) service tier, exactly 2x each row's own Standard Global rate.
// ---------------------------------------------------------------------------

const GPT56_PRIORITY_CASES = [
  {
    model: "GPT-5.6 Sol",
    base: { inputUsd: 5.0, cachedUsd: 0.5, outputUsd: 30.0 },
    priority: { inputUsd: 10.0, cachedUsd: 1.0, outputUsd: 60.0 },
  },
  {
    model: "GPT-5.6 Terra",
    base: { inputUsd: 2.0, cachedUsd: 0.2, outputUsd: 12.0 },
    priority: { inputUsd: 4.0, cachedUsd: 0.4, outputUsd: 24.0 },
  },
  {
    model: "GPT-5.6 Luna",
    base: { inputUsd: 0.2, cachedUsd: 0.02, outputUsd: 1.2 },
    priority: { inputUsd: 0.4, cachedUsd: 0.04, outputUsd: 2.4 },
  },
];

for (const { model, base, priority } of GPT56_PRIORITY_CASES) {
  test(`${model} (Global) resolves the Priority variant at exactly 2x its Standard rate`, () => {
    const resolved = resolveRate(gpt56Global(model), {
      now: new Date("2026-08-20T12:00:00Z"),
      serviceTier: "priority",
    });

    assert.equal(resolved.label, "Priority");
    assert.equal(resolved.inputUsd, priority.inputUsd);
    assert.equal(resolved.cachedUsd, priority.cachedUsd);
    assert.equal(resolved.outputUsd, priority.outputUsd);
    assert.equal(resolved.inputUsd, base.inputUsd * 2);
    assert.equal(resolved.cachedUsd, (base.cachedUsd as number) * 2);
    assert.equal(resolved.outputUsd, base.outputUsd * 2);
    assert.equal(resolved.confidence, "official");
  });

  test(`${model} (Global) stays on its base rate without a service tier`, () => {
    const resolved = resolveRate(gpt56Global(model), { now: new Date("2026-08-20T12:00:00Z") });

    assert.equal(resolved.variant, null);
    assert.equal(resolved.inputUsd, base.inputUsd);
    assert.equal(resolved.cachedUsd, base.cachedUsd);
    assert.equal(resolved.outputUsd, base.outputUsd);
  });
}

test("GPT-5.6 Sol resolves the commercial September 1 retail tranche", () => {
  const cases = [
    {
      model: "GPT-5.6 Sol",
      tier: "Global" as const,
      standard: { inputUsd: 4.0, cachedUsd: 0.4, outputUsd: 20.0 },
      priority: { inputUsd: 8.0, cachedUsd: 0.8, outputUsd: 40.0 },
    },
    {
      model: "GPT-5.6 Sol",
      tier: "DataZone" as const,
      standard: { inputUsd: 4.4, cachedUsd: 0.44, outputUsd: 22.0 },
      priority: { inputUsd: 8.8, cachedUsd: 0.88, outputUsd: 44.0 },
    },
    {
      model: "GPT-5.6 Sol Long Context",
      tier: "Global" as const,
      standard: { inputUsd: 8.0, cachedUsd: 0.8, outputUsd: 30.0 },
      priority: { inputUsd: 16.0, cachedUsd: 1.6, outputUsd: 60.0 },
    },
    {
      model: "GPT-5.6 Sol Long Context",
      tier: "DataZone" as const,
      standard: { inputUsd: 8.8, cachedUsd: 0.88, outputUsd: 33.0 },
      priority: { inputUsd: 17.6, cachedUsd: 1.76, outputUsd: 66.0 },
    },
  ] as const;

  for (const { model, tier, standard, priority } of cases) {
    const entry = gpt56Tier(model, tier);
    const standardResolved = resolveRate(entry, at("2026-09-14T12:00:00Z"));
    assert.deepEqual(
      {
        inputUsd: standardResolved.inputUsd,
        cachedUsd: standardResolved.cachedUsd,
        outputUsd: standardResolved.outputUsd,
      },
      standard,
      `${model} ${tier} standard`,
    );

    const priorityResolved = resolveRate(entry, {
      now: new Date("2026-09-14T12:00:00Z"),
      serviceTier: "priority",
    });
    assert.deepEqual(
      {
        inputUsd: priorityResolved.inputUsd,
        cachedUsd: priorityResolved.cachedUsd,
        outputUsd: priorityResolved.outputUsd,
      },
      priority,
      `${model} ${tier} priority`,
    );
    assert.equal(priorityResolved.confidence, "official");
  }
});

test("GPT-5.6 Terra and Luna long-context rows expose the new retail Priority meters", () => {
  for (const [model, expected] of [
    ["GPT-5.6 Terra Long Context", { inputUsd: 8.0, cachedUsd: 0.8, outputUsd: 36.0 }],
    ["GPT-5.6 Luna Long Context", { inputUsd: 0.8, cachedUsd: 0.08, outputUsd: 3.6 }],
  ] as const) {
    const resolved = resolveRate(gpt56Global(model), {
      now: new Date("2026-09-14T12:00:00Z"),
      serviceTier: "priority",
    });

    assert.equal(resolved.label, "Priority (from 2026-09-01)");
    assert.deepEqual(
      {
        inputUsd: resolved.inputUsd,
        cachedUsd: resolved.cachedUsd,
        outputUsd: resolved.outputUsd,
      },
      expected,
      model,
    );
  }
});

// ---------------------------------------------------------------------------
// Guard: keep the resolver's current state explicit as real dates pass. Rows
// whose dated variants are intentionally active at the pinned instant are
// allowlisted below; every other row must still resolve to its flat base rate.
// ---------------------------------------------------------------------------

// Rows that are EXPECTED to resolve to a non-null variant at the pinned
// historical `now` below — a periodic maintenance task done by hand (see
// AGENTS.md working notes). Without this allowlist, a scheduled rate regime
// would fail the guard even though nothing is actually wrong — the variant is
// doing exactly what it was authored to do.
//
// Before adding a row here, confirm its active variant is intentional (not an
// authoring mistake, e.g. a `from` date wrongly set in the past) by checking
// the variant's own `sourceNote`.
const ROWS_WITH_PERMANENTLY_ACTIVE_VARIANTS = new Set<string>([
  // DeepSeek's Peak/Off-peak pair is active at the pinned 2026-09-24
  // instant; the V4.1 transition later bounds that legacy regime.
  "deepseek / DeepSeek-V4 Pro (DeepSeek direct API)",
  "deepseek / DeepSeek-V4.1 Flash (DeepSeek direct API)",
  // Commercial GPT-5.6 Sol Global and Data Zone short-context rows and the
  // Global long-context row use the new retail tranche effective September 1.
  "openai-azure / GPT-5.6 Sol",
  "openai-azure / GPT-5.6 Sol Long Context",
  // GLM-5.3-Flash's dated promotion reversion became active on September 9.
  "glm / GLM-5.3-Flash (Z.ai direct API)",
  // Qwen3.7 Max's promo reverts to list price via a "List price (from
  // September)" variant with `{ from: "2026-09-01T00:00:00Z" }` and no
  // `until` — permanently active from that instant on.
  "qwen / Qwen3.7 Max (Promo) (Model Studio (Intl))",
  // Gemini 3.6/3.7/3.8 Flash's "Standard (from 2027)" variant reverts the promo
  // rate via `{ from: "2027-01-01T00:00:00Z" }` with no `until` or
  // `serviceTier` — permanently active from that instant on. (Their other
  // Batch/Flex/Priority variants are `serviceTier`-scoped and never match
  // this guard's plain `{ now }` context, so they need no allowlist entry.)
  "gemini / Gemini 3.6 Flash",
  "gemini / Gemini 3.7 Flash",
  "gemini / Gemini 3.8 Flash",
]);

test("guard: every catalog row resolves to its own base rate as of today", () => {
  // A literal, not `Date.now()`, so the guard is deterministic — bump it by
  // hand as real time passes, or it stops representing an actual "today".
  const now = new Date("2026-09-24T12:00:00Z");

  for (const provider of providers) {
    for (const row of provider.entries) {
      const resolved = resolveRate(row, { now });
      const label = `${provider.slug} / ${row.model}${row.host ? ` (${row.host})` : ""}`;

      if (resolved.variant === null) {
        assert.equal(resolved.variant, null, `${label} should have no matching variant today`);
        assert.equal(resolved.inputUsd, row.inputUsd, `${label} inputUsd`);
        assert.equal(resolved.cachedUsd, row.cachedUsd, `${label} cachedUsd`);
        assert.equal(resolved.outputUsd, row.outputUsd, `${label} outputUsd`);
        continue;
      }

      assert.ok(
        ROWS_WITH_PERMANENTLY_ACTIVE_VARIANTS.has(label),
        `${label} resolved to a non-null variant ("${resolved.label}") today, but is not on the ` +
          `allowlist of rows with a known permanently-active variant. This usually means a variant's ` +
          `\`from\`/\`until\` was authored incorrectly (e.g. a date wrongly set in the past) — check its ` +
          `\`sourceNote\` before adding it to the allowlist.`,
      );
    }
  }
});
