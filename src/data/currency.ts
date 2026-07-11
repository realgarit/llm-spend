/**
 * Single source of truth for USD -> CHF conversion.
 *
 * All pricing data in this project is stored in USD only. CHF figures shown
 * across the site are computed from this one constant so the whole site can be
 * re-based by changing a single number.
 *
 * Reference rate, not a live FX feed. See the footer disclosure.
 */
export const USD_TO_CHF = 0.805;

/** Convert a USD amount to CHF using the site reference rate. */
export function usdToChf(usd: number): number {
  return usd * USD_TO_CHF;
}

/**
 * Format a per-million-token USD rate. Uses enough precision to keep small
 * rates (e.g. $0.028) legible while not over-showing on round numbers.
 */
export function formatUsd(usd: number): string {
  return `$${trim(usd)}`;
}

/** Format the CHF equivalent of a USD amount. */
export function formatChf(usd: number): string {
  return `CHF ${trim(usdToChf(usd))}`;
}

/** Combined "$1.75 / CHF 1.41" rendering used throughout the site. */
export function formatDual(usd: number): string {
  return `${formatUsd(usd)} / ${formatChf(usd)}`;
}

/**
 * Trim a monetary value to a sensible number of decimals:
 * - >= 1        -> 2 decimals ($5.00, $1.75)
 * - < 1         -> up to 3 decimals, but drop trailing zeros ($0.19, $0.028)
 */
function trim(value: number): string {
  if (value === 0) return "0.00";
  const decimals = value >= 1 ? 2 : 3;
  const fixed = value.toFixed(decimals);
  // Keep at least 2 decimals for readability, drop a needless trailing zero on
  // 3-decimal small values (0.190 -> 0.19) but not (5.00 -> 5).
  if (decimals === 3 && fixed.endsWith("0")) {
    return value.toFixed(2);
  }
  return fixed;
}
