import { CATALOG_VERIFIED_AT, FRESHNESS_THRESHOLDS_DAYS } from "@/data/catalog-meta";
import type { CompareRow } from "@/data/compare-data";
import { officialSourceFor } from "@/data/source-links";
import type { Confidence, ProviderSlug, RateConditions, SourceLink } from "@/data/types";

/**
 * Pure derivations for the `/freshness` trust and provenance dashboard.
 *
 * This file answers three questions about the catalog as a whole, never about
 * what anything costs: how old is the last full verification sweep, how much
 * of the catalog is officially published versus derived or estimated, and
 * what is scheduled to change and when.
 *
 * Two rules keep this file honest with the rest of the site:
 *
 * 1. **Freshness never touches `confidence`.** Every function here reads
 *    `CompareRow.confidence` / `.cachedConfidence` as published and only
 *    reshapes or counts them — it never upgrades, downgrades, or infers a
 *    confidence value. The catalog is the sole source of truth for that
 *    field; this module is read-only over it.
 * 2. **`scheduledChanges` and the `hasUpcomingChange` flag on
 *    `buildFreshnessRecords` are a RAW scan of `variants[].conditions`, never
 *    a resolution.** They never call `resolveRate` / `applicableVariants`
 *    (lib/rates.ts) — this file answers "when is this row's schedule written
 *    to change", not "what does this row charge right now", so it does not
 *    need (and must not apply) `contextBand`/`serviceTier` gating, which
 *    governs billability, not scheduling.
 */

// ---------------------------------------------------------------------------
// Freshness status
// ---------------------------------------------------------------------------

export type FreshnessStatus = "current" | "review-due" | "stale";

export const FRESHNESS_STATUS_LABEL: Record<FreshnessStatus, string> = {
  current: "current",
  "review-due": "review due",
  stale: "stale",
};

/**
 * Age-in-days -> status, using `FRESHNESS_THRESHOLDS_DAYS` (data/catalog-meta.ts)
 * exclusively — no threshold literal is duplicated here. `currentMax` and
 * `reviewDueMax` are both inclusive upper bounds: an age exactly at
 * `currentMax` is still "current", and an age exactly at `reviewDueMax` is
 * still "review-due" (only ages strictly greater than `reviewDueMax` are
 * "stale"). See freshness.test.ts for the pinned 7/8/30/31-day boundaries.
 */
export function freshnessStatus(ageDays: number): FreshnessStatus {
  if (ageDays <= FRESHNESS_THRESHOLDS_DAYS.currentMax) return "current";
  if (ageDays <= FRESHNESS_THRESHOLDS_DAYS.reviewDueMax) return "review-due";
  return "stale";
}

/**
 * Whole days between `CATALOG_VERIFIED_AT` and `now`. Floored (never rounds
 * up), matching the equivalent computation already used on the lane detail
 * page. Defensively clamped to a finite `0` rather than propagating `NaN` if
 * either instant fails to parse — `CATALOG_VERIFIED_AT` is a trusted, fixed
 * literal, so this can only happen from a caller passing an invalid `now`,
 * never from real catalog data.
 */
function catalogAgeDays(now: Date): number {
  const auditedMs = Date.parse(CATALOG_VERIFIED_AT);
  const nowMs = now.getTime();
  if (!Number.isFinite(auditedMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, Math.floor((nowMs - auditedMs) / 86_400_000));
}

// ---------------------------------------------------------------------------
// Raw variant-boundary scanning (shared by buildFreshnessRecords and scheduledChanges)
// ---------------------------------------------------------------------------

/** Whether a variant's schedule is recurring/time-of-day rather than a plain calendar boundary. */
export type ScheduledChangeKind = "expiry" | "time-of-day";

export const SCHEDULED_CHANGE_KIND_LABEL: Record<ScheduledChangeKind, string> = {
  expiry: "Promotion / rate expiry",
  "time-of-day": "Time-of-day pricing",
};

/**
 * A variant is "time-of-day" when its conditions carry a non-empty
 * `utcHourWindows` or `utcDaysOfWeek` — the same "omitted or empty places no
 * constraint" reading lib/rates.ts's own matcher uses. Everything else
 * (a plain `from`/`until`, alone or alongside `contextBand`/`serviceTier`) is
 * a one-time promotion or rate-change expiry: it fires once, on a calendar
 * date, and does not recur.
 */
function isRecurring(conditions: RateConditions): boolean {
  return Boolean(
    (conditions.utcHourWindows && conditions.utcHourWindows.length > 0) ||
      (conditions.utcDaysOfWeek && conditions.utcDaysOfWeek.length > 0),
  );
}

interface RawBoundary {
  at: Date;
  kind: ScheduledChangeKind;
  variantLabel: string;
}

/**
 * Every `from`/`until` instant declared on `row`'s variants that is still
 * ahead of `now`, in catalog (variants-array) order. A single variant
 * contributes up to two boundaries — its `from` and its `until` — whenever
 * both are set and both are still in the future.
 *
 * Unparseable instants are skipped rather than surfaced as a broken date,
 * mirroring `lib/rates.ts`'s "drop rather than misquote" rule for a typoed
 * `from`/`until`. An instant equal to `now` is NOT included: `resolveRate`
 * treats `from` as inclusive, so a boundary exactly at `now` has already
 * taken effect and is no longer "upcoming".
 */
function futureBoundaries(row: CompareRow, now: Date): RawBoundary[] {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) return [];

  const boundaries: RawBoundary[] = [];
  for (const variant of row.variants ?? []) {
    const kind: ScheduledChangeKind = isRecurring(variant.conditions) ? "time-of-day" : "expiry";
    for (const iso of [variant.conditions.from, variant.conditions.until]) {
      if (iso === undefined) continue;
      const ms = Date.parse(iso);
      if (!Number.isFinite(ms) || ms <= nowMs) continue;
      boundaries.push({ at: new Date(ms), kind, variantLabel: variant.label });
    }
  }
  return boundaries;
}

// ---------------------------------------------------------------------------
// buildFreshnessRecords
// ---------------------------------------------------------------------------

export interface FreshnessRecord {
  /** The catalog lane this record is about, untouched — confidence, effectiveDate, sourceNote, variants all travel through as published. */
  row: CompareRow;
  /**
   * Days since `CATALOG_VERIFIED_AT`. This is a CATALOG-WIDE instant, not
   * inferred from `row.effectiveDate` — every record in one `buildFreshnessRecords`
   * call carries the identical `ageDays`/`status`, by design: the audit
   * sweep verifies the whole catalog together, so freshness is a property of
   * the catalog, not of an individual lane. `row.effectiveDate` is still
   * carried on `row` for display/context, just never used for this
   * calculation.
   */
  ageDays: number;
  status: FreshnessStatus;
  /** `row.cachedUsd !== null` — whether this lane has a cache meter at all. */
  hasCacheMeter: boolean;
  /** Whether this row's own `variants` carry at least one future `from`/`until` boundary. See `scheduledChanges` for the catalog-wide, deduplicated view. */
  hasUpcomingChange: boolean;
}

/** One freshness record per catalog lane, in `rows`' input order. */
export function buildFreshnessRecords(rows: CompareRow[], now: Date): FreshnessRecord[] {
  const ageDays = catalogAgeDays(now);
  const status = freshnessStatus(ageDays);

  return rows.map((row) => ({
    row,
    ageDays,
    status,
    hasCacheMeter: row.cachedUsd !== null,
    hasUpcomingChange: futureBoundaries(row, now).length > 0,
  }));
}

// ---------------------------------------------------------------------------
// confidenceCounts
// ---------------------------------------------------------------------------

export type ConfidenceDimensionCounts = Record<Confidence, number>;

export interface ConfidenceCounts {
  /** Input/output confidence — always meaningful, one count per record. */
  input: ConfidenceDimensionCounts;
  /** Cached-input confidence, counted ONLY for records with a cache meter. */
  cached: ConfidenceDimensionCounts;
  /** Records with no cache meter at all — excluded from `cached` rather than folded into any bucket, since confidence is not a meaningful concept for a dimension that does not exist on that lane. */
  cachedMissing: number;
}

function emptyDimensionCounts(): ConfidenceDimensionCounts {
  return { official: 0, derived: 0, estimate: 0 };
}

/**
 * Aggregate confidence across the catalog, counting input and cached as the
 * two potentially-different dimensions they are (a lane can be official on
 * input and derived on cached, or vice versa) — the same distinction the lane
 * detail page's provenance section already draws per row, just totaled here.
 */
export function confidenceCounts(records: FreshnessRecord[]): ConfidenceCounts {
  const input = emptyDimensionCounts();
  const cached = emptyDimensionCounts();
  let cachedMissing = 0;

  for (const record of records) {
    input[record.row.confidence] += 1;
    if (record.hasCacheMeter) {
      cached[record.row.cachedConfidence] += 1;
    } else {
      cachedMissing += 1;
    }
  }

  return { input, cached, cachedMissing };
}

// ---------------------------------------------------------------------------
// scheduledChanges
// ---------------------------------------------------------------------------

export interface ScheduledChange {
  /** Stable dedup/React key — see the dedup-key note below. */
  id: string;
  row: CompareRow;
  at: Date;
  kind: ScheduledChangeKind;
  /**
   * Distinct variant labels whose `from` or `until` produced this boundary,
   * in first-seen (catalog array) order. Usually one label; can be several
   * when multiple variants share an identical instant on the same row (e.g.
   * a promo's "Standard" variant `from`-ing in at the same moment a
   * service-tier variant `until`-s out).
   */
  variantLabels: string[];
}

/**
 * Every future rate-change boundary across the catalog, deduplicated and
 * ordered — the data behind the "Upcoming changes" timeline.
 *
 * **Dedup key: `(row.id, instant, kind)`.** Reasoning, since the brief leaves
 * this as a judgment call:
 *
 * - A single row's variants routinely reference the SAME instant more than
 *   once — e.g. Gemini 3.6/3.7 Flash's 2027-01-01 reversion is written as one
 *   `from` on a "Standard" variant plus a matching `until`/`from` pair on each
 *   of its Batch/Flex/Priority service-tier variants. Deduping only within a
 *   row (not across the whole catalog) collapses these into ONE timeline
 *   entry for that row at that instant, with every contributing variant's
 *   label folded into `variantLabels` — one calendar event, not seven.
 * - Deliberately keyed by ROW, not by instant alone: two different lanes can
 *   coincidentally share a boundary instant (e.g. two promos both ending on
 *   the same date), and each is its own purchasable lane with its own
 *   detail-page anchor — collapsing them into one entry would lose that
 *   per-lane identity the brief calls out ("lane anchors"). So same-instant
 *   boundaries on DIFFERENT rows stay as separate entries.
 * - `kind` is part of the key (not folded away) so a hypothetical row whose
 *   variants reference the identical instant for both a one-time expiry AND
 *   a recurring time-of-day boundary still surfaces as two distinct kinds of
 *   change, rather than silently picking one classification to represent
 *   both.
 *
 * Ordered by `at` ascending; ties break on stable lane id then kind, so the
 * result never depends on `rows`' input order — the same rule
 * `lib/lane-insights.ts` documents for its own order-independent sorts.
 */
export function scheduledChanges(rows: CompareRow[], now: Date): ScheduledChange[] {
  const byKey = new Map<string, ScheduledChange>();

  for (const row of rows) {
    for (const boundary of futureBoundaries(row, now)) {
      const key = `${row.id}::${boundary.at.toISOString()}::${boundary.kind}`;
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.variantLabels.includes(boundary.variantLabel)) {
          existing.variantLabels.push(boundary.variantLabel);
        }
      } else {
        byKey.set(key, { id: key, row, at: boundary.at, kind: boundary.kind, variantLabels: [boundary.variantLabel] });
      }
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const byInstant = a.at.getTime() - b.at.getTime();
    if (byInstant !== 0) return byInstant;
    const byLane = a.row.id.localeCompare(b.row.id);
    if (byLane !== 0) return byLane;
    return a.kind.localeCompare(b.kind);
  });
}

// ---------------------------------------------------------------------------
// filterFreshnessRecords
// ---------------------------------------------------------------------------

export interface FreshnessFilter {
  stale: boolean;
  /** Either dimension: input is derived, OR (when a cache meter exists) cached is derived. */
  derived: boolean;
  /** Either dimension: input is estimate, OR (when a cache meter exists) cached is estimate. */
  estimated: boolean;
  scheduledToChange: boolean;
  missingCache: boolean;
}

export const DEFAULT_FRESHNESS_FILTER: FreshnessFilter = {
  stale: false,
  derived: false,
  estimated: false,
  scheduledToChange: false,
  missingCache: false,
};

/** Does `record` have `confidence` on some MEANINGFUL dimension — input always, cached only when a meter exists? */
function hasConfidenceOn(record: FreshnessRecord, confidence: Confidence): boolean {
  if (record.row.confidence === confidence) return true;
  return record.hasCacheMeter && record.row.cachedConfidence === confidence;
}

/**
 * Composable AND-together filters over freshness records, in the same spirit
 * as `lib/compare-insights.ts`'s `filterComparedRows`: every active
 * (`true`) field must hold for a record to pass; an all-`false` filter (the
 * default) returns every record unchanged.
 */
export function filterFreshnessRecords(records: FreshnessRecord[], filter: FreshnessFilter): FreshnessRecord[] {
  return records.filter((record) => {
    if (filter.stale && record.status !== "stale") return false;
    if (filter.derived && !hasConfidenceOn(record, "derived")) return false;
    if (filter.estimated && !hasConfidenceOn(record, "estimate")) return false;
    if (filter.scheduledToChange && !record.hasUpcomingChange) return false;
    if (filter.missingCache && record.hasCacheMeter) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// providerCoverage
// ---------------------------------------------------------------------------

export interface ProviderCoverage {
  providerSlug: string;
  provider: string;
  laneCount: number;
  source: SourceLink;
  input: ConfidenceDimensionCounts;
  cached: ConfidenceDimensionCounts;
  cachedMissing: number;
}

/**
 * Per-provider rollup for the dashboard's source-coverage section: how many
 * lanes, their confidence breakdown (reusing `confidenceCounts` per group
 * rather than re-implementing the tally), and the official source link from
 * the shared registry (data/source-links.ts) — never a second, page-local
 * source registry.
 *
 * Not part of the brief's named "Produces" list, but built the same way every
 * other page-specific rollup on this site is: a small pure function in the
 * lib file backing the page, so `freshness-dashboard.tsx` only renders
 * already-computed data rather than aggregating inline. Sorted by provider
 * display name so the result does not depend on catalog array order.
 */
export function providerCoverage(records: FreshnessRecord[]): ProviderCoverage[] {
  const byProvider = new Map<string, FreshnessRecord[]>();
  for (const record of records) {
    const bucket = byProvider.get(record.row.providerSlug);
    if (bucket) bucket.push(record);
    else byProvider.set(record.row.providerSlug, [record]);
  }

  const coverage = [...byProvider.entries()].map(([providerSlug, providerRecords]) => {
    const counts = confidenceCounts(providerRecords);
    return {
      providerSlug,
      provider: providerRecords[0].row.provider,
      laneCount: providerRecords.length,
      source: officialSourceFor(providerSlug as ProviderSlug),
      input: counts.input,
      cached: counts.cached,
      cachedMissing: counts.cachedMissing,
    };
  });

  coverage.sort((a, b) => a.provider.localeCompare(b.provider));
  return coverage;
}
