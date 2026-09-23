import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const claude: Provider = {
  slug: "claude",
  name: "Claude",
  org: "Anthropic",
  tagline: "Claude Opus 5.5 cuts first-party rates to $4/$0.20/$20 per M and adds Azure-hosted Foundry Global and US Data Zone lanes billed through CCUs.",
  intro: [
    "Claude Opus 5.5, introduced September 22, is Anthropic's current Opus flagship: 1M-token context, 128K max output, and $4/$0.20/$20 per M for input, cached input and output, 20% below Opus 5's standard rate. The first-party API also publishes Batch pricing at $2/$0.10/$10 and Fast mode at $8/$0.40/$40. Claude Fable 5.1 remains GA at $10/$0.25/$50, while invite-only Mythos 5.1 shares those prices; Sonnet 5's $2/$0.20/$10 launch rate is permanent.",
    "Opus 5.5 is GA on Azure-hosted Foundry in Global Standard and US Data Zone. Microsoft bills Claude through CCUs, converting token usage at Anthropic's published per-model prices before marketplace discounts; the Foundry Global row therefore uses the exact standard token rates and the US Data Zone row the documented 1.1x uplift. Fable 5.1 and Mythos 5.1 are listed as Anthropic-hosted previews rather than Azure-hosted deployments.",
  ],
  entries: [
    {
      model: "Claude Opus 5.5",
      tier: "Direct",
      inputUsd: 4.0,
      cachedUsd: 0.2,
      outputUsd: 20.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Current Opus flagship. Anthropic includes the full 1M-token context at this rate; Batch is half price and first-party Fast mode is $8/$0.40/$40 per M.",
      sourceNote:
        "Anthropic's Opus 5.5 announcement and official pricing page, captured 2026-09-23: standard rates are $4/M input, $0.20/M cache hits, and $20/M output; the model has a 1M context and 128K max output. Cache writes are $5/M for 5 minutes and $8/M for one hour, outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 2.0,
          cachedUsd: 0.1,
          outputUsd: 10.0,
          confidence: "official",
          sourceNote:
            "Anthropic's pricing page, captured 2026-09-23, publishes Opus 5.5 Batch at $2/M input and $10/M output (50% of Standard). Prompt-cache discounts stack with Batch; the published 0.05x cache-hit factor yields $0.10/M. Batch is a first-party API option, not a Foundry deployment tier.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 8.0,
          cachedUsd: 0.4,
          outputUsd: 40.0,
          confidence: "official",
          sourceNote:
            "Anthropic's pricing page, captured 2026-09-23, publishes first-party Opus 5.5 Fast mode at $8/M input and $40/M output. Fast mode is first-party API only; its 2x input rate and the published 0.05x cache-hit factor yield $0.40/M cached input. The catalog's `priority` service tier maps to Fast mode.",
        },
      ],
    },
    {
      model: "Claude Opus 5.5",
      tier: "Global",
      inputUsd: 4.0,
      cachedUsd: 0.2,
      outputUsd: 20.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted Microsoft Foundry Global Standard. The published long-context offer has the same rates; cache writes are outside this schema. Foundry invoices token-equivalent usage through CCUs.",
      sourceNote:
        "Microsoft's September 22 Foundry Opus 5.5 announcement publishes Global Standard at $4/M input, $0.20/M cache hit, and $20/M output, with the same rates for its long-context offer. Microsoft Learn lists Azure-hosted Opus 5.5 as GA with a 1M context and 128K max output; CCU billing converts usage at Anthropic's per-model rates. Captured 2026-09-23; no per-model token meter is expected in the Azure Retail Prices feed.",
      effectiveDate: "2026-09-22",
    },
    {
      model: "Claude Opus 5.5",
      tier: "DataZone",
      inputUsd: 4.4,
      cachedUsd: 0.22,
      outputUsd: 22.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted US Data Zone Standard. The Foundry launch table lists Global and US Data Zone together without a separate zone price; Anthropic explicitly documents the 1.1x US multiplier used here. The deployment has no per-model Retail Prices token meter because it bills through CCUs.",
      sourceNote:
        "Microsoft Learn lists Azure-hosted Claude Opus 5.5 as GA in US Data Zone Standard; the Foundry launch table combines Global and US Data Zone offers without separate figures. Anthropic's pricing page, captured 2026-09-23, explicitly says Foundry US Data Zone Standard uses the same 1.1x multiplier as `inference_geo: us`; applying that published multiplier to the $4/$0.20/$20 Global rates gives the explicit $4.40/$0.22/$22 per M rates stored here. CCU billing converts token usage at Anthropic's published rates before marketplace discounts.",
      effectiveDate: "2026-09-22",
    },
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
      confidence: "official",
      notes:
        "Azure-hosted Foundry Global Standard, billed via CCU. Microsoft's billing documentation confirms token usage converts at Anthropic's published model rates, so the standard token-equivalent rate is official; private marketplace discounts can change an individual invoice.",
      sourceNote:
        "Microsoft Learn's CCU billing page, captured 2026-09-23, states that Foundry converts token usage using Anthropic's published per-model rates at $0.01 per CCU before any private-offer discount. Anthropic's official pricing page publishes Sonnet 5 at $2/M input, $0.20/M cache hit, and $10/M output and says its scheduled September 1 increase will not occur. Azure invoices aggregate usage under CCUs rather than per-model token meters; the official standard token-equivalent rate is unchanged.",
      effectiveDate: CAPTURED,
    },
    {
      model: "Claude Fable 5.1",
      tier: "Direct",
      inputUsd: 10.0,
      cachedUsd: 0.25,
      outputUsd: 50.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Latest generally available Claude model for demanding reasoning and long-horizon agentic work. Cache reads are priced at $0.25/M, one quarter of the predecessor's cache-read rate.",
      sourceNote:
        "Anthropic's official Claude Fable 5.1 model page and pricing page, read 2026-09-02: $10/M input, $0.25/M cache read and $50/M output, with a 1M-token context and 128K max output. The release notes confirm availability on the Claude API and Microsoft Foundry. Azure's full Foundry Models Retail Prices API sweep on 2026-09-02 has no Anthropic per-token meter, so this is a Direct row rather than a token-priced Foundry row.",
      effectiveDate: "2026-09-01",
    },
    {
      model: "Claude Mythos 5.1",
      tier: "Direct",
      inputUsd: 10.0,
      cachedUsd: 0.25,
      outputUsd: 50.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Invite-only Project Glasswing model. Shares Claude Fable 5.1's specifications and $0.25/M cache-read rate.",
      sourceNote:
        "Anthropic's official Claude pricing and Claude Fable 5.1 model pages, read 2026-09-02: Claude Mythos 5.1 is limited to Project Glasswing participants and shares the published $10/M input, $0.25/M cache read, $50/M output, 1M context and 128K max output. Azure's full Foundry Models Retail Prices API sweep on 2026-09-02 has no Anthropic per-token meter, so this is a Direct row rather than a token-priced Foundry row.",
      effectiveDate: "2026-09-01",
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
        "Anthropic's pricing page now publishes explicit per-model cache hit rates (e.g., $0.25/MTok for Fable/Mythos 5.1, $0.50/MTok for Opus 4.8, $0.20/MTok for Sonnet 5). These replace the earlier multiplier model (~10% of input). Cache writes still follow the 1.25x (5-min) / 2x (1-hour) multiplier pattern relative to base input.",
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
        "Claude usage on Microsoft Foundry is billed in Claude Consumption Units (CCU), replacing the old per-model Azure token meters. Microsoft and Anthropic now document the exact conversion: token usage is rated at Anthropic's published per-model prices, converted at $0.01 per CCU, then adjusted for any private-offer discount. Azure Cost Management shows aggregated CCUs, while standard token-equivalent rates remain official; US Data Zone Standard carries Anthropic's explicit 1.1x multiplier for eligible models.",
      ],
    },
  ],
};
