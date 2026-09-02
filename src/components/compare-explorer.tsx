"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompareRow } from "@/data/compare-data";
import { formatChf, formatUsd, usdToChf } from "@/data/currency";
import { formatTokens, type Workload } from "@/lib/calc";
import { compareRows, type SortDir, type SortKey } from "@/lib/compare-sort";
import { buildCompareCsv } from "@/lib/compare-export";
import {
  decodeCompareState,
  encodeCompareState,
  type CompareDecisionState,
} from "@/lib/compare-state";
import { formatDuration, formatUtcInstant } from "@/lib/rate-display";
import {
  compareRowUnderScenario,
  scenarioContexts,
  type ComparedRow,
  type Scenario,
  type ScheduledPreview,
} from "@/lib/scenario";
import { useNow } from "@/lib/use-now";
import { useShortlist } from "@/hooks/use-shortlist";
import { Mark, TierBadge } from "@/components/price";
import { CompareActionBar, CompareFilterBar } from "@/components/compare-filters";
import { CostSignalRail } from "@/components/cost-signal-rail";
import { ScenarioControls } from "@/components/scenario-controls";
import { ShortlistTray } from "@/components/shortlist-tray";
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
 * The decision state a visitor arriving at a bare `/compare` starts from.
 *
 * Derived from the URL codec itself rather than re-listing the same defaults
 * here, so the two can never drift: decoding an empty query with no known
 * lanes is by definition "no state was shared". `encodeCompareState` of this
 * value is `""`, which is what keeps `/compare` canonical for a first-time
 * visitor (asserted in decision-workspace.test.ts).
 */
export const DEFAULT_DECISION_STATE: CompareDecisionState = decodeCompareState("", new Set<string>());

/**
 * `buildAtMs` is the server's build-time basis for resolving scenario rates —
 * same role as `pricing-table.tsx`'s prop of the same name (see rate-cell.tsx).
 * Before mount (and during the static-generation server render) this uses
 * `buildAtMs` for "now"; after mount `useNow()` supplies the visitor's real
 * clock, so a variant boundary crossed between build and view corrects itself
 * without a rebuild, and the server/pre-mount HTML never disagrees with the
 * first client render.
 *
 * ## Why this component is a thin shell around `CompareWorkspace`
 *
 * `/compare` is `force-static`: its HTML is generated at build time, long
 * before any visitor's query string exists. So the first client render MUST
 * reproduce `DEFAULT_DECISION_STATE` exactly, or hydration diverges. Reading
 * `window.location.search` during render is therefore not an option.
 *
 * Instead this shell renders the workspace with default state, then — once,
 * after mount — decodes the real URL and remounts the workspace with it via a
 * changed `key`. The remount is the load-bearing part, and it happens EXACTLY
 * ONCE, on this pre-hydration -> hydrated transition: `useShortlist` resolves
 * URL-vs-storage precedence at ITS first render (see the hook's doc comment),
 * so handing it URL lanes requires a genuinely fresh mount, not a prop change.
 *
 * A later `popstate` (browser back/forward) does NOT remount `CompareWorkspace`
 * again. It used to — an earlier version of this shell bumped the same key on
 * every `popstate` — but remounting to reseed the shortlist also reset every
 * other piece of that component's local state along with it, including view
 * toggles with no URL representation at all (`showAll`, `trayExpanded`): a
 * Back press would silently re-collapse an expanded result list or shortlist
 * tray even though every genuinely shared value was restored correctly.
 * `popstate` is now handled entirely inside the already-mounted
 * `CompareWorkspace`, which decodes the new URL and pushes it into its own
 * state setters directly — including `useShortlist`'s `setLaneIds` seam,
 * which exists specifically so the shortlist can be reseeded without a
 * remount. See `CompareWorkspace`'s own `popstate` effect for the rest.
 *
 * This mirrors the "render a value derivable from props first, adopt the real
 * browser-only value in a post-mount effect" discipline already used by
 * `useNow` and `ThemeToggle`; the `key` is only how that discipline is applied
 * to state a child hook captures at mount.
 */
export function CompareExplorer({ rows, buildAtMs }: { rows: CompareRow[]; buildAtMs: number }) {
  const validLaneIds = useMemo(() => new Set(rows.map((row) => row.id)), [rows]);

  /**
   * The query string as it was when this component first rendered on the
   * client. Captured in the render body (lazy ref init — never read into the
   * rendered output, so it cannot cause a hydration mismatch) rather than in
   * the effect below, because effects run child-first: `CompareWorkspace`'s
   * history-sync effect fires before this component's, and reading the URL
   * afterwards would risk observing a URL the workspace had already rewritten.
   */
  const initialSearchRef = useRef<string | null>(null);
  if (initialSearchRef.current === null) {
    initialSearchRef.current = typeof window === "undefined" ? "" : window.location.search;
  }

  // Non-null only once the one-time hydration effect below has run. Its mere
  // presence — not its content — is what the `key` below keys off of, so
  // `CompareWorkspace` remounts exactly once, on the pre-hydration ->
  // hydrated transition, and never again on a later `popstate`.
  const [hydratedState, setHydratedState] = useState<CompareDecisionState | null>(null);

  useEffect(() => {
    setHydratedState(decodeCompareState(initialSearchRef.current ?? "", validLaneIds));
  }, [validLaneIds]);

  return (
    <CompareWorkspace
      key={hydratedState ? "hydrated" : "pre-hydration"}
      initialState={hydratedState ?? DEFAULT_DECISION_STATE}
      rows={rows}
      validLaneIds={validLaneIds}
      buildAtMs={buildAtMs}
    />
  );
}

/** Feedback from the most recent share/export action, plus the manual-copy fallback URL when the clipboard refused. */
interface ShareFeedback {
  status: string | null;
  fallbackUrl: string | null;
}

const NO_SHARE_FEEDBACK: ShareFeedback = { status: null, fallbackUrl: null };

/**
 * Byte-order mark prepended to the exported CSV blob only — never to
 * `buildCompareCsv`'s return value, whose byte-exact contract is pinned by
 * `compare-export.test.ts`. Without it Excel on Windows decodes the file as
 * the system codepage and mangles the non-ASCII characters the scenario label
 * and several model names contain.
 */
const UTF8_BOM = "\uFEFF";

function CompareWorkspace({
  initialState,
  rows,
  validLaneIds,
  buildAtMs,
}: {
  initialState: CompareDecisionState;
  rows: CompareRow[];
  validLaneIds: ReadonlySet<string>;
  buildAtMs: number;
}) {
  const [workload, setWorkload] = useState<Workload>(initialState.workload);
  const [scenario, setScenario] = useState<Scenario>(initialState.scenario);
  const [sortKey, setSortKey] = useState<SortKey>(initialState.sort.key);
  const [sortDir, setSortDir] = useState<SortDir>(initialState.sort.dir);
  const [filters, setFilters] = useState(initialState.filters);
  const [showAll, setShowAll] = useState(false);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const [share, setShare] = useState<ShareFeedback>(NO_SHARE_FEEDBACK);
  const now = useNow();

  const shortlist = useShortlist(validLaneIds, initialState.selectedLaneIds);

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

  const pinnedIds = useMemo(() => new Set(shortlist.laneIds), [shortlist.laneIds]);

  /**
   * Shortlisted lanes, in pin order, read out of the SAME `computed` array the
   * table renders from — never re-priced. Sourced from `computed` rather than
   * `filtered` on purpose: a pinned lane must stay in the tray even once a
   * filter hides it from the results, otherwise narrowing the search would
   * silently drop lanes the visitor deliberately kept.
   */
  const shortlistRows = useMemo(() => {
    const byId = new Map(computed.map((entry) => [entry.row.id, entry]));
    return shortlist.laneIds
      .map((id) => byId.get(id))
      .filter((entry): entry is ComparedRow => entry !== undefined);
  }, [computed, shortlist.laneIds]);

  const workloadSummary = `${formatTokens(workload.inputTokens)} in / ${formatTokens(workload.outputTokens)} out @ ${Math.round(workload.cacheHitRate * 100)}% cache`;

  const decisionState = useMemo<CompareDecisionState>(
    () => ({
      workload,
      scenario,
      filters,
      sort: { key: sortKey, dir: sortDir },
      selectedLaneIds: shortlist.laneIds,
    }),
    [workload, scenario, filters, sortKey, sortDir, shortlist.laneIds],
  );

  /**
   * Mirror the live decision state into the address bar.
   *
   * `replaceState`, never `pushState`: per the design spec, "user changes
   * replace the current history entry" — a Back press should leave the page,
   * not rewind one filter keystroke at a time. The first run is skipped
   * because at that instant the state either is still the pre-hydration
   * default or came straight out of the URL, so writing it back is at best a
   * no-op and at worst (before hydration) would erase the query this component
   * has not read yet.
   */
  const skipFirstSyncRef = useRef(true);
  useEffect(() => {
    if (skipFirstSyncRef.current) {
      skipFirstSyncRef.current = false;
      return;
    }
    const query = encodeCompareState(decisionState);
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (next === `${window.location.pathname}${window.location.search}`) return;
    // Preserve whatever the App Router stashed in history.state; replacing it
    // with null breaks Next's own back/forward restoration.
    window.history.replaceState(window.history.state, "", next);
  }, [decisionState]);

  /**
   * Restore workload/scenario/filters/sort/shortlist on a `popstate`
   * (browser back/forward) by decoding the URL the browser just navigated to
   * and pushing it directly into this already-mounted component's own state
   * setters — including `shortlist.setLaneIds`, which reuses that hook's own
   * normalize-then-persist path (see use-shortlist.ts) rather than
   * duplicating it here.
   *
   * Deliberately does NOT touch `showAll` or `trayExpanded`: those are local
   * view toggles with no URL representation, and a Back press that restores
   * the shared decision state should not also silently re-collapse an
   * expanded result list or shortlist tray. It also resets `share` to
   * `NO_SHARE_FEEDBACK` — that message is ephemeral feedback about a past
   * copy-link/export action, not decision state, and resetting it here keeps
   * this handler's behavior otherwise identical to what the remount it
   * replaced used to do (which cleared every piece of local state).
   *
   * `shortlist.setLaneIds` always treats the popstate-decoded lane list as
   * authoritative, including when it's empty — unlike a fresh mount of
   * `useShortlist`, which falls back to storage when the URL is silent. A
   * live `/compare` history entry's URL is kept continuously in sync with the
   * shortlist by the history-sync effect above (`replaceState`, not
   * `pushState`), so by the time a visitor navigates away and back, the URL
   * they land on already reflects whatever was pinned at that point in
   * history — there is no separate "URL truly has no opinion" case to fall
   * back from here the way there is at initial mount.
   */
  useEffect(() => {
    function onPopState() {
      const decoded = decodeCompareState(window.location.search, validLaneIds);
      setWorkload(decoded.workload);
      setScenario(decoded.scenario);
      setSortKey(decoded.sort.key);
      setSortDir(decoded.sort.dir);
      setFilters(decoded.filters);
      shortlist.setLaneIds(decoded.selectedLaneIds);
      setShare(NO_SHARE_FEEDBACK);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // `shortlist` (from `useShortlist`) is a fresh object every render, so
    // this resubscribes on every render rather than only when `setLaneIds`
    // would genuinely change — `setLaneIds` itself is `useCallback(..., [])`
    // and never changes identity, so this is a same-cost no-op swap each
    // time, not a real churn source.
  }, [validLaneIds, shortlist]);

  const scenarioUrl = useCallback(() => {
    const query = encodeCompareState(decisionState);
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
  }, [decisionState]);

  const onCopyLink = useCallback(() => {
    const url = scenarioUrl();
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
    if (!clipboard?.writeText) {
      setShare({ status: "Clipboard unavailable here — select and copy the link below.", fallbackUrl: url });
      return;
    }
    clipboard.writeText(url).then(
      () => setShare({ status: "Scenario link copied.", fallbackUrl: null }),
      () =>
        setShare({
          status: "Could not copy automatically — select and copy the link below.",
          fallbackUrl: url,
        }),
    );
  }, [scenarioUrl]);

  /**
   * Write the visible result rows to a CSV file.
   *
   * Projects `visibleSorted` — exactly the rows on screen at this instant, at
   * the rates already resolved for them — through `buildCompareCsv`, which
   * re-derives nothing. Entirely local: no network, no state mutation, so a
   * failure anywhere below leaves the comparison exactly as it was and only
   * reports itself in the live region.
   *
   * The blob is prefixed with a UTF-8 BOM (not added by `buildCompareCsv`, so
   * that function's own byte-exact tests stay valid) because the scenario
   * label and several model names carry non-ASCII characters that Excel
   * otherwise decodes as the system codepage.
   */
  const onExportCsv = useCallback(() => {
    let objectUrl: string | null = null;
    try {
      const csv = buildCompareCsv(visibleSorted, decisionState, usdToChf);
      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `llm-spend-compare-${stamp}.csv`;
      const blob = new Blob([UTF8_BOM, csv], { type: "text/csv;charset=utf-8" });
      objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setShare({
        status: `Exported ${visibleSorted.length} ${visibleSorted.length === 1 ? "lane" : "lanes"} to ${filename}.`,
        fallbackUrl: null,
      });
    } catch {
      setShare({
        status: "Could not start the CSV download. The comparison above is unchanged.",
        fallbackUrl: null,
      });
    } finally {
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
    }
  }, [visibleSorted, decisionState]);

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
        workloadSummary={workloadSummary}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => {
          setSortKey(key);
          setSortDir(dir);
        }}
        onClear={() => setFilters(DEFAULT_COMPARE_FILTERS)}
      >
        <CompareActionBar
          onCopyLink={onCopyLink}
          onExportCsv={onExportCsv}
          status={share.status}
          fallbackUrl={share.fallbackUrl}
          exportCount={visibleSorted.length}
        />
      </CompareFilterBar>

      {sorted.length > 0 ? (
      <>
      <div className="table-wrap decision-results">
        <table className="data decision-table">
          <thead>
            <tr>
              <th className="th-pin" scope="col"><span className="visually-hidden">Shortlist</span></th>
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
              const pinned = pinnedIds.has(row.id);
              return (
                <tr key={row.id} className={pinned ? "is-pinned" : undefined}>
                  <td data-label="Shortlist" className="cell-pin">
                    <button
                      type="button"
                      className="pin-button"
                      aria-pressed={pinned}
                      aria-label={pinned ? `Unpin ${row.model} from shortlist` : `Pin ${row.model} to shortlist`}
                      onClick={() => shortlist.toggle(row.id)}
                    >
                      <span aria-hidden="true">{pinned ? "★" : "☆"}</span>
                    </button>
                  </td>
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
        never shows a preview. The <span className="mono">☆</span> control pins a lane to the shortlist tray, which
        ranks pinned lanes by cost for the selected workload only.
      </p>

      {/* Keeps the fixed decision spine from covering the end of the page. */}
      {shortlist.laneIds.length > 0 && (
        <div className="decision-spine-spacer" data-expanded={trayExpanded ? "true" : "false"} aria-hidden />
      )}

      <ShortlistTray
        rows={shortlistRows}
        message={shortlist.message}
        expanded={trayExpanded}
        onToggleExpanded={() => setTrayExpanded((value) => !value)}
        onRemove={shortlist.toggle}
        onReset={() => {
          shortlist.reset();
          setTrayExpanded(false);
        }}
        workloadSummary={workloadSummary}
      />

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
