import assert from "node:assert/strict";
import test from "node:test";
import { buildCompareRows } from "@/data/compare-data";
import type { Tier } from "@/data/types";
import type { ComparedRow } from "@/lib/scenario";
import { DEFAULT_WORKLOAD } from "@/lib/calc";
import { DEFAULT_SCENARIO, compareRowUnderScenario, scenarioContexts } from "@/lib/scenario";
import {
  costComparableAlternatives,
  costComponents,
  sameModelDeploymentComparison,
} from "@/lib/lane-insights";

/**
 * Fixture builder for an already-priced compare row, in the same spirit as
 * compare-insights.test.ts's local `compared()` helper (not shared/exported
 * anywhere in this codebase, so each test file defines its own).
 *
 * Unlike that helper, cost components are given directly (not derived as
 * fixed fractions of a `totalUsd`) and `totalUsd` is computed as their exact
 * sum here — so "the four fields sum to the total" holds by construction with
 * zero floating-point drift, and callers who only care about a row's total
 * cost (the cost-band tests) can just set `freshInputUsd` and leave the other
 * two at their zero default.
 */
function compared({
  id,
  provider = "Example",
  providerSlug,
  model = "Example Model",
  host,
  tier = "Direct",
  freshInputUsd = 0,
  cachedInputUsd = 0,
  outputUsd = 0,
  cachedUsd = 0.1,
}: {
  id: string;
  provider?: string;
  providerSlug?: string;
  model?: string;
  host?: string;
  tier?: Tier;
  freshInputUsd?: number;
  cachedInputUsd?: number;
  outputUsd?: number;
  cachedUsd?: number | null;
}): ComparedRow {
  const totalUsd = freshInputUsd + cachedInputUsd + outputUsd;
  return {
    row: {
      id,
      provider,
      providerSlug: providerSlug ?? provider.toLocaleLowerCase().replaceAll(" ", "-"),
      model,
      host,
      tier,
      inputUsd: 1,
      cachedUsd,
      outputUsd: 4,
      confidence: "official",
      cachedConfidence: cachedUsd === null ? "official" : "official",
      effectiveDate: "2026-08-30",
    },
    resolved: {
      inputUsd: 1,
      cachedUsd,
      outputUsd: 4,
      confidence: "official",
      cachedConfidence: "official",
      variant: null,
      label: null,
    },
    cost: {
      freshInputUsd,
      cachedInputUsd,
      outputUsd,
      totalUsd,
      cacheApplied: cachedUsd !== null,
      blendedInputPerMUsd: cachedUsd ?? 1,
    },
    scenarioPriced: false,
    preview: null,
  };
}

// ---------------------------------------------------------------------------
// costComponents
// ---------------------------------------------------------------------------

test("costComponents projects exactly the four cost-breakdown fields from an already-resolved row", () => {
  const row = compared({ id: "a", freshInputUsd: 12.34, cachedInputUsd: 0.56, outputUsd: 7.89 });
  assert.deepEqual(costComponents(row), {
    freshInputUsd: 12.34,
    cachedInputUsd: 0.56,
    outputUsd: 7.89,
    totalUsd: 12.34 + 0.56 + 7.89,
  });
});

test("costComponents' three parts always sum exactly to totalUsd, with or without a cache meter", () => {
  const withCache = compared({ id: "a", freshInputUsd: 3.1, cachedInputUsd: 0.9, outputUsd: 6, cachedUsd: 0.05 });
  const noCache = compared({ id: "b", freshInputUsd: 9.5, cachedInputUsd: 0, outputUsd: 2.5, cachedUsd: null });

  for (const row of [withCache, noCache]) {
    const c = costComponents(row);
    assert.equal(c.freshInputUsd + c.cachedInputUsd + c.outputUsd, c.totalUsd);
  }
  // The missing-cache-meter row reports $0 cached cost, not null/undefined/NaN —
  // "not available" is rendered by the page from resolved.cachedUsd === null,
  // never invented here as a break in the component-sum invariant.
  assert.equal(costComponents(noCache).cachedInputUsd, 0);
});

// ---------------------------------------------------------------------------
// costComparableAlternatives
// ---------------------------------------------------------------------------

test("costComparableAlternatives never includes the target's own lane", () => {
  const target = compared({ id: "target", freshInputUsd: 10 });
  const result = costComparableAlternatives(target, [target], 12);
  assert.deepEqual(result, []);
});

test("costComparableAlternatives keeps only lanes within +-25% of the target's workload cost, inclusive at the boundary", () => {
  const target = compared({ id: "target", freshInputUsd: 100 });
  const rows = [
    target,
    compared({ id: "low-in", freshInputUsd: 75 }), // exactly -25% — included
    compared({ id: "high-in", freshInputUsd: 125 }), // exactly +25% — included
    compared({ id: "low-out", freshInputUsd: 74.99 }), // just past -25% — excluded
    compared({ id: "high-out", freshInputUsd: 125.01 }), // just past +25% — excluded
  ];

  const ids = costComparableAlternatives(target, rows, 12).map((a) => a.compared.row.id);
  assert.deepEqual(ids.sort(), ["high-in", "low-in"]);
});

test("costComparableAlternatives at a $0 target cost only admits other $0 lanes (the literal ±25% band, not a special case)", () => {
  const target = compared({ id: "target", freshInputUsd: 0 });
  const rows = [
    target,
    compared({ id: "also-free", freshInputUsd: 0 }),
    compared({ id: "cheap", freshInputUsd: 0.01 }),
  ];

  const ids = costComparableAlternatives(target, rows, 12).map((a) => a.compared.row.id);
  assert.deepEqual(ids, ["also-free"]);
});

test("costComparableAlternatives sorts same-provider lanes first, ahead of closer-priced other-provider lanes", () => {
  const target = compared({ id: "target", provider: "Acme", freshInputUsd: 100 });
  const rows = [
    target,
    compared({ id: "other-provider-closer", provider: "Other", freshInputUsd: 101 }),
    compared({ id: "same-provider-farther", provider: "Acme", freshInputUsd: 120 }),
  ];

  const ids = costComparableAlternatives(target, rows, 12).map((a) => a.compared.row.id);
  assert.deepEqual(ids, ["same-provider-farther", "other-provider-closer"]);
});

test("costComparableAlternatives orders within a provider tier by absolute cost difference, then by stable lane id", () => {
  const target = compared({ id: "target", provider: "Acme", freshInputUsd: 100 });
  const rows = [
    target,
    compared({ id: "b-tie", provider: "Acme", freshInputUsd: 110 }),
    compared({ id: "a-tie", provider: "Acme", freshInputUsd: 90 }), // |diff| tied with b-tie at 10
    compared({ id: "closest", provider: "Acme", freshInputUsd: 102 }),
  ];

  const ids = costComparableAlternatives(target, rows, 12).map((a) => a.compared.row.id);
  // closest (|diff|=2) first; then the tie at |diff|=10 broken by lane id (a-tie < b-tie).
  assert.deepEqual(ids, ["closest", "a-tie", "b-tie"]);
});

test("costComparableAlternatives reports both the signed USD delta and a percent relative to the target", () => {
  const target = compared({ id: "target", freshInputUsd: 100 });
  const rows = [target, compared({ id: "pricier", freshInputUsd: 120 })];

  const [alt] = costComparableAlternatives(target, rows, 12);
  assert.equal(alt.deltaUsd, 20);
  assert.equal(alt.deltaPercent, 20);
});

test("costComparableAlternatives result order is independent of the input array's order", () => {
  const target = compared({ id: "target", freshInputUsd: 100 });
  const rows = [
    target,
    compared({ id: "x", freshInputUsd: 105 }),
    compared({ id: "y", freshInputUsd: 95 }),
    compared({ id: "z", freshInputUsd: 110 }),
  ];

  const forward = costComparableAlternatives(target, rows, 12).map((a) => a.compared.row.id);
  const reversed = costComparableAlternatives(target, [...rows].reverse(), 12).map((a) => a.compared.row.id);
  assert.deepEqual(forward, reversed);
});

test("costComparableAlternatives respects the limit after filtering and sorting", () => {
  const target = compared({ id: "target", freshInputUsd: 100 });
  const rows = [
    target,
    compared({ id: "one", freshInputUsd: 101 }),
    compared({ id: "two", freshInputUsd: 102 }),
    compared({ id: "three", freshInputUsd: 103 }),
  ];

  assert.equal(costComparableAlternatives(target, rows, 2).length, 2);
  assert.equal(costComparableAlternatives(target, rows, 0).length, 0);
});

// ---------------------------------------------------------------------------
// sameModelDeploymentComparison
// ---------------------------------------------------------------------------

test("sameModelDeploymentComparison: a Direct target is compared against every same-model Foundry lane, Foundry-minus-Direct", () => {
  const direct = compared({ id: "direct", providerSlug: "acme", model: "Acme X", tier: "Direct", freshInputUsd: 10 });
  const global = compared({ id: "global", providerSlug: "acme", model: "Acme X", tier: "Global", freshInputUsd: 12 });
  const dataZone = compared({ id: "dz", providerSlug: "acme", model: "Acme X", tier: "DataZone", freshInputUsd: 11 });
  const otherModel = compared({ id: "other", providerSlug: "acme", model: "Acme Y", tier: "Global", freshInputUsd: 5 });

  const result = sameModelDeploymentComparison(direct, [direct, global, dataZone, otherModel]);

  assert.equal(result.targetIsDirect, true);
  assert.deepEqual(
    result.comparisons.map((c) => c.compared.row.id),
    ["dz", "global"], // stable lane id order: "dz" < "global"
  );
  const globalComparison = result.comparisons.find((c) => c.compared.row.id === "global")!;
  assert.equal(globalComparison.deltaUsd, 2); // 12 - 10
  assert.equal(globalComparison.deltaPercent, 20); // 2 / 10 * 100
});

test("sameModelDeploymentComparison: a Foundry target is compared against every same-model Direct lane (there can be more than one)", () => {
  const global = compared({ id: "global", providerSlug: "acme", model: "Acme X", tier: "Global", freshInputUsd: 20 });
  const directA = compared({ id: "direct-a", providerSlug: "acme", model: "Acme X", tier: "Direct", host: "Vendor A", freshInputUsd: 10 });
  const directB = compared({ id: "direct-b", providerSlug: "acme", model: "Acme X", tier: "Direct", host: "Vendor B", freshInputUsd: 25 });

  const result = sameModelDeploymentComparison(global, [global, directA, directB]);

  assert.equal(result.targetIsDirect, false);
  assert.deepEqual(
    result.comparisons.map((c) => c.compared.row.id),
    ["direct-a", "direct-b"],
  );
  assert.equal(result.comparisons.find((c) => c.compared.row.id === "direct-a")!.deltaUsd, 10); // 20 - 10
  // Foundry can undercut Direct — the sign must go negative, not clamp to 0.
  assert.equal(result.comparisons.find((c) => c.compared.row.id === "direct-b")!.deltaUsd, -5); // 20 - 25
  assert.equal(result.comparisons.find((c) => c.compared.row.id === "direct-b")!.deltaPercent, -20); // -5 / 25 * 100
});

test("sameModelDeploymentComparison returns an empty comparisons array, not an error, when the model has no counterpart on the other side", () => {
  const onlyDirect = compared({ id: "solo", providerSlug: "acme", model: "Acme Solo", tier: "Direct", freshInputUsd: 5 });
  const result = sameModelDeploymentComparison(onlyDirect, [onlyDirect]);
  assert.equal(result.targetIsDirect, true);
  assert.deepEqual(result.comparisons, []);
});

test("sameModelDeploymentComparison never compares a peer Direct/Direct or Foundry/Foundry pair for the same model", () => {
  const directA = compared({ id: "direct-a", providerSlug: "acme", model: "Acme X", tier: "Direct", host: "A", freshInputUsd: 5 });
  const directB = compared({ id: "direct-b", providerSlug: "acme", model: "Acme X", tier: "Direct", host: "B", freshInputUsd: 50 });
  const global = compared({ id: "global", providerSlug: "acme", model: "Acme X", tier: "Global", freshInputUsd: 6 });
  const dataZone = compared({ id: "dz", providerSlug: "acme", model: "Acme X", tier: "DataZone", freshInputUsd: 7 });

  const result = sameModelDeploymentComparison(directA, [directA, directB, global, dataZone]);
  const ids = result.comparisons.map((c) => c.compared.row.id);
  assert.ok(!ids.includes("direct-b"), "a peer Direct lane must never appear in a Direct target's comparisons");
  assert.deepEqual(ids.sort(), ["dz", "global"]);
});

test("sameModelDeploymentComparison's zero-baseline convention: deltaPercent is exactly 0, never null/NaN/Infinity, when the Direct baseline costs $0", () => {
  const direct = compared({ id: "direct", providerSlug: "acme", model: "Acme Free", tier: "Direct", freshInputUsd: 0 });
  const global = compared({ id: "global", providerSlug: "acme", model: "Acme Free", tier: "Global", freshInputUsd: 3 });

  const result = sameModelDeploymentComparison(direct, [direct, global]);
  assert.equal(result.comparisons[0].deltaUsd, 3);
  assert.equal(result.comparisons[0].deltaPercent, 0);
  assert.ok(Number.isFinite(result.comparisons[0].deltaPercent));
});

test("sameModelDeploymentComparison result order is independent of the input array's order", () => {
  const direct = compared({ id: "direct", providerSlug: "acme", model: "Acme X", tier: "Direct", freshInputUsd: 10 });
  const global = compared({ id: "global", providerSlug: "acme", model: "Acme X", tier: "Global", freshInputUsd: 12 });
  const dataZone = compared({ id: "dz", providerSlug: "acme", model: "Acme X", tier: "DataZone", freshInputUsd: 11 });
  const rows = [direct, global, dataZone];

  const forward = sameModelDeploymentComparison(direct, rows).comparisons.map((c) => c.compared.row.id);
  const reversed = sameModelDeploymentComparison(direct, [...rows].reverse()).comparisons.map((c) => c.compared.row.id);
  assert.deepEqual(forward, reversed);
});

// ---------------------------------------------------------------------------
// Integration against the real catalog (mirrors lane-id.test.ts's use of the
// live catalog to guard against fixture-only false confidence).
// ---------------------------------------------------------------------------

test("against the real catalog: DeepSeek-V4 Pro's two Direct lanes each see all three real Foundry counterparts, never each other", () => {
  const rows = buildCompareRows();
  const now = new Date("2026-08-30T12:00:00Z");
  const ctxs = scenarioContexts(DEFAULT_SCENARIO, now, DEFAULT_WORKLOAD.inputTokens);
  const computed = rows.map((r) => compareRowUnderScenario(r, DEFAULT_WORKLOAD, ctxs));

  const deepseekDirectRows = computed.filter(
    (c) => c.row.providerSlug === "deepseek" && c.row.model === "DeepSeek-V4 Pro" && c.row.tier === "Direct",
  );
  assert.equal(deepseekDirectRows.length, 2, "fixture assumption: DeepSeek-V4 Pro has two Direct hosts today");

  for (const target of deepseekDirectRows) {
    const result = sameModelDeploymentComparison(target, computed);
    assert.equal(result.targetIsDirect, true);
    assert.equal(result.comparisons.length, 3, "Global + two DataZone lanes");
    for (const c of result.comparisons) {
      assert.equal(c.compared.row.tier === "Direct", false);
      assert.ok(Number.isFinite(c.deltaUsd));
      assert.ok(Number.isFinite(c.deltaPercent));
    }
    // Order must not depend on which of the two Direct rows is the target.
    const ids = result.comparisons.map((c) => c.compared.row.id);
    assert.deepEqual([...ids].sort(), ids);
  }
});

test("against the real catalog: a Qwen lane (Direct-only family, no Foundry meter) reports an explicit empty comparison, not a crash", () => {
  const rows = buildCompareRows();
  const now = new Date("2026-08-30T12:00:00Z");
  const ctxs = scenarioContexts(DEFAULT_SCENARIO, now, DEFAULT_WORKLOAD.inputTokens);
  const computed = rows.map((r) => compareRowUnderScenario(r, DEFAULT_WORKLOAD, ctxs));

  const qwenRow = computed.find((c) => c.row.providerSlug === "qwen");
  assert.ok(qwenRow, "fixture assumption: at least one Qwen row exists in the catalog");
  assert.deepEqual(sameModelDeploymentComparison(qwenRow!, computed).comparisons, []);
});

test("against the real catalog: costComparableAlternatives never crashes and never returns the target for every lane", () => {
  const rows = buildCompareRows();
  const now = new Date("2026-08-30T12:00:00Z");
  const ctxs = scenarioContexts(DEFAULT_SCENARIO, now, DEFAULT_WORKLOAD.inputTokens);
  const computed = rows.map((r) => compareRowUnderScenario(r, DEFAULT_WORKLOAD, ctxs));

  for (const target of computed) {
    const alternatives = costComparableAlternatives(target, computed, 6);
    assert.ok(alternatives.length <= 6);
    assert.ok(!alternatives.some((a) => a.compared.row.id === target.row.id));
    for (const a of alternatives) {
      assert.ok(Number.isFinite(a.deltaUsd));
      assert.ok(Number.isFinite(a.deltaPercent));
    }
  }
});
