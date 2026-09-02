import type { ComparedRow } from "@/lib/scenario";

/**
 * Persistent shortlist: a small, ordered set of pinned compare-lane ids.
 *
 * Every function in this file is pure and storage-agnostic — no
 * `localStorage` call appears here. The React hook that actually touches the
 * browser (`src/hooks/use-shortlist.ts`) is the only place that reads/writes
 * storage, wrapping every call in try/catch there. This module only defines:
 * the state machine (`normalizeShortlist`, `toggleShortlistLane`), the
 * versioned storage payload shape (`serializeShortlist` /
 * `parseStoredShortlist`), and the cost-delta projection (`shortlistDeltas`)
 * the tray renders.
 */

/** Maximum number of lanes that can be pinned at once. */
export const SHORTLIST_LIMIT = 4;

/**
 * Minimum pinned lanes required before the expanded side-by-side comparison
 * is meaningful. A property of the *comparison affordance*, not a floor on
 * how many lanes may be pinned — 0, 1, 3, and 4 are all valid shortlist
 * sizes; this only gates whether "Compare shortlist" can be used.
 */
export const SHORTLIST_COMPARE_MIN = 2;

const STORAGE_VERSION = 1;

/**
 * Deduplicate, drop ids absent from the current catalog, and cap at
 * `SHORTLIST_LIMIT` — while leaving the relative order of the surviving ids
 * exactly as given (first occurrence wins; nothing is reordered or
 * renumbered).
 *
 * Used identically for every external source of a shortlist: a decoded URL
 * parameter and a parsed storage payload (see `use-shortlist.ts`). The cap is
 * enforced here too, silently — deliberately more than "prune removed
 * lanes": a bulk external payload (a hand-edited URL, an old storage entry
 * written before the cap existed, a corrupted value) could carry more than
 * four ids, and "a shortlist has at most `SHORTLIST_LIMIT` lanes" is a
 * property of the shortlist itself, not just of one interactive toggle. This
 * is a different situation from `toggleShortlistLane`'s rejection: that one
 * reports on a live, single "5th pin" action as it happens; this one is a
 * defensive load-time normalization of a bulk value with no single "attempt"
 * to report on, so it truncates without a message.
 */
export function normalizeShortlist(ids: string[], validLaneIds: ReadonlySet<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of ids) {
    if (!validLaneIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length >= SHORTLIST_LIMIT) break;
  }

  return result;
}

/** The result of one `toggleShortlistLane` call. */
export interface ToggleShortlistResult {
  /** The new shortlist: unique, order-preserving, at most `SHORTLIST_LIMIT` long. */
  ids: string[];
  /** Non-null only when the toggle was rejected (shortlist already full, adding a new id). */
  message: string | null;
}

/**
 * Toggle one lane id in an already-normalized shortlist.
 *
 * Exclusive and idempotent: an id already present is removed; an id absent
 * is added, unless the shortlist is already at `SHORTLIST_LIMIT`, in which
 * case the attempt is rejected outright — the list comes back unchanged
 * (never silently dropped in a way indistinguishable from success, and never
 * bumping an existing lane out to make room) and `message` explains why.
 * The membership check is the only branch that can add an id, so a duplicate
 * can never be produced.
 */
export function toggleShortlistLane(ids: string[], id: string): ToggleShortlistResult {
  if (ids.includes(id)) {
    return { ids: ids.filter((existing) => existing !== id), message: null };
  }
  if (ids.length >= SHORTLIST_LIMIT) {
    return {
      ids: [...ids],
      message: `Shortlist is full (${SHORTLIST_LIMIT} max) — remove a lane before pinning another.`,
    };
  }
  return { ids: [...ids, id], message: null };
}

/** One shortlisted lane's cost relative to the shortlist's cheapest lane. */
export interface ShortlistDelta {
  compared: ComparedRow;
  /** True for the cheapest lane(s) in the shortlist — the cost baseline. Every tied-cheapest lane is marked. */
  isBaseline: boolean;
  /** USD above the baseline's total cost. 0 for baseline lane(s); never negative otherwise. */
  deltaUsd: number;
  /**
   * Percent above the baseline's total cost, rounded to the nearest integer.
   * 0 for baseline lane(s); never negative otherwise.
   *
   * Zero-baseline convention (a deliberate design decision, not derived from
   * elsewhere in the codebase): when the baseline's own `cost.totalUsd` is
   * $0, a percentage relative to it is mathematically undefined (division by
   * zero). Rather than let `Infinity`/`NaN` leak into the UI — or hide the
   * signal behind `null` the way `buildCostLeaders` does for its own
   * "unavailable" case in compare-insights.ts — every lane's `deltaPercent`
   * is defined as exactly `0` whenever the baseline costs $0. `deltaUsd`
   * stays fully meaningful and finite regardless (cost - 0 = cost), so the
   * real signal is never lost, only the percentage framing of it, which has
   * no honest finite value at a zero baseline.
   */
  deltaPercent: number;
}

/**
 * Project each shortlisted, already-priced row against the cheapest lane in
 * the set.
 *
 * The returned order matches `rows` exactly — this is a per-lane cost
 * projection, not a sort. The tray shows lanes in the order the visitor
 * pinned them; re-sorting by cost here would fight that pinned order. When
 * more than one lane shares the lowest cost, every tied lane is marked
 * `isBaseline`.
 */
export function shortlistDeltas(rows: ComparedRow[]): ShortlistDelta[] {
  if (rows.length === 0) return [];

  const baselineUsd = Math.min(...rows.map((row) => row.cost.totalUsd));

  return rows.map((compared) => {
    const deltaUsd = compared.cost.totalUsd - baselineUsd;
    const deltaPercent = baselineUsd === 0 ? 0 : Math.round((deltaUsd / baselineUsd) * 100);
    return { compared, isBaseline: compared.cost.totalUsd === baselineUsd, deltaUsd, deltaPercent };
  });
}

/** Shape of one shortlist payload as persisted to `localStorage`. */
interface StoredShortlistV1 {
  v: 1;
  ids: string[];
}

/**
 * Serialize a shortlist for `localStorage`.
 *
 * Versioned the same way `compare-state.ts` versions its URL payload: a `v`
 * field pins the shape so a future format change can add a new version
 * rather than silently misreading an old one.
 */
export function serializeShortlist(ids: string[]): string {
  const payload: StoredShortlistV1 = { v: STORAGE_VERSION, ids: [...ids] };
  return JSON.stringify(payload);
}

/**
 * Parse a `localStorage` payload back into a raw list of lane ids.
 *
 * Purely defensive: missing data, malformed JSON, an unexpected shape, an
 * unsupported `v`, or a non-array `ids` field all fall back to an empty list
 * rather than throwing — mirroring `decodeCompareState`'s "malformed/unknown
 * data falls back safely" contract for the URL codec. Returned ids are NOT
 * deduped, pruned against the catalog, or capped here — call
 * `normalizeShortlist` on the result for that, exactly as callers already do
 * for a decoded URL list, so there is exactly one definition of "a valid
 * shortlist" in this file.
 */
export function parseStoredShortlist(raw: string | null): string[] {
  if (raw === null || raw === "") return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];
  const { v, ids } = parsed as { v?: unknown; ids?: unknown };
  if (v !== STORAGE_VERSION || !Array.isArray(ids)) return [];

  return ids.filter((id): id is string => typeof id === "string");
}
