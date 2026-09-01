import assert from "node:assert/strict";
import test from "node:test";
import { buildCompareRows, type CompareRow } from "@/data/compare-data";
import { CATALOG_VERIFIED_AT, FRESHNESS_THRESHOLDS_DAYS } from "@/data/catalog-meta";
import type { Confidence, RateVariant, Tier } from "@/data/types";
import {
  DEFAULT_FRESHNESS_FILTER,
  buildFreshnessRecords,
  confidenceCounts,
  filterFreshnessRecords,
  freshnessStatus,
  providerCoverage,
  scheduledChanges,
  type FreshnessFilter,
  type FreshnessRecord,
} from "@/lib/freshness";

const AUDITED_MS = Date.parse(CATALOG_VERIFIED_AT);
const DAY_MS = 86_400_000;

/** `now` exactly `days` whole days after the catalog audit instant. */
function daysAfterAudit(days: number): Date {
  return new Date(AUDITED_MS + days * DAY_MS);
}

/**
 * Fixture builder for a bare catalog lane, in the same spirit as
 * lane-insights.test.ts's/compare-insights.test.ts's local `compared()`
 * helpers — not shared/exported anywhere, each test file defines its own.
 */
function row({
  id,
  provider = "Example",
  providerSlug = provider.toLocaleLowerCase().replaceAll(" ", "-"),
  model = "Example Model",
  host,
  tier = "Direct",
  cachedUsd = 0.1,
  confidence = "official",
  cachedConfidence = confidence,
  effectiveDate = "2026-08-30",
  sourceNote,
  variants,
}: {
  id: string;
  provider?: string;
  providerSlug?: string;
  model?: string;
  host?: string;
  tier?: Tier;
  cachedUsd?: number | null;
  confidence?: Confidence;
  cachedConfidence?: Confidence;
  effectiveDate?: string;
  sourceNote?: string;
  variants?: RateVariant[];
}): CompareRow {
  return {
    id,
    provider,
    providerSlug,
    model,
    host,
    tier,
    inputUsd: 1,
    cachedUsd,
    outputUsd: 4,
    confidence,
    cachedConfidence,
    effectiveDate,
    sourceNote,
    variants,
  };
}

/** A variant whose conditions are a plain calendar boundary only — an "expiry" kind. */
function expiryVariant(label: string, conditions: { from?: string; until?: string }): RateVariant {
  return { label, conditions, inputUsd: 9, cachedUsd: 0.9, outputUsd: 18 };
}

/** A variant scoped to recurring UTC hours — a "time-of-day" kind. */
function timeOfDayVariant(label: string, conditions: { from?: string; until?: string }): RateVariant {
  return {
    label,
    conditions: { ...conditions, utcHourWindows: [{ startHourUtc: 1, endHourUtc: 4 }] },
    inputUsd: 9,
    cachedUsd: 0.9,
    outputUsd: 18,
  };
}

// ---------------------------------------------------------------------------
// freshnessStatus — exact day boundaries
// ---------------------------------------------------------------------------

test("freshnessStatus: 7 days (currentMax) is current", () => {
  assert.equal(FRESHNESS_THRESHOLDS_DAYS.currentMax, 7, "test assumes the documented currentMax; update the test if the constant changes");
  assert.equal(freshnessStatus(7), "current");
});

test("freshnessStatus: 8 days (currentMax + 1) is review-due", () => {
  assert.equal(freshnessStatus(8), "review-due");
});

test("freshnessStatus: 30 days (reviewDueMax) is review-due", () => {
  assert.equal(FRESHNESS_THRESHOLDS_DAYS.reviewDueMax, 30, "test assumes the documented reviewDueMax; update the test if the constant changes");
  assert.equal(freshnessStatus(30), "review-due");
});

test("freshnessStatus: 31 days (reviewDueMax + 1) is stale", () => {
  assert.equal(freshnessStatus(31), "stale");
});

test("freshnessStatus: 0 days is current", () => {
  assert.equal(freshnessStatus(0), "current");
});

test("freshnessStatus: a very large age is stale", () => {
  assert.equal(freshnessStatus(10_000), "stale");
});

// ---------------------------------------------------------------------------
// buildFreshnessRecords
// ---------------------------------------------------------------------------

test("buildFreshnessRecords: ageDays/status are wired from CATALOG_VERIFIED_AT, uniformly across every record", () => {
  const rows = [row({ id: "a" }), row({ id: "b" })];
  const records = buildFreshnessRecords(rows, daysAfterAudit(8));
  assert.equal(records.length, 2);
  for (const record of records) {
    assert.equal(record.ageDays, 8);
    assert.equal(record.status, "review-due");
  }
});

test("buildFreshnessRecords: age/status do NOT depend on a row's own effectiveDate", () => {
  const rows = [row({ id: "a", effectiveDate: "2020-01-01" }), row({ id: "b", effectiveDate: "2026-08-30" })];
  const records = buildFreshnessRecords(rows, daysAfterAudit(3));
  assert.deepEqual(records.map((r) => r.status), ["current", "current"]);
  assert.deepEqual(records.map((r) => r.ageDays), [3, 3]);
});

test("buildFreshnessRecords: hasCacheMeter reflects cachedUsd === null", () => {
  const rows = [row({ id: "with-cache", cachedUsd: 0.5 }), row({ id: "no-cache", cachedUsd: null })];
  const records = buildFreshnessRecords(rows, daysAfterAudit(0));
  assert.equal(records.find((r) => r.row.id === "with-cache")?.hasCacheMeter, true);
  assert.equal(records.find((r) => r.row.id === "no-cache")?.hasCacheMeter, false);
});

test("buildFreshnessRecords: hasUpcomingChange is true when a variant's from is still ahead of now", () => {
  const now = daysAfterAudit(0);
  const future = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [row({ id: "scheduled", variants: [expiryVariant("List price", { from: future })] })];
  const [record] = buildFreshnessRecords(rows, now);
  assert.equal(record.hasUpcomingChange, true);
});

test("buildFreshnessRecords: hasUpcomingChange is false once every boundary is behind now", () => {
  const now = daysAfterAudit(0);
  const past = new Date(now.getTime() - DAY_MS).toISOString();
  const rows = [row({ id: "already-active", variants: [expiryVariant("Off-peak", { from: past })] })];
  const [record] = buildFreshnessRecords(rows, now);
  assert.equal(record.hasUpcomingChange, false);
});

test("buildFreshnessRecords: hasUpcomingChange is false with no variants at all", () => {
  const [record] = buildFreshnessRecords([row({ id: "flat" })], daysAfterAudit(0));
  assert.equal(record.hasUpcomingChange, false);
});

test("buildFreshnessRecords: a boundary exactly at now does not count as upcoming (from is inclusive, so it has already taken effect)", () => {
  const now = daysAfterAudit(0);
  const rows = [row({ id: "at-now", variants: [expiryVariant("Starts now", { from: now.toISOString() }) ] })];
  const [record] = buildFreshnessRecords(rows, now);
  assert.equal(record.hasUpcomingChange, false);
});

test("buildFreshnessRecords: never produces NaN ageDays even for a pathological now", () => {
  const [record] = buildFreshnessRecords([row({ id: "a" })], new Date(NaN));
  assert.equal(Number.isFinite(record.ageDays), true);
  assert.equal(record.ageDays, 0);
});

// ---------------------------------------------------------------------------
// confidenceCounts
// ---------------------------------------------------------------------------

function records(rows: CompareRow[]): FreshnessRecord[] {
  return buildFreshnessRecords(rows, daysAfterAudit(0));
}

test("confidenceCounts: tallies input and cached as independent dimensions", () => {
  const set = records([
    row({ id: "1", confidence: "official", cachedConfidence: "official" }),
    row({ id: "2", confidence: "official", cachedConfidence: "derived" }),
    row({ id: "3", confidence: "derived", cachedConfidence: "official" }),
    row({ id: "4", confidence: "estimate", cachedConfidence: "estimate" }),
  ]);
  const counts = confidenceCounts(set);
  assert.deepEqual(counts.input, { official: 2, derived: 1, estimate: 1 });
  assert.deepEqual(counts.cached, { official: 2, derived: 1, estimate: 1 });
  assert.equal(counts.cachedMissing, 0);
});

test("confidenceCounts: a row with no cache meter is excluded from the cached tally and counted in cachedMissing instead", () => {
  const set = records([
    row({ id: "1", confidence: "official", cachedUsd: null, cachedConfidence: "derived" }),
    row({ id: "2", confidence: "official", cachedUsd: 0.2, cachedConfidence: "official" }),
  ]);
  const counts = confidenceCounts(set);
  // Row 1's cachedConfidence field is populated ("derived") but must NOT be
  // counted, since there is no cache dimension to have a confidence about.
  assert.deepEqual(counts.input, { official: 2, derived: 0, estimate: 0 });
  assert.deepEqual(counts.cached, { official: 1, derived: 0, estimate: 0 });
  assert.equal(counts.cachedMissing, 1);
});

test("confidenceCounts: empty input returns all-zero buckets, never undefined", () => {
  const counts = confidenceCounts([]);
  assert.deepEqual(counts.input, { official: 0, derived: 0, estimate: 0 });
  assert.deepEqual(counts.cached, { official: 0, derived: 0, estimate: 0 });
  assert.equal(counts.cachedMissing, 0);
});

// ---------------------------------------------------------------------------
// scheduledChanges — dedup, ordering, classification
// ---------------------------------------------------------------------------

test("scheduledChanges: a plain from/until boundary classifies as expiry", () => {
  const now = daysAfterAudit(0);
  const at = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [row({ id: "promo", variants: [expiryVariant("List price", { from: at })] })];
  const [change] = scheduledChanges(rows, now);
  assert.equal(change.kind, "expiry");
  assert.deepEqual(change.variantLabels, ["List price"]);
});

test("scheduledChanges: an hour-scoped boundary classifies as time-of-day", () => {
  const now = daysAfterAudit(0);
  const at = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [row({ id: "peak", variants: [timeOfDayVariant("Peak", { from: at })] })];
  const [change] = scheduledChanges(rows, now);
  assert.equal(change.kind, "time-of-day");
});

test("scheduledChanges: a day-of-week-scoped boundary (no hour window) also classifies as time-of-day", () => {
  const now = daysAfterAudit(0);
  const at = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [
    row({
      id: "weekday-only",
      variants: [{ label: "Weekday rate", conditions: { from: at, utcDaysOfWeek: [1, 2, 3, 4, 5] }, inputUsd: 1, cachedUsd: null, outputUsd: 1 }],
    }),
  ];
  const [change] = scheduledChanges(rows, now);
  assert.equal(change.kind, "time-of-day");
});

test("scheduledChanges: multiple variants on ONE row sharing the same instant+kind dedupe into a single entry, folding in every label", () => {
  const now = daysAfterAudit(0);
  const at = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [
    row({
      id: "gemini-like",
      variants: [
        expiryVariant("Standard (from later)", { from: at }),
        expiryVariant("Batch", { until: at }),
        expiryVariant("Batch (from later)", { from: at }),
      ],
    }),
  ];
  const changes = scheduledChanges(rows, now);
  assert.equal(changes.length, 1, "all three variants share one row + one instant + one kind, so they must collapse to one timeline entry");
  assert.deepEqual(changes[0].variantLabels, ["Standard (from later)", "Batch", "Batch (from later)"]);
});

test("scheduledChanges: the SAME instant on TWO DIFFERENT rows stays as two separate entries (lane identity is preserved)", () => {
  const now = daysAfterAudit(0);
  const at = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [
    row({ id: "lane-a", variants: [expiryVariant("List price", { from: at })] }),
    row({ id: "lane-b", variants: [expiryVariant("List price", { from: at })] }),
  ];
  const changes = scheduledChanges(rows, now);
  assert.equal(changes.length, 2);
  assert.deepEqual(
    changes.map((c) => c.row.id).sort(),
    ["lane-a", "lane-b"],
  );
});

test("scheduledChanges: orders by effective instant ascending, independent of catalog input order", () => {
  const now = daysAfterAudit(0);
  const soon = new Date(now.getTime() + DAY_MS).toISOString();
  const later = new Date(now.getTime() + 10 * DAY_MS).toISOString();
  const rows = [
    row({ id: "later-lane", variants: [expiryVariant("Later", { from: later })] }),
    row({ id: "soon-lane", variants: [expiryVariant("Soon", { from: soon })] }),
  ];
  const changes = scheduledChanges(rows, now);
  assert.deepEqual(changes.map((c) => c.row.id), ["soon-lane", "later-lane"]);
});

test("scheduledChanges: a boundary already in the past is excluded", () => {
  const now = daysAfterAudit(0);
  const past = new Date(now.getTime() - DAY_MS).toISOString();
  const rows = [row({ id: "already-active", variants: [expiryVariant("Off-peak", { from: past })] })];
  assert.deepEqual(scheduledChanges(rows, now), []);
});

test("scheduledChanges: an unparseable date is dropped, not surfaced as a broken entry", () => {
  const now = daysAfterAudit(0);
  const rows = [row({ id: "typo", variants: [expiryVariant("Oops", { from: "not-a-real-date" })] })];
  assert.deepEqual(scheduledChanges(rows, now), []);
});

test("scheduledChanges: an until boundary (not just from) is picked up", () => {
  const now = daysAfterAudit(0);
  const at = new Date(now.getTime() + DAY_MS).toISOString();
  const rows = [row({ id: "batch", variants: [expiryVariant("Batch", { until: at })] })];
  const [change] = scheduledChanges(rows, now);
  assert.equal(change.at.getTime(), Date.parse(at));
});

test("scheduledChanges: real catalog data produces no throw and every entry's `at` is strictly after now", () => {
  const now = new Date("2026-09-01T00:00:00Z");
  const changes = scheduledChanges(buildCompareRows(), now);
  assert.ok(Array.isArray(changes));
  for (const change of changes) {
    assert.ok(change.at.getTime() > now.getTime());
    assert.ok(change.variantLabels.length > 0);
  }
  // Ordering holds on real data too.
  for (let i = 1; i < changes.length; i += 1) {
    assert.ok(changes[i].at.getTime() >= changes[i - 1].at.getTime());
  }
});

// ---------------------------------------------------------------------------
// filterFreshnessRecords — individual and composed
// ---------------------------------------------------------------------------

function filterWith(overrides: Partial<FreshnessFilter>): FreshnessFilter {
  return { ...DEFAULT_FRESHNESS_FILTER, ...overrides };
}

test("filterFreshnessRecords: the default (all-false) filter returns every record unchanged", () => {
  const set = records([row({ id: "1" }), row({ id: "2" })]);
  assert.deepEqual(filterFreshnessRecords(set, DEFAULT_FRESHNESS_FILTER), set);
});

test("filterFreshnessRecords: stale isolates status === stale", () => {
  const stale = buildFreshnessRecords([row({ id: "stale-lane" })], daysAfterAudit(31));
  const current = buildFreshnessRecords([row({ id: "current-lane" })], daysAfterAudit(31))[0];
  // Force a mixed set by combining records computed at different `now`s (status is uniform per call, so build two batches).
  const mixed = [...stale, { ...current, status: "current" as const, ageDays: 0 }];
  const result = filterFreshnessRecords(mixed, filterWith({ stale: true }));
  assert.deepEqual(result.map((r) => r.row.id), ["stale-lane"]);
});

test("filterFreshnessRecords: missingCache isolates rows with no cache meter", () => {
  const set = records([row({ id: "has-cache", cachedUsd: 0.1 }), row({ id: "no-cache", cachedUsd: null })]);
  const result = filterFreshnessRecords(set, filterWith({ missingCache: true }));
  assert.deepEqual(result.map((r) => r.row.id), ["no-cache"]);
});

test("filterFreshnessRecords: derived matches on EITHER dimension", () => {
  const set = records([
    row({ id: "input-derived", confidence: "derived", cachedConfidence: "official" }),
    row({ id: "cached-derived", confidence: "official", cachedConfidence: "derived" }),
    row({ id: "all-official", confidence: "official", cachedConfidence: "official" }),
  ]);
  const result = filterFreshnessRecords(set, filterWith({ derived: true }));
  assert.deepEqual(
    result.map((r) => r.row.id).sort(),
    ["cached-derived", "input-derived"],
  );
});

test("filterFreshnessRecords: derived on the cached dimension does NOT match a row with no cache meter", () => {
  const set = records([row({ id: "no-cache-but-derived-field", cachedUsd: null, confidence: "official", cachedConfidence: "derived" })]);
  assert.deepEqual(filterFreshnessRecords(set, filterWith({ derived: true })), []);
});

test("filterFreshnessRecords: estimated matches on EITHER dimension", () => {
  const set = records([
    row({ id: "input-estimate", confidence: "estimate", cachedConfidence: "official" }),
    row({ id: "cached-estimate", confidence: "official", cachedConfidence: "estimate" }),
    row({ id: "all-derived", confidence: "derived", cachedConfidence: "derived" }),
  ]);
  const result = filterFreshnessRecords(set, filterWith({ estimated: true }));
  assert.deepEqual(
    result.map((r) => r.row.id).sort(),
    ["cached-estimate", "input-estimate"],
  );
});

test("filterFreshnessRecords: scheduledToChange isolates rows with an upcoming boundary", () => {
  const now = daysAfterAudit(0);
  const future = new Date(now.getTime() + DAY_MS).toISOString();
  const set = buildFreshnessRecords(
    [row({ id: "scheduled", variants: [expiryVariant("List price", { from: future })] }), row({ id: "flat" })],
    now,
  );
  const result = filterFreshnessRecords(set, filterWith({ scheduledToChange: true }));
  assert.deepEqual(result.map((r) => r.row.id), ["scheduled"]);
});

test("filterFreshnessRecords: composed filters AND together", () => {
  const set = records([
    row({ id: "derived-and-missing", confidence: "derived", cachedUsd: null }),
    row({ id: "derived-with-cache", confidence: "derived", cachedUsd: 0.1, cachedConfidence: "official" }),
    row({ id: "official-and-missing", confidence: "official", cachedUsd: null }),
  ]);
  const result = filterFreshnessRecords(set, filterWith({ derived: true, missingCache: true }));
  assert.deepEqual(result.map((r) => r.row.id), ["derived-and-missing"]);
});

// ---------------------------------------------------------------------------
// providerCoverage
// ---------------------------------------------------------------------------

test("providerCoverage: groups by providerSlug, sums lane counts, and sorts by provider display name", () => {
  const set = records([
    row({ id: "1", provider: "Zeta", providerSlug: "gemini" }),
    row({ id: "2", provider: "Zeta", providerSlug: "gemini" }),
    row({ id: "3", provider: "Alpha", providerSlug: "claude" }),
  ]);
  const coverage = providerCoverage(set);
  assert.deepEqual(
    coverage.map((c) => [c.provider, c.laneCount]),
    [
      ["Alpha", 1],
      ["Zeta", 2],
    ],
  );
});

test("providerCoverage: reuses confidenceCounts per provider group (input/cached/cachedMissing all present)", () => {
  const set = records([
    row({ id: "1", providerSlug: "claude", provider: "Claude", confidence: "official", cachedUsd: null }),
    row({ id: "2", providerSlug: "claude", provider: "Claude", confidence: "derived", cachedUsd: 0.1, cachedConfidence: "estimate" }),
  ]);
  const [coverage] = providerCoverage(set);
  assert.deepEqual(coverage.input, { official: 1, derived: 1, estimate: 0 });
  assert.deepEqual(coverage.cached, { official: 0, derived: 0, estimate: 1 });
  assert.equal(coverage.cachedMissing, 1);
});

test("providerCoverage: looks up the official source link from the shared registry for a real provider slug", () => {
  const set = records([row({ id: "1", providerSlug: "claude", provider: "Claude" })]);
  const [coverage] = providerCoverage(set);
  assert.equal(coverage.source.href.startsWith("https://"), true);
  assert.ok(coverage.source.label.length > 0);
});

test("providerCoverage: real catalog data covers every provider with at least one lane", () => {
  const set = records(buildCompareRows());
  const coverage = providerCoverage(set);
  const totalLanes = coverage.reduce((sum, c) => sum + c.laneCount, 0);
  assert.equal(totalLanes, buildCompareRows().length);
  for (const c of coverage) {
    assert.ok(c.laneCount > 0);
    assert.ok(c.source.href.length > 0);
  }
});
