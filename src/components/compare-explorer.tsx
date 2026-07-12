"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompareRow } from "@/data/compare-data";
import { formatChf, formatUsd } from "@/data/currency";
import { computeCost, DEFAULT_WORKLOAD, formatTokens, type Workload } from "@/lib/calc";
import { Mark } from "@/components/price";

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

export function CompareExplorer({ rows }: { rows: CompareRow[] }) {
  const [workload, setWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  const providersList = useMemo(
    () => Array.from(new Set(rows.map((r) => r.provider))),
    [rows]
  );

  const computed = useMemo(() => {
    return rows.map((r) => {
      const cost = computeCost(
        {
          model: r.model,
          tier: r.tier,
          inputUsd: r.inputUsd,
          cachedUsd: r.cachedUsd,
          outputUsd: r.outputUsd,
          confidence: r.confidence,
          effectiveDate: "",
        },
        workload
      );
      return { row: r, cost };
    });
  }, [rows, workload]);

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
          return dir * (a.row.inputUsd - b.row.inputUsd);
        case "cachedUsd":
          return dir * (nz(a.row.cachedUsd) - nz(b.row.cachedUsd));
        case "outputUsd":
          return dir * (a.row.outputUsd - b.row.outputUsd);
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
      <Calculator workload={workload} onChange={setWorkload} />

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
            {sorted.map(({ row, cost }) => {
              const isCheapest = cost.totalUsd === cheapest;
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
                  </td>
                  <td>
                    <span className="badge badge-tier">{row.tier}</span>
                  </td>
                  <td className="num">
                    {formatUsd(row.inputUsd)}
                    <Mark confidence={row.confidence} />
                  </td>
                  <td className="num" style={{ color: row.cachedUsd === null ? "var(--text-faint)" : "var(--text-muted)" }}>
                    {row.cachedUsd === null ? "—" : formatUsd(row.cachedUsd)}
                    {row.cachedUsd !== null && <Mark confidence={row.cachedConfidence} />}
                  </td>
                  <td className="num">
                    {formatUsd(row.outputUsd)}
                    <Mark confidence={row.confidence} />
                  </td>
                  <td className="num" style={{ color: "var(--text-muted)" }}>
                    {formatUsd(cost.blendedInputPerMUsd)}
                    {!cost.cacheApplied && (
                      <span title="No cache meter, so hit rate does not apply" style={{ color: "var(--text-faint)" }}>*</span>
                    )}
                  </td>
                  <td className="num">
                    <span
                      style={{
                        fontWeight: 600,
                        color: isCheapest ? "var(--official)" : "var(--text)",
                      }}
                    >
                      {formatUsd(cost.totalUsd)}
                    </span>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{formatChf(cost.totalUsd)}</div>
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
        estimated rates.
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

function Calculator({
  workload,
  onChange,
}: {
  workload: Workload;
  onChange: (w: Workload) => void;
}) {
  return (
    <div className="card-2" style={{ padding: "1.4rem 1.5rem", marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.1rem" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Interactive</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Workload cost calculator</h2>
        </div>
        <button
          type="button"
          className="btn"
          style={{ fontSize: "0.8rem" }}
          onClick={() => onChange(DEFAULT_WORKLOAD)}
        >
          Reset to example
        </button>
      </div>

      <div style={{ display: "grid", gap: "1.4rem", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        <NumberField
          label="Input tokens (M)"
          value={workload.inputTokens}
          onChange={(v) => onChange({ ...workload, inputTokens: v })}
          hint={formatTokens(workload.inputTokens)}
        />
        <NumberField
          label="Output tokens (M)"
          value={workload.outputTokens}
          onChange={(v) => onChange({ ...workload, outputTokens: v })}
          hint={formatTokens(workload.outputTokens)}
        />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label htmlFor="cacherate" className="eyebrow">Cache hit rate</label>
            <span className="mono" style={{ color: "var(--brand)", fontSize: "0.85rem" }}>
              {Math.round(workload.cacheHitRate * 100)}%
            </span>
          </div>
          <input
            id="cacherate"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(workload.cacheHitRate * 100)}
            onChange={(e) => onChange({ ...workload, cacheHitRate: Number(e.target.value) / 100 })}
          />
          <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem" }}>
            Share of input tokens served from cache. Applied only to models with a cache meter.
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  const displayValue = Number((value / 1_000_000).toFixed(4));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <label className="eyebrow">{label}</label>
        <span className="mono" style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>{hint}</span>
      </div>
      <input
        type="number"
        min={0}
        step={0.01}
        value={displayValue}
        onChange={(e) => {
          const millions = Number(e.target.value);
          const tokens = Number.isNaN(millions) ? 0 : millions * 1_000_000;
          onChange(Math.max(0, Math.round(tokens)));
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function nz(n: number | null): number {
  return n === null ? Number.POSITIVE_INFINITY : n;
}
