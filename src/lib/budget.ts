import type { PricingEntry } from "@/data/types";
import { usdToChf } from "@/data/currency";
import { type Workload, computeCost } from "@/lib/calc";
import { type RateContext, resolveRate } from "@/lib/rates";

/**
 * Monthly budget projection and break-even math for the `/budget` planner.
 *
 * Every dollar figure in this file is produced by `computeCost` (lib/calc.ts),
 * which is itself built on `resolveRate` (lib/rates.ts) — the same two
 * functions the compare page and the lane cost-anatomy page price every row
 * through. Nothing here re-derives a pricing formula, stores a rate constant,
 * or re-implements the fresh/cached/output split; this file only reshapes and
 * solves for the extra inputs a monthly budget conversation needs (daily
 * volume, growth, a target spend) that calc.ts has no reason to know about.
 *
 * ## Why the break-even solvers do algebra, not search
 *
 * `computeCost`'s `totalUsd` is an exact LINEAR function of a workload's
 * `cacheHitRate` for a fixed resolved rate: `freshTokens = inputTokens*(1-h)`,
 * `cachedTokens = inputTokens*h`, and both feed linearly into `totalUsd` with
 * no other `h`-dependence (see calc.ts's `computeCost` body). When the entry
 * has no cache meter, `totalUsd` is simply CONSTANT in `h` — a degenerate
 * (zero-slope) line, not a special case the code below needs to branch on
 * separately except where the *meaning* of "no lever exists" needs its own
 * status (see `requiredCacheHitRate`'s `"no-cache-meter"`).
 *
 * Either way, two points fully determine the line. Every solver below calls
 * `computeCost` at `h=0` and `h=1` to get two exact endpoints, then solves the
 * resulting linear equation directly for whatever target it needs (a budget
 * ceiling, or where two lines meet). No bisection, no iteration, no
 * epsilon-tolerance search loop — and the result is exact rather than
 * approximate, modulo ordinary floating-point rounding in the arithmetic
 * chain itself.
 */

// ---------------------------------------------------------------------------
// Rate basis
// ---------------------------------------------------------------------------

/**
 * Enough to resolve and price one purchasable lane: the catalog entry
 * (reconstruct with `toPricingEntry` from a `CompareRow`, the same way
 * lib/scenario.ts does) plus the `RateContext` to resolve it under — the same
 * scenario/time/service-tier context the compare page builds via
 * `scenarioToRateContext`.
 *
 * Every function below takes one or two of these rather than a bare resolved
 * number (a flat `{ inputUsd, cachedUsd, outputUsd }`) precisely because a
 * bare number has no way to answer "what would this cost at a DIFFERENT cache
 * hit rate" — that requires re-running `computeCost`, which needs the entry
 * and context back. Carrying `{ entry, ctx }` end to end is what lets every
 * solver below reuse `computeCost` itself instead of reimplementing its
 * fresh/cached/output arithmetic.
 */
export interface RateBasis {
  entry: PricingEntry;
  ctx: RateContext;
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

/**
 * Clamp to a finite, non-negative number no larger than `max`. `NaN`,
 * `Infinity`/`-Infinity`, and negative values all become `0` — the brief's
 * "clamp invalid/negative input to zero rather than propagating a negative or
 * NaN through the math" rule, applied uniformly to every numeric input this
 * file accepts. A large but finite positive value passes through unchanged up
 * to `max`: "huge" is a valid input this planner must still answer with a
 * finite, directional result — only genuinely invalid values are zeroed,
 * never merely large ones.
 *
 * `max` defaults to `Number.MAX_SAFE_INTEGER` (~9.007e15) so that every
 * caller gets an upper bound for free without having to think about it.
 * That default is not arbitrary: `monthlyVolume` chains up to four sanitized
 * fields together (`perRequest.inputTokens * effectiveRequestsPerDay *
 * activeDaysPerMonth`, itself `requestsPerDay * (1 + growthPercent / 100)`),
 * and the worst case with every factor at this bound — roughly
 * `9.007e15^4` — lands around `6.6e61`, still ~246 orders of magnitude below
 * `Number.MAX_VALUE` (~1.7977e308). Without a bound here, an absurd-but-finite
 * single input like `requestsPerDay: 1e304` multiplies out to `Infinity`,
 * which then turns into `NaN` the instant two such values are subtracted
 * (`requiredCacheHitRate`'s `atOne - atZero`) — this bound is what keeps every
 * downstream computation finite instead of propagating that.
 */
function sanitizeNonNegative(n: number, max: number = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

/** Sanitizes the two token counts; `cacheHitRate` is left to `computeCost`'s own `clamp01`, which already handles NaN/out-of-range without this file duplicating that clamp. */
function sanitizeWorkload(workload: Workload): Workload {
  return {
    inputTokens: sanitizeNonNegative(workload.inputTokens),
    outputTokens: sanitizeNonNegative(workload.outputTokens),
    cacheHitRate: workload.cacheHitRate,
  };
}

// ---------------------------------------------------------------------------
// projectMonthlyBudget
// ---------------------------------------------------------------------------

export interface BudgetInput {
  /** Tokens and assumed cache hit rate for a SINGLE request — not a monthly aggregate. */
  perRequest: Workload;
  /** Requests/day BEFORE growth is applied — this month's current run rate. */
  requestsPerDay: number;
  /** How many days this month actually see traffic. */
  activeDaysPerMonth: number;
  /**
   * Expected month-over-month growth, as a percent (`10` means 10%, not
   * `0.10`). Negative values clamp to `0` — this planner does not model usage
   * decline, per the brief's explicit "negative growth" clamp-to-zero
   * example.
   */
  monthlyGrowthPercent: number;
  /** The monthly spend ceiling being planned against. */
  monthlyBudgetUsd: number;
}

/** A reasonable illustrative starting point for the planner, in the same spirit as calc.ts's `DEFAULT_WORKLOAD` (which is calibrated for a monthly aggregate, not one request — this one is deliberately request-sized). */
export const DEFAULT_BUDGET_INPUT: BudgetInput = {
  perRequest: { inputTokens: 4_000, outputTokens: 800, cacheHitRate: 0.5 },
  requestsPerDay: 10_000,
  activeDaysPerMonth: 30,
  monthlyGrowthPercent: 5,
  monthlyBudgetUsd: 1_000,
};

export interface BudgetProjection {
  /**
   * `requestsPerDay` after applying ONE month of growth. Growth is a single
   * multiplicative step, not compounded across multiple months: `BudgetInput`
   * carries no "how many months from now" parameter, and the brief's framing
   * of the overflow risk ("growth compounding over many months... a single
   * representative month is enough") reads as steering away from an
   * `(1+g)^N` compounding model entirely. This projects one representative
   * month — the immediate next one — rather than simulating a horizon.
   */
  effectiveRequestsPerDay: number;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  monthlySpendUsd: number;
  monthlySpendChf: number;
  /** `monthlyBudgetUsd - monthlySpendUsd`. Negative reads as an overrun. */
  headroomUsd: number;
  /**
   * The flat (no-growth) daily request volume that would spend exactly
   * `monthlyBudgetUsd` over `activeDaysPerMonth`, holding the per-request
   * shape fixed. Deliberately independent of `requestsPerDay`/growth — it
   * answers "how much could I run", not "how much am I about to run".
   */
  affordableRequestsPerDay: number;
}

/**
 * A finite ceiling used in place of `Infinity` when a `$0` per-request cost
 * (or `0` active days combined with a `$0` cost) would otherwise make
 * "affordable requests/day" unbounded. `Number.MAX_SAFE_INTEGER` rather than
 * an arbitrary round number, so it reads as an obvious sentinel rather than a
 * plausible capacity figure, while staying finite and safe for further
 * arithmetic (the brief's "must still produce a finite... result" rule).
 */
export const UNBOUNDED_AFFORDABLE_REQUESTS_PER_DAY = Number.MAX_SAFE_INTEGER;

function affordableRequestsPerDay(
  monthlyBudgetUsd: number,
  activeDaysPerMonth: number,
  perRequestCostUsd: number,
): number {
  // 0 active days: there is no month to spend across, so no daily rate is
  // meaningful. 0 is the literal, non-misleading answer (0 requests execute
  // regardless of the rate dial) — checked first so a 0-and-0 combination
  // (no days AND a free lane) reads as "no capacity" rather than "unbounded".
  if (activeDaysPerMonth <= 0) return 0;
  // A free (or degenerate-zero) per-request cost never binds against a
  // positive budget — report the sentinel rather than Infinity. Against a $0
  // budget even a free lane affords nothing to spend, so 0 is correct there.
  if (perRequestCostUsd <= 0) return monthlyBudgetUsd > 0 ? UNBOUNDED_AFFORDABLE_REQUESTS_PER_DAY : 0;
  return monthlyBudgetUsd / (activeDaysPerMonth * perRequestCostUsd);
}

/** Shared sanitized/scaled inputs both `projectMonthlyBudget` and `requiredCacheHitRate` need. */
function monthlyVolume(input: BudgetInput) {
  const perRequest = sanitizeWorkload(input.perRequest);
  const requestsPerDay = sanitizeNonNegative(input.requestsPerDay);
  const activeDaysPerMonth = sanitizeNonNegative(input.activeDaysPerMonth);
  const growthPercent = sanitizeNonNegative(input.monthlyGrowthPercent);
  const monthlyBudgetUsd = sanitizeNonNegative(input.monthlyBudgetUsd);

  const effectiveRequestsPerDay = requestsPerDay * (1 + growthPercent / 100);
  const monthlyInputTokens = perRequest.inputTokens * effectiveRequestsPerDay * activeDaysPerMonth;
  const monthlyOutputTokens = perRequest.outputTokens * effectiveRequestsPerDay * activeDaysPerMonth;

  return {
    perRequest,
    activeDaysPerMonth,
    monthlyBudgetUsd,
    effectiveRequestsPerDay,
    monthlyInputTokens,
    monthlyOutputTokens,
  };
}

/**
 * Project one representative month's tokens, spend, headroom, and affordable
 * volume for `resolvedRate`'s lane.
 *
 * `monthlyInputTokens`/`monthlyOutputTokens` and `monthlySpendUsd` are all
 * read off a SINGLE `computeCost` call against those exact monthly token
 * counts — never a per-request total multiplied out after the fact — so the
 * reported tokens and the reported spend can never drift apart, and
 * `computeCost`'s own fresh/cached/output split is never re-derived here.
 */
export function projectMonthlyBudget(input: BudgetInput, resolvedRate: RateBasis): BudgetProjection {
  const {
    perRequest,
    activeDaysPerMonth,
    monthlyBudgetUsd,
    effectiveRequestsPerDay,
    monthlyInputTokens,
    monthlyOutputTokens,
  } = monthlyVolume(input);

  const monthlyCost = computeCost(
    resolvedRate.entry,
    { inputTokens: monthlyInputTokens, outputTokens: monthlyOutputTokens, cacheHitRate: perRequest.cacheHitRate },
    resolvedRate.ctx,
  );
  const perRequestCostUsd = computeCost(resolvedRate.entry, perRequest, resolvedRate.ctx).totalUsd;

  return {
    effectiveRequestsPerDay,
    monthlyInputTokens,
    monthlyOutputTokens,
    monthlySpendUsd: monthlyCost.totalUsd,
    monthlySpendChf: usdToChf(monthlyCost.totalUsd),
    headroomUsd: monthlyBudgetUsd - monthlyCost.totalUsd,
    affordableRequestsPerDay: affordableRequestsPerDay(monthlyBudgetUsd, activeDaysPerMonth, perRequestCostUsd),
  };
}

// ---------------------------------------------------------------------------
// requiredCacheHitRate
// ---------------------------------------------------------------------------

export type BreakEvenResult =
  | { status: "no-cache-meter" }
  | { status: "already-within-budget"; monthlySpendAtNoCacheUsd: number }
  | { status: "impossible"; monthlySpendAtFullCacheUsd: number }
  | { status: "required"; hitRate: number; monthlySpendUsd: number };

/**
 * The cache hit rate `resolvedRate`'s lane needs to meet `input`'s monthly
 * budget, holding everything else (volume, growth, days) fixed.
 *
 * Solved algebraically, not by search: `computeCost` is called at `h=0` and
 * `h=1` against this month's monthly token volume to get two exact points on
 * the (linear, or constant when there's no cache meter) cost-vs-`h` line —
 * see the file-level doc comment for why two points fully determine it — and
 * the four states below fall out of comparing those two points to the
 * budget.
 *
 * "already-within-budget" is evaluated at `h=0` (no caching at all) rather
 * than at whatever `input.perRequest.cacheHitRate` happens to already be:
 * `h=0` is the floor of the achievable range, so meeting budget there is the
 * strongest, input-independent form of "you don't need a cache hit rate
 * target" — true regardless of what the workload's own assumed hit rate is
 * set to.
 */
export function requiredCacheHitRate(input: BudgetInput, resolvedRate: RateBasis): BreakEvenResult {
  const resolved = resolveRate(resolvedRate.entry, resolvedRate.ctx);
  if (resolved.cachedUsd === null) {
    return { status: "no-cache-meter" };
  }

  const { monthlyBudgetUsd, monthlyInputTokens, monthlyOutputTokens } = monthlyVolume(input);

  const atZero = computeCost(
    resolvedRate.entry,
    { inputTokens: monthlyInputTokens, outputTokens: monthlyOutputTokens, cacheHitRate: 0 },
    resolvedRate.ctx,
  ).totalUsd;
  const atOne = computeCost(
    resolvedRate.entry,
    { inputTokens: monthlyInputTokens, outputTokens: monthlyOutputTokens, cacheHitRate: 1 },
    resolvedRate.ctx,
  ).totalUsd;

  if (atZero <= monthlyBudgetUsd) {
    return { status: "already-within-budget", monthlySpendAtNoCacheUsd: atZero };
  }
  if (atOne > monthlyBudgetUsd) {
    return { status: "impossible", monthlySpendAtFullCacheUsd: atOne };
  }

  // atOne <= budget < atZero here, and totalUsd(h) is an affine (weighted-
  // average) function of h, so atOne < atZero strictly — this division is
  // never by zero.
  const rawHitRate = (monthlyBudgetUsd - atZero) / (atOne - atZero);
  const hitRate = Math.min(1, Math.max(0, rawHitRate));
  const monthlySpendUsd = computeCost(
    resolvedRate.entry,
    { inputTokens: monthlyInputTokens, outputTokens: monthlyOutputTokens, cacheHitRate: hitRate },
    resolvedRate.ctx,
  ).totalUsd;

  return { status: "required", hitRate, monthlySpendUsd };
}

// ---------------------------------------------------------------------------
// deploymentCacheCrossover
// ---------------------------------------------------------------------------

export type CrossoverResult =
  | { status: "crosses"; hitRate: number }
  | { status: "no-crossover"; cheaperLane: "direct" | "foundry" }
  | { status: "always-equal" };

/**
 * The cache hit rate at which `directRate` and `foundryRate` — presumed to
 * already be a same-model Direct/Foundry pair, e.g. one comparison out of
 * lane-insights.ts's `sameModelDeploymentComparison` — cost the same for
 * `input.perRequest`'s token shape.
 *
 * Pairing — "is there even a counterpart, and which one" — is deliberately
 * NOT this function's job. That logic already exists, is tested, and is
 * explicitly the brief's directed reuse: `sameModelDeploymentComparison`
 * (lane-insights.ts) finds zero, one, or several same-model counterparts on
 * the other side of the Direct/Foundry divide for a given lane. This function
 * assumes it has already been handed a real pair; the caller (the budget
 * planner UI) renders an explicit "no counterpart" state itself when
 * `sameModelDeploymentComparison` finds none, and never calls this function
 * in that case.
 *
 * Only `input.perRequest` affects the crossing point. Both cost lines are
 * `(scale) * (rate terms)`, so requests/day, active days, growth, and budget
 * are a uniform scale factor applied identically to both lines — a factor
 * that cancels out of "where do the lines cross in h" entirely (a crossing
 * measured in dollars would move with volume; one measured in h does not).
 * `input`'s type is still the full `BudgetInput`, for a uniform calling
 * convention with this file's other two functions, not because those other
 * fields matter here.
 *
 * Degenerate "always-equal" (the two lines coincide at every `h`, not just
 * one point) is a real, reachable catalog state — see e.g. a Direct lane and
 * a Foundry lane whose input/cached/output rates all happen to match — and is
 * reported explicitly rather than as an arbitrary single crossing point,
 * which a bare `hitRate` could not represent honestly.
 */
export function deploymentCacheCrossover(
  input: BudgetInput,
  directRate: RateBasis,
  foundryRate: RateBasis,
): CrossoverResult {
  const perRequest = sanitizeWorkload(input.perRequest);

  const d0 = computeCost(directRate.entry, { ...perRequest, cacheHitRate: 0 }, directRate.ctx).totalUsd;
  const d1 = computeCost(directRate.entry, { ...perRequest, cacheHitRate: 1 }, directRate.ctx).totalUsd;
  const f0 = computeCost(foundryRate.entry, { ...perRequest, cacheHitRate: 0 }, foundryRate.ctx).totalUsd;
  const f1 = computeCost(foundryRate.entry, { ...perRequest, cacheHitRate: 1 }, foundryRate.ctx).totalUsd;

  const diffAt0 = d0 - f0;
  const diffAt1 = d1 - f1;

  if (diffAt0 === 0 && diffAt1 === 0) return { status: "always-equal" };
  if (diffAt0 === 0) return { status: "crosses", hitRate: 0 };
  if (diffAt1 === 0) return { status: "crosses", hitRate: 1 };

  const sameSign = diffAt0 > 0 === diffAt1 > 0;
  if (sameSign) {
    return { status: "no-crossover", cheaperLane: diffAt0 > 0 ? "foundry" : "direct" };
  }

  const rawHitRate = diffAt0 / (diffAt0 - diffAt1);
  const hitRate = Math.min(1, Math.max(0, rawHitRate));
  return { status: "crosses", hitRate };
}
