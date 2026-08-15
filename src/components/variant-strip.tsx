"use client";

import type { PricingEntry } from "@/data/types";
import { formatUsd } from "@/data/currency";
import { describeNextChange } from "@/lib/rate-display";
import { resolveRate } from "@/lib/rates";
import { useNow } from "@/lib/use-now";

/**
 * The expandable panel under a rate-variant row: which variant is active
 * right now, when the price next changes, and every published variant's
 * numbers so the full picture is visible without interacting with anything.
 *
 * All variant numbers below are ordinary server-rendered text — they don't
 * depend on the clock — so they're in the HTML on first load whether or not
 * JS runs. Only the active badge and the change announcement are
 * time-dependent; those alone re-resolve after mount via `useNow()`, with
 * `buildAtMs` as the pre-mount/server fallback (see rate-cell.tsx for the
 * same pattern applied to the row's main price cells).
 */
export function VariantStrip({
  entry,
  isEmbeddings,
  buildAtMs,
}: {
  entry: PricingEntry;
  isEmbeddings: boolean;
  buildAtMs: number;
}) {
  // Hooks must run unconditionally, so this is called before the guard below
  // even though the caller only renders VariantStrip for rows that have
  // variants — never gate a hook call on a prop check.
  const now = useNow() ?? new Date(buildAtMs);

  const variants = entry.variants;
  if (!variants || variants.length === 0) return null;

  const ctx = { now };
  const resolved = resolveRate(entry, ctx);
  const announcement = describeNextChange(entry, ctx);

  return (
    <div className="variant-strip">
      {(resolved.variant || announcement) && (
        <div className="variant-status">
          {resolved.variant && (
            <span className="badge badge-active" suppressHydrationWarning>
              {resolved.label}
            </span>
          )}
          {announcement && (
            <span className="variant-countdown mono" suppressHydrationWarning>
              {announcement.text}
            </span>
          )}
        </div>
      )}
      <div className="variant-list">
        {variants.map((v) => (
          <span
            key={v.label}
            className={`variant-chip${v === resolved.variant ? " is-active" : ""}`}
            title={isEmbeddings ? "Input" : "Input / Cached / Output"}
          >
            <span className="variant-chip-label">{v.label}</span>
            <span className="mono tnum variant-chip-nums">
              {isEmbeddings
                ? formatUsd(v.inputUsd)
                : `${formatUsd(v.inputUsd)} / ${v.cachedUsd === null ? "—" : formatUsd(v.cachedUsd)} / ${formatUsd(v.outputUsd)}`}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
