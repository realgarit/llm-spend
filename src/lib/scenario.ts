import { type CompareRow, toPricingEntry } from "@/data/compare-data";
import type { ServiceTier } from "@/data/types";
import { type CostBreakdown, type Workload, computeCost } from "@/lib/calc";
import { type RateContext, type ResolvedRate, resolveRate } from "@/lib/rates";

/**
 * Scenario controls for the compare page: pick a point in time and a service
 * tier, and every row is priced under those conditions via `resolveRate`
 * instead of always showing its flat base rate. Prompt/context size rides
 * along on the existing workload input-token control rather than a scenario
 * field of its own — see `compareRowUnderScenario` below for why.
 *
 * Kept as plain data plus pure functions so the scenario -> `RateContext`
 * mapping is unit-testable with plain node:test, no DOM or React renderer.
 * `scenario-controls.tsx` only renders this; it holds no logic of its own.
 */

export type TimeMode = "now" | "peak" | "off-peak" | "custom";

export interface TimeScenario {
  mode: TimeMode;
  /** UTC hour (0-23) to preview. Only read when `mode` is "custom". */
  customHourUtc?: number;
}

export interface Scenario {
  time: TimeScenario;
  serviceTier: ServiceTier;
}

/** "Now", standard tier — the scenario the compare page starts on. */
export const DEFAULT_SCENARIO: Scenario = {
  time: { mode: "now" },
  serviceTier: "standard",
};

/** Representative UTC hour inside DeepSeek's published peak windows (01:00-04:00, 06:00-10:00). */
export const PEAK_HOUR_UTC = 2;
/** Representative UTC hour outside every published peak window. */
export const OFF_PEAK_HOUR_UTC = 12;
/**
 * Hour "custom" mode falls back to before the visitor has picked one. A fixed
 * constant rather than the live hour so the control's displayed selection can
 * never silently disagree with what is actually being priced — the UI's hour
 * `<select>` and this resolver share this same value.
 */
export const DEFAULT_CUSTOM_HOUR_UTC = 0;

export const SERVICE_TIER_OPTIONS: { value: ServiceTier; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "batch", label: "Batch" },
  { value: "flex", label: "Flex" },
  { value: "priority", label: "Priority" },
  { value: "highspeed", label: "Highspeed" },
];

/**
 * The instant a time scenario resolves to, given the visitor's real clock.
 *
 * "now" passes `liveNow` straight through. The other modes keep `liveNow`'s
 * calendar date and only override the UTC hour — they preview an hour of the
 * day, not a different day. That matters for a `from`-gated variant: DeepSeek's
 * peak/off-peak split does not start until 2026-08-16T16:00:00Z, so picking
 * "Peak" before then still correctly resolves to the row's base rate. This is
 * an hour-of-day preview, not a time machine that fast-forwards a promo into
 * existence early.
 */
export function resolveScenarioTime(time: TimeScenario, liveNow: Date): Date {
  switch (time.mode) {
    case "now":
      return liveNow;
    case "peak":
      return atUtcHour(liveNow, PEAK_HOUR_UTC);
    case "off-peak":
      return atUtcHour(liveNow, OFF_PEAK_HOUR_UTC);
    case "custom":
      return atUtcHour(liveNow, time.customHourUtc ?? DEFAULT_CUSTOM_HOUR_UTC);
    default:
      return liveNow;
  }
}

function atUtcHour(base: Date, hourUtc: number): Date {
  const next = new Date(base.getTime());
  next.setUTCHours(hourUtc, 0, 0, 0);
  return next;
}

/**
 * Build the `RateContext` a scenario resolves to.
 *
 * `contextTokens` reuses the workload's input-token count rather than adding
 * a separate "prompt size" control. The two are not really the same thing —
 * a workload total is cumulative across many calls, a context band is about
 * one prompt — but no catalog row defines a `contextBand` variant yet (only
 * time-of-day and promo-expiry variants exist today), so this choice is
 * currently a forward-compatible no-op rather than a load-bearing one. It
 * avoids a second control for a dimension nothing yet reacts to, and once a
 * banded row is added, a small workload will correctly read as a small
 * prompt and a large one as a large prompt without further UI work.
 */
export function scenarioToRateContext(scenario: Scenario, liveNow: Date, contextTokens: number): RateContext {
  return {
    now: resolveScenarioTime(scenario.time, liveNow),
    serviceTier: scenario.serviceTier,
    contextTokens,
  };
}

/** True when `resolved` differs from `base` on any dimension — i.e. a variant actually changed the price. */
export function isScenarioPriced(
  base: { inputUsd: number; cachedUsd: number | null; outputUsd: number },
  resolved: ResolvedRate,
): boolean {
  return (
    resolved.inputUsd !== base.inputUsd ||
    resolved.outputUsd !== base.outputUsd ||
    resolved.cachedUsd !== base.cachedUsd
  );
}

/** A compare row priced under a scenario: its resolved rate, the workload cost it implies, and whether that differs from the row's base rate. */
export interface ComparedRow {
  row: CompareRow;
  resolved: ResolvedRate;
  cost: CostBreakdown;
  scenarioPriced: boolean;
}

/**
 * Resolve one compare row's rate and workload cost under `ctx`.
 *
 * The single place that reconstructs a `PricingEntry` from a `CompareRow` and
 * runs it through both `resolveRate` (for the per-unit numbers a table cell
 * shows) and `computeCost` (for the $ totals) — kept together so the compare
 * page's sort/filter/render logic never has to know how that reconstruction
 * works.
 */
export function compareRowUnderScenario(row: CompareRow, workload: Workload, ctx: RateContext): ComparedRow {
  const entry = toPricingEntry(row);
  const resolved = resolveRate(entry, ctx);
  const cost = computeCost(entry, workload, ctx);
  return { row, resolved, cost, scenarioPriced: isScenarioPriced(row, resolved) };
}
