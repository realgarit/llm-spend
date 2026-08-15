"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompareRow } from "@/data/compare-data";
import { formatChf, formatUsd } from "@/data/currency";
import { DEFAULT_WORKLOAD, formatTokens, type Workload } from "@/lib/calc";
import { compareRowUnderScenario, DEFAULT_SCENARIO, scenarioToRateContext, type Scenario } from "@/lib/scenario";
import { useNow } from "@/lib/use-now";
import { Mark } from "@/components/price";
import { ScenarioControls } from "@/components/scenario-controls";
import { WorkloadCalculator } from "@/components/workload-calculator";

type SortKey =
  | "provider"
  | "model"
  | "tier"
  | "inputUsd"
  | "cachedUsd"
  | "outputUsd"
  | "blended"
  | "total";
type SortDir = "asc" | "desc";

const TIER_ORDER: Record<string, number> = { Direct: 0, Global: 1, DataZone: 2, Regional: 3 };

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
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const now = useNow();

  const providersList = useMemo(
    () => Array.from(new Set(rows.map((r) => r.provider))),
    [rows]
  );

  const computed = useMemo(() => {
    const liveNow = now ?? new Date(buildAtMs);
    const ctx = scenarioToRateContext(scenario, liveNow, workload.inputTokens);
    return rows.map((r) => compareRowUnderScenario(r, workload, ctx));
  }, [rows, workload, scenario, now, buildAtMs]);

  const filtered = useMemo(
    () => (providerFilter === "all" ? computed : computed.filter((c) => c.row.provider === providerFilter)),
    [computed, providerFilter]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "provider":
          return dir * a.row.provider.localeCompare(b.row.provider);
        case "model":
          return dir * a.row.model.localeCompare(b.row.model);
        case "tier":
          return dir * ((TIER_ORDER[a.row.tier] ?? 9) - (TIER_ORDER[b.row.tier] ?? 9));
        case "inputUsd":
          return dir * (a.resolved.inputUsd - b.resolved.inputUsd);
        case "cachedUsd":
          return dir * (nz(a.resolved.cachedUsd) - nz(b.resolved.cachedUsd));
        case "outputUsd":
          return dir * (a.resolved.outputUsd - b.resolved.outputUsd);
        case "blended":
          return dir * (a.cost.blendedInputPerMUsd - b.cost.blendedInputPerMUsd);
        case "total":
        default:
          return dir * (a.cost.totalUsd - b.cost.totalUsd);
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const cheapest = useMemo(
    () => (sorted.length ? Math.min(...sorted.map((c) => c.cost.totalUsd)) : 0),
    [sorted]
  );

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
    <div>
      <WorkloadCalculator workload={workload} onChange={setWorkload} />
      <ScenarioControls scenario={scenario} onChange={setScenario} />

      {/* Filter + result summary */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.9rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
          <label htmlFor="provfilter" className="eyebrow" style={{ marginRight: "0.15rem" }}>
            Provider
          </label>
          <select
            id="provfilter"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="all">All providers</option>
            {providersList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-faint)" }} className="mono">
          {sorted.length} models · cost for {formatTokens(workload.inputTokens)} in /{" "}
          {formatTokens(workload.outputTokens)} out @ {Math.round(workload.cacheHitRate * 100)}% cache
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <Th onClick={() => onSort("provider")} className="th-sort">Provider{sortArrow("provider")}</Th>
              <Th onClick={() => onSort("model")} className="th-sort">Model{sortArrow("model")}</Th>
              <Th onClick={() => onSort("tier")} className="th-sort">Tier{sortArrow("tier")}</Th>
              <Th onClick={() => onSort("inputUsd")} className="th-sort num-h">Input{sortArrow("inputUsd")}</Th>
              <Th onClick={() => onSort("cachedUsd")} className="th-sort num-h">Cached{sortArrow("cachedUsd")}</Th>
              <Th onClick={() => onSort("outputUsd")} className="th-sort num-h">Output{sortArrow("outputUsd")}</Th>
              <Th onClick={() => onSort("blended")} className="th-sort num-h">Blended in{sortArrow("blended")}</Th>
              <Th onClick={() => onSort("total")} className="th-sort num-h">Workload cost{sortArrow("total")}</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ row, resolved, cost, scenarioPriced }) => {
              const isCheapest = cost.totalUsd === cheapest;
              const cachedConfidence = resolved.cachedConfidence ?? resolved.confidence;
              return (
                <tr key={row.id}>
                  <td>
                    <Link href={`/providers/${row.providerSlug}`} style={{ color: "var(--text-muted)" }} className="link-provider">
                      {row.provider}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{row.model}</div>
                    {row.host && <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{row.host}</div>}
                    {scenarioPriced && (
                      <div
                        className="mono"
                        style={{ fontSize: "0.68rem", color: "var(--brand)", marginTop: "0.15rem" }}
                        title="Priced under the selected scenario — differs from this row's flat base rate"
                        suppressHydrationWarning
                      >
                        {resolved.label ?? "Scenario"}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-tier">{row.tier}</span>
                  </td>
                  <td className="num">
                    <span suppressHydrationWarning>{formatUsd(resolved.inputUsd)}</span>
                    <Mark confidence={resolved.confidence} />
                  </td>
                  <td className="num" style={{ color: resolved.cachedUsd === null ? "var(--text-faint)" : "var(--text-muted)" }}>
                    <span suppressHydrationWarning>{resolved.cachedUsd === null ? "—" : formatUsd(resolved.cachedUsd)}</span>
                    {resolved.cachedUsd !== null && <Mark confidence={cachedConfidence} />}
                  </td>
                  <td className="num">
                    <span suppressHydrationWarning>{formatUsd(resolved.outputUsd)}</span>
                    <Mark confidence={resolved.confidence} />
                  </td>
                  <td className="num" style={{ color: "var(--text-muted)" }}>
                    <span suppressHydrationWarning>{formatUsd(cost.blendedInputPerMUsd)}</span>
                    {!cost.cacheApplied && (
                      <span title="No cache meter, so hit rate does not apply" style={{ color: "var(--text-faint)" }}>*</span>
                    )}
                  </td>
                  <td className="num">
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

      <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "0.9rem" }}>
        <span className="mono">Blended in</span> is the effective $/1M input paid after the cache split.
        <span className="mono"> *</span> marks models with no cache meter (hit rate ignored). Daggers{" "}
        <span className="mark mark-derived">†</span> /<span className="mark mark-estimate">‡</span> mark derived /
        estimated rates. A <span className="mono" style={{ color: "var(--brand)" }}>brand-colored label</span> under a
        model name names the variant priced under the selected scenario, when it differs from the row&rsquo;s base rate.
      </p>

      <style>{`
        .link-provider:hover { color: var(--brand); }
      `}</style>
    </div>
  );
}

function Th({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th
      onClick={onClick}
      className={className}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </th>
  );
}

function nz(n: number | null): number {
  return n === null ? Number.POSITIVE_INFINITY : n;
}
