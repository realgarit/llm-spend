"use client";

import React from "react";
import { formatChf, formatUsd } from "@/data/currency";
import type { ComparedRow } from "@/lib/scenario";
import { SHORTLIST_COMPARE_MIN, SHORTLIST_LIMIT, shortlistDeltas } from "@/lib/shortlist";
import { Mark, TierBadge } from "@/components/price";

export interface ShortlistTrayProps {
  /** Shortlisted rows, already priced under the caller's current scenario, in pin order. */
  rows: ComparedRow[];
  /** Feedback from the most recent pin/unpin action (e.g. limit reached), or null. Rendered in an aria-live region. */
  message: string | null;
  /** Whether the side-by-side comparison is currently shown. */
  expanded: boolean;
  /** Toggle the expanded comparison. */
  onToggleExpanded: () => void;
  /** Unpin one lane by its stable `CompareRow.id`. */
  onRemove: (id: string) => void;
  /** Clear the whole shortlist. */
  onReset: () => void;
  /** Short label for the workload currently priced, e.g. "60M in / 210K out @ 90% cache". */
  workloadSummary: string;
}

/**
 * The decision spine: a persistent tray naming every pinned compare lane.
 *
 * Fully controlled — no state of its own. `rows` are already-resolved
 * `ComparedRow`s (the same shape the compare table renders), in the order
 * the visitor pinned them; every dollar figure here is read from `resolved`/
 * `cost`, nothing is recomputed. Collapses to a single strip; renders
 * essentially nothing once the shortlist is empty (no chips, no actions —
 * only the always-mounted `aria-live` region survives), matching the design
 * spec ("collapses to one compact row ... and disappears when empty").
 *
 * Not yet mounted on `/compare` — a later task wires this to real URL/
 * storage state via `useShortlist` (`src/hooks/use-shortlist.ts`) and the
 * live scenario resolver.
 */
export function ShortlistTray({
  rows,
  message,
  expanded,
  onToggleExpanded,
  onRemove,
  onReset,
  workloadSummary,
}: ShortlistTrayProps) {
  const hasRows = rows.length > 0;
  const canExpand = rows.length >= SHORTLIST_COMPARE_MIN;

  return (
    <section className="shortlist-tray" aria-label="Pinned shortlist">
      {/* Kept mounted even when empty: a message fired by the action that just
          emptied the shortlist (e.g. removing the last lane) must still be
          announced, and some assistive tech only announces *changes* to an
          already-present live region, not content in a newly-mounted one. */}
      <div className="shortlist-live" role="status" aria-live="polite">
        {message ?? ""}
      </div>

      {hasRows && (
        <>
          <div className="shortlist-strip">
            <div className="shortlist-heading-row">
              <span className="eyebrow">{`Shortlist · ${rows.length}/${SHORTLIST_LIMIT}`}</span>
              <span className="shortlist-workload mono">{workloadSummary}</span>
            </div>

            <ul className="shortlist-chips">
              {rows.map(({ row }) => (
                <li key={row.id} className="shortlist-chip">
                  <span className="shortlist-chip-label">{row.model}</span>
                  <button
                    type="button"
                    className="shortlist-chip-remove"
                    aria-pressed={true}
                    aria-label={`Unpin ${row.model} from shortlist`}
                    onClick={() => onRemove(row.id)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="shortlist-actions">
              <button
                type="button"
                className="btn btn-primary"
                aria-expanded={expanded}
                disabled={!canExpand}
                title={canExpand ? undefined : `Pin at least ${SHORTLIST_COMPARE_MIN} lanes to compare them side-by-side`}
                onClick={onToggleExpanded}
              >
                {expanded ? "Collapse comparison" : "Compare shortlist"}
              </button>
              <button type="button" className="btn" onClick={onReset}>
                Reset shortlist
              </button>
            </div>
          </div>

          {expanded &&
            (canExpand ? (
              <ShortlistComparison rows={rows} onRemove={onRemove} />
            ) : (
              <p className="shortlist-need-more">
                Pin at least {SHORTLIST_COMPARE_MIN} lanes to compare them side-by-side. Currently {rows.length} pinned.
              </p>
            ))}
        </>
      )}
    </section>
  );
}

/**
 * The expanded side-by-side comparison surface. Only ever rendered when the
 * caller has already checked `rows.length >= SHORTLIST_COMPARE_MIN` (see
 * `ShortlistTray` above) — this component does not re-check that itself, so
 * it always assumes there is a meaningful baseline to compare against.
 */
function ShortlistComparison({ rows, onRemove }: { rows: ComparedRow[]; onRemove: (id: string) => void }) {
  const deltas = shortlistDeltas(rows);

  return (
    <div className="shortlist-grid">
      {deltas.map(({ compared, isBaseline, deltaUsd, deltaPercent }) => {
        const { row, resolved, cost } = compared;
        const cachedConfidence = resolved.cachedConfidence ?? resolved.confidence;

        return (
          <article key={row.id} className="shortlist-card">
            <div className="shortlist-card-head">
              <div>
                <div className="shortlist-card-model">{row.model}</div>
                <div className="shortlist-card-meta">
                  <span>{row.provider}</span>
                  <TierBadge tier={row.tier} />
                  {row.host && <span className="shortlist-card-host">{row.host}</span>}
                </div>
              </div>
              <button
                type="button"
                className="shortlist-chip-remove"
                aria-pressed={true}
                aria-label={`Unpin ${row.model} from shortlist`}
                onClick={() => onRemove(row.id)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <dl className="shortlist-card-figures">
              <div>
                <dt>Input / 1M</dt>
                <dd>
                  {formatUsd(resolved.inputUsd)}
                  <Mark confidence={resolved.confidence} />
                </dd>
              </div>
              <div>
                <dt>Cached / 1M</dt>
                <dd>
                  {resolved.cachedUsd === null ? "—" : formatUsd(resolved.cachedUsd)}
                  {resolved.cachedUsd !== null && <Mark confidence={cachedConfidence} />}
                </dd>
              </div>
              <div>
                <dt>Output / 1M</dt>
                <dd>
                  {formatUsd(resolved.outputUsd)}
                  <Mark confidence={resolved.confidence} />
                </dd>
              </div>
              <div>
                <dt>Blended input</dt>
                <dd>
                  {formatUsd(cost.blendedInputPerMUsd)}
                  {!cost.cacheApplied && (
                    <span title="No cache meter, so hit rate does not apply">*</span>
                  )}
                </dd>
              </div>
            </dl>

            {compared.scenarioPriced && resolved.label && (
              <div className="shortlist-card-variant mono" title="Priced under the selected scenario — differs from this row's flat base rate">
                {resolved.label}
              </div>
            )}

            <div className="shortlist-card-total">
              <div className="shortlist-card-total-usd mono tnum">{formatUsd(cost.totalUsd)}</div>
              <div className="shortlist-card-total-chf mono">{formatChf(cost.totalUsd)}</div>
            </div>

            <div className="shortlist-card-delta">
              {isBaseline ? (
                <span className="shortlist-baseline">Lowest cost in this shortlist</span>
              ) : (
                <span>
                  +{formatUsd(deltaUsd)} (+{deltaPercent}%) vs. lowest
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
