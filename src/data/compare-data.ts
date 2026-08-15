import { chatEntries } from "./providers";
import type { Confidence, PricingEntry, RateVariant, Tier } from "./types";

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
  /**
   * Conditional rate variants carried through from the catalog row so the
   * compare page can resolve scenario-aware pricing (see lib/scenario.ts and
   * lib/rates.ts) instead of always showing the flat fields above.
   */
  variants?: RateVariant[];
}

export function buildCompareRows(): CompareRow[] {
  return chatEntries().map(({ provider, entry }, i) => ({
    id: `${provider.slug}-${entry.model}-${entry.tier}-${entry.host ?? ""}-${i}`,
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
    variants: entry.variants,
  }));
}

/**
 * Project a compare row back into a minimal `PricingEntry` so it can be run
 * through the rate resolver (`resolveRate` / `computeCost`). `effectiveDate`
 * is not part of `CompareRow` and plays no part in resolution, so it's a
 * blank placeholder here — the same convention the compare page already used
 * before variants existed.
 */
export function toPricingEntry(row: CompareRow): PricingEntry {
  return {
    model: row.model,
    tier: row.tier,
    inputUsd: row.inputUsd,
    cachedUsd: row.cachedUsd,
    outputUsd: row.outputUsd,
    confidence: row.confidence,
    cachedConfidence: row.cachedConfidence,
    effectiveDate: "",
    variants: row.variants,
  };
}
