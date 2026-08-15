import type { PricingEntry } from "@/data/types";
import { type RateContext, applicableVariants, nextRateChange, resolveRate } from "@/lib/rates";

/**
 * Pure display helpers for rate-variant rows.
 *
 * Turns a resolver result (`resolveRate` / `nextRateChange`) into the short
 * strings the UI shows next to a variable price: a countdown once a variant
 * regime is under way, or a "begins <date>" announcement while it is still
 * pending. Kept separate from the "use client" rate-cell/variant-strip
 * components so this logic is testable with plain node:test — no DOM, no
 * test-renderer.
 */

const UTC_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Compact "Xh Ym" / "Xd Yh" duration for a countdown, floored (never rounds
 * up) so it never promises more time than is actually left. Negative input
 * clamps to zero.
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "<1m";
}

/**
 * Format a UTC instant for display, always labelled "UTC" — per the
 * resolver's UTC-only rule, an instant like 16:00Z falls on a different
 * calendar day depending on the reader's zone, so a bare date would mislead.
 * The year is shown only when it differs from `referenceNow`'s, and the
 * time-of-day only when it is not exactly UTC midnight, to keep the common
 * cases short (e.g. "16 Aug, 16:00 UTC" vs "1 Sep UTC" vs "1 Jan 2027 UTC").
 */
export function formatUtcInstant(at: Date, referenceNow: Date): string {
  const day = at.getUTCDate();
  const month = UTC_MONTHS[at.getUTCMonth()];
  const year = at.getUTCFullYear();
  const hours = at.getUTCHours();
  const minutes = at.getUTCMinutes();

  let text = `${day} ${month}`;
  if (year !== referenceNow.getUTCFullYear()) text += ` ${year}`;
  if (hours !== 0 || minutes !== 0) {
    text += `, ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return `${text} UTC`;
}

export interface ChangeAnnouncement {
  /**
   * "scheduled": no variant is active yet — the row's conditional pricing has
   * not started, so this announces it by name and instant rather than
   * counting down (a "changes in 743h 12m" countdown to a months-away promo
   * expiry is not a useful thing to tell a reader).
   * "countdown": a variant is active right now; this is when it next flips.
   */
  kind: "scheduled" | "countdown";
  text: string;
}

/**
 * What to show next to a variant row's price for "when does this change".
 *
 * Returns null when nothing is scheduled to change: the row has no variants,
 * or it has already settled on its final one (`nextRateChange` itself
 * returns null in both cases).
 */
export function describeNextChange(entry: PricingEntry, ctx: RateContext): ChangeAnnouncement | null {
  const change = nextRateChange(entry, ctx);
  if (!change) return null;

  const active = resolveRate(entry, ctx).variant;
  if (active !== null) {
    return { kind: "countdown", text: `Changes in ${formatDuration(change.at.getTime() - ctx.now.getTime())}` };
  }

  // Nothing is active yet, so the row's regime hasn't started. Announce every
  // variant that takes effect at that same instant (ignoring hour-of-day) —
  // DeepSeek's Peak and Off-peak both begin at the same instant, so this
  // reads as one regime starting ("Peak / Off-peak begins ...") rather than
  // naming only whichever half happens to be first.
  const incoming = applicableVariants(entry, { ...ctx, now: change.at }).map((v) => v.label);
  const label = incoming.length > 0 ? incoming.join(" / ") : change.label;
  return { kind: "scheduled", text: `${label} begins ${formatUtcInstant(change.at, ctx.now)}` };
}
