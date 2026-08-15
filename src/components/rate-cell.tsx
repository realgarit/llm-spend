"use client";

import type { PricingEntry } from "@/data/types";
import { resolveRate } from "@/lib/rates";
import { useNow } from "@/lib/use-now";
import { PriceStacked } from "./price";

/**
 * The Input / Cached / Output `<td>`s for a row whose price varies.
 *
 * Only used for rows that carry `variants` — plain rows keep rendering the
 * static `<PriceStacked>` cells directly in pricing-table.tsx, unchanged.
 *
 * `buildAtMs` is the server's build-time resolution basis. Before mount (and
 * on the server) this renders `resolveRate(entry, { now: buildAtMs })`,
 * identical to what the server sent — no hydration mismatch. After mount,
 * `useNow()` supplies the visitor's real clock and the cells re-resolve, so a
 * variant boundary crossed between build and view (or while the page sits
 * open) corrects itself without a rebuild or reload.
 */
export function RateCells({
  entry,
  isEmbeddings,
  buildAtMs,
}: {
  entry: PricingEntry;
  isEmbeddings: boolean;
  buildAtMs: number;
}) {
  const now = useNow() ?? new Date(buildAtMs);
  const resolved = resolveRate(entry, { now });
  const cachedConfidence = resolved.cachedConfidence ?? resolved.confidence;

  return (
    <>
      <td className="num">
        <PriceStacked usd={resolved.inputUsd} confidence={resolved.confidence} live />
      </td>
      {!isEmbeddings && (
        <td className="num">
          <PriceStacked usd={resolved.cachedUsd} confidence={cachedConfidence} muted live />
        </td>
      )}
      {!isEmbeddings && (
        <td className="num">
          <PriceStacked usd={resolved.outputUsd} confidence={resolved.confidence} live />
        </td>
      )}
    </>
  );
}
