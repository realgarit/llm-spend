import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const claude: Provider = {
  slug: "claude",
  name: "Claude",
  org: "Anthropic",
  tagline: "1M-token Opus, Sonnet 5's launch pricing now permanent, caching priced as a multiplier, and now natively hosted on Microsoft Foundry with Azure billing.",
  intro: [
    "Claude Opus 5 is now GA and prices identically to Opus 4.8 — both carry a 1M-token window. Sonnet 5 launched in June 2026 at $2/$0.20/$10 per M as introductory pricing through 2026-08-31, with a rise to $3/$0.30/$15 planned for 2026-09-01; Anthropic cancelled that increase on 2026-08-10, so the launch rate is now permanent.",
    "Claude Opus 4.8, Sonnet 5, and Haiku 4.5 are now GA and natively hosted on Microsoft Foundry (Azure-hosted, not just resold). Foundry usage bills through Azure via Claude Consumption Units (CCU), replacing the old per-model Azure token meters.",
  ],
  entries: [
    {
      model: "Claude Opus 5",
      tier: "Direct",
      inputUsd: 5.0,
      cachedUsd: 0.50,
      outputUsd: 25.0,
      contextWindow: 1_000_000,
      confidence: "official",
      notes: "Anthropic's new flagship Opus; prices identically to Opus 4.8 (no launch premium).",
      sourceNote:
        "Verified on Anthropic's official Claude API pricing page on 2026-07-25. Uses the same newer tokenizer as Opus 4.8 (~30% more tokens for the same text vs. pre-4.7 models).",
      effectiveDate: "2026-07-25",
    },
    {
      model: "Claude Opus 4.8 (Standard)",
      tier: "Direct",
      inputUsd: 5.0,
      cachedUsd: 0.50,
      outputUsd: 25.0,
      contextWindow: 1_000_000,
      confidence: "official",
      notes: "Published rate.",
      sourceNote: "Anthropic pricing page now publishes explicit cache-read rates per model.",
      effectiveDate: CAPTURED,
    },
    {
      model: "Claude Sonnet 5",
      tier: "Direct",
      inputUsd: 2.0,
      cachedUsd: 0.20,
      outputUsd: 10.0,
      confidence: "official",
      notes:
        "Launched June 2026 at this rate as introductory pricing through 2026-08-31, with a rise to $3/$0.30/$15 planned for 2026-09-01. Anthropic cancelled that increase on 2026-08-10 and confirmed this rate is now permanent.",
      sourceNote:
        "Anthropic (@claudeai) on X, 2026-08-10 9:03pm: \"We're making Claude Sonnet 5's introductory pricing permanent ... that price will remain unchanged.\" (https://x.com/claudeai/status/2086891169217122586, captured 2026-08-11) — the original announcement. Anthropic's pricing page (platform.claude.com/docs/en/about-claude/pricing) has since caught up: a 2026-08-12 raw-DOM read shows a single Sonnet 5 row ($2/M input, $2.50 5-minute cache write, $4 1-hour cache write, $0.20 cache hit, $10/M output; batch $1/$5) and states verbatim, \"The $2/$10 per million input/output token pricing for Claude Sonnet 5, announced at launch as introductory pricing through August 31, 2026, is now the standard price. The previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 will not occur.\" Cache hit rate explicitly $0.20/MTok.",
      effectiveDate: CAPTURED,
    },
    {
      model: "Claude Sonnet 5",
      tier: "Global",
      inputUsd: 2.0,
      cachedUsd: 0.20,
      outputUsd: 10.0,
      confidence: "estimate",
      notes:
        "Hosted-on-Azure Foundry deployment, billed via CCU. Launched at this rate as introductory pricing through 2026-08-31; Anthropic cancelled the planned 2026-09-01 rise to $3/$0.30/$15 and confirmed this rate is now permanent.",
      sourceNote:
        "Microsoft's CCU billing docs state the CCU price converts Anthropic's own published per-model rates; no Anthropic per-token meter exists in Azure's Retail Prices API, so this stays an estimate. Anthropic (@claudeai) on X, 2026-08-10: introductory pricing made permanent (see the Direct row above for the exact quote and URL) — the original announcement. Anthropic's pricing page (platform.claude.com/docs/en/about-claude/pricing) has since caught up: a 2026-08-12 raw-DOM read confirms the $2/$10 rate is now the standard price and the planned September 1 increase will not occur (see the Direct row above for the verbatim quote), captured 2026-08-12. Cache hit rate inherited from Anthropic's direct pricing ($0.20/MTok).",
      effectiveDate: CAPTURED,
    },
    {
      model: "Claude Fable 5",
      tier: "Direct",
      inputUsd: 10.0,
      cachedUsd: 1.0,
      outputUsd: 50.0,
      confidence: "official",
      notes: "Flagship model — Anthropic's next-gen frontier.",
      sourceNote:
        "Anthropic pricing page now publishes explicit cache-read rates. Cache hit = $1.00/MTok.",
      effectiveDate: CAPTURED,
    },
    {
      model: "Claude Mythos 5",
      tier: "Direct",
      inputUsd: 10.0,
      cachedUsd: 1.0,
      outputUsd: 50.0,
      confidence: "official",
      notes: "Limited availability at launch.",
      sourceNote:
        "Anthropic pricing page now publishes explicit cache-read rates. Cache hit = $1.00/MTok.",
      effectiveDate: CAPTURED,
    },
  ],
  quirks: [
    {
      title: "Cache read rates now explicitly published",
      tone: "info",
      body: [
        "Anthropic's pricing page now publishes explicit per-model cache hit rates (e.g., $0.50/MTok for Opus 4.8, $0.20/MTok for Sonnet 5). These replace the earlier multiplier model (~10% of input). Cache writes still follow the 1.25x (5-min) / 2x (1-hour) multiplier pattern relative to base input.",
      ],
    },
    {
      title: "Sonnet 5's tokenizer can inflate code counts",
      tone: "warning",
      body: [
        "Sonnet 5's new tokenizer can inflate code token counts 1.0-1.35x versus Sonnet 4.6. Same price, more tokens per task on code-heavy work, because the meter runs faster. Measure on your own code before assuming parity.",
      ],
    },
    {
      title: "Foundry billing switched to Claude Consumption Units",
      tone: "info",
      body: [
        "Claude usage on Microsoft Foundry is now billed in Claude Consumption Units (CCU) instead of the old per-model Azure token meters. A single CCU line shows up in Azure Cost Management, but the CCU price is designed to convert Anthropic's own per-token rates, so the effective $/M cost should track the direct-API numbers above rather than introduce an independent markup. Microsoft doesn't publish an exact CCU-to-dollar conversion ratio, so treat the direct rate as the best available proxy.",
      ],
    },
  ],
};
