/**
 * Core data model for llm-spend.
 *
 * Every price on the site is a USD-per-million-tokens number attached to a
 * PricingEntry. CHF is always derived at render time (see currency.ts); we never
 * store CHF. The `confidence` field is a first-class part of the model because a
 * central theme of the site is distinguishing officially published rates from
 * ones derived from billing reconciliation or estimated from a pattern.
 */

export type ProviderSlug =
  | "kimi"
  | "deepseek"
  | "glm"
  | "openai-azure"
  | "claude"
  | "gemini"
  | "xai"
  | "qwen"
  | "mistral"
  | "minimax"
  | "embeddings";

/**
 * Hosting / routing tier a price applies to.
 * - Global      : cloud "Global" routed tier (any datacenter)
 * - DataZone    : region-constrained (US or EU), typically ~10% premium
 * - Regional    : single specific region, most restrictive
 * - Direct      : the model developer's own first-party API (non-cloud-resold)
 */
export type Tier = "Global" | "DataZone" | "Regional" | "Direct";

/**
 * How much to trust a number:
 * - official : taken from an official, published pricing page
 * - derived  : back-calculated from a real billing/cost-management export
 * - estimate : inferred from an established pattern; not yet published
 */
export type Confidence = "official" | "derived" | "estimate";

/**
 * Service tier a rate is quoted for. Absent everywhere means "standard".
 * - standard  : the ordinary synchronous API
 * - batch     : asynchronous batch queue (typically ~50% of standard)
 * - flex      : lower-priority synchronous serving
 * - priority  : premium low-latency serving
 * - highspeed : a provider-specific accelerated lane (Moonshot's naming)
 */
export type ServiceTier = "standard" | "batch" | "flex" | "priority" | "highspeed";

/**
 * A half-open window of UTC hours, `[startHourUtc, endHourUtc)`.
 *
 * Hours are 0-23 as returned by `Date#getUTCHours`; `endHourUtc` may also be 24
 * to mean midnight. A window may wrap midnight (`{ startHourUtc: 22,
 * endHourUtc: 2 }` is 22:00-02:00 UTC). A window whose bounds are equal is
 * empty and never matches.
 */
export interface UtcHourWindow {
  startHourUtc: number;
  endHourUtc: number;
}

/**
 * The conditions under which a rate variant applies. Every field is optional;
 * an omitted field places no constraint. All fields present must hold for the
 * variant to match (they are ANDed).
 */
export interface RateConditions {
  /** ISO 8601 instant this variant starts applying (inclusive). */
  from?: string;
  /** ISO 8601 instant this variant stops applying (exclusive). */
  until?: string;
  /**
   * UTC hour-of-day windows this variant applies in. The variant matches when
   * the current UTC hour falls in any one of them. Used for time-of-day
   * pricing such as DeepSeek's peak/off-peak split.
   */
  utcHourWindows?: UtcHourWindow[];
  /** Prompt-size band in tokens. `minTokens` inclusive, `maxTokens` exclusive. */
  contextBand?: { minTokens?: number; maxTokens?: number };
  /** Service tier this variant is for. Absent means it applies to "standard". */
  serviceTier?: ServiceTier;
}

/**
 * One published rate that applies only under certain conditions: a promo
 * window, a time-of-day band, a context-size band, a service tier.
 *
 * A variant carries its own **explicitly published** numbers. We never store a
 * multiplier and compute a rate at runtime — that would violate the file-level
 * rule in providers.ts that every number traces to an official page. A variant
 * that is a stated multiple of the base rate still gets its arithmetic done by
 * a human, against the source, at authoring time.
 *
 * Provenance travels with the variant: `confidence`, `cachedConfidence` and
 * `sourceNote` fall back to the owning entry's values when omitted, so a
 * variant sourced from a different page can say so.
 */
export interface RateVariant {
  /** Short UI label, e.g. "Off-peak", "Peak", "Batch", "256K-1M". */
  label: string;
  conditions: RateConditions;
  /** USD per 1M input tokens under these conditions. */
  inputUsd: number;
  /** USD per 1M cached input tokens, or null when no cache meter applies. */
  cachedUsd: number | null;
  /** USD per 1M output tokens under these conditions. */
  outputUsd: number;
  /** Defaults to the owning entry's `confidence`. */
  confidence?: Confidence;
  /** Defaults to the owning entry's `cachedConfidence`. */
  cachedConfidence?: Confidence;
  /** Short inline note shown with the variant. */
  notes?: string;
  /** Provenance of this variant's numbers specifically. */
  sourceNote?: string;
}

export interface PricingEntry {
  /** Human model name, e.g. "DeepSeek-V4 Pro". */
  model: string;
  /** Optional hosting note, e.g. "Fireworks-hosted", "Native". */
  host?: string;
  tier: Tier;
  /** USD per 1M input tokens. */
  inputUsd: number;
  /** USD per 1M cached input tokens, or null when no cache meter applies. */
  cachedUsd: number | null;
  /**
   * Confidence for the cached rate specifically, when it differs from the row's
   * overall confidence. The classic case: input/output are officially published
   * but the cache meter is undocumented and its rate was reconciled from a real
   * billing export. When omitted, the cached cell inherits `confidence`.
   */
  cachedConfidence?: Confidence;
  /** USD per 1M output tokens. Use 0 for input-only models (e.g. embeddings). */
  outputUsd: number;
  /** Context window in tokens, if known. */
  contextWindow?: number;
  /** Max output tokens, if known. */
  maxOutput?: number;
  confidence: Confidence;
  /** Short inline note shown with the row. */
  notes?: string;
  /** Provenance of the number (where it came from / how derived). */
  sourceNote?: string;
  /** ISO date the rate was effective / captured. */
  effectiveDate: string;
  /**
   * Conditional rates layered over the flat rate above, for models whose price
   * is not one number forever: promo windows, peak/off-peak hours, context
   * bands, service tiers.
   *
   * The entry stays ONE row (one model, one purchasable lane); the variation is
   * structured sub-data. Order is priority order — the first variant whose
   * conditions match wins. When nothing matches, the flat `inputUsd`/
   * `cachedUsd`/`outputUsd` above are the base rate. See lib/rates.ts.
   */
  variants?: RateVariant[];
}

export interface Provider {
  slug: ProviderSlug;
  /** Display name, e.g. "DeepSeek". */
  name: string;
  /** Parenthetical org, e.g. "Moonshot AI". */
  org?: string;
  /** One-line summary for cards and page headers. */
  tagline: string;
  /** Longer intro paragraph(s) for the provider page. */
  intro: string[];
  entries: PricingEntry[];
  /** Free-form quirk/insight blocks rendered as callouts on the page. */
  quirks?: ProviderQuirk[];
}

export interface ProviderQuirk {
  title: string;
  /** Paragraphs of body text. */
  body: string[];
  /** Visual tone of the callout. */
  tone?: "info" | "warning" | "insight";
}
