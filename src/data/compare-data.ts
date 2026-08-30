import { chatEntries } from "./providers";
import type { Confidence, PricingEntry, RateVariant, Tier } from "./types";
import { assertUniqueLaneIds, laneId } from "@/lib/lane-id";

/**
 * Flattened, serializable rows for the client-side compare table + calculator.
 * Kept as plain data so it can cross the server/client boundary cheaply.
 */
export interface CompareRow {
  id: string;
  provider: string;
  providerSlug: string;
  model: string;
  host?: string;
  tier: Tier;
  inputUsd: number;
  cachedUsd: number | null;
  outputUsd: number;
  confidence: Confidence;
  cachedConfidence: Confidence;
  /** ISO date the source rate was effective or captured. */
  effectiveDate: string;
  /** Short inline catalog note, if applicable. */
  notes?: string;
  /** Catalog provenance for the row's published or derived numbers. */
  sourceNote?: string;
  /**
   * Conditional rate variants carried through from the catalog row so the
   * compare page can resolve scenario-aware pricing (see lib/scenario.ts and
   * lib/rates.ts) instead of always showing the flat fields above.
   */
  variants?: RateVariant[];
}

export function buildCompareRows(entries = chatEntries()): CompareRow[] {
  const rows = entries.map(({ provider, entry }) => ({
    id: laneId({
      providerSlug: provider.slug,
      model: entry.model,
      tier: entry.tier,
      host: entry.host,
    }),
    provider: provider.name,
    providerSlug: provider.slug,
    model: entry.model,
    host: entry.host,
    tier: entry.tier,
    inputUsd: entry.inputUsd,
    cachedUsd: entry.cachedUsd,
    outputUsd: entry.outputUsd,
    confidence: entry.confidence,
    cachedConfidence: entry.cachedConfidence ?? entry.confidence,
    effectiveDate: entry.effectiveDate,
    notes: entry.notes,
    sourceNote: entry.sourceNote,
    variants: entry.variants,
  }));

  assertUniqueLaneIds(rows);
  return rows;
}

/**
 * Project a compare row back into a minimal `PricingEntry` so it can be run
 * through the rate resolver (`resolveRate` / `computeCost`). Provenance fields
 * travel with the row even though only the pricing fields affect resolution.
 */
export function toPricingEntry(row: CompareRow): PricingEntry {
  return {
    model: row.model,
    host: row.host,
    tier: row.tier,
    inputUsd: row.inputUsd,
    cachedUsd: row.cachedUsd,
    outputUsd: row.outputUsd,
    confidence: row.confidence,
    cachedConfidence: row.cachedConfidence,
    effectiveDate: row.effectiveDate,
    notes: row.notes,
    sourceNote: row.sourceNote,
    variants: row.variants,
  };
}
