import { providers } from "../data/providers";
import { rateRange } from "./rates";

/**
 * Pulled out of page.tsx so it is unit-testable as a plain function (see
 * from-price.test.ts) instead of only reachable by rendering the homepage —
 * same rationale as the pure functions in compare-sort.ts / scenario.ts.
 *
 * The cheapest input rate a provider can currently be billed: the minimum,
 * across every one of its rows, of `rateRange`'s `minInputUsd` under `now`.
 *
 * Deliberately resolves through `rateRange` rather than reading a row's flat
 * `inputUsd` field directly (the bug this replaces) or using `resolveRate`:
 *
 * - `rateRange` is built on `applicableVariants`, which waives
 *   `utcHourWindows` (see rates.ts), so this "from" price does not depend on
 *   what hour a static build happens to run at. `resolveRate` would bake in
 *   whichever half of an hour-scoped pair — DeepSeek Direct's Peak/Off-peak
 *   split, live since 2026-08-16T16:00Z — happened to be in force at build
 *   time.
 * - A row's flat `inputUsd` is only its base rate; once an always-active
 *   variant supersedes it (as DeepSeek Direct's did at that same instant), the
 *   flat field is a rate no hour actually charges any more. Reading it
 *   directly is exactly the bug this function fixes.
 * - `now` alone carries no `serviceTier`, so a batch/priority/highspeed-scoped
 *   variant never leaks into this standard-tier figure. Date windows still
 *   gate normally, so a scheduled reversion (Gemini's 2027-01-01 revert,
 *   Qwen's 2026-09-01 revert) takes effect on schedule instead of the
 *   from-price silently going stale forever.
 */
export function fromPrice(slug: string, now: Date): number {
  const p = providers.find((x) => x.slug === slug)!;
  return Math.min(...p.entries.map((e) => rateRange(e, { now }).minInputUsd));
}
