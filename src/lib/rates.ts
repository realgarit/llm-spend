import type {
  Confidence,
  PricingEntry,
  RateConditions,
  RateVariant,
  ServiceTier,
  UtcHourWindow,
} from "@/data/types";

/**
 * Rate resolution for entries that carry conditional `variants`.
 *
 * A pricing entry's flat `inputUsd`/`cachedUsd`/`outputUsd` are its base rate.
 * `variants` layer conditional rates over it — promo windows, peak/off-peak
 * hours, context bands, service tiers — each with its own explicitly published
 * numbers. This module answers "which of those applies right now, for this
 * prompt size and tier", and nothing else: it never multiplies, discounts or
 * otherwise derives a number that is not written in the catalog.
 *
 * All time arithmetic is UTC. Never reach for a local-time accessor here — the
 * windows providers publish (DeepSeek's peak hours, promo end dates) are
 * absolute instants, and reading them in the server's or browser's local zone
 * would silently quote the wrong price for most of the world.
 */

/** What we are pricing for: the instant, and optionally the prompt size and tier. */
export interface RateContext {
  now: Date;
  /** Prompt size in tokens. Omit when unknown — band variants then cannot match. */
  contextTokens?: number;
  /** Service tier being priced. Defaults to "standard". */
  serviceTier?: ServiceTier;
  /**
   * Opt-in preview of scheduled rates: waive the `from`/`until` gate so a
   * variant that has not started yet (or has already ended) can still be
   * resolved and shown.
   *
   * **Off by default, and it must stay that way for every "what does this cost
   * right now" caller.** A resolution made with this set is NOT a billable
   * rate — it answers "what will this cost once the schedule reaches it",
   * which is only ever a legitimate thing to show when the reader explicitly
   * asked to look ahead and the UI says so in as many words. The compare
   * page's non-"Now" time scenarios are the only caller that sets it (see
   * lib/scenario.ts, which also owns the "is this a preview or is it really
   * true" test that drives the label).
   *
   * Everything else still applies: `utcHourWindows`, `contextBand` and
   * `serviceTier` are enforced exactly as normal, and a `from`/`until` that
   * does not parse still drops the variant rather than quoting a price off a
   * typo.
   */
  previewScheduledRates?: boolean;
}

/** The rate that actually applies, plus which variant produced it. */
export interface ResolvedRate {
  inputUsd: number;
  cachedUsd: number | null;
  outputUsd: number;
  confidence: Confidence;
  cachedConfidence?: Confidence;
  /** The variant that matched, or null when the row's base rate was used. */
  variant: RateVariant | null;
  /** The matched variant's label, or null for the base rate. */
  label: string | null;
}

/** Range of rates a row can currently charge, across its applicable variants. */
export interface RateRange {
  minInputUsd: number;
  maxInputUsd: number;
  minOutputUsd: number;
  maxOutputUsd: number;
  /** True when the applicable variants do not all agree on input and output. */
  varies: boolean;
}

/** Label reported by `nextRateChange` when the base rate is what takes over. */
export const BASE_RATE_LABEL = "Base rate";

const HOUR_MS = 3_600_000;

/**
 * How far ahead `nextRateChange` scans hour-of-day boundaries.
 *
 * Must span a full week plus margin, because a recurring window can be scoped
 * to days as well as hours: DeepSeek's peak hours run Monday-Friday, so from
 * Friday 10:00 UTC the next change is Monday 01:00 UTC — 63 hours out. A
 * 48-hour scan would report "nothing scheduled" for most of the weekend.
 */
const HOUR_SCAN_LIMIT = 24 * 8;

/**
 * Does a condition set hold for this context?
 *
 * Semantics, all ANDed:
 * - `from` is inclusive, `until` is exclusive, so back-to-back variants can
 *   share an instant without overlapping. An unparseable date never matches —
 *   we would rather drop a variant than quote a price on a typo. When
 *   `ctx.previewScheduledRates` is set, the in/out-of-window comparison is
 *   waived (the parse check is not); see {@link RateContext} for when that is
 *   allowed.
 * - `utcHourWindows` matches when the current UTC hour is in any one window;
 *   windows are half-open `[start, end)` and may wrap midnight.
 * - `utcDaysOfWeek` matches when the current UTC day (`Date#getUTCDay`, 0 =
 *   Sunday) is in the list. Omitted or empty places no constraint, exactly as
 *   for `utcHourWindows`.
 * - `contextBand`'s `minTokens` is inclusive and `maxTokens` exclusive; an
 *   absent bound is unbounded. If `ctx.contextTokens` is unknown, a variant
 *   with a band does NOT match — we cannot claim a band price without knowing
 *   the prompt size.
 * - `serviceTier`: a variant without one matches only the standard tier; a
 *   variant with one matches only that exact tier.
 */
export function matchesConditions(c: RateConditions, ctx: RateContext): boolean {
  return matches(c, ctx, false);
}

/**
 * The rate that applies to `entry` under `ctx`.
 *
 * Variants are evaluated in array order and the FIRST match wins — authoring
 * order is priority order, so put the more specific variant first. When no
 * variant matches, the entry's flat base rate is returned with
 * `variant: null` and `label: null`.
 *
 * A matched variant's `confidence`/`cachedConfidence` fall back to the entry's,
 * so a variant only has to restate provenance when it actually differs.
 */
export function resolveRate(entry: PricingEntry, ctx: RateContext): ResolvedRate {
  const variant = entry.variants?.find((candidate) => matchesConditions(candidate.conditions, ctx));

  if (!variant) {
    return {
      inputUsd: entry.inputUsd,
      cachedUsd: entry.cachedUsd,
      outputUsd: entry.outputUsd,
      confidence: entry.confidence,
      cachedConfidence: entry.cachedConfidence,
      variant: null,
      label: null,
    };
  }

  return {
    inputUsd: variant.inputUsd,
    cachedUsd: variant.cachedUsd,
    outputUsd: variant.outputUsd,
    confidence: variant.confidence ?? entry.confidence,
    cachedConfidence: variant.cachedConfidence ?? entry.cachedConfidence,
    variant,
    label: variant.label,
  };
}

/**
 * Every variant that applies to `ctx` **ignoring where we are in the recurring
 * week**, in array order.
 *
 * Date windows, context bands and service tiers still filter; the recurring
 * time scoping — `utcHourWindows` and `utcDaysOfWeek` — is waived. This is what
 * a UI wants when it shows the whole picture: both halves of a peak/off-peak
 * pair, rather than just the one in force this hour. Waiving the day alongside
 * the hour matters for the same reason it matters for the hour — a statically
 * rendered "from $X" or "$0.66-$1.32" range must not change meaning at a
 * weekend boundary.
 */
export function applicableVariants(entry: PricingEntry, ctx: RateContext): RateVariant[] {
  return (entry.variants ?? []).filter((variant) => matches(variant.conditions, ctx, true));
}

/**
 * The spread of rates this row can charge under `ctx`, across the variants that
 * apply ignoring time of day — the input to a "$0.66-$1.32" style display.
 *
 * When no variant applies, the base rate is the whole range and `varies` is
 * false. A row with no variants at all therefore always reports `varies: false`.
 */
export function rateRange(entry: PricingEntry, ctx: RateContext): RateRange {
  const variants = applicableVariants(entry, ctx);
  const inputs = variants.length > 0 ? variants.map((v) => v.inputUsd) : [entry.inputUsd];
  const outputs = variants.length > 0 ? variants.map((v) => v.outputUsd) : [entry.outputUsd];

  const minInputUsd = Math.min(...inputs);
  const maxInputUsd = Math.max(...inputs);
  const minOutputUsd = Math.min(...outputs);
  const maxOutputUsd = Math.max(...outputs);

  return {
    minInputUsd,
    maxInputUsd,
    minOutputUsd,
    maxOutputUsd,
    varies: minInputUsd !== maxInputUsd || minOutputUsd !== maxOutputUsd,
  };
}

/**
 * When the currently-resolved rate stops applying, and what takes over.
 *
 * Candidate instants are every variant `from`/`until` in the future plus, when
 * any variant is hour-scoped, the next {@link HOUR_SCAN_LIMIT} top-of-hour
 * ticks. The earliest candidate that resolves to a different variant than the
 * one in force now is the answer; `label` is the incoming rate's label, or
 * {@link BASE_RATE_LABEL} when the base rate takes over.
 *
 * Returns null when nothing is scheduled to change — no variants, or none whose
 * boundaries are ahead of `ctx.now`.
 *
 * `ctx.previewScheduledRates` is deliberately ignored here: "when does the
 * price next change" is a question about the real schedule, and answering it
 * from a context that waives the schedule would report that nothing ever
 * changes.
 */
export function nextRateChange(
  entry: PricingEntry,
  ctx: RateContext,
): { at: Date; label: string } | null {
  const variants = entry.variants ?? [];
  if (variants.length === 0) return null;

  const nowMs = ctx.now.getTime();
  if (!Number.isFinite(nowMs)) return null;

  const scheduled: RateContext = ctx.previewScheduledRates
    ? { ...ctx, previewScheduledRates: false }
    : ctx;
  const current = resolveRate(entry, scheduled).variant;
  const candidates = new Set<number>();

  let recurring = false;
  for (const variant of variants) {
    const { from, until, utcHourWindows, utcDaysOfWeek } = variant.conditions;
    for (const iso of [from, until]) {
      if (iso === undefined) continue;
      const ms = Date.parse(iso);
      if (Number.isNaN(ms) || ms <= nowMs) continue;
      candidates.add(ms);
    }
    if (utcHourWindows && utcHourWindows.length > 0) recurring = true;
    if (utcDaysOfWeek && utcDaysOfWeek.length > 0) recurring = true;
  }

  if (recurring) {
    const firstTick = (Math.floor(nowMs / HOUR_MS) + 1) * HOUR_MS;
    for (let i = 0; i < HOUR_SCAN_LIMIT; i += 1) {
      candidates.add(firstTick + i * HOUR_MS);
    }
  }

  for (const at of [...candidates].sort((a, b) => a - b)) {
    const next = resolveRate(entry, { ...scheduled, now: new Date(at) }).variant;
    if (next !== current) {
      return { at: new Date(at), label: next?.label ?? BASE_RATE_LABEL };
    }
  }

  return null;
}

function matches(c: RateConditions, ctx: RateContext, ignoreRecurringTime: boolean): boolean {
  const nowMs = ctx.now.getTime();
  if (!Number.isFinite(nowMs)) return false;

  // The schedule gate. `previewScheduledRates` waives only the comparison
  // against `now` — an unparseable instant still drops the variant, because a
  // typo is a typo whether or not we are previewing.
  const previewing = ctx.previewScheduledRates === true;

  if (c.from !== undefined) {
    const fromMs = Date.parse(c.from);
    if (Number.isNaN(fromMs)) return false;
    if (!previewing && nowMs < fromMs) return false;
  }

  if (c.until !== undefined) {
    const untilMs = Date.parse(c.until);
    if (Number.isNaN(untilMs)) return false;
    if (!previewing && nowMs >= untilMs) return false;
  }

  if (!ignoreRecurringTime) {
    if (c.utcHourWindows && c.utcHourWindows.length > 0) {
      const hour = ctx.now.getUTCHours();
      if (!c.utcHourWindows.some((window) => containsHour(window, hour))) return false;
    }

    if (c.utcDaysOfWeek && c.utcDaysOfWeek.length > 0) {
      const day = ctx.now.getUTCDay();
      if (!c.utcDaysOfWeek.includes(day)) return false;
    }
  }

  if (c.contextBand) {
    const tokens = ctx.contextTokens;
    if (tokens === undefined) return false;
    const { minTokens, maxTokens } = c.contextBand;
    if (minTokens !== undefined && tokens < minTokens) return false;
    if (maxTokens !== undefined && tokens >= maxTokens) return false;
  }

  const wantedTier = c.serviceTier ?? "standard";
  const actualTier = ctx.serviceTier ?? "standard";
  if (wantedTier !== actualTier) return false;

  return true;
}

/** Half-open `[start, end)` containment, wrapping past midnight when start > end. */
function containsHour(window: UtcHourWindow, hour: number): boolean {
  const { startHourUtc, endHourUtc } = window;
  if (startHourUtc === endHourUtc) return false;
  if (startHourUtc < endHourUtc) return hour >= startHourUtc && hour < endHourUtc;
  return hour >= startHourUtc || hour < endHourUtc;
}
