"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompareRow } from "@/data/compare-data";
import { formatChf, formatUsd } from "@/data/currency";
import { DEFAULT_WORKLOAD, formatTokens, type Workload } from "@/lib/calc";
import { compareRows, type SortDir, type SortKey } from "@/lib/compare-sort";
import { formatDuration, formatUtcInstant } from "@/lib/rate-display";
import {
  compareRowUnderScenario,
  DEFAULT_SCENARIO,
  scenarioContexts,
  type Scenario,
  type ScheduledPreview,
} from "@/lib/scenario";
import { useNow } from "@/lib/use-now";
import { Mark, TierBadge } from "@/components/price";
import { CompareFilterBar } from "@/components/compare-filters";
import { CostSignalRail } from "@/components/cost-signal-rail";
import { ScenarioControls } from "@/components/scenario-controls";
import { WorkloadCalculator } from "@/components/workload-calculator";
import { WorkloadPresets } from "@/components/workload-presets";
import {
  buildCostLeaders,
  DEFAULT_COMPARE_FILTERS,
  filterComparedRows,
  limitComparedRows,
  RESULTS_PREVIEW_LIMIT,
} from "@/lib/compare-insights";

/**
 * `buildAtMs` is the server's build-time basis for resolving scenario rates —
 * same role as `pricing-table.tsx`'s prop of the same name (see rate-cell.tsx).
 * Before mount (and during the static-generation server render) this uses
 * `buildAtMs` for "now"; after mount `useNow()` supplies the visitor's real
 * clock, so a variant boundary crossed between build and view corrects itself
 * without a rebuild, and the server/pre-mount HTML never disagrees with the
 * first client render.
 */
export function CompareExplorer({ rows, buildAtMs }: { rows: CompareRow[]; buildAtMs: number }) {
  const [workload, setWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState(DEFAULT_COMPARE_FILTERS);
  const [showAll, setShowAll] = useState(false);
  const now = useNow();

  const providersList = useMemo(
    () => Array.from(new Set(rows.map((r) => r.provider))),
    [rows]
  );

  const liveNow = useMemo(() => now ?? new Date(buildAtMs), [now, buildAtMs]);

  const computed = useMemo(() => {
    const ctxs = scenarioContexts(scenario, liveNow, workload.inputTokens);
    return rows.map((r) => compareRowUnderScenario(r, workload, ctxs));
  }, [rows, workload, scenario, liveNow]);

  const filtered = useMemo(() => filterComparedRows(computed, filters), [computed, filters]);

  const leaders = useMemo(() => buildCostLeaders(filtered), [filtered]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => compareRows(a, b, sortKey, sortDir));
    return arr;
  }, [filtered, sortKey, sortDir]);

  const visibleSorted = useMemo(() => limitComparedRows(sorted, showAll), [sorted, showAll]);

  const cheapest = leaders.overall?.compared.cost.totalUsd ?? 0;

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Numeric columns default to ascending (cheapest first); text to asc too.
      setSortDir("asc");
    }
  }

  function sortArrow(key: SortKey) {
    if (key !== sortKey) return <span style={{ color: "var(--text-faint)" }}> ↕</span>;
    return <span style={{ color: "var(--brand)" }}>{sortDir === "asc" ? " ↑" : " ↓"}</span>;
  }

  return (
    <div className="decision-cockpit">
      <WorkloadPresets workload={workload} onChange={setWorkload} />
      <CostSignalRail leaders={leaders} />

      <section className="fine-tune-section" aria-labelledby="fine-tune-heading">
        <div className="fine-tune-heading">
          <div className="eyebrow">Fine-tune</div>
          <h2 id="fine-tune-heading">Workload and pricing scenario</h2>
          <p>Adjust the token shape, cache behavior, time window, and service tier. Every signal updates immediately.</p>
        </div>
        <WorkloadCalculator workload={workload} onChange={setWorkload} />
        <ScenarioControls scenario={scenario} onChange={setScenario} />
      </section>

      <CompareFilterBar
        filters={filters}
        onChange={setFilters}
        providers={providersList}
        resultCount={filtered.length}
        totalCount={computed.length}
        workloadSummary={`${formatTokens(workload.inputTokens)} in / ${formatTokens(workload.outputTokens)} out @ ${Math.round(workload.cacheHitRate * 100)}% cache`}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => {
          setSortKey(key);
          setSortDir(dir);
        }}
        onClear={() => setFilters(DEFAULT_COMPARE_FILTERS)}
      />

      {sorted.length > 0 ? (
      <>
      <div className="table-wrap decision-results">
        <table className="data decision-table">
          <thead>
            <tr>
              <Th onClick={() => onSort("provider")} className="th-sort" sort={sortKey === "provider" ? sortDir : undefined}>Provider{sortArrow("provider")}</Th>
              <Th onClick={() => onSort("model")} className="th-sort" sort={sortKey === "model" ? sortDir : undefined}>Model{sortArrow("model")}</Th>
              <Th onClick={() => onSort("tier")} className="th-sort" sort={sortKey === "tier" ? sortDir : undefined}>Tier{sortArrow("tier")}</Th>
              <Th onClick={() => onSort("inputUsd")} className="th-sort num-h" sort={sortKey === "inputUsd" ? sortDir : undefined}>Input{sortArrow("inputUsd")}</Th>
              <Th onClick={() => onSort("cachedUsd")} className="th-sort num-h" sort={sortKey === "cachedUsd" ? sortDir : undefined}>Cached{sortArrow("cachedUsd")}</Th>
              <Th onClick={() => onSort("outputUsd")} className="th-sort num-h" sort={sortKey === "outputUsd" ? sortDir : undefined}>Output{sortArrow("outputUsd")}</Th>
              <Th onClick={() => onSort("blended")} className="th-sort num-h" sort={sortKey === "blended" ? sortDir : undefined}>Blended in{sortArrow("blended")}</Th>
              <Th onClick={() => onSort("total")} className="th-sort num-h" sort={sortKey === "total" ? sortDir : undefined}>Workload cost{sortArrow("total")}</Th>
            </tr>
          </thead>
          <tbody>
            {visibleSorted.map(({ row, resolved, cost, scenarioPriced, preview }) => {
              const isCheapest = cost.totalUsd === cheapest;
              const cachedConfidence = resolved.cachedConfidence ?? resolved.confidence;
              return (
                <tr key={row.id}>
                  <td data-label="Provider">
                    <Link href={`/providers/${row.providerSlug}`} style={{ color: "var(--text-muted)" }} className="link-provider">
                      {row.provider}
                    </Link>
                  </td>
                  <td data-label="Model">
                    <Link href={`/models/${row.id}`} style={{ fontWeight: 500 }}>{row.model}</Link>
                    {row.host && <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{row.host}</div>}
                    {scenarioPriced &&
                      (preview ? (
                        <ScheduledPreviewLabel preview={preview} liveNow={liveNow} />
                      ) : (
                        <div
                          className="mono"
                          style={{ fontSize: "0.68rem", color: "var(--brand)", marginTop: "0.15rem" }}
                          title="Priced under the selected scenario — differs from this row's flat base rate"
                          suppressHydrationWarning
                        >
                          {resolved.label ?? "Scenario"}
                        </div>
                      ))}
                  </td>
                  <td data-label="Deployment">
                    <TierBadge tier={row.tier} />
                  </td>
                  <td className="num" data-label="Input / 1M">
                    <span suppressHydrationWarning>{formatUsd(resolved.inputUsd)}</span>
                    <Mark confidence={resolved.confidence} />
                  </td>
                  <td className="num" data-label="Cached / 1M" style={{ color: resolved.cachedUsd === null ? "var(--text-faint)" : "var(--text-muted)" }}>
                    <span suppressHydrationWarning>{resolved.cachedUsd === null ? "—" : formatUsd(resolved.cachedUsd)}</span>
                    {resolved.cachedUsd !== null && <Mark confidence={cachedConfidence} />}
                  </td>
                  <td className="num" data-label="Output / 1M">
                    <span suppressHydrationWarning>{formatUsd(resolved.outputUsd)}</span>
                    <Mark confidence={resolved.confidence} />
                  </td>
                  <td className="num" data-label="Blended input" style={{ color: "var(--text-muted)" }}>
                    <span suppressHydrationWarning>{formatUsd(cost.blendedInputPerMUsd)}</span>
                    {!cost.cacheApplied && (
                      <span title="No cache meter, so hit rate does not apply" style={{ color: "var(--text-faint)" }}>*</span>
                    )}
                  </td>
                  <td className="num decision-total" data-label="Workload cost">
                    <span
                      suppressHydrationWarning
                      style={{
                        fontWeight: 600,
                        color: isCheapest ? "var(--official)" : "var(--text)",
                      }}
                    >
                      {formatUsd(cost.totalUsd)}
                    </span>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }} suppressHydrationWarning>
                      {formatChf(cost.totalUsd)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > RESULTS_PREVIEW_LIMIT && (
        <div className="result-disclosure">
          <span className="mono">
            Showing {visibleSorted.length} of {sorted.length} lanes under the current sort
          </span>
          <button type="button" className="btn" onClick={() => setShowAll((value) => !value)}>
            {showAll ? "Show top 12" : `Show all ${sorted.length}`}
          </button>
        </div>
      )}
      </>
      ) : (
        <section className="result-empty" aria-labelledby="no-results-heading">
          <div className="result-empty-mark mono" aria-hidden>0</div>
          <div>
            <div className="eyebrow">No matching lanes</div>
            <h2 id="no-results-heading">Broaden the cost search</h2>
            <p>No catalog lane matches every active filter. Your workload and pricing scenario are still intact.</p>
            <button type="button" className="btn btn-primary" onClick={() => setFilters(DEFAULT_COMPARE_FILTERS)}>
              Clear filters
            </button>
          </div>
        </section>
      )}

      <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "0.9rem" }}>
        Tier badges reading <span className="mono">Foundry · …</span> are Microsoft Foundry deployment tiers
        (Global routes to any datacenter, Data Zone pins to US or EU at roughly a 10% premium, Regional pins to one
        region); <span className="mono">Direct API</span> is the model developer&rsquo;s own first-party API.{" "}
        <span className="mono">Blended in</span> is the effective $/1M input paid after the cache split.
        <span className="mono"> *</span> marks models with no cache meter (hit rate ignored). Daggers{" "}
        <span className="mark mark-derived">†</span> /<span className="mark mark-estimate">‡</span> mark derived /
        estimated rates. A <span className="mono" style={{ color: "var(--brand)" }}>brand-colored label</span> under a
        model name names the variant priced under the selected scenario, when it differs from the row&rsquo;s base rate.
        A <span className="mono scenario-preview">· preview</span> label means the opposite: that rate is scheduled but
        is <strong>not billing yet</strong>, and is only shown because a specific hour was picked above — the row still
        charges its base rate until the stated start instant. The default <span className="mono">Now</span> scenario
        never shows a preview.
      </p>

      <style>{`
        .link-provider:hover { color: var(--brand); }
      `}</style>
    </div>
  );
}

/**
 * Annotation for a row priced at a rate that has not started billing yet.
 *
 * Deliberately unlike the brand-colored label used for a genuinely active
 * variant: a different color, the word "preview" spelled out, and the start
 * instant on its own line, so a scheduled rate can never be mistaken for what
 * the row bills today. `preview` is non-null only when the resolver actually
 * had to look past a start date to produce these numbers — see
 * `scheduledPreview` in lib/scenario.ts.
 */
function ScheduledPreviewLabel({ preview, liveNow }: { preview: ScheduledPreview; liveNow: Date }) {
  const { variant, startsAt } = preview;
  const starts = startsAt === null ? null : formatUtcInstant(startsAt, liveNow);
  const title =
    startsAt === null
      ? `Preview only — "${variant.label}" is not in effect right now. This row still bills at its base rate.`
      : `Preview only — not billable yet. "${variant.label}" takes effect ${starts}` +
        ` (in ${formatDuration(startsAt.getTime() - liveNow.getTime())}).` +
        " Until then this row still bills at its base rate.";

  return (
    <div style={{ marginTop: "0.15rem" }} title={title} suppressHydrationWarning>
      <div className="mono scenario-preview">{variant.label} · preview</div>
      <div className="mono" style={{ fontSize: "0.64rem", color: "var(--text-faint)" }}>
        {starts ? `starts ${starts}` : "not in effect yet"}
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  className,
  sort,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  sort?: SortDir;
}) {
  return (
    <th
      className={className}
      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
    >
      {onClick ? (
        <button
          type="button"
          className="th-sort-button"
          onClick={onClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onClick();
            }
          }}
        >
          {children}
        </button>
      ) : children}
    </th>
  );
}
