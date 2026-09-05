/** The UTC day of the repository's most recent full catalog audit. */
export const CATALOG_VERIFIED_AT = "2026-09-05T00:00:00Z";

/** Age bands used to communicate catalog freshness without implying live data. */
export const FRESHNESS_THRESHOLDS_DAYS = {
  currentMax: 7,
  reviewDueMax: 30,
} as const;
