"use client";

import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 30_000;

/**
 * The current time, client-only.
 *
 * Returns `null` on the server and on the first client render (before
 * mount), so a component that falls back to a server-supplied timestamp
 * while this is null renders identically on both — no hydration mismatch.
 * After mount, an effect sets the real `Date` and refreshes it every
 * `intervalMs` (30s by default) so time-of-day windows and countdowns keep
 * moving without a page reload.
 *
 * This is the ONLY sanctioned way a component gets "now" — never call
 * `new Date()` directly during render, since that would differ from the
 * server's build-time render and break hydration.
 */
export function useNow(intervalMs = DEFAULT_INTERVAL_MS): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
