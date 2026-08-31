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
}

/** Read the persisted shortlist. Never throws: storage access failures (quota, disabled, private mode) fall back to an empty list. */
function readStoredShortlist(): string[] {
  try {
    return parseStoredShortlist(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/** Persist the shortlist, or clear the key entirely for an empty one. Never throws — a failed write just means the session stays in-memory-only. */
function writeStoredShortlist(ids: string[]): void {
  try {
    if (ids.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, serializeShortlist(ids));
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
 * `normalizeShortlist`). This hook is not wired into a live route yet — a
 * later task connects it to `/compare`'s real URL state and can decide
 * whether a `popstate` navigation after mount should re-apply URL
 * precedence; nothing here forecloses that, it simply isn't built yet, so
 * mount-only mirrors the two existing hydration hooks rather than
 * introducing a third, different pattern.
 */
export function useShortlist(
  validLaneIds: ReadonlySet<string>,
  urlLaneIds: string[] = [],
): UseShortlistResult {
  const [laneIds, setLaneIds] = useState<string[]>(() => normalizeShortlist(urlLaneIds, validLaneIds));
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
    setLaneIds(next);
  }, []);

  const toggle = useCallback((id: string) => {
    const result = toggleShortlistLane(laneIdsRef.current, id);
    setLaneIds(result.ids);
    setMessage(result.message);
    writeStoredShortlist(result.ids);
  }, []);

  const reset = useCallback(() => {
    setLaneIds([]);
    setMessage(null);
    writeStoredShortlist([]);
  }, []);

  return { laneIds, toggle, reset, message };
}
