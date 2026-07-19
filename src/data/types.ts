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
