import type { CompareRow } from "@/data/compare-data";
import type { Tier } from "@/data/types";

export interface LaneIdentity {
  providerSlug: string;
  model: string;
  tier: Tier;
  host?: string;
}

function normalizeSegment(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLocaleLowerCase();
}

/**
 * A stable catalog identity for one purchasable model lane.
 *
 * It deliberately excludes catalog position and mutable pricing/provenance
 * fields, leaving provider, model, deployment tier, and host as the identity.
 */
export function laneId({ providerSlug, model, tier, host }: LaneIdentity): string {
  return [providerSlug, model, tier, host]
    .filter((segment): segment is string => segment !== undefined)
    .map(normalizeSegment)
    .join("--");
}

export function assertUniqueLaneIds(rows: CompareRow[]): void {
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) {
      throw new Error(`Duplicate lane id: ${row.id}`);
    }
    seen.add(row.id);
  }
}
