"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  normalizeShortlist,
  parseStoredShortlist,
  serializeShortlist,
  toggleShortlistLane,
} from "@/lib/shortlist";

const STORAGE_KEY = "llm-spend-shortlist";

export interface UseShortlistResult {
  /** Ordered, unique, capped-at-`SHORTLIST_LIMIT` pinned lane ids. */
  laneIds: string[];
  /** Pin `id` if not already selected (rejected past the cap — see `message`); unpin it if it is. */
  toggle: (id: string) => void;
  /** Clear the selection, in memory and in storage. */
  reset: () => void;
  /** Feedback from the most recent `toggle` call — non-null only on a rejected (cap-exceeding) pin attempt. */
  message: string | null;
  /**
   * Replace the shortlist outright with `ids`, normalized (deduped, pruned
   * against the current catalog, capped at `SHORTLIST_LIMIT`) exactly the way
   * the mount effect below normalizes a URL-provided list, then written
   * through the same storage path `toggle`/`reset` already use.
   *
   * The seam a caller with its own authoritative lane list — e.g. a
   * `popstate`-decoded URL — uses to reseed this hook in place, without
   * having to remount the component that owns it just to get the mount
   * effect below to run again with a fresh `urlLaneIds`.
   */
  setLaneIds: (ids: string[]) => void;
}

/**
 * Minimal shape of the storage `readStoredShortlist`/`writeStoredShortlist`
 * need — satisfied by the real `localStorage`/`sessionStorage`, and small
 * enough to stub out with a throwing fake in a test (see
 * `use-shortlist.test.ts`) without pulling in a DOM.
 */
export type ShortlistStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Read the persisted shortlist. Never throws: storage access failures
 * (quota, disabled, private mode) fall back to an empty list.
 *
 * `storage` defaults to the browser's `localStorage`, so every call site
 * below is unchanged; the parameter exists so this function's
 * failure-handling contract — the thing the Global Constraints require of
 * this hook — is directly exercisable by `node:test` with a stub whose
 * methods throw, independent of `useShortlist` the React hook (which this
 * repo's test runner can't otherwise mount).
 */
export function readStoredShortlist(storage: ShortlistStorage = localStorage): string[] {
  try {
    return parseStoredShortlist(storage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Persist the shortlist, or clear the key entirely for an empty one. Never
 * throws — a failed write just means the session stays in-memory-only.
 *
 * `storage` defaults to the browser's `localStorage` for the same
 * testability reason as `readStoredShortlist`.
 */
export function writeStoredShortlist(ids: string[], storage: ShortlistStorage = localStorage): void {
  try {
    if (ids.length === 0) {
      storage.removeItem(STORAGE_KEY);
    } else {
      storage.setItem(STORAGE_KEY, serializeShortlist(ids));
    }
  } catch {
    /* Storage disabled/unavailable — the in-memory shortlist is unaffected and stays correct for the rest of the session. */
  }
}

/**
 * Persistent, capped shortlist of pinned compare lanes.
 *
 * `laneIds` starts as `normalizeShortlist(urlLaneIds, validLaneIds)`, which
 * is safe to compute synchronously: both arguments are ordinary props,
 * identically available during SSR and the client's first render, so the
 * server-rendered markup and the client's pre-hydration render can never
 * disagree. `localStorage` — a browser-only source — is read only inside the
 * effect below, which fires once after mount, the same pattern `useNow`
 * (lib/use-now.ts) and `ThemeToggle` (components/theme-toggle.tsx) use for
 * their own browser-only state: render a value derivable from props/nothing
 * first, then let a post-mount effect adopt the real browser-only value.
 *
 * URL precedence and storage sync are resolved once, at mount: if the URL
 * named a shortlist, it wins and is (re-)written to storage as-is; otherwise
 * whatever was already in storage is adopted (pruned/capped the same way via
 * `normalizeShortlist`). Mount-only mirrors the two existing hydration hooks
 * rather than introducing a third, different pattern.
 *
 * A `popstate` navigation (browser back/forward) on `/compare` does NOT
 * remount this hook and does NOT re-run URL-vs-storage precedence — see
 * `compare-explorer.tsx`'s `CompareWorkspace`, which instead calls the
 * `setLaneIds` seam below directly with the popstate-decoded lane list,
 * treating it as authoritative the way a mount treats a non-empty
 * `urlLaneIds`. This was a deliberate choice made when wiring this hook into
 * `/compare`: remounting to reseed just the shortlist also reset unrelated,
 * URL-independent view state (`showAll`, `trayExpanded`) that a Back press
 * should not touch.
 */
export function useShortlist(
  validLaneIds: ReadonlySet<string>,
  urlLaneIds: string[] = [],
): UseShortlistResult {
  // Named distinctly from the `setLaneIds` returned below (see
  // `UseShortlistResult`) — that one is a public, on-demand "replace the
  // whole list" seam with its own normalize-then-persist behavior, not a
  // bare re-export of this internal setState function.
  const [laneIds, setLaneIdsState] = useState<string[]>(() => normalizeShortlist(urlLaneIds, validLaneIds));
  const [message, setMessage] = useState<string | null>(null);

  // Refs mirroring the latest render's inputs/state, so the mount-only effect
  // and the stable-identity callbacks below can read current values without
  // declaring them as reactive dependencies (which would defeat "run once at
  // mount" / "never change identity"). Assigning `.current` directly in the
  // render body — not inside an effect — keeps it synchronously up to date
  // before any callback or effect that reads it can run.
  const laneIdsRef = useRef(laneIds);
  laneIdsRef.current = laneIds;
  const validLaneIdsRef = useRef(validLaneIds);
  validLaneIdsRef.current = validLaneIds;
  const hadUrlSelectionAtMountRef = useRef(urlLaneIds.length > 0);

  useEffect(() => {
    const next = hadUrlSelectionAtMountRef.current
      ? laneIdsRef.current
      : normalizeShortlist(readStoredShortlist(), validLaneIdsRef.current);
    writeStoredShortlist(next);
    setLaneIdsState(next);
  }, []);

  const toggle = useCallback((id: string) => {
    const result = toggleShortlistLane(laneIdsRef.current, id);
    setLaneIdsState(result.ids);
    setMessage(result.message);
    writeStoredShortlist(result.ids);
  }, []);

  const reset = useCallback(() => {
    setLaneIdsState([]);
    setMessage(null);
    writeStoredShortlist([]);
  }, []);

  // See the `setLaneIds` doc comment on `UseShortlistResult`. This mirrors
  // exactly what the mount effect above does for a URL-provided list (the
  // `hadUrlSelectionAtMountRef.current === true` branch: normalize, adopt
  // in-memory, persist) — just made callable on demand instead of only at
  // mount, and always treating its input as authoritative the way a mount
  // treats `urlLaneIds`, rather than falling back to storage the way the
  // mount effect does when the URL is silent. Reuses `normalizeShortlist`
  // and `writeStoredShortlist` rather than duplicating either.
  const setLaneIds = useCallback((ids: string[]) => {
    const next = normalizeShortlist(ids, validLaneIdsRef.current);
    setLaneIdsState(next);
    setMessage(null);
    writeStoredShortlist(next);
  }, []);

  return { laneIds, toggle, reset, message, setLaneIds };
}
