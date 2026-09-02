"use client";

import React from "react";
import Link from "next/link";
import { formatUsd } from "@/data/currency";
import type { ComparedRow } from "@/lib/scenario";
import { SHORTLIST_LIMIT } from "@/lib/shortlist";
import { TierBadge } from "@/components/price";

export interface ShortlistContextChipsProps {
  /**
   * Pinned lanes, already priced under the host page's own current
   * workload/scenario, in pin order. The host page is responsible for
   * filtering its own full-catalog `ComparedRow[]` down to the pinned lane
   * ids (`useShortlist().laneIds`) — this component never recomputes a rate
   * or a workload cost itself.
   */
  rows: ComparedRow[];
  /**
   * Unpin one lane by its stable `CompareRow.id`. Omit to render a read-only
   * strip with no remove control — the minimum bar the design spec asks for
   * on `/budget` and `/models/[laneId]` ("preserve the context"); full
   * pin/unpin interactivity on those pages is a nice-to-have.
   */
  onRemove?: (id: string) => void;
}

/**
 * Compact shortlist context strip for pages other than `/compare` —
 * `/budget` and `/models/[laneId]` — where a lane pinned on the compare page
 * would otherwise be invisible (issue #87). Surfaces what's pinned without
 * the compare page's full persistent tray (`ShortlistTray`): no expand/
 * compare/reset actions, just enough to see what's pinned and jump to it.
 *
 * Fully controlled and pure, exactly like `ShortlistTray`: `rows` are
 * already-resolved `ComparedRow`s the host page computed for its own
 * purposes (its full-catalog `comparedRows` array, filtered down to
 * `useShortlist().laneIds`) — this component reads `resolved`/`cost` fields
 * only, so mounting it is never a second pricing computation.
 *
 * Renders nothing when `rows` is empty — no chips, no wrapper element, no
 * empty-state copy — so an unused shortlist costs the page nothing (per the
 * issue's explicit acceptance criterion).
 *
 * Reuses the compare page's `.shortlist-chip`/`.shortlist-chips` visual
 * language (globals.css, `ShortlistTray`) rather than inventing a new chip
 * style. One deliberate difference from that tray's compact chip: there, a
 * chip shows only the bare model name, because the surrounding compare table
 * already carries provider/tier/price for every row. Here there is no such
 * table, so each chip is self-describing — provider + model (+ host), a
 * tier badge, and the workload cost already computed for it — following the
 * provider/model/tier labeling convention used throughout the compare table
 * and the lane detail page's own alternative-lane cards.
 */
export function ShortlistContextChips({ rows, onRemove }: ShortlistContextChipsProps) {
  if (rows.length === 0) return null;

  return (
    <section className="shortlist-context-chips" aria-label="Pinned shortlist">
      <span className="eyebrow">{`Shortlist · ${rows.length}/${SHORTLIST_LIMIT}`}</span>
      <ul className="shortlist-chips">
        {rows.map(({ row, cost }) => (
          <li
            key={row.id}
            className={`shortlist-chip shortlist-context-chip${onRemove ? " has-remove" : ""}`}
          >
            <Link href={`/models/${row.id}`} className="shortlist-chip-label shortlist-context-chip-link">
              {row.provider} · {row.model}
              {row.host ? ` — ${row.host}` : ""}
            </Link>
            <TierBadge tier={row.tier} />
            <span className="shortlist-context-chip-price mono tnum" suppressHydrationWarning>
              {formatUsd(cost.totalUsd)}
            </span>
            {onRemove && (
              <button
                type="button"
                className="shortlist-chip-remove"
                aria-pressed={true}
                aria-label={`Unpin ${row.model} from shortlist`}
                onClick={() => onRemove(row.id)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
