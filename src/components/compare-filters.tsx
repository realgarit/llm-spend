"use client";

import React from "react";
import type { CompareFilters, DeploymentFilter } from "@/lib/compare-insights";
import type { SortDir, SortKey } from "@/lib/compare-sort";

const DEPLOYMENT_OPTIONS: { value: DeploymentFilter; label: string }[] = [
  { value: "all", label: "All lanes" },
  { value: "foundry", label: "Foundry" },
  { value: "direct", label: "Direct API" },
];

const SORT_OPTIONS: { value: string; label: string; key: SortKey; dir: SortDir }[] = [
  { value: "total-asc", label: "Lowest workload cost", key: "total", dir: "asc" },
  { value: "total-desc", label: "Highest workload cost", key: "total", dir: "desc" },
  { value: "inputUsd-asc", label: "Lowest input rate", key: "inputUsd", dir: "asc" },
  { value: "inputUsd-desc", label: "Highest input rate", key: "inputUsd", dir: "desc" },
  { value: "outputUsd-asc", label: "Lowest output rate", key: "outputUsd", dir: "asc" },
  { value: "outputUsd-desc", label: "Highest output rate", key: "outputUsd", dir: "desc" },
  { value: "cachedUsd-asc", label: "Lowest cache rate", key: "cachedUsd", dir: "asc" },
  { value: "cachedUsd-desc", label: "Highest cache rate", key: "cachedUsd", dir: "desc" },
  { value: "blended-asc", label: "Lowest blended input", key: "blended", dir: "asc" },
  { value: "blended-desc", label: "Highest blended input", key: "blended", dir: "desc" },
  { value: "provider-asc", label: "Provider A–Z", key: "provider", dir: "asc" },
  { value: "provider-desc", label: "Provider Z–A", key: "provider", dir: "desc" },
  { value: "model-asc", label: "Model A–Z", key: "model", dir: "asc" },
  { value: "model-desc", label: "Model Z–A", key: "model", dir: "desc" },
  { value: "tier-asc", label: "Deployment direct first", key: "tier", dir: "asc" },
  { value: "tier-desc", label: "Deployment regional first", key: "tier", dir: "desc" },
];

export function CompareFilterBar({
  filters,
  onChange,
  providers,
  resultCount,
  totalCount,
  workloadSummary,
  sortKey,
  sortDir,
  onSortChange,
  onClear,
  children,
}: {
  filters: CompareFilters;
  onChange: (filters: CompareFilters) => void;
  providers: string[];
  resultCount: number;
  totalCount: number;
  workloadSummary: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey, dir: SortDir) => void;
  onClear: () => void;
  /** Optional panel footer — the compare page passes {@link CompareActionBar} here. */
  children?: React.ReactNode;
}) {
  const selectedSort = SORT_OPTIONS.find((option) => option.key === sortKey && option.dir === sortDir);

  return (
    <section className="filter-panel" aria-labelledby="filter-heading">
      <div className="filter-heading-row">
        <div>
          <div className="eyebrow">Results</div>
          <h2 id="filter-heading">Focus the catalog</h2>
        </div>
        <button type="button" className="filter-clear" onClick={onClear}>Clear filters</button>
      </div>

      <div className="filter-grid">
        <div className="filter-field filter-search">
          <label htmlFor="model-search">Search provider, model, or host</label>
          <input
            id="model-search"
            type="search"
            value={filters.query}
            placeholder="e.g. Terra, DeepSeek, Fireworks"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="provider-filter">Provider</label>
          <select
            id="provider-filter"
            value={filters.provider}
            onChange={(event) => onChange({ ...filters, provider: event.target.value })}
          >
            <option value="all">All providers</option>
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="result-sort">Sort results</label>
          <select
            id="result-sort"
            value={selectedSort?.value ?? "total-asc"}
            onChange={(event) => {
              const option = SORT_OPTIONS.find((candidate) => candidate.value === event.target.value);
              if (option) onSortChange(option.key, option.dir);
            }}
          >
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      <div className="filter-secondary-row">
        <fieldset className="deployment-filter">
          <legend>Deployment</legend>
          <div className="segmented-control">
            {DEPLOYMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filters.deployment === option.value}
                onClick={() => onChange({ ...filters, deployment: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="filter-check">
          <input
            type="checkbox"
            checked={filters.cacheOnly}
            onChange={(event) => onChange({ ...filters, cacheOnly: event.target.checked })}
          />
          <span>Has cache meter</span>
        </label>
        <label className="filter-check">
          <input
            type="checkbox"
            checked={filters.officialOnly}
            onChange={(event) => onChange({ ...filters, officialOnly: event.target.checked })}
          />
          <span>Official only</span>
        </label>
      </div>

      <div className="filter-summary mono" aria-live="polite">
        <strong>{resultCount} of {totalCount} lanes</strong>
        <span>{workloadSummary}</span>
      </div>

      {children}
    </section>
  );
}

export interface CompareActionBarProps {
  /** Copy the full scenario URL to the clipboard. */
  onCopyLink: () => void;
  /** Download the visible result rows as CSV. */
  onExportCsv: () => void;
  /** Result of the most recent copy/export attempt, announced politely. Null before either is used. */
  status: string | null;
  /**
   * The scenario URL, exposed as selectable text only when the clipboard write
   * failed. Per the design spec's boundary behavior, a clipboard failure
   * "leaves the comparison intact and exposes a selectable URL fallback" —
   * so the visitor can still hand the scenario to someone else by hand.
   */
  fallbackUrl: string | null;
  /** How many rows an export would write — the visible result set, not the whole catalog. */
  exportCount: number;
}

/**
 * Share and export controls for the current comparison.
 *
 * Deliberately lives inside the filter panel rather than as its own section
 * between the panel and the results table: `.decision-cockpit` is a grid whose
 * gap `.decision-results` cancels with a negative margin, so a new top-level
 * sibling there would break that rhythm. This is presentational and fully
 * controlled — every clipboard, blob, and history call stays in
 * `compare-explorer.tsx`, which owns the state being shared.
 */
export function CompareActionBar({
  onCopyLink,
  onExportCsv,
  status,
  fallbackUrl,
  exportCount,
}: CompareActionBarProps) {
  return (
    <div className="share-bar">
      <div className="share-actions">
        <button type="button" className="btn" onClick={onCopyLink}>
          Copy scenario link
        </button>
        <button type="button" className="btn" onClick={onExportCsv}>
          Export CSV
        </button>
        <span className="share-hint mono">
          Shares this exact workload, scenario, filters, sort, and shortlist. CSV writes the {exportCount} visible
          {exportCount === 1 ? " lane" : " lanes"}.
        </span>
      </div>

      {/* Always mounted: some assistive tech only announces *changes* to a live
          region that was already present, not the content of a new one. */}
      <p className="share-status mono" role="status" aria-live="polite">
        {status ?? ""}
      </p>

      {fallbackUrl !== null && (
        <div className="share-fallback">
          <label htmlFor="share-fallback-url">Scenario link</label>
          <input
            id="share-fallback-url"
            className="mono"
            type="text"
            readOnly
            value={fallbackUrl}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}
    </div>
  );
}
