import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const claude: Provider = {
  slug: "claude",
  name: "Claude",
  org: "Anthropic",
  tagline: "Claude Opus 5.5 and Sonnet 5.5 are available through first-party and Azure-hosted Foundry lanes billed at Anthropic's token-equivalent rates.",
  intro: [
    "Claude Sonnet 5.5, released September 28, is Anthropic's latest Sonnet model: 1M-token context, 128K max output, and $2/$0.20/$10 per M for input, cached input and output. The first-party Batch API is $1/$0.10/$5. Claude Opus 5.5 remains the current Opus flagship at $4/$0.20/$20 per M, with Batch at $2/$0.10/$10 and first-party Fast mode at $8/$0.40/$40. Claude Fable 5.1 remains GA at $10/$0.25/$50, while invite-only Mythos 5.1 shares those prices; Sonnet 5's $2/$0.20/$10 rate remains current.",
    "Claude Sonnet 5.5 and Opus 5.5 are GA on Azure-hosted Foundry in Global Standard and US Data Zone. Microsoft bills Claude through CCUs, converting token usage at Anthropic's published per-model rates before marketplace discounts; the Foundry Global rows use those standard rates and the US Data Zone rows use the documented 1.1x uplift. Fable 5.1 and Mythos 5.1 are listed as Anthropic-hosted previews rather than Azure-hosted deployments.",
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
      model: "Claude Sonnet 5.5",
      tier: "Direct",
      inputUsd: 2.0,
      cachedUsd: 0.2,
      outputUsd: 10.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Released September 28, 2026. Anthropic publishes $2/$0.20/$10 per M for input/cache-hit/output. Its Batch API halves input and output rates; prompt-cache discounts stack with Batch, making cache hits $0.10/M. Batch is a first-party API option, not a Foundry deployment tier.",
      sourceNote:
        "Anthropic's official Claude Sonnet 5.5 model and pricing pages, captured 2026-09-29, identify the release date as September 28 and publish $2/M input, $0.20/M cache hits, $10/M output, 1M context and 128K max output. Batch halves input and output and stacks with the standard 0.1x cache-hit multiplier, yielding $1/$0.10/$5 per M. The Foundry-only availability is represented by separate Azure-hosted entries below.",
      effectiveDate: "2026-09-28",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 1.0,
          cachedUsd: 0.1,
          outputUsd: 5.0,
          confidence: "official",
          sourceNote:
            "Anthropic's pricing page, captured 2026-09-29, publishes a 50% Batch discount on input and output and says cache multipliers stack with Batch. Applying the published 0.1x Sonnet 5.5 cache-hit multiplier to Batch input gives $0.10/M cached input; this variant applies only to the first-party API.",
        },
      ],
    },
    {
      model: "Claude Sonnet 5.5",
      tier: "Global",
      inputUsd: 2.0,
      cachedUsd: 0.2,
      outputUsd: 10.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted Microsoft Foundry Global Standard, generally available since September 28, 2026. Anthropic's per-model rates are the token-equivalent prices used for Foundry CCU billing.",
      sourceNote:
        "Microsoft's 2026-09-28 Foundry announcement confirms Claude Sonnet 5.5 is generally available and hosted on Azure in Global Standard and US Data Zone. Its price row is mislabeled 'Claude Opus 5.5' while showing $2 input and $10 output; Anthropic's Sonnet 5.5 model and pricing pages publish the exact $2/$0.20/$10 per M input/cache-hit/output rate. Anthropic's Foundry billing documentation says token use is rated at the standard per-model rates and converted to CCUs; no per-model Retail Prices token meter is expected. Captured 2026-09-29.",
      effectiveDate: "2026-09-28",
    },
    {
      model: "Claude Sonnet 5.5",
      tier: "DataZone",
      inputUsd: 2.2,
      cachedUsd: 0.22,
      outputUsd: 11.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted US Data Zone Standard, generally available since September 28, 2026. The 1.1x multiplier applies to input, cached input and output; invoices aggregate the token-equivalent usage through CCUs.",
      sourceNote:
        "Microsoft's 2026-09-28 Foundry announcement confirms Claude Sonnet 5.5 is generally available in US Data Zone. Anthropic's official pricing documentation states that Azure-hosted US Data Zone uses the same 1.1x multiplier as `inference_geo: us` across token pricing categories; applying it to Sonnet 5.5's official $2/$0.20/$10 per M Global rates gives $2.20/$0.22/$11.00. The model bills through CCUs rather than per-model Azure Retail Prices token meters. Captured 2026-09-29.",
      effectiveDate: "2026-09-28",
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
