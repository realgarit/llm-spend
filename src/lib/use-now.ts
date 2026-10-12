"use client";

import { useMemo, useSyncExternalStore } from "react";

const DEFAULT_INTERVAL_MS = 30_000;

/**
 * The current time, client-only.
 *
 * Returns `null` on the server and on the first client render (before
 * mount), so a component that falls back to a server-supplied timestamp
 * while this is null renders identically on both — no hydration mismatch.
 * After mount, a shared clock publishes the real `Date` and refreshes it every
 * `intervalMs` (30s by default) so time-of-day windows and countdowns keep
 * moving without a page reload.
 *
 * This is the ONLY sanctioned way a component gets "now" — never call
 * `new Date()` directly during render, since that would differ from the
 * server's build-time render and break hydration.
 */
type Clock = { now: Date; listeners: Set<() => void>; timer: ReturnType<typeof setInterval> | null };
const clocks = new Map<number, Clock>();

function getClock(intervalMs: number): Clock {
  let clock = clocks.get(intervalMs);
  if (!clock) {
    clock = { now: new Date(), listeners: new Set(), timer: null };
    clocks.set(intervalMs, clock);
  }
  return clock;
}

export function useNow(intervalMs = DEFAULT_INTERVAL_MS): Date | null {
  const source = useMemo(() => {
    const clock = getClock(intervalMs);
    return {
      snapshot: () => clock.now,
      subscribe: (onChange: () => void) => {
        clock.listeners.add(onChange);
        if (clock.timer === null) {
          clock.now = new Date();
          clock.timer = setInterval(() => {
            clock.now = new Date();
            for (const listener of clock.listeners) listener();
          }, intervalMs);
        }
        return () => {
          clock.listeners.delete(onChange);
          if (clock.listeners.size === 0 && clock.timer !== null) {
            clearInterval(clock.timer);
            clock.timer = null;
          }
        };
      },
    };
  }, [intervalMs]);
  return useSyncExternalStore(source.subscribe, source.snapshot, () => null);
}
