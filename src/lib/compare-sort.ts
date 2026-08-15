/**
 * Sort comparator for the compare-page table.
 *
 * Pulled out of `compare-explorer.tsx` so it is unit-testable as a plain
 * function (see compare-sort.test.ts) instead of only reachable by rendering
 * the table and clicking a header — same rationale as the pure functions in
 * scenario.ts.
 */

/**
 * The slice of a resolved+priced compare row the comparator actually reads.
 * Narrower than `ComparedRow` (lib/scenario.ts) on purpose: a fixture only
 * has to supply these fields, not a whole resolved rate / cost breakdown /
 * scenario-preview object. `ComparedRow` satisfies this structurally, so the
 * compare page can pass its rows straight through with no adapter.
 */
export interface SortableRow {
  row: { provider: string; model: string; tier: string };
  resolved: { inputUsd: number; cachedUsd: number | null; outputUsd: number };
  cost: { blendedInputPerMUsd: number; totalUsd: number };
}

export type SortKey =
  | "provider"
  | "model"
  | "tier"
  | "inputUsd"
  | "cachedUsd"
  | "outputUsd"
  | "blended"
  | "total";

export type SortDir = "asc" | "desc";

const TIER_ORDER: Record<string, number> = { Direct: 0, Global: 1, DataZone: 2, Regional: 3 };

/**
 * Order two possibly-null numbers so that a null — a row with no cache meter,
 * shown as "—" in the table — always sorts to the end, for BOTH ascending and
 * descending, while two real numbers still reverse order with `dir` as usual.
 *
 * The bug this replaces substituted `Infinity` for null and multiplied the
 * whole difference by `dir`. That puts nulls last only when ascending:
 * flipping `dir` to -1 also flips the sign of that `Infinity`, so a
 * descending sort put every "—" row above every priced row instead of below
 * it. Treating "one side is null" as its own comparison — decided before
 * `dir` is even consulted — keeps null rows pinned to the end regardless of
 * direction, the convention spreadsheets and most data-table libraries use
 * for missing/incomparable values.
 */
export function compareNullsLast(a: number | null, b: number | null, dir: 1 | -1): number {
  if (a === null || b === null) {
    if (a === null && b === null) return 0;
    return a === null ? 1 : -1;
  }
  return dir * (a - b);
}

/** Comparator for `Array#sort` over compare-table rows under the given column/direction. */
export function compareRows(a: SortableRow, b: SortableRow, sortKey: SortKey, sortDir: SortDir): number {
  const dir = sortDir === "asc" ? 1 : -1;
  switch (sortKey) {
    case "provider":
      return dir * a.row.provider.localeCompare(b.row.provider);
    case "model":
      return dir * a.row.model.localeCompare(b.row.model);
    case "tier":
      return dir * ((TIER_ORDER[a.row.tier] ?? 9) - (TIER_ORDER[b.row.tier] ?? 9));
    case "inputUsd":
      return dir * (a.resolved.inputUsd - b.resolved.inputUsd);
    case "cachedUsd":
      return compareNullsLast(a.resolved.cachedUsd, b.resolved.cachedUsd, dir);
    case "outputUsd":
      return dir * (a.resolved.outputUsd - b.resolved.outputUsd);
    case "blended":
      return dir * (a.cost.blendedInputPerMUsd - b.cost.blendedInputPerMUsd);
    case "total":
    default:
      return dir * (a.cost.totalUsd - b.cost.totalUsd);
  }
}
