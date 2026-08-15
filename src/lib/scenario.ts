import { type CompareRow, toPricingEntry } from "@/data/compare-data";
import type { PricingEntry, RateVariant, ServiceTier } from "@/data/types";
import { type CostBreakdown, type Workload, computeCost } from "@/lib/calc";
import { type RateContext, type ResolvedRate, applicableVariants, resolveRate } from "@/lib/rates";

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
 * day, not a different day. The date is never moved: a scenario instant is
 * always today, so nothing here can fast-forward a promo into existence.
 *
 * Looking *past* a not-yet-reached start date is a separate, explicit opt-in
 * carried on the `RateContext` instead (`previewScheduledRates`, set by
 * {@link scenarioContexts} for non-"now" modes only) — and whatever it reveals
 * is labelled as a preview by {@link scheduledPreview}, never shown as a live
 * price.
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
 *
 * `previewScheduledRates` is set for every mode except "now". That is the
 * whole of the opt-in described on `RateContext`: asking for a specific hour
 * is an explicit "show me what this scenario costs", so a rate that is
 * scheduled but not yet started may be revealed — labelled as a preview by
 * {@link scheduledPreview}. Asking for "now" never is, so the default
 * scenario can only ever show literally billable prices.
 */
export function scenarioToRateContext(scenario: Scenario, liveNow: Date, contextTokens: number): RateContext {
  return {
    now: resolveScenarioTime(scenario.time, liveNow),
    serviceTier: scenario.serviceTier,
    contextTokens,
    previewScheduledRates: scenario.time.mode !== "now",
  };
}

/**
 * The two contexts every compare row is resolved against.
 *
 * - `preview` is what the visitor asked to see: the scenario's hour and tier,
 *   with the schedule gate waived for non-"now" modes.
 * - `live` is the literal truth at this instant — real clock, gate enforced.
 *   It is never rendered; it exists so {@link scheduledPreview} can tell a
 *   rate that is genuinely billable today apart from one that is only
 *   reachable by looking ahead.
 */
export interface ScenarioContexts {
  preview: RateContext;
  live: RateContext;
}

export function scenarioContexts(scenario: Scenario, liveNow: Date, contextTokens: number): ScenarioContexts {
  return {
    preview: scenarioToRateContext(scenario, liveNow, contextTokens),
    live: {
      now: liveNow,
      serviceTier: scenario.serviceTier,
      contextTokens,
      previewScheduledRates: false,
    },
  };
}

/** True when any of `entry`'s variants is scoped to hours of the day. */
export function isTimeOfDayPriced(entry: PricingEntry): boolean {
  return (entry.variants ?? []).some((v) => (v.conditions.utcHourWindows?.length ?? 0) > 0);
}

/**
 * Narrow the schedule-gate opt-in to the rows the Time control is about.
 *
 * The control picks an hour of the day, so it may look past a start date only
 * for rows whose price actually depends on the hour — DeepSeek's peak/off-peak
 * pair. Rows whose only variants are plain date reversions (Gemini's 2027
 * revert, Qwen's September list price) are left on the enforced gate: picking
 * "Peak" is not a request to see next year's price, and letting one leak in
 * would silently reorder the table's workload-cost ranking and move the
 * cheapest-model highlight for a reason the reader never asked about.
 *
 * The whole *row* is opened up, not just its hour-scoped variants: DeepSeek's
 * "Off-peak" carries no `utcHourWindows` at all (it is the fallback half of an
 * hour-scoped pair), so gating variant-by-variant would reveal Peak and leave
 * Off-peak stuck on the base rate.
 */
export function effectivePreviewContext(entry: PricingEntry, preview: RateContext): RateContext {
  if (!preview.previewScheduledRates || isTimeOfDayPriced(entry)) return preview;
  return { ...preview, previewScheduledRates: false };
}

/** A resolved rate that is only reachable by looking past its start date. */
export interface ScheduledPreview {
  /** The variant being previewed. */
  variant: RateVariant;
  /** When it starts applying, or null if its conditions name no start instant. */
  startsAt: Date | null;
}

/**
 * Is the rate `previewCtx` resolved to a preview of something not yet
 * billable, or is it already really in force?
 *
 * The test is whether the matched variant's schedule is live *right now*, on
 * the real clock, setting aside what hour of the day the scenario asked for —
 * exactly what `applicableVariants` computes (it enforces `from`/`until`,
 * context band and tier, and waives only `utcHourWindows`).
 *
 * Waiving the hour is what makes this self-correcting rather than a hardcoded
 * "DeepSeek is a preview" rule. Comparing against the live *resolution*
 * instead would misfire twice: once the peak/off-peak split is genuinely
 * running it would call every non-current hour a "preview" (Peak at 02:00 is
 * a real, billable rate even while it is 20:00), and on the changeover day
 * itself the scenario instant can land earlier than the live one, since only
 * the hour is overridden and the calendar date is kept.
 *
 * Returns null when nothing is being previewed: the base rate resolved, or the
 * matched variant's schedule has genuinely started.
 */
export function scheduledPreview(
  entry: PricingEntry,
  previewCtx: RateContext,
  liveCtx: RateContext,
): ScheduledPreview | null {
  const variant = resolveRate(entry, previewCtx).variant;
  if (!variant) return null;
  if (applicableVariants(entry, { ...liveCtx, previewScheduledRates: false }).includes(variant)) {
    return null;
  }

  const fromMs = variant.conditions.from === undefined ? Number.NaN : Date.parse(variant.conditions.from);
  return { variant, startsAt: Number.isNaN(fromMs) ? null : new Date(fromMs) };
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
  /**
   * Non-null when `resolved` is a rate that has not started billing yet. The
   * UI must say so wherever it shows these numbers — see
   * {@link scheduledPreview}.
   */
  preview: ScheduledPreview | null;
}

/**
 * Resolve one compare row's rate and workload cost under `ctxs`.
 *
 * The single place that reconstructs a `PricingEntry` from a `CompareRow` and
 * runs it through both `resolveRate` (for the per-unit numbers a table cell
 * shows) and `computeCost` (for the $ totals) — kept together so the compare
 * page's sort/filter/render logic never has to know how that reconstruction
 * works. It is also where the scenario's preview opt-in is narrowed per row
 * ({@link effectivePreviewContext}) and where a previewed rate is flagged
 * ({@link scheduledPreview}), so the two can never drift apart: the same
 * context decides the numbers and the label.
 */
export function compareRowUnderScenario(
  row: CompareRow,
  workload: Workload,
  ctxs: ScenarioContexts,
): ComparedRow {
  const entry = toPricingEntry(row);
  const ctx = effectivePreviewContext(entry, ctxs.preview);
  const resolved = resolveRate(entry, ctx);
  const cost = computeCost(entry, workload, ctx);
  return {
    row,
    resolved,
    cost,
    scenarioPriced: isScenarioPriced(row, resolved),
    preview: scheduledPreview(entry, ctx, ctxs.live),
  };
}
