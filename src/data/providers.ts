import type { Provider } from "./types";

/**
 * All pricing data for the site.
 *
 * Rules for editing this file:
 * - Store USD per 1M tokens only. Never store CHF (it is derived at render time).
 * - Do not invent numbers. Every rate traces to the handoff / an official page /
 *   a billing reconciliation. Put provenance in `sourceNote`.
 * - Mark anything not on an official pricing page as `derived` or `estimate`.
 *   Use `cachedConfidence` when only the cache rate is uncertain.
 * - `effectiveDate` is ISO (YYYY-MM-DD): the date the rate was captured or takes
 *   effect. See README > "Adding a model entry".
 */

const CAPTURED = "2026-07-11";

export const providers: Provider[] = [
  {
    slug: "kimi",
    name: "Kimi",
    org: "Moonshot AI",
    tagline: "Kimi K3 is a 1M-context direct API flagship; earlier K2 models are resold on Microsoft Foundry across tiers.",
    intro: [
      "Kimi K3 is available directly from Moonshot's API for long-horizon coding and knowledge work. Earlier K2 models are resold on Microsoft Foundry at Global and Data Zone tiers, plus a Fireworks-hosted listing. These chat models are generation-only, so pair them with an embeddings model for retrieval.",
    ],
    entries: [
      {
        model: "Kimi K3",
        host: "Kimi direct API",
        tier: "Direct",
        inputUsd: 3.0,
        cachedUsd: 0.3,
        outputUsd: 15.0,
        contextWindow: 1_000_000,
        confidence: "official",
        notes: "Flagship long-horizon coding and knowledge-work model; max reasoning effort at launch.",
        sourceNote: "Moonshot's official Kimi K3 API pricing: $3/M cache-miss input, $0.30/M cache-hit input, and $15/M output.",
        effectiveDate: "2026-07-17",
      },
      {
        model: "Kimi K2.6",
        tier: "Global",
        inputUsd: 0.95,
        cachedUsd: 0.16,
        cachedConfidence: "official",
        outputUsd: 4.0,
        confidence: "official",
        notes: "Native Global tier; cached input now officially metered.",
        sourceNote:
          "Input $0.95/M and output $4.00/M official. Azure Retail Prices API 'K2.6 cached glbl' meter now publishes cached input at $0.00016/1K ($0.16/M), effective 2026-07-01, captured 2026-07-23 — replacing the earlier ~$0.19/M billing-reconciled estimate.",
        effectiveDate: "2026-07-23",
      },
      {
        model: "Kimi K2.7 Code",
        tier: "Global",
        inputUsd: 0.95,
        cachedUsd: 0.19,
        outputUsd: 4.0,
        confidence: "official",
        notes: "Cached rate officially published for this tier.",
        sourceNote: "Official page (input, cached, and output all listed).",
        effectiveDate: CAPTURED,
      },
      {
        model: "Kimi K2.5 Thinking",
        tier: "Global",
        inputUsd: 0.6,
        cachedUsd: 0.1,
        outputUsd: 3.0,
        confidence: "official",
        notes: "Cached input now officially metered.",
        sourceNote:
          "Input $0.60/M and output $3.00/M official. Azure Retail Prices API 'K2.5 cached glbl' meter publishes cached input at $0.0001/1K ($0.10/M), effective 2026-07-01, captured 2026-07-23.",
        effectiveDate: "2026-07-23",
      },
      {
        model: "Kimi K2.6",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.045,
        cachedUsd: 0.176,
        outputUsd: 4.4,
        confidence: "official",
        notes: "Third-party Fireworks-hosted listing with a published cached column.",
        sourceNote: "Fireworks live pricing page.",
        effectiveDate: CAPTURED,
      },
    ],
    quirks: [
      {
        title: "The cache meter the pricing page omitted — now published",
        tone: "info",
        body: [
          "Microsoft Foundry's public page long showed no cached column for the K2.6 Global listing, so the rate was back-solved from a Cost Management export at ~$0.19 / CHF 0.15 per M (about 81% hit rate). As of 2026-07-01 Azure's Retail Prices API publishes a dedicated 'K2.6 cached glbl' meter at $0.16 / CHF 0.13 per M, so the catalog now carries the official figure instead of the reconciled estimate.",
        ],
      },
      {
        title: "Data Zone premium via Fireworks",
        tone: "info",
        body: [
          "The Fireworks-hosted K2.6 Data Zone listing ($1.045 / CHF 0.84 input) sits above the native Global tier ($0.95 / CHF 0.77).",
        ],
      },
    ],
  },

  {
    slug: "deepseek",
    name: "DeepSeek",
    tagline: "1M-token context, cheap direct pricing, and Microsoft Foundry resale markups from ~10% to a reported 4.5x.",
    intro: [
      "DeepSeek V4 Pro and V4 Flash ship real 1M-token windows (max output up to 384K). Pricing is a resale case study: the direct API is cheap, Microsoft Foundry resells it at a markup, and some Foundry tiers bill a cache meter the public page hides. Numbers below.",
    ],
    entries: [
      {
        model: "DeepSeek-V4 Pro",
        tier: "Global",
        inputUsd: 1.74,
        cachedUsd: 0.145,
        outputUsd: 3.48,
        contextWindow: 1_000_000,
        maxOutput: 384_000,
        confidence: "official",
        notes: "1M context. Cache meter is published in Azure's retail catalog.",
        sourceNote:
          "Azure retail catalog: $1.74/M input, $0.145/M cached input, and $3.48/M output.",
        effectiveDate: CAPTURED,
      },
      {
        model: "DeepSeek-V4 Flash",
        tier: "Global",
        inputUsd: 0.19,
        cachedUsd: 0.028,
        outputUsd: 0.51,
        contextWindow: 1_000_000,
        maxOutput: 384_000,
        confidence: "official",
        notes: "1M context. Cache meter is published in Azure's retail catalog.",
        sourceNote:
          "Azure retail catalog: $0.19/M input, $0.028/M cached input, and $0.51/M output.",
        effectiveDate: CAPTURED,
      },
      {
        model: "DeepSeek-V4 Pro",
        host: "DeepSeek direct API",
        tier: "Direct",
        inputUsd: 0.435,
        cachedUsd: 0.003625,
        outputUsd: 0.87,
        contextWindow: 1_000_000,
        confidence: "official",
        notes: "First-party published cache-hit, cache-miss, and output rates after the 75% direct price cut.",
        sourceNote: "DeepSeek's own direct (non-cloud-resold) API pricing, including the published cached-input rate.",
        effectiveDate: CAPTURED,
      },
      {
        model: "DeepSeek-V4 Flash",
        host: "DeepSeek direct API",
        tier: "Direct",
        inputUsd: 0.14,
        cachedUsd: 0.0028,
        outputUsd: 0.28,
        contextWindow: 1_000_000,
        confidence: "official",
        notes: "First-party published cache-hit, cache-miss, and output rates.",
        sourceNote: "DeepSeek's own direct API pricing, including the published cached-input rate.",
        effectiveDate: CAPTURED,
      },
      {
        model: "DeepSeek-V4 Pro",
        host: "Fireworks direct API",
        tier: "Direct",
        inputUsd: 1.74,
        cachedUsd: null,
        outputUsd: 3.48,
        confidence: "official",
        notes: "Third-party inference provider's direct rate.",
        sourceNote: "Fireworks direct API pricing.",
        effectiveDate: CAPTURED,
      },
      {
        model: "DeepSeek-V4 Pro",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.925,
        cachedUsd: 0.165,
        outputUsd: 3.828,
        confidence: "official",
        notes: "~10% above the Fireworks direct rate: the Data Zone premium.",
        sourceNote: "Fireworks official live pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "DeepSeek V3",
        tier: "Global",
        inputUsd: 1.14,
        cachedUsd: null,
        outputUsd: 4.56,
        confidence: "official",
        sourceNote: "Official pricing page.",
        effectiveDate: CAPTURED,
      },
    ],
    quirks: [
      {
        title: "Resale markup: ~10% to a reported 4.5x",
        tone: "insight",
        body: [
          "Direct V4 Pro is $0.435 / CHF 0.35 input. A \"Global\" Microsoft Foundry V4 Pro has been reported at about 4.5x that, the widest markup here. The Fireworks Data Zone listing ($1.925 / CHF 1.55) is a milder ~10% over Fireworks direct ($1.74 / CHF 1.40).",
        ],
      },
      {
        title: "Azure cache meters are publicly priced",
        tone: "warning",
        body: [
          "The Azure pricing summary does not show a cached-input column, but Azure's retail catalog lists one for both Global models: $0.145 / CHF 0.12 per M for V4 Pro (~91.7% off) and $0.028 / CHF 0.02 for V4 Flash (~85% off). Billing exports reconcile to those published meters.",
        ],
      },
      {
        title: "1M context is a real autonomy lever",
        tone: "info",
        body: [
          "V4 Pro and V4 Flash carry 1M-token windows (max output up to 384K). Bigger windows mean less forced compaction, so less babysitting.",
        ],
      },
      {
        title: "No first-party embedding model",
        tone: "info",
        body: [
          "The chat models are generation-only. A separate deepseek-embedding-v2 (768-dim) exists, but for code RAG the Embeddings page recommends Cohere embed-v4.",
        ],
      },
    ],
  },

  {
    slug: "glm",
    name: "GLM",
    org: "Zhipu / Z.ai",
    tagline: "GLM-5.2 adds a 1M-token window and now has its own officially published Foundry Data Zone rate, including $0.15/M cached input.",
    intro: [
      "GLM-5.2 lifts the window to a real 1M tokens (up 5x from 5.1's 200K), with 131K max output, the practical win for agentic coding. Input and output match 5.1's Data Zone rate, but Azure now publishes a dedicated 5.2 cached-input meter at $0.15/M, well below 5.1's $0.286/M (see below).",
    ],
    entries: [
      {
        model: "GLM 5.1",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.54,
        cachedUsd: 0.286,
        outputUsd: 4.84,
        contextWindow: 200_000,
        confidence: "official",
        sourceNote: "Fireworks official live pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GLM 5.2",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.54,
        cachedUsd: 0.15,
        outputUsd: 4.84,
        contextWindow: 1_000_000,
        maxOutput: 131_000,
        confidence: "official",
        notes: "Cached input is officially published at $0.15/M, ~48% below GLM 5.1's $0.286/M.",
        sourceNote:
          "Azure Retail Prices API 'FW GLM 5.2' meters, captured 2026-07-22 (effective 2026-07-01): input $0.00154/1K, output $0.00484/1K, cached input $0.00015/1K, uniform across regions. Earlier estimate (equal to GLM 5.1) was right on input/output but high on cache.",
        effectiveDate: "2026-07-01",
      },
      {
        model: "GLM-5.1",
        host: "Fireworks direct API",
        tier: "Direct",
        inputUsd: 1.4,
        cachedUsd: null,
        outputUsd: 4.4,
        contextWindow: 200_000,
        confidence: "official",
        sourceNote: "Fireworks direct API pricing.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GLM-5.2",
        host: "Fireworks direct API",
        tier: "Direct",
        inputUsd: 1.4,
        cachedUsd: null,
        outputUsd: 4.4,
        contextWindow: 1_000_000,
        maxOutput: 131_000,
        confidence: "official",
        notes: "Identical direct rate to GLM-5.1.",
        sourceNote: "Fireworks direct API pricing (5.1 and 5.2 priced identically).",
        effectiveDate: CAPTURED,
      },
    ],
    quirks: [
      {
        title: "5.2 Data Zone: an estimate that held up",
        tone: "insight",
        body: [
          "The unlisted GLM-5.2 Data Zone rate was set equal to GLM-5.1's ($1.54 / CHF 1.24 input, $0.286 / CHF 0.23 cached, $4.84 / CHF 3.90 output). Real invoices later matched almost exactly. A well-reasoned estimate, flagged as such, can hold until an official number lands.",
        ],
      },
      {
        title: "1M context window on 5.2",
        tone: "info",
        body: [
          "GLM-5.2's 1M-token window (up from 200K on 5.1) puts it in the same autonomy tier as DeepSeek V4 for long runs.",
        ],
      },
    ],
  },

  {
    slug: "openai-azure",
    name: "OpenAI / Azure OpenAI",
    tagline: "Azure resells OpenAI 1:1 with no markup. The catch is deployment type and Responses-API-only variants.",
    intro: [
      "Azure OpenAI matches OpenAI's direct pricing 1:1, so no resale markup. What changes is the deployment type on Microsoft Foundry (Global, Data Zone, Regional; see below). GPT-5.6 (Sol / Terra / Luna) hit GA on 2026-07-09 and now has official Azure Foundry meters confirming the 1:1 pattern, including cached-input and cache-write meters plus Data Zone (+10%) and long-context tiers.",
    ],
    entries: [
      {
        model: "GPT-5.6 Sol",
        tier: "Global",
        inputUsd: 5.0,
        cachedUsd: 0.5,
        outputUsd: 30.0,
        confidence: "official",
        notes: "Flagship (hardest reasoning / coding / agentic). GA 2026-07-09. Matches OpenAI's direct rate 1:1.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 sol Std Gl, effective 2026-07-01; captured 2026-07-21). Cache write bills at 1.25x uncached input ($6.25/M meter); reads stay ~90% off.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.6 Sol",
        tier: "DataZone",
        inputUsd: 5.5,
        cachedUsd: 0.55,
        outputUsd: 33.0,
        confidence: "official",
        notes: "~10% Data Zone premium over Global.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 sol Std DZ, effective 2026-07-01; captured 2026-07-21).",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.6 Sol Long Context",
        tier: "Global",
        inputUsd: 10.0,
        cachedUsd: 1.0,
        outputUsd: 45.0,
        confidence: "official",
        notes: "Long Context tier; all meters roughly double the short-context rates.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 sol LongCo Std Gl, effective 2026-07-01; captured 2026-07-21).",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.6 Terra",
        tier: "Global",
        inputUsd: 2.5,
        cachedUsd: 0.25,
        outputUsd: 15.0,
        confidence: "official",
        notes: "Balanced production tier. GA 2026-07-09. Matches OpenAI's direct rate 1:1.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 terra Std Gl, effective 2026-07-01; captured 2026-07-21). Data Zone +10% and long-context ($5/$0.50/$22.50) meters also published.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.6 Luna",
        tier: "Global",
        inputUsd: 1.0,
        cachedUsd: 0.1,
        outputUsd: 6.0,
        confidence: "official",
        notes: "Fast / cheap, high-volume. GA 2026-07-09. Matches OpenAI's direct rate 1:1.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 luna Std Gl, effective 2026-07-01; captured 2026-07-21). Data Zone +10% and long-context ($2/$0.20/$9) meters also published.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.5",
        tier: "Global",
        inputUsd: 5.0,
        cachedUsd: 0.5,
        outputUsd: 30.0,
        confidence: "official",
        sourceNote: "Azure OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.5",
        tier: "DataZone",
        inputUsd: 5.5,
        cachedUsd: 0.55,
        outputUsd: 33.0,
        confidence: "official",
        notes: "~10% Data Zone premium over Global.",
        sourceNote: "Azure OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.5 Long Context",
        tier: "Global",
        inputUsd: 10.0,
        cachedUsd: 1.0,
        outputUsd: 45.0,
        confidence: "official",
        notes: "Long Context tier.",
        sourceNote: "Azure OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.3 Codex / Chat",
        tier: "Global",
        inputUsd: 1.75,
        cachedUsd: 0.18,
        outputUsd: 14.0,
        confidence: "official",
        notes: "The -codex variant is Responses-API only.",
        sourceNote: "Azure OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.2 / Codex",
        tier: "Global",
        inputUsd: 1.75,
        cachedUsd: 0.18,
        outputUsd: 14.0,
        confidence: "official",
        notes: "The -codex variant is Responses-API only.",
        sourceNote: "Azure OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.2 / Codex",
        tier: "DataZone",
        inputUsd: 1.93,
        cachedUsd: 0.2,
        outputUsd: 15.4,
        confidence: "official",
        sourceNote: "Azure OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
    ],
    quirks: [
      {
        title: "Deployment types: Global vs Data Zone vs Regional",
        tone: "info",
        body: [
          "Global routes to any datacenter: cheapest, highest throughput. Data Zone pins routing to US or EU and adds ~10%. Regional pins to one region and is the most restrictive and priciest. Pick Global unless data residency forces otherwise. The premium buys geography, not capability.",
        ],
      },
      {
        title: "-codex variants are Responses-API only",
        tone: "warning",
        body: [
          "GPT-5.3-Codex, GPT-5.2-Codex and other \"-codex\" variants only support the Responses API (/v1/responses), not Chat Completions. Clients that default to Chat Completions fail with a 400 \"unsupported operation\" until reconfigured.",
        ],
      },
      {
        title: "GPT-5.6 cache-write billing changed",
        tone: "warning",
        body: [
          "GPT-5.6 bills cache writes at 1.25x the uncached input rate (was the standard input rate). Reads stay ~90% off. Factor the write premium into high-churn prompts.",
        ],
      },
      {
        title: "Benchmark leader, real-world laggard",
        tone: "insight",
        body: [
          "GPT-5.3-Codex tops coding benchmarks but can lag in real agentic use, with poor context retention, versus DeepSeek V4 Pro and GLM-5.2. Likely a smaller window and less mature Responses-API support in some clients.",
        ],
      },
    ],
  },

  {
    slug: "claude",
    name: "Claude",
    org: "Anthropic",
    tagline: "1M-token Opus, intro pricing through August, caching priced as a multiplier, and now natively hosted on Microsoft Foundry with Azure billing.",
    intro: [
      "Opus 4.8 has a 1M-token window. Intro pricing runs through 2026-08-31 for Sonnet 5; standard rate starts 2026-09-01.",
      "Claude Opus 4.8, Sonnet 5, and Haiku 4.5 are now GA and natively hosted on Microsoft Foundry (Azure-hosted, not just resold). Foundry usage bills through Azure via Claude Consumption Units (CCU), replacing the old per-model Azure token meters.",
    ],
    entries: [
      {
        model: "Claude Opus 4.8 (Standard)",
        tier: "Direct",
        inputUsd: 5.0,
        cachedUsd: 0.50,
        outputUsd: 25.0,
        contextWindow: 1_000_000,
        confidence: "official",
        notes: "Published rate (no separate intro tier — only Sonnet 5 has intro pricing).",
        sourceNote: "Anthropic pricing page now publishes explicit cache-read rates per model.",
        effectiveDate: CAPTURED,
      },
      {
        model: "Claude Sonnet 5 (Intro)",
        tier: "Direct",
        inputUsd: 2.0,
        cachedUsd: 0.20,
        outputUsd: 10.0,
        confidence: "official",
        notes: "Introductory pricing through 2026-08-31.",
        sourceNote: "Anthropic promotional pricing window. Cache hit rate explicitly $0.20/MTok.",
        effectiveDate: CAPTURED,
      },
      {
        model: "Claude Sonnet 5 (Standard)",
        tier: "Direct",
        inputUsd: 3.0,
        cachedUsd: 0.30,
        outputUsd: 15.0,
        confidence: "official",
        notes: "Standard rate from 2026-09-01.",
        sourceNote: "Anthropic pricing page. Cache hit rate explicitly $0.30/MTok. New tokenizer can inflate code token counts 1.0-1.35x vs Sonnet 4.6.",
        effectiveDate: "2026-09-01",
      },
      {
        model: "Claude Sonnet 5 (Foundry, Intro)",
        tier: "Global",
        inputUsd: 2.0,
        cachedUsd: 0.20,
        outputUsd: 10.0,
        confidence: "estimate",
        notes: "Hosted-on-Azure Foundry deployment, billed via CCU. Promo runs through 2026-08-31.",
        sourceNote:
          "Microsoft's CCU billing docs state the CCU price converts Anthropic's own published per-model rates. Cache hit rate inherited from Anthropic's direct pricing ($0.20/MTok).",
        effectiveDate: CAPTURED,
      },
      {
        model: "Claude Sonnet 5 (Foundry, Standard)",
        tier: "Global",
        inputUsd: 3.0,
        cachedUsd: 0.30,
        outputUsd: 15.0,
        confidence: "estimate",
        notes: "Hosted-on-Azure Foundry deployment, billed via CCU. Standard rate from 2026-09-01.",
        sourceNote:
          "CCU price converts Anthropic's per-model rates. Cache hit rate inherited from Anthropic's direct pricing ($0.30/MTok).",
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
          "Anthropic's pricing page now publishes explicit per-model cache hit rates (e.g., $0.50/MTok for Opus 4.8, $0.20/MTok for Sonnet 5 intro). These replace the earlier multiplier model (~10% of input). Cache writes still follow the 1.25x (5-min) / 2x (1-hour) multiplier pattern relative to base input.",
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
  },

  {
    slug: "gemini",
    name: "Gemini",
    org: "Google",
    tagline: "Gemini 3.6 Flash headlines the catalog's low-cost coding and agentic lane, succeeding 3.5 Flash at a lower output price.",
    intro: [
      "Gemini 3.6 Flash is now the catalog's headline Gemini option for lower-cost coding and agentic workloads, replacing 3.5 Flash as the primary pick at the same input price and a lower output rate. 3.5 Flash remains listed for comparison.",
    ],
    entries: [
      {
        model: "Gemini 3.6 Flash",
        tier: "Global",
        inputUsd: 1.5,
        cachedUsd: 0.15,
        outputUsd: 7.5,
        confidence: "official",
        notes: "Succeeds 3.5 Flash at the same input price with ~17% cheaper output.",
        sourceNote:
          "Google pricing page (last updated 2026-07-21 UTC, captured 2026-07-22). Also bills a separate cache-storage dimension at $1.00 per 1M tokens per hour, not modeled by this schema.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "Gemini 3.5 Flash",
        tier: "Global",
        inputUsd: 1.5,
        cachedUsd: 0.15,
        outputUsd: 9.0,
        confidence: "official",
        notes: "~25% cheaper than 3.1 Pro; beats it on coding/agentic benchmarks.",
        sourceNote:
          "Google pricing page. Cached-input rate now published on the same page (captured 2026-07-22).",
        effectiveDate: "2026-07-21",
      },
    ],
  },

  {
    slug: "xai",
    name: "Grok",
    org: "xAI",
    tagline: "Grok 4.5 is direct-API only for now; Microsoft Foundry resells the 4.x line up to Grok-4.3, which now carries a published cache meter.",
    intro: [
      "xAI's flagship Grok 4.5 (500K context, configurable reasoning) currently ships only on xAI's own API. Microsoft Foundry hosts the older Grok line as serverless listings — currently topping out at Grok-4.3 Global — with published input/output rates and, as of the 2026-07-23 recheck, a published cached-input meter on Grok-4.3 ($0.20/M).",
    ],
    entries: [
      {
        model: "Grok 4.5",
        host: "xAI direct API",
        tier: "Direct",
        inputUsd: 2.0,
        cachedUsd: 0.3,
        outputUsd: 6.0,
        contextWindow: 500_000,
        confidence: "official",
        notes: "Flagship. All rates double for requests with ≥200K prompt tokens ($4 input / $12 output).",
        sourceNote:
          "xAI's official Grok 4.5 model page: $2/M input, $0.30/M cached input, $6/M output, and 500K context; captured 2026-07-21.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "Grok-4.3",
        tier: "Global",
        inputUsd: 1.25,
        cachedUsd: 0.2,
        outputUsd: 2.5,
        confidence: "official",
        notes: "Newest Grok on Foundry; cached-input meter now published. Long-context (≥200K prompt) meters bill at 2x, including cached input at $0.40/M.",
        sourceNote:
          "Input $1.25/M and output $2.50/M from the Foundry Models pricing page. Cached input from the Azure Retail Prices API meter named bare '4.3' — a 'grok' meterName search misses it — 'Cached Inp Glbl' at $0.0002/1K ($0.20/M), effective 2026-05-01, captured 2026-07-23; matches xAI's direct Grok 4.3 docs. Long-context 'L' meters exist at 2x ($2.50 in / $5.00 out / $0.40 cached).",
        effectiveDate: "2026-07-23",
      },
      {
        model: "Grok 4.1 Fast",
        tier: "Global",
        inputUsd: 0.2,
        cachedUsd: null,
        outputUsd: 0.5,
        confidence: "official",
        notes: "Cheap fast tier on Foundry.",
        sourceNote: "Microsoft Foundry Models pricing page (Grok tab), captured 2026-07-19.",
        effectiveDate: "2026-07-19",
      },
    ],
    quirks: [
      {
        title: "Grok 4.5 is not on Foundry yet",
        tone: "warning",
        body: [
          "As of 2026-07-19 the Foundry Grok lineup stops at Grok-4.3 Global ($1.25 / CHF 1.01 input, $2.50 / CHF 2.01 output). To run Grok 4.5 you must bill through xAI directly. Watch the Foundry Grok pricing page for a 4.5 listing before assuming Azure availability.",
        ],
      },
      {
        title: "Grok-4.3 now has a Foundry cache meter",
        tone: "info",
        body: [
          "The Azure Retail Prices API now publishes a cached-input meter for Grok-4.3 at $0.20 / CHF 0.16 per M (effective 2026-05-01, surfaced on the 2026-07-23 recheck), matching xAI's direct Grok 4.3 cache rate. The meter is named bare '4.3', so a 'grok' search misses it. Grok 4.1 Fast still shows no cached column on Foundry.",
        ],
      },
      {
        title: "Long-context surcharge on the direct API",
        tone: "warning",
        body: [
          "On xAI's API, requests at or above 200K prompt tokens double every meter: $4 / CHF 3.22 input and $12 / CHF 9.66 output per M. The 500K window is usable, but the second half of it bills at 2x.",
        ],
      },
    ],
  },

  {
    slug: "qwen",
    name: "Qwen",
    org: "Alibaba",
    tagline: "Qwen3.7 flagships under limited-time promo rates, an officially documented cache rule — but on Microsoft Foundry it's GPU-hour managed compute only, no per-token meter.",
    intro: [
      "Alibaba's current flagships are the Qwen3.7 family (Max and Plus), currently sold at limited-time promotional discounts with no published end date; the Qwen 3.6 line (Plus, Flash, Max preview) remains listed at stable rates. All prices are Alibaba Cloud Model Studio's International (Singapore) endpoint. On Microsoft Foundry, Qwen models are available only as Managed Compute — dedicated GPU-hour billing ($4–8 per compute hour) with no serverless per-token listing, so there is no Foundry token rate to compare.",
    ],
    entries: [
      {
        model: "Qwen3.7 Max (Promo)",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 1.25,
        cachedUsd: 0.125,
        cachedConfidence: "derived",
        outputUsd: 3.75,
        contextWindow: 1_000_000,
        confidence: "official",
        notes:
          "Current flagship. Effective rate under a limited-time 50% discount (list $2.50/M in, $7.50/M out); no promo end date published. Single price tier across the full 1M window; thinking and non-thinking modes priced the same.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-07-20: list $2.5/$7.5 marked 'Limited-time 50% off'. Cached input derived as 10% of effective input per the official context-cache rule (explicit cache hits).",
        effectiveDate: "2026-07-20",
      },
      {
        model: "Qwen3.7 Plus (Promo)",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 0.32,
        cachedUsd: 0.032,
        cachedConfidence: "derived",
        outputUsd: 1.28,
        contextWindow: 1_000_000,
        confidence: "official",
        notes:
          "Effective rate under a limited-time 20% discount (list $0.40/$1.60); no promo end date published. Rates shown are ≤256K prompt tokens; 256K–1M bills $0.96/$3.84 effective ($1.20/$4.80 list). Thinking and non-thinking output priced the same.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-07-20: list prices marked 'Limited-time 20% off'. Cached input derived as 10% of effective input per the official context-cache rule.",
        effectiveDate: "2026-07-20",
      },
      {
        model: "Qwen3.6 Plus",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 0.5,
        cachedUsd: 0.05,
        cachedConfidence: "derived",
        outputUsd: 3.0,
        contextWindow: 1_000_000,
        confidence: "official",
        notes: "Tiered: rates shown are ≤256K prompt tokens; 256K-1M bills $2/M input, $6/M output.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint. Cached input derived as 10% of input per the official context-cache doc (explicit hits 10%, creation 125%, implicit hits 20%), which lists this model as supported.",
        effectiveDate: "2026-07-19",
      },
      {
        model: "Qwen3.6 Flash",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 0.25,
        cachedUsd: 0.025,
        cachedConfidence: "derived",
        outputUsd: 1.5,
        confidence: "official",
        notes: "Cheap tier; 50% batch-inference discount also published.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint (≤256K tier). Cached input derived as 10% of input per the official context-cache doc, which lists this model as supported.",
        effectiveDate: "2026-07-19",
      },
      {
        model: "Qwen3.6 Max Preview",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 1.3,
        cachedUsd: 0.13,
        cachedConfidence: "derived",
        outputUsd: 7.8,
        confidence: "official",
        notes: "Thinking-only preview; rates shown are the ≤128K tier (128K-256K bills $2/$12). Superseded as flagship by Qwen3.7 Max.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint. Cached input derived as 10% of input per the official context-cache doc, which lists this model as supported.",
        effectiveDate: "2026-07-19",
      },
    ],
    quirks: [
      {
        title: "No per-token Qwen meter on Foundry",
        tone: "warning",
        body: [
          "Microsoft Foundry hosts Qwen models (e.g. the Qwen3-VL family) only via Managed Compute: dedicated A100/H100/MI300 GPUs at $4-8 / CHF 3.22-6.44 per compute hour. There is no serverless per-token Qwen listing on the Foundry pricing page — neither native nor Fireworks-hosted — so cost per token depends entirely on your utilization.",
        ],
      },
      {
        title: "Endpoint pricing differs sharply",
        tone: "info",
        body: [
          "The Chinese-mainland (Beijing) endpoint is far cheaper than International: Qwen3.6 Plus drops from $0.50 / CHF 0.40 to ~$0.276 / CHF 0.22 input and from $3.00 / CHF 2.42 to ~$1.65 / CHF 1.33 output. The catalog lists International (Singapore) rates as the realistic option for most non-China deployments.",
        ],
      },
      {
        title: "Cache rule now officially documented",
        tone: "insight",
        body: [
          "Model Studio's Context Cache doc now states the billing rule outright: explicit cache hits at 10% of the input rate, explicit cache creation at 125% (5-minute validity), and implicit cache hits at 20% — the same shape as Anthropic's model, plus a pricier implicit path. The doc lists every Qwen model in this catalog as supported, so cached rates here are upgraded from estimate to derived (10% of the billed input rate; still no per-model dollar figures published).",
        ],
      },
      {
        title: "Flagship pricing is promotional",
        tone: "warning",
        body: [
          "Qwen3.7 Max ($1.25 / CHF 1.01 input, $3.75 / CHF 3.02 output effective) and Qwen3.7 Plus ($0.32 / CHF 0.26 input, $1.28 / CHF 1.03 output effective, ≤256K) are billed under limited-time discounts of 50% and 20% off list — with no published end date. If the promos lapse, Max reverts to $2.50/$7.50 and Plus to $0.40/$1.60. Budget against list price for anything long-lived.",
        ],
      },
    ],
  },

  {
    slug: "mistral",
    name: "Mistral",
    org: "Mistral AI",
    tagline: "Mistral Medium 3.5 is now on Microsoft Foundry at the same rate as Mistral's own API.",
    intro: [
      "Under the expanded Microsoft–Mistral partnership announced 2026-07-21, Mistral Medium 3.5 is now resold on Microsoft Foundry as a serverless listing, priced identically to Mistral's first-party API. Foundry publishes Global and Data Zone meters; no cached-input meter exists on either tier yet, so cache-heavy workloads get no discount on this model. (Mistral OCR 4 is billed per page rather than per token, so it is out of this catalog's scope.)",
    ],
    entries: [
      {
        model: "Mistral Medium 3.5",
        tier: "Global",
        inputUsd: 1.5,
        cachedUsd: null,
        outputUsd: 7.5,
        confidence: "official",
        notes: "Foundry serverless Global tier; no cached-input meter published.",
        sourceNote:
          "Azure Retail Prices API 'MM3.5 Inp/Outp glbl' meters at $0.0015/1K and $0.0075/1K ($1.50/M and $7.50/M), effective 2026-07-01, captured 2026-07-23. Announced via the Microsoft–Mistral partnership on 2026-07-21. No cached-input meter published on any tier.",
        effectiveDate: "2026-07-23",
      },
      {
        model: "Mistral Medium 3.5",
        tier: "DataZone",
        inputUsd: 1.65,
        cachedUsd: null,
        outputUsd: 8.25,
        confidence: "official",
        notes: "Data Zone tier at the usual ~10% premium over Global; no cached-input meter.",
        sourceNote:
          "Azure Retail Prices API 'MM3.5 Inp/Outp DZ' meters at $0.00165/1K and $0.00825/1K ($1.65/M and $8.25/M) — a clean 1.1x the Global rate — effective 2026-06-01, captured 2026-07-23. No cached-input meter published.",
        effectiveDate: "2026-07-23",
      },
      {
        model: "Mistral Medium 3.5",
        host: "Mistral direct API",
        tier: "Direct",
        inputUsd: 1.5,
        cachedUsd: null,
        outputUsd: 7.5,
        confidence: "official",
        notes: "mistral-medium-latest; identical to the Foundry Global rate.",
        sourceNote:
          "Mistral's official API pricing page (mistral.ai/pricing/api) lists mistral-medium-latest at $1.50/M input and $7.50/M output, captured 2026-07-23.",
        effectiveDate: "2026-07-23",
      },
    ],
    quirks: [
      {
        title: "Foundry Global matches Mistral's direct API",
        tone: "info",
        body: [
          "Mistral Medium 3.5 costs the same on Microsoft Foundry Global ($1.50 / CHF 1.21 input, $7.50 / CHF 6.04 output) as on Mistral's own API — no Foundry resale markup at the Global tier. The Data Zone tier adds the usual ~10% ($1.65 / $8.25).",
        ],
      },
      {
        title: "No cache discount yet",
        tone: "warning",
        body: [
          "Neither Foundry nor Mistral's direct API publishes a cached-input meter for Mistral Medium 3.5, so repeated-prompt workloads pay full input price on every call. Models like Grok-4.3 ($0.20/M cached) or the Kimi K2 line ($0.10–$0.16/M cached) are cheaper for cache-heavy use.",
        ],
      },
    ],
  },

  {
    slug: "embeddings",
    name: "Embeddings",
    tagline: "The retrieval layer. Input-only pricing, and the cheapest model is rarely the right one for code RAG.",
    intro: [
      "Embedding models bill per million input tokens only, no output meter. The DeepSeek and Kimi chat models are generation-only; DeepSeek has a separate deepseek-embedding-v2 (768-dim) for retrieval.",
    ],
    entries: [
      {
        model: "Cohere embed-v-4-0",
        tier: "Direct",
        inputUsd: 0.12,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes: "Best RAG / code-retrieval pick. Matryoshka dims 256/512/1024/1536 (default 1536); input_type query/document distinction.",
        sourceNote: "Approximate published rate (~$0.12/M).",
        effectiveDate: CAPTURED,
      },
      {
        model: "OpenAI text-embedding-3-large",
        tier: "Global",
        inputUsd: 0.13,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        sourceNote: "OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "OpenAI text-embedding-3-small",
        tier: "Global",
        inputUsd: 0.02,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes: "Cheapest solid option.",
        sourceNote: "OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
      {
        model: "OpenAI text-embedding-ada-002",
        tier: "Global",
        inputUsd: 0.1,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes: "Legacy: worse than 3-small on cost and quality. Avoid.",
        sourceNote: "OpenAI pricing page.",
        effectiveDate: CAPTURED,
      },
    ],
    quirks: [
      {
        title: "Cheapest isn't best for code retrieval",
        tone: "insight",
        body: [
          "text-embedding-3-small is cheapest at $0.02 / CHF 0.016 per M, but for code RAG Cohere embed-v4 ($0.12 / CHF 0.097 per M) wins on retrieval quality (query/document input_type, Matryoshka dims 256/512/1024/1536). ada-002 ($0.10 / CHF 0.081) is legacy: worse than 3-small on price and quality. No reason to pick it for new work.",
        ],
      },
      {
        title: "A reference retrieval stack",
        tone: "info",
        body: [
          "For code indexing plus RAG: a dedicated embedding model (Cohere embed-v4), a vector store (LanceDB), then a strong coding LLM (DeepSeek V4 Pro, Kimi K2.7 Code, or GLM-5.2) over the retrieved chunks.",
        ],
      },
    ],
  },
];

export const providerSlugs = providers.map((p) => p.slug);

export function getProvider(slug: string): Provider | undefined {
  return providers.find((p) => p.slug === slug);
}

/** Chat/generation models only (excludes embeddings); used by compare + calculator. */
export function chatEntries(): { provider: Provider; entry: Provider["entries"][number] }[] {
  return providers
    .filter((p) => p.slug !== "embeddings")
    .flatMap((p) => p.entries.map((entry) => ({ provider: p, entry })));
}
