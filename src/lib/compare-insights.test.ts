import assert from "node:assert/strict";
import test from "node:test";
import type { Confidence, Tier } from "@/data/types";
import type { ComparedRow } from "@/lib/scenario";
import {
  DEFAULT_COMPARE_FILTERS,
  WORKLOAD_PRESETS,
  buildCostLeaders,
  filterComparedRows,
  limitComparedRows,
  workloadMatchesPreset,
} from "@/lib/compare-insights";

function compared({
  id,
  provider = "Example",
  model = "Example Model",
  host,
  tier = "Direct",
  totalUsd = 10,
  cachedUsd = 0.1,
  confidence = "official",
  cachedConfidence = confidence,
}: {
  id: string;
  provider?: string;
  model?: string;
  host?: string;
  tier?: Tier;
  totalUsd?: number;
  cachedUsd?: number | null;
  confidence?: Confidence;
  cachedConfidence?: Confidence;
}): ComparedRow {
  return {
    row: {
      id,
      provider,
      providerSlug: provider.toLocaleLowerCase().replaceAll(" ", "-"),
      model,
      host,
      tier,
      inputUsd: 1,
      cachedUsd,
      outputUsd: 4,
      confidence,
      cachedConfidence,
    },
    resolved: {
      inputUsd: 1,
      cachedUsd,
      outputUsd: 4,
      confidence,
      cachedConfidence,
      variant: null,
      label: null,
    },
    cost: {
      freshInputUsd: totalUsd * 0.4,
      cachedInputUsd: cachedUsd === null ? 0 : totalUsd * 0.1,
      outputUsd: cachedUsd === null ? totalUsd * 0.6 : totalUsd * 0.5,
      totalUsd,
      cacheApplied: cachedUsd !== null,
      blendedInputPerMUsd: cachedUsd ?? 1,
    },
    scenarioPriced: false,
    preview: null,
  };
}

test("publishes four named illustrative workload presets", () => {
  assert.deepEqual(
    WORKLOAD_PRESETS.map((preset) => preset.id),
    ["agentic", "rag", "support", "batch"],
  );
  assert.ok(WORKLOAD_PRESETS.every((preset) => preset.label && preset.description));
});

test("matches a workload to a preset only when all three dimensions are exact", () => {
  const preset = WORKLOAD_PRESETS[0];
  assert.equal(workloadMatchesPreset(preset.workload, preset), true);
  assert.equal(
    workloadMatchesPreset({ ...preset.workload, inputTokens: preset.workload.inputTokens + 1 }, preset),
    false,
  );
  assert.equal(
    workloadMatchesPreset({ ...preset.workload, outputTokens: preset.workload.outputTokens + 1 }, preset),
    false,
  );
  assert.equal(
    workloadMatchesPreset({ ...preset.workload, cacheHitRate: preset.workload.cacheHitRate + 0.01 }, preset),
    false,
  );
});

test("searches provider, model, host, and tier case-insensitively", () => {
  const rows = [
    compared({ id: "azure", provider: "OpenAI / Azure OpenAI", model: "GPT-5.6 Terra", host: "Microsoft-hosted", tier: "Global" }),
    compared({ id: "direct", provider: "Qwen", model: "Qwen3.8 Max", host: "Model Studio (Intl)" }),
  ];

  for (const query of ["AZURE", "terra", "microsoft-hosted", "global"]) {
    assert.deepEqual(
      filterComparedRows(rows, { ...DEFAULT_COMPARE_FILTERS, query }).map((row) => row.row.id),
      ["azure"],
    );
  }
});

test("composes provider, deployment, cache-meter, and official-only filters", () => {
  const rows = [
    compared({ id: "official-foundry-cache", provider: "DeepSeek", tier: "DataZone" }),
    compared({ id: "derived-foundry", provider: "DeepSeek", tier: "Global", confidence: "derived" }),
    compared({ id: "direct-no-cache", provider: "DeepSeek", tier: "Direct", cachedUsd: null }),
    compared({ id: "direct-estimated-cache", provider: "DeepSeek", tier: "Direct", cachedConfidence: "estimate" }),
    compared({ id: "other", provider: "Qwen", tier: "Direct" }),
  ];

  assert.deepEqual(
    filterComparedRows(rows, {
      query: "",
      provider: "DeepSeek",
      deployment: "foundry",
      cacheOnly: true,
      officialOnly: true,
    }).map((row) => row.row.id),
    ["official-foundry-cache"],
  );

  assert.deepEqual(
    filterComparedRows(rows, {
      query: "",
      provider: "DeepSeek",
      deployment: "direct",
      cacheOnly: false,
      officialOnly: true,
    }).map((row) => row.row.id),
    ["direct-no-cache"],
  );
});

test("treats whitespace-only search as no search filter", () => {
  const rows = [compared({ id: "one" }), compared({ id: "two" })];
  assert.equal(filterComparedRows(rows, { ...DEFAULT_COMPARE_FILTERS, query: "   " }).length, 2);
});

test("builds overall, Foundry, and direct leaders from an odd-sized result set", () => {
  const rows = [
    compared({ id: "direct-low", tier: "Direct", totalUsd: 2 }),
    compared({ id: "foundry-low", tier: "Global", totalUsd: 4 }),
    compared({ id: "foundry-high", tier: "DataZone", totalUsd: 12 }),
  ];

  const leaders = buildCostLeaders(rows);
  assert.equal(leaders.medianTotalUsd, 4);
  assert.equal(leaders.overall?.compared.row.id, "direct-low");
  assert.equal(leaders.foundry?.compared.row.id, "foundry-low");
  assert.equal(leaders.direct?.compared.row.id, "direct-low");
  assert.equal(leaders.overall?.belowMedianPercent, 50);
  assert.equal(leaders.foundry?.belowMedianPercent, 0);
});

test("uses the mean of the center pair as the median for an even result set", () => {
  const leaders = buildCostLeaders([
    compared({ id: "one", totalUsd: 1 }),
    compared({ id: "two", totalUsd: 3 }),
    compared({ id: "three", totalUsd: 9 }),
    compared({ id: "four", totalUsd: 11 }),
  ]);
  assert.equal(leaders.medianTotalUsd, 6);
});

test("returns unavailable lane leaders and safe percentages for empty or zero-cost results", () => {
  const empty = buildCostLeaders([]);
  assert.deepEqual(empty, {
    medianTotalUsd: null,
    overall: null,
    foundry: null,
    direct: null,
  });

  const zero = buildCostLeaders([compared({ id: "free", tier: "Direct", totalUsd: 0 })]);
  assert.equal(zero.medianTotalUsd, 0);
  assert.equal(zero.overall?.belowMedianPercent, null);
  assert.equal(zero.foundry, null);
});

test("progressively discloses a sorted result set without changing its order", () => {
  const rows = Array.from({ length: 15 }, (_, index) => compared({ id: String(index) }));
  assert.deepEqual(limitComparedRows(rows, false).map((item) => item.row.id), rows.slice(0, 12).map((item) => item.row.id));
  assert.equal(limitComparedRows(rows, true), rows);
  assert.deepEqual(limitComparedRows(rows.slice(0, 4), false).map((item) => item.row.id), ["0", "1", "2", "3"]);
});
