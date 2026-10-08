import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const claude: Provider = {
  slug: "claude",
  name: "Claude",
  org: "Anthropic",
  tagline: "Claude Haiku 5.5 adds context-priced Direct and Foundry lanes, and Sonnet 5.5 cache reads are now cheaper.",
  intro: [
    "Claude Haiku 5.5 launched October 7 with a 1M-token context window and 128K max output. Its input, cache-read, and output rates depend on each prompt's length: $0.10/$0.01/$0.50 per M up to 100K tokens and $0.50/$0.05/$2.50 over 100K. The Direct API Batch lane halves input and output. Claude Sonnet 5.5 remains $2/$0.10/$10 per M after its October 7 cache-read price cut; its Batch rates are $1/$0.05/$5. Claude Opus 5.5 remains $4/$0.20/$20, with Batch at $2/$0.10/$10 and first-party Fast mode at $8/$0.40/$40.",
    "Microsoft Foundry offers Claude Haiku 5.5 in Global Standard and US Data Zone Standard and bills Claude through CCUs at Anthropic's published per-model rates. The US Data Zone carries the documented 1.1x multiplier. The compare workload stores monthly input totals rather than per-request prompt length, so Haiku's two prompt-price bands are shown as separate lanes. Foundry does not support the Message Batches API.",
  ],
  entries: [
    {
      model: "Claude Haiku 5.5 Up To 100K Prompt",
      tier: "Direct",
      inputUsd: 0.1,
      cachedUsd: 0.01,
      outputUsd: 0.5,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Applies when an individual prompt is at most 100,000 tokens. Prompt cache-write fees are outside this schema. The separate over-100K lane keeps monthly workload totals from being mistaken for per-prompt size.",
      sourceNote:
        "Anthropic's Claude Haiku 5.5 pricing page, captured 2026-10-08, publishes $0.10/M input, $0.01/M cache reads, and $0.50/M output for prompts up to 100,000 tokens; the model has a 1M context and 128K max output. Five-minute and one-hour cache writes are $0.125/M and $0.20/M, outside this schema. Its 50% Batch discount and cache multiplier are represented in the Direct Batch variant.",
      effectiveDate: "2026-10-07",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 0.05,
          cachedUsd: 0.005,
          outputUsd: 0.25,
          confidence: "official",
          sourceNote:
            "Anthropic's pricing page, captured 2026-10-08, lists Batch at $0.05/M input and $0.25/M output for prompts up to 100,000 tokens. The documented cache-read multiplier is 0.1x and cache multipliers stack with Batch, yielding $0.005/M cached input. Batch is a Direct API feature, not a Foundry deployment tier.",
        },
      ],
    },
    {
      model: "Claude Haiku 5.5 Up To 100K Prompt",
      tier: "Global",
      inputUsd: 0.1,
      cachedUsd: 0.01,
      outputUsd: 0.5,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Microsoft Foundry Global Standard; the model is available Hosted on Azure or Hosted on Anthropic. Usage is billed through CCUs at Anthropic's standard per-model rates.",
      sourceNote:
        "Microsoft Learn's Claude model quota page, captured 2026-10-08, lists claude-haiku-5-5 for Global Standard as both Hosted on Azure and Hosted on Anthropic. Anthropic's Foundry pricing page states that token usage uses the same standard model rates as the Claude API and is converted to CCUs. For prompts up to 100,000 tokens, the official rates are $0.10/M input, $0.01/M cache reads, and $0.50/M output. The full Azure Retail Prices Foundry feed has no Claude, Anthropic, or CCU meter row; no per-model retail token meter is inferred.",
      effectiveDate: "2026-10-07",
    },
    {
      model: "Claude Haiku 5.5 Up To 100K Prompt",
      tier: "DataZone",
      inputUsd: 0.11,
      cachedUsd: 0.011,
      outputUsd: 0.55,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted US Data Zone Standard. Anthropic publishes the 1.1x multiplier for all token categories; this lane applies it to the up-to-100K prompt rates.",
      sourceNote:
        "Microsoft Learn's Claude model quota page, captured 2026-10-08, lists claude-haiku-5-5 as Hosted on Azure in US Data Zone Standard. Anthropic's Foundry pricing page states this deployment uses the same 1.1x US inference multiplier across token categories. Applying it to the published up-to-100K rates of $0.10/$0.01/$0.50 per M yields $0.11/$0.011/$0.55. Foundry invoices Claude usage through CCUs; no per-model Retail Prices token meter is expected.",
      effectiveDate: "2026-10-07",
    },
    {
      model: "Claude Haiku 5.5 Over 100K Prompt",
      tier: "Direct",
      inputUsd: 0.5,
      cachedUsd: 0.05,
      outputUsd: 2.5,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Applies when an individual prompt exceeds 100,000 tokens. Prompt cache-write fees are outside this schema. The separate up-to-100K lane keeps monthly workload totals from being mistaken for per-prompt size.",
      sourceNote:
        "Anthropic's Claude Haiku 5.5 pricing page, captured 2026-10-08, publishes $0.50/M input, $0.05/M cache reads, and $2.50/M output for prompts over 100,000 tokens; the model has a 1M context and 128K max output. Five-minute and one-hour cache writes are $0.625/M and $1/M, outside this schema. Its 50% Batch discount and cache multiplier are represented in the Direct Batch variant.",
      effectiveDate: "2026-10-07",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 0.25,
          cachedUsd: 0.025,
          outputUsd: 1.25,
          confidence: "official",
          sourceNote:
            "Anthropic's pricing page, captured 2026-10-08, lists Batch at $0.25/M input and $1.25/M output for prompts over 100,000 tokens. The documented cache-read multiplier is 0.1x and cache multipliers stack with Batch, yielding $0.025/M cached input. Batch is a Direct API feature, not a Foundry deployment tier.",
        },
      ],
    },
    {
      model: "Claude Haiku 5.5 Over 100K Prompt",
      tier: "Global",
      inputUsd: 0.5,
      cachedUsd: 0.05,
      outputUsd: 2.5,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Microsoft Foundry Global Standard; the model is available Hosted on Azure or Hosted on Anthropic. Usage is billed through CCUs at Anthropic's standard per-model rates.",
      sourceNote:
        "Microsoft Learn's Claude model quota page, captured 2026-10-08, lists claude-haiku-5-5 for Global Standard as both Hosted on Azure and Hosted on Anthropic. Anthropic's Foundry pricing page states that token usage uses the same standard model rates as the Claude API and is converted to CCUs. For prompts over 100,000 tokens, the official rates are $0.50/M input, $0.05/M cache reads, and $2.50/M output. The full Azure Retail Prices Foundry feed has no Claude, Anthropic, or CCU meter row; no per-model retail token meter is inferred.",
      effectiveDate: "2026-10-07",
    },
    {
      model: "Claude Haiku 5.5 Over 100K Prompt",
      tier: "DataZone",
      inputUsd: 0.55,
      cachedUsd: 0.055,
      outputUsd: 2.75,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted US Data Zone Standard. Anthropic publishes the 1.1x multiplier for all token categories; this lane applies it to the over-100K prompt rates.",
      sourceNote:
        "Microsoft Learn's Claude model quota page, captured 2026-10-08, lists claude-haiku-5-5 as Hosted on Azure in US Data Zone Standard. Anthropic's Foundry pricing page states this deployment uses the same 1.1x US inference multiplier across token categories. Applying it to the published over-100K rates of $0.50/$0.05/$2.50 per M yields $0.55/$0.055/$2.75. Foundry invoices Claude usage through CCUs; no per-model Retail Prices token meter is expected.",
      effectiveDate: "2026-10-07",
    },
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
      cachedUsd: 0.1,
      outputUsd: 10.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Released September 28, 2026. Anthropic's October 7 update cuts cache reads to $0.10/M; input/output remain $2/$10 per M. Its Batch API halves input/output and the cache-read multiplier stacks, making Batch cache reads $0.05/M.",
      sourceNote:
        "Anthropic's October 7 release note and current Claude Sonnet 5.5 pricing page, captured 2026-10-08, confirm $2/M input, $0.10/M cache reads (down from $0.20/M), and $10/M output. Cache writes remain $2.50/M for 5 minutes and $4/M for one hour, outside this schema. The Batch API halves input and output; the 0.05x cache-read multiplier stacks with Batch to yield $1/$0.05/$5 per M.",
      effectiveDate: "2026-10-07",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 1.0,
          cachedUsd: 0.05,
          outputUsd: 5.0,
          confidence: "official",
          sourceNote:
            "Anthropic's pricing page, captured 2026-10-08, publishes Sonnet 5.5 Batch at $1/M input and $5/M output and a $0.10/M standard cache-read price. Its cache-read multiplier is 0.05x and cache multipliers stack with Batch, yielding $0.05/M cached input; this variant applies only to the first-party API.",
        },
      ],
    },
    {
      model: "Claude Sonnet 5.5",
      tier: "Global",
      inputUsd: 2.0,
      cachedUsd: 0.1,
      outputUsd: 10.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Microsoft Foundry Global Standard, generally available since September 28, 2026. The October 7 cache-read update lowers its token-equivalent rate to $0.10/M; usage is billed through CCUs.",
      sourceNote:
        "Anthropic's October 7 release note and current Sonnet 5.5 pricing page, captured 2026-10-08, confirm $2/M input, $0.10/M cache reads, and $10/M output. Anthropic states that Microsoft Foundry token usage is rated at standard per-model API prices and converted to CCUs; no per-model Retail Prices token meter is expected. Captured 2026-10-08.",
      effectiveDate: "2026-10-07",
    },
    {
      model: "Claude Sonnet 5.5",
      tier: "DataZone",
      inputUsd: 2.2,
      cachedUsd: 0.11,
      outputUsd: 11.0,
      contextWindow: 1_000_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Azure-hosted US Data Zone Standard, generally available since September 28, 2026. The 1.1x multiplier applies to input, cached input and output; the current token-equivalent cache-read rate is $0.11/M and invoices aggregate usage through CCUs.",
      sourceNote:
        "Microsoft Learn lists Claude Sonnet 5.5 Hosted on Azure in US Data Zone Standard. Anthropic's October 7 release note and current pricing page, captured 2026-10-08, set Global rates at $2/$0.10/$10 per M; its Foundry pricing documentation applies the same 1.1x multiplier to US Data Zone token categories, giving $2.20/$0.11/$11.00. The model is billed through CCUs rather than per-model Azure Retail Prices token meters. Anthropic's Foundry guide currently says Sonnet 5.5 supports Global only, while Microsoft Learn still lists US Data Zone; this deployment-availability discrepancy remains under review.",
      effectiveDate: "2026-10-07",
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
