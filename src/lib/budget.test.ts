import assert from "node:assert/strict";
import test from "node:test";
import { buildCompareRows, toPricingEntry } from "@/data/compare-data";
import type { PricingEntry } from "@/data/types";
import { getProvider } from "@/data/providers";
import { usdToChf } from "@/data/currency";
import { type Workload, computeCost } from "@/lib/calc";
import { sameModelDeploymentComparison } from "@/lib/lane-insights";
import type { RateContext } from "@/lib/rates";
import { DEFAULT_SCENARIO, compareRowUnderScenario, scenarioContexts } from "@/lib/scenario";
import {
  type BudgetInput,
  type RateBasis,
  DEFAULT_BUDGET_INPUT,
  UNBOUNDED_AFFORDABLE_REQUESTS_PER_DAY,
  deploymentCacheCrossover,
  projectMonthlyBudget,
  requiredCacheHitRate,
} from "@/lib/budget";

/** A fixed instant with no bearing on any test fixture (none of them carry `variants`). */
const CTX: RateContext = { now: new Date("2026-08-31T12:00:00Z") };

function fixtureEntry(overrides: Partial<PricingEntry> = {}): PricingEntry {
  return {
    model: "Fixture Model",
    tier: "Direct",
    inputUsd: 2,
    cachedUsd: 0.2,
    outputUsd: 10,
    confidence: "official",
    effectiveDate: "2026-08-30",
    ...overrides,
  };
}

function basis(overrides: Partial<PricingEntry> = {}, ctx: RateContext = CTX): RateBasis {
  return { entry: fixtureEntry(overrides), ctx };
}

function input(overrides: Partial<BudgetInput> = {}): BudgetInput {
  return {
    perRequest: { inputTokens: 1000, outputTokens: 200, cacheHitRate: 0 },
    requestsPerDay: 100,
    activeDaysPerMonth: 30,
    monthlyGrowthPercent: 0,
    monthlyBudgetUsd: 1_000_000,
    ...overrides,
  };
}

/** `obj` is typed loosely (`object`, not `Record<string, number>`) purely so callers can pass a concrete result interface like `BudgetProjection` directly without an index-signature mismatch — every field these results carry is in fact numeric. */
function allFinite(obj: object, label: string) {
  for (const [key, value] of Object.entries(obj)) {
    assert.ok(Number.isFinite(value), `${label}.${key} should be finite, got ${value}`);
  }
}

// ---------------------------------------------------------------------------
// projectMonthlyBudget — formula
// ---------------------------------------------------------------------------

test("projectMonthlyBudget scales per-request tokens by requests/day and active days, with zero growth", () => {
  const result = projectMonthlyBudget(input(), basis());
  assert.equal(result.effectiveRequestsPerDay, 100);
  assert.equal(result.monthlyInputTokens, 1000 * 100 * 30);
  assert.equal(result.monthlyOutputTokens, 200 * 100 * 30);
});

test("monthlyGrowthPercent applies once, projecting a single representative month rather than compounding", () => {
  const result = projectMonthlyBudget(input({ monthlyGrowthPercent: 10 }), basis());
  // 100 * 1.10 — not 100 * 1.10^N for any N. Float tolerance: 100 * (1 + 10/100)
  // is 110.00000000000001 in IEEE 754, not a logic error.
  assert.ok(Math.abs(result.effectiveRequestsPerDay - 110) < 1e-9);
  assert.ok(Math.abs(result.monthlyInputTokens - 1000 * 110 * 30) < 1e-6);
});

test("monthly spend with no cache meter ignores cacheHitRate entirely, matching a hand-computed total", () => {
  const result = projectMonthlyBudget(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 100_000, cacheHitRate: 0.9 }, requestsPerDay: 1, activeDaysPerMonth: 1 }),
    basis({ cachedUsd: null, inputUsd: 2, outputUsd: 10 }),
  );
  // monthlyInputTokens = 1,000,000; monthlyOutputTokens = 100,000
  const expected = (1_000_000 / 1_000_000) * 2 + (100_000 / 1_000_000) * 10;
  assert.equal(result.monthlySpendUsd, expected);
});

test("monthly spend applies the cache-hit split when a cache meter exists", () => {
  const result = projectMonthlyBudget(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0.5 }, requestsPerDay: 1, activeDaysPerMonth: 1 }),
    basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 0 }),
  );
  // 500,000 fresh @ $2/M + 500,000 cached @ $0.2/M = 1 + 0.1
  assert.equal(result.monthlySpendUsd, 1.1);
});

test("headroomUsd is budget minus spend, negative when over budget", () => {
  const result = projectMonthlyBudget(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 1 }),
    basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 0 }),
  );
  assert.equal(result.monthlySpendUsd, 2);
  assert.equal(result.headroomUsd, 1 - 2);
  assert.ok(result.headroomUsd < 0, "overrun should read as negative headroom");
});

test("headroomUsd is positive when under budget", () => {
  const result = projectMonthlyBudget(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 100 }),
    basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 0 }),
  );
  assert.equal(result.headroomUsd, 98);
  assert.ok(result.headroomUsd > 0);
});

test("affordableRequestsPerDay, plugged back in as requestsPerDay, spends exactly the monthly budget", () => {
  const rate = basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 10 });
  const scenario = input({
    perRequest: { inputTokens: 1000, outputTokens: 200, cacheHitRate: 0.3 },
    requestsPerDay: 1, // deliberately irrelevant to affordableRequestsPerDay itself
    activeDaysPerMonth: 30,
    monthlyBudgetUsd: 500,
  });
  const result = projectMonthlyBudget(scenario, rate);
  assert.ok(Number.isFinite(result.affordableRequestsPerDay) && result.affordableRequestsPerDay > 0);

  const replay = projectMonthlyBudget({ ...scenario, requestsPerDay: result.affordableRequestsPerDay }, rate);
  assert.ok(
    Math.abs(replay.monthlySpendUsd - 500) < 1e-6,
    `replaying affordableRequestsPerDay should spend ~$500, got $${replay.monthlySpendUsd}`,
  );
});

// ---------------------------------------------------------------------------
// projectMonthlyBudget — clamping and boundary inputs
// ---------------------------------------------------------------------------

test("negative requestsPerDay clamps to zero, producing zero monthly tokens and zero spend", () => {
  const result = projectMonthlyBudget(input({ requestsPerDay: -50 }), basis());
  assert.equal(result.effectiveRequestsPerDay, 0);
  assert.equal(result.monthlyInputTokens, 0);
  assert.equal(result.monthlyOutputTokens, 0);
  assert.equal(result.monthlySpendUsd, 0);
});

test("negative activeDaysPerMonth clamps to zero, producing zero monthly tokens and zero affordable requests/day", () => {
  const result = projectMonthlyBudget(input({ activeDaysPerMonth: -10 }), basis());
  assert.equal(result.monthlyInputTokens, 0);
  assert.equal(result.monthlyOutputTokens, 0);
  assert.equal(result.affordableRequestsPerDay, 0);
});

test("negative monthlyGrowthPercent clamps to zero rather than shrinking volume (no decline modeled)", () => {
  const result = projectMonthlyBudget(input({ requestsPerDay: 100, monthlyGrowthPercent: -50 }), basis());
  assert.equal(result.effectiveRequestsPerDay, 100);
});

test("negative monthlyBudgetUsd clamps to zero, so headroom is never positive and never NaN", () => {
  const result = projectMonthlyBudget(input({ monthlyBudgetUsd: -500 }), basis());
  assert.ok(Number.isFinite(result.headroomUsd));
  assert.ok(result.headroomUsd <= 0);
});

test("NaN across every numeric input clamps to zero and produces an all-finite, non-NaN projection", () => {
  const result = projectMonthlyBudget(
    {
      perRequest: { inputTokens: Number.NaN, outputTokens: Number.NaN, cacheHitRate: Number.NaN },
      requestsPerDay: Number.NaN,
      activeDaysPerMonth: Number.NaN,
      monthlyGrowthPercent: Number.NaN,
      monthlyBudgetUsd: Number.NaN,
    },
    basis(),
  );
  allFinite(result, "NaN-input projection");
  assert.equal(result.monthlySpendUsd, 0);
});

test("very large requests/day, tokens, and growth still produce a finite, directional projection", () => {
  const result = projectMonthlyBudget(
    input({
      perRequest: { inputTokens: 1_000_000, outputTokens: 200_000, cacheHitRate: 0.5 },
      requestsPerDay: 1_000_000_000,
      activeDaysPerMonth: 31,
      monthlyGrowthPercent: 500,
      monthlyBudgetUsd: 1_000_000_000,
    }),
    basis(),
  );
  allFinite(result, "huge-input projection");
  assert.ok(result.monthlySpendUsd > 0);
  assert.ok(result.headroomUsd < 0, "a billion requests/day at these rates should overrun a $1B budget");
});

test("an all-zero input produces an all-zero, finite projection — never NaN from a 0/0 division", () => {
  const result = projectMonthlyBudget(
    { perRequest: { inputTokens: 0, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 0, activeDaysPerMonth: 0, monthlyGrowthPercent: 0, monthlyBudgetUsd: 0 },
    basis(),
  );
  allFinite(result, "all-zero projection");
  assert.equal(result.monthlyInputTokens, 0);
  assert.equal(result.monthlySpendUsd, 0);
  assert.equal(result.headroomUsd, 0);
  // 0 active days wins over the "free lane" branch — see affordableRequestsPerDay's doc comment.
  assert.equal(result.affordableRequestsPerDay, 0);
});

test("a $0 per-request cost with active days and a positive budget reports the UNBOUNDED sentinel, not Infinity", () => {
  const result = projectMonthlyBudget(
    { perRequest: { inputTokens: 0, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 100, activeDaysPerMonth: 30, monthlyGrowthPercent: 0, monthlyBudgetUsd: 500 },
    basis(),
  );
  assert.equal(result.affordableRequestsPerDay, UNBOUNDED_AFFORDABLE_REQUESTS_PER_DAY);
  assert.ok(Number.isFinite(result.affordableRequestsPerDay));
});

test("a $0 per-request cost against a $0 budget affords zero requests/day, not the unbounded sentinel", () => {
  const result = projectMonthlyBudget(
    { perRequest: { inputTokens: 0, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 100, activeDaysPerMonth: 30, monthlyGrowthPercent: 0, monthlyBudgetUsd: 0 },
    basis(),
  );
  assert.equal(result.affordableRequestsPerDay, 0);
});

test("monthlySpendChf is exactly usdToChf(monthlySpendUsd) — the one shared conversion constant, never re-derived", () => {
  const result = projectMonthlyBudget(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 100_000, cacheHitRate: 0.5 }, requestsPerDay: 10, monthlyBudgetUsd: 100_000 }),
    basis(),
  );
  assert.equal(result.monthlySpendChf, usdToChf(result.monthlySpendUsd));
});

test("real catalog: every lane produces a fully finite projection under the default budget input", () => {
  const rows = buildCompareRows();
  assert.ok(rows.length > 0, "expected a non-empty catalog");
  for (const row of rows) {
    const rate: RateBasis = { entry: toPricingEntry(row), ctx: CTX };
    const result = projectMonthlyBudget(DEFAULT_BUDGET_INPUT, rate);
    allFinite(result, row.id);
  }
});

// ---------------------------------------------------------------------------
// requiredCacheHitRate
// ---------------------------------------------------------------------------

test("requiredCacheHitRate reports no-cache-meter when the resolved rate has no cache dimension, regardless of budget", () => {
  const rate = basis({ cachedUsd: null, inputUsd: 2, outputUsd: 10 });
  const result = requiredCacheHitRate(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 100_000, cacheHitRate: 0.5 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 1 }),
    rate,
  );
  assert.deepEqual(result, { status: "no-cache-meter" });
});

test("requiredCacheHitRate reports already-within-budget when zero caching already fits, with the correct spend", () => {
  const rate = basis({ inputUsd: 1, cachedUsd: 0.1, outputUsd: 1 });
  const result = requiredCacheHitRate(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 1000 }),
    rate,
  );
  assert.equal(result.status, "already-within-budget");
  if (result.status === "already-within-budget") assert.equal(result.monthlySpendAtNoCacheUsd, 1);
});

test("requiredCacheHitRate reports impossible when even full caching exceeds budget, with the correct spend at h=1", () => {
  const rate = basis({ inputUsd: 100, cachedUsd: 50, outputUsd: 0 });
  const result = requiredCacheHitRate(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 10 }),
    rate,
  );
  assert.equal(result.status, "impossible");
  if (result.status === "impossible") assert.equal(result.monthlySpendAtFullCacheUsd, 50);
});

test("requiredCacheHitRate's finite required rate, plugged back into computeCost, reproduces the budget within a tight tolerance", () => {
  const rate = basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 0 });
  const scenario = input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 1.1 });
  // atZero = $2 (h=0), atOne = $0.2 (h=1); budget $1.1 sits strictly between.
  const result = requiredCacheHitRate(scenario, rate);
  assert.equal(result.status, "required");
  if (result.status !== "required") return;

  assert.ok(result.hitRate > 0 && result.hitRate < 1);
  // Hand-check the algebra: h = (1.1 - 2) / (0.2 - 2) = -0.9 / -1.8 = 0.5
  assert.ok(Math.abs(result.hitRate - 0.5) < 1e-9);

  const replay = computeCost(rate.entry, { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: result.hitRate }, rate.ctx);
  assert.ok(Math.abs(replay.totalUsd - 1.1) < 1e-6, `replayed cost ${replay.totalUsd} should match budget 1.1`);
  assert.ok(Math.abs(result.monthlySpendUsd - 1.1) < 1e-6);
});

test("a budget exactly equal to the full-cache cost resolves to required at hitRate 1, not impossible", () => {
  const rate = basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 0 });
  const result = requiredCacheHitRate(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 0.2 }),
    rate,
  );
  assert.equal(result.status, "required");
  if (result.status === "required") assert.equal(result.hitRate, 1);
});

test("a budget exactly equal to the no-cache cost resolves to already-within-budget", () => {
  const rate = basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 0 });
  const result = requiredCacheHitRate(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 }, requestsPerDay: 1, activeDaysPerMonth: 1, monthlyBudgetUsd: 2 }),
    rate,
  );
  assert.equal(result.status, "already-within-budget");
});

test("real catalog: requiredCacheHitRate returns a valid, finite result for every lane under the default budget input", () => {
  for (const row of buildCompareRows()) {
    const rate: RateBasis = { entry: toPricingEntry(row), ctx: CTX };
    const result = requiredCacheHitRate(DEFAULT_BUDGET_INPUT, rate);
    if (result.status === "required") {
      assert.ok(result.hitRate >= 0 && result.hitRate <= 1, `${row.id} hitRate out of [0,1]: ${result.hitRate}`);
      assert.ok(Number.isFinite(result.hitRate) && Number.isFinite(result.monthlySpendUsd));
    }
    if (result.status === "already-within-budget") assert.ok(Number.isFinite(result.monthlySpendAtNoCacheUsd));
    if (result.status === "impossible") assert.ok(Number.isFinite(result.monthlySpendAtFullCacheUsd));
  }
});

// ---------------------------------------------------------------------------
// deploymentCacheCrossover
// ---------------------------------------------------------------------------

test("deploymentCacheCrossover reports always-equal when both lanes price identically on every dimension", () => {
  const direct = basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 10, tier: "Direct" });
  const foundry = basis({ inputUsd: 2, cachedUsd: 0.2, outputUsd: 10, tier: "Global" });
  const result = deploymentCacheCrossover(
    input({ perRequest: { inputTokens: 1000, outputTokens: 200, cacheHitRate: 0.5 } }),
    direct,
    foundry,
  );
  assert.deepEqual(result, { status: "always-equal" });
});

test("deploymentCacheCrossover reports no-crossover with the correct cheaper lane when direct dominates the whole range", () => {
  const cheap = basis({ inputUsd: 1, cachedUsd: 0.1, outputUsd: 1 });
  const pricey = basis({ inputUsd: 5, cachedUsd: 4, outputUsd: 5 });
  const result = deploymentCacheCrossover(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 100_000, cacheHitRate: 0.5 } }),
    cheap,
    pricey,
  );
  assert.equal(result.status, "no-crossover");
  if (result.status === "no-crossover") assert.equal(result.cheaperLane, "direct");
});

test("deploymentCacheCrossover reports no-crossover with the correct cheaper lane when foundry dominates the whole range", () => {
  const cheap = basis({ inputUsd: 1, cachedUsd: 0.1, outputUsd: 1 });
  const pricey = basis({ inputUsd: 5, cachedUsd: 4, outputUsd: 5 });
  const result = deploymentCacheCrossover(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 100_000, cacheHitRate: 0.5 } }),
    pricey,
    cheap,
  );
  assert.equal(result.status, "no-crossover");
  if (result.status === "no-crossover") assert.equal(result.cheaperLane, "foundry");
});

test("deploymentCacheCrossover finds a genuine mid-range crossing, verified by plugging it back into both lanes' computeCost", () => {
  // direct starts pricier but caches down hard; foundry starts cheaper but barely discounts.
  const direct = basis({ inputUsd: 3, cachedUsd: 0.1, outputUsd: 0 });
  const foundry = basis({ inputUsd: 1, cachedUsd: 0.9, outputUsd: 0 });
  const scenario = input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 } });

  const result = deploymentCacheCrossover(scenario, direct, foundry);
  assert.equal(result.status, "crosses");
  if (result.status !== "crosses") return;

  // Hand-check: direct(h) = 3 - 2.9h, foundry(h) = 1 - 0.1h -> h = 2/2.8 = 5/7.
  assert.ok(Math.abs(result.hitRate - 5 / 7) < 1e-9);
  assert.ok(result.hitRate > 0 && result.hitRate < 1);

  const workload: Workload = { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: result.hitRate };
  const directReplay = computeCost(direct.entry, workload, direct.ctx).totalUsd;
  const foundryReplay = computeCost(foundry.entry, workload, foundry.ctx).totalUsd;
  assert.ok(
    Math.abs(directReplay - foundryReplay) < 1e-9,
    `direct ($${directReplay}) and foundry ($${foundryReplay}) should match at the crossover hit rate`,
  );
});

test("deploymentCacheCrossover reports a crossing exactly at hitRate 1 when the lines meet only at full cache", () => {
  const direct = basis({ inputUsd: 1, cachedUsd: 0.5, outputUsd: 0 });
  const foundry = basis({ inputUsd: 2, cachedUsd: 0.5, outputUsd: 0 });
  const result = deploymentCacheCrossover(
    input({ perRequest: { inputTokens: 1_000_000, outputTokens: 0, cacheHitRate: 0 } }),
    direct,
    foundry,
  );
  assert.deepEqual(result, { status: "crosses", hitRate: 1 });
});

test("real catalog: DeepSeek-V4 Pro's Fireworks direct API (no cache meter) crosses its Foundry Global counterpart exactly at hitRate 0", () => {
  const deepseek = getProvider("deepseek");
  const fireworksDirect = deepseek?.entries.find((e) => e.model === "DeepSeek-V4 Pro" && e.host === "Fireworks direct API");
  const foundryGlobal = deepseek?.entries.find((e) => e.model === "DeepSeek-V4 Pro" && e.tier === "Global");
  assert.ok(fireworksDirect, "expected a DeepSeek-V4 Pro Fireworks direct API entry");
  assert.ok(foundryGlobal, "expected a DeepSeek-V4 Pro Foundry Global entry");
  // Both fixtures carry no `variants`, so the exact instant in CTX is inert — this is a stable, deterministic check.
  assert.equal(fireworksDirect?.variants, undefined);
  assert.equal(foundryGlobal?.variants, undefined);

  const scenario = input({ perRequest: { inputTokens: 1_000_000, outputTokens: 200_000, cacheHitRate: 0.5 } });
  const result = deploymentCacheCrossover(scenario, { entry: fireworksDirect as PricingEntry, ctx: CTX }, { entry: foundryGlobal as PricingEntry, ctx: CTX });

  assert.equal(result.status, "crosses");
  if (result.status !== "crosses") return;
  assert.equal(result.hitRate, 0);

  const workload: Workload = { inputTokens: 1_000_000, outputTokens: 200_000, cacheHitRate: 0 };
  const directReplay = computeCost(fireworksDirect as PricingEntry, workload, CTX).totalUsd;
  const foundryReplay = computeCost(foundryGlobal as PricingEntry, workload, CTX).totalUsd;
  assert.ok(Math.abs(directReplay - foundryReplay) < 1e-9);
});

test("real catalog: deploymentCacheCrossover never throws and always returns a valid, finite result for every Direct/Foundry pair", () => {
  const rows = buildCompareRows();
  const workload: Workload = { inputTokens: 1_000_000, outputTokens: 200_000, cacheHitRate: 0.5 };
  const scenarioCtxs = scenarioContexts(DEFAULT_SCENARIO, CTX.now, workload.inputTokens);
  const compared = rows.map((row) => compareRowUnderScenario(row, workload, scenarioCtxs));
  const scenario = input({ perRequest: workload });

  let pairsChecked = 0;
  for (const target of compared) {
    const { targetIsDirect, comparisons } = sameModelDeploymentComparison(target, compared);
    for (const { compared: counterpart } of comparisons) {
      const targetBasis: RateBasis = { entry: toPricingEntry(target.row), ctx: CTX };
      const counterpartBasis: RateBasis = { entry: toPricingEntry(counterpart.row), ctx: CTX };
      const directRate = targetIsDirect ? targetBasis : counterpartBasis;
      const foundryRate = targetIsDirect ? counterpartBasis : targetBasis;

      const result = deploymentCacheCrossover(scenario, directRate, foundryRate);
      pairsChecked += 1;
      if (result.status === "crosses") {
        assert.ok(Number.isFinite(result.hitRate) && result.hitRate >= 0 && result.hitRate <= 1, `${target.row.id} vs ${counterpart.row.id}: hitRate out of range`);
      }
    }
  }
  assert.ok(pairsChecked > 0, "expected at least one real Direct/Foundry pair in the catalog to exercise this sweep");
});
