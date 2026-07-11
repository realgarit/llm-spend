import { chatEntries } from "./providers";
import type { Confidence, Tier } from "./types";

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
  }));
}
