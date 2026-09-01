"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompareRow } from "@/data/compare-data";
import { CATALOG_VERIFIED_AT, FRESHNESS_THRESHOLDS_DAYS } from "@/data/catalog-meta";
import type { Confidence } from "@/data/types";
import {
  DEFAULT_FRESHNESS_FILTER,
  FRESHNESS_STATUS_LABEL,
  SCHEDULED_CHANGE_KIND_LABEL,
  buildFreshnessRecords,
  confidenceCounts,
  filterFreshnessRecords,
  providerCoverage,
  scheduledChanges,
  type ConfidenceDimensionCounts,
  type FreshnessFilter,
  type FreshnessRecord,
  type ProviderCoverage,
  type ScheduledChange,
} from "@/lib/freshness";
import { formatUtcInstant } from "@/lib/rate-display";
import { useNow } from "@/lib/use-now";
import { ConfidenceBadge, TierBadge } from "@/components/price";
import { SectionHeading, Stat } from "@/components/ui";

/**
 * The interactive dashboard behind `/freshness`.
 *
 * Same server/client hydration split as `compare-explorer.tsx`,
 * `cost-anatomy-explorer.tsx` and `budget-planner.tsx`: the server page
 * (`app/freshness/page.tsx`) captures `Date.now()` once as `buildAtMs` and
 * passes it down with `rows` (the full catalog). Before mount this falls
 * back to `buildAtMs` so the first client render is byte-identical to the
 * server HTML; `useNow()` takes over post-mount — see `lib/use-now.ts`.
 *
 * Every number here comes from `lib/freshness.ts`'s pure functions
 * (`buildFreshnessRecords`, `confidenceCounts`, `scheduledChanges`,
 * `filterFreshnessRecords`, `providerCoverage`) — this file only lays out
 * already-derived data. It never computes a rate, a workload cost, or a
 * confidence value itself, and it never mutates `row.confidence` /
 * `row.cachedConfidence` — see freshness.ts's file header for why.
 */
export function FreshnessDashboard({ rows, buildAtMs }: { rows: CompareRow[]; buildAtMs: number }) {
  const now = useNow();
  const liveNow = useMemo(() => now ?? new Date(buildAtMs), [now, buildAtMs]);

  const records = useMemo(() => buildFreshnessRecords(rows, liveNow), [rows, liveNow]);
  const counts = useMemo(() => confidenceCounts(records), [records]);
  const coverage = useMemo(() => providerCoverage(records), [records]);
  const upcoming = useMemo(() => scheduledChanges(rows, liveNow), [rows, liveNow]);
  const missingCacheCount = useMemo(
    () => filterFreshnessRecords(records, { ...DEFAULT_FRESHNESS_FILTER, missingCache: true }).length,
    [records],
  );
  const scheduledCount = useMemo(
    () => filterFreshnessRecords(records, { ...DEFAULT_FRESHNESS_FILTER, scheduledToChange: true }).length,
    [records],
  );

  const [filter, setFilter] = useState<FreshnessFilter>(DEFAULT_FRESHNESS_FILTER);
  const filtered = useMemo(() => filterFreshnessRecords(records, filter), [records, filter]);

  // ageDays/status are identical across every record in one buildFreshnessRecords
  // call (see freshness.ts) — reading them off the first record is exact, not
  // an approximation. `records` is only empty if the catalog itself is empty,
  // which cannot happen from a real build; the fallback keeps this component
  // from crashing rather than assuming that can never occur.
  const audit = records[0] ?? { ageDays: 0, status: "current" as const };
  const auditedText = formatUtcInstant(new Date(CATALOG_VERIFIED_AT), liveNow);

  return (
    <div className="freshness-dashboard">
      <TrustPulseSection
        totalLanes={records.length}
        ageDays={audit.ageDays}
        status={audit.status}
        auditedText={auditedText}
        counts={counts}
        scheduledCount={scheduledCount}
        missingCacheCount={missingCacheCount}
      />

      <ThresholdsNote />

      <FiltersSection
        filter={filter}
        onChange={setFilter}
        onClear={() => setFilter(DEFAULT_FRESHNESS_FILTER)}
        resultCount={filtered.length}
        totalCount={records.length}
        auditedText={auditedText}
      />

      <RecordsSection records={filtered} totalCount={records.length} filter={filter} auditedText={auditedText} />

      <TimelineSection changes={upcoming} liveNow={liveNow} auditedText={auditedText} />

      <CoverageSection coverage={coverage} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trust pulse
// ---------------------------------------------------------------------------

function TrustPulseSection({
  totalLanes,
  ageDays,
  status,
  auditedText,
  counts,
  scheduledCount,
  missingCacheCount,
}: {
  totalLanes: number;
  ageDays: number;
  status: FreshnessRecord["status"];
  auditedText: string;
  counts: ReturnType<typeof confidenceCounts>;
  scheduledCount: number;
  missingCacheCount: number;
}) {
  return (
    <section className="freshness-section" aria-label="Trust pulse">
      <SectionHeading eyebrow="Trust pulse" title="Catalog freshness at a glance">
        {totalLanes} tracked lanes, audited together as of {auditedText}. Every figure below is read directly from
        catalog metadata — freshness never changes a lane&rsquo;s published confidence.
      </SectionHeading>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <Stat value={ageDays === 0 ? "Today" : `${ageDays}d ago`} label="Last full catalog audit" accent={status !== "current"} />
        <Stat value={FRESHNESS_STATUS_LABEL[status]} label={`Freshness status · ${auditedText}`} />
        <Stat value={String(scheduledCount)} label="Lanes with a scheduled rate change ahead" />
        <Stat value={`${missingCacheCount} / ${totalLanes}`} label="Lanes with no cache meter" />
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginTop: "1rem",
        }}
      >
        <ConfidenceCountsCard label="Input / output confidence" dimensionCounts={counts.input} total={totalLanes} />
        <ConfidenceCountsCard
          label="Cached-input confidence"
          dimensionCounts={counts.cached}
          total={totalLanes - counts.cachedMissing}
          footnote={`${counts.cachedMissing} lane${counts.cachedMissing === 1 ? "" : "s"} excluded — no cache meter`}
        />
      </div>
    </section>
  );
}

function ConfidenceCountsCard({
  label,
  dimensionCounts,
  total,
  footnote,
}: {
  label: string;
  dimensionCounts: ConfidenceDimensionCounts;
  total: number;
  footnote?: string;
}) {
  const order: Confidence[] = ["official", "derived", "estimate"];
  return (
    <div className="card" style={{ padding: "1rem 1.1rem", minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", alignItems: "center" }}>
        {order.map((confidence) => (
          <span key={confidence} style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
            <ConfidenceBadge confidence={confidence} />
            <span className="mono tnum">{dimensionCounts[confidence]}</span>
          </span>
        ))}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
        {total} lane{total === 1 ? "" : "s"} counted{footnote ? ` · ${footnote}` : ""}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Documented thresholds
// ---------------------------------------------------------------------------

function ThresholdsNote() {
  const { currentMax, reviewDueMax } = FRESHNESS_THRESHOLDS_DAYS;
  return (
    <section className="freshness-section callout callout-info" aria-label="Freshness thresholds">
      <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Fixed thresholds</div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        <strong style={{ color: "var(--text)" }}>Current</strong>: audited 0–{currentMax} days ago.{" "}
        <strong style={{ color: "var(--text)" }}>Review due</strong>: {currentMax + 1}–{reviewDueMax} days ago.{" "}
        <strong style={{ color: "var(--text)" }}>Stale</strong>: more than {reviewDueMax} days ago. These bands apply
        to the whole catalog at once (one audit sweep covers every lane) and never change a lane&rsquo;s published
        confidence — a stale audit means the evidence needs a closer look, not that the model or its price is worse.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

const FILTER_TOGGLES: { key: keyof FreshnessFilter; label: string }[] = [
  { key: "stale", label: "Stale audit" },
  { key: "derived", label: "Derived (either dimension)" },
  { key: "estimated", label: "Estimated (either dimension)" },
  { key: "scheduledToChange", label: "Scheduled to change" },
  { key: "missingCache", label: "No cache meter" },
];

function FiltersSection({
  filter,
  onChange,
  onClear,
  resultCount,
  totalCount,
  auditedText,
}: {
  filter: FreshnessFilter;
  onChange: (filter: FreshnessFilter) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
  auditedText: string;
}) {
  return (
    <section className="filter-panel" aria-labelledby="freshness-filter-heading">
      <div className="filter-heading-row">
        <div>
          <div className="eyebrow">Filters</div>
          <h2 id="freshness-filter-heading">Focus the trust audit</h2>
        </div>
        <button type="button" className="filter-clear" onClick={onClear}>Clear filters</button>
      </div>

      <div className="filter-secondary-row">
        {FILTER_TOGGLES.map(({ key, label }) => (
          <label className="filter-check" key={key}>
            <input
              type="checkbox"
              checked={filter[key]}
              onChange={(event) => onChange({ ...filter, [key]: event.target.checked })}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="filter-summary mono" aria-live="polite" suppressHydrationWarning>
        <strong>{resultCount} of {totalCount} lanes</strong>
        <span>audited {auditedText}</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Records table
// ---------------------------------------------------------------------------

function activeFilterLabels(filter: FreshnessFilter): string[] {
  return FILTER_TOGGLES.filter(({ key }) => filter[key]).map(({ label }) => label.toLocaleLowerCase());
}

function RecordsSection({
  records,
  totalCount,
  filter,
  auditedText,
}: {
  records: FreshnessRecord[];
  totalCount: number;
  filter: FreshnessFilter;
  auditedText: string;
}) {
  return (
    <section className="freshness-section" id="freshness-records" aria-label="Lane freshness records">
      <SectionHeading eyebrow="Lane records" title="Every tracked lane, provenance first">
        {totalCount} lanes total. Confidence and cache-meter columns are read straight from the catalog; the
        &ldquo;Upcoming&rdquo; column names lanes with at least one future rate boundary — see the timeline below for
        the details.
      </SectionHeading>

      {records.length === 0 ? (
        <div className="callout callout-info" role="status">
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>No matching lanes</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }} suppressHydrationWarning>
            No {activeFilterLabels(filter).join(" + ") || "catalog"} lanes as of the audit on {auditedText}. The
            catalog itself is unchanged — try clearing a filter above.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data freshness-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Model</th>
                <th>Deployment</th>
                <th>Input confidence</th>
                <th>Cached confidence</th>
                <th>Effective</th>
                <th>Upcoming</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <FreshnessRow key={record.row.id} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FreshnessRow({ record }: { record: FreshnessRecord }) {
  const { row } = record;
  return (
    <tr>
      <td data-label="Provider" style={{ color: "var(--text-muted)" }}>{row.provider}</td>
      <td data-label="Model">
        <Link href={`/models/${row.id}`} style={{ fontWeight: 500 }}>{row.model}</Link>
        {row.host && <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{row.host}</div>}
      </td>
      <td data-label="Deployment"><TierBadge tier={row.tier} /></td>
      <td data-label="Input confidence"><ConfidenceBadge confidence={row.confidence} /></td>
      <td data-label="Cached confidence">
        {record.hasCacheMeter ? (
          <ConfidenceBadge confidence={row.cachedConfidence} />
        ) : (
          <span className="mono" style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>no cache meter</span>
        )}
      </td>
      <td data-label="Effective" className="mono" style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
        {row.effectiveDate}
      </td>
      <td data-label="Upcoming">
        {record.hasUpcomingChange ? (
          <a href="#freshness-timeline" className="link-underline mono" style={{ fontSize: "0.8rem" }}>scheduled ↓</a>
        ) : (
          <span className="mono" style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>—</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Upcoming changes timeline
// ---------------------------------------------------------------------------

/** "A, B" for two labels; "A, B + 1 more" beyond that — keeps a dense Gemini-style multi-variant boundary readable. */
function formatVariantLabels(labels: string[]): string {
  if (labels.length <= 2) return labels.join(", ");
  return `${labels.slice(0, 2).join(", ")} + ${labels.length - 2} more`;
}

function TimelineSection({
  changes,
  liveNow,
  auditedText,
}: {
  changes: ScheduledChange[];
  liveNow: Date;
  auditedText: string;
}) {
  return (
    <section className="freshness-section" id="freshness-timeline" aria-label="Upcoming scheduled changes">
      <SectionHeading eyebrow="Upcoming" title="Scheduled rate changes">
        Every future boundary declared on a catalog lane&rsquo;s published rate schedule, in order. A promotion or
        rate-change expiry fires once, on a calendar date; time-of-day pricing recurs on a schedule (e.g. a weekday
        peak/off-peak split).
      </SectionHeading>

      {changes.length === 0 ? (
        <div className="callout callout-info" role="status">
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Nothing scheduled</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }} suppressHydrationWarning>
            No scheduled rate changes ahead of the audit on {auditedText}.
          </p>
        </div>
      ) : (
        <ol className="freshness-timeline-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.6rem" }}>
          {changes.map((change) => (
            <li key={change.id} className="card" style={{ padding: "0.85rem 1rem", minWidth: 0 }} suppressHydrationWarning>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", alignItems: "baseline", justifyContent: "space-between" }}>
                <div>
                  <Link href={`/models/${change.row.id}`} className="link-underline" style={{ fontWeight: 500 }}>
                    {change.row.model}
                  </Link>
                  <span style={{ color: "var(--text-faint)", fontSize: "0.78rem", marginLeft: "0.5rem" }}>
                    {change.row.provider}
                    {change.row.host ? ` · ${change.row.host}` : ""}
                  </span>
                </div>
                <span className="mono" style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {formatUtcInstant(change.at, liveNow)}
                </span>
              </div>
              <div style={{ marginTop: "0.4rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", alignItems: "center" }}>
                <span className="badge badge-tier">{SCHEDULED_CHANGE_KIND_LABEL[change.kind]}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }} title={change.variantLabels.join(", ")}>
                  {formatVariantLabels(change.variantLabels)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Provider / source coverage
// ---------------------------------------------------------------------------

function CoverageSection({ coverage }: { coverage: ProviderCoverage[] }) {
  return (
    <section className="freshness-section" aria-label="Provider and source coverage">
      <SectionHeading eyebrow="Coverage" title="Provider and source coverage">
        The official source registry every lane above traces back to, with each provider&rsquo;s confidence
        breakdown across its tracked lanes.
      </SectionHeading>

      <div className="table-wrap">
        <table className="data freshness-coverage-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th className="num-h">Lanes</th>
              <th>Input confidence</th>
              <th>Cached confidence</th>
              <th>Official source</th>
            </tr>
          </thead>
          <tbody>
            {coverage.map((entry) => (
              <tr key={entry.providerSlug}>
                <td data-label="Provider" style={{ fontWeight: 500 }}>{entry.provider}</td>
                <td data-label="Lanes" className="num mono tnum">{entry.laneCount}</td>
                <td data-label="Input confidence"><InlineDimensionCounts counts={entry.input} /></td>
                <td data-label="Cached confidence">
                  <InlineDimensionCounts counts={entry.cached} />
                  {entry.cachedMissing > 0 && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.2rem" }}>
                      {entry.cachedMissing} without a cache meter
                    </div>
                  )}
                </td>
                <td data-label="Official source">
                  <a href={entry.source.href} target="_blank" rel="noreferrer" className="link-underline" style={{ fontSize: "0.85rem" }}>
                    {entry.source.label}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InlineDimensionCounts({ counts }: { counts: ConfidenceDimensionCounts }) {
  const order: Confidence[] = ["official", "derived", "estimate"];
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.4rem", fontSize: "0.8rem" }}>
      {order
        .filter((confidence) => counts[confidence] > 0)
        .map((confidence) => (
          <span key={confidence} className="mono">
            {counts[confidence]} <ConfidenceBadge confidence={confidence} />
          </span>
        ))}
      {order.every((confidence) => counts[confidence] === 0) && (
        <span className="mono" style={{ color: "var(--text-faint)" }}>—</span>
      )}
    </span>
  );
}
