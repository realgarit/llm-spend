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
        cachedUsd: 0.19,
        cachedConfidence: "derived",
        outputUsd: 4.0,
        confidence: "official",
        notes: "Native Global tier.",
        sourceNote:
          "Input and output are official. The public page shows no cached column, but a billing export revealed a cache meter; ~$0.19/M reconciled at ~81% hit rate.",
        effectiveDate: CAPTURED,
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
        cachedUsd: null,
        outputUsd: 3.0,
        confidence: "official",
        sourceNote: "Official pricing page.",
        effectiveDate: CAPTURED,
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
        title: "The cache meter the pricing page omits",
        tone: "warning",
        body: [
          "Microsoft Foundry's public page shows no cached column for the K2.6 / K2.7 Thinking Global listings, but a Cost Management export had a billed cache meter. Reconciling token totals back-solved ~$0.19 / CHF 0.15 per M (about 81% hit rate). Derived, not published.",
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
    tagline: "GLM-5.2 adds a 1M-token window. Fireworks charges 5.1 and 5.2 the same, so the 5.2 Data Zone rate is a validated estimate.",
    intro: [
      "GLM-5.2 lifts the window to a real 1M tokens (up 5x from 5.1's 200K), with 131K max output, the practical win for agentic coding. Fireworks charges 5.1 and 5.2 the same, which is why the unlisted 5.2 Data Zone rate can be estimated (see below).",
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
        cachedUsd: 0.286,
        outputUsd: 4.84,
        contextWindow: 1_000_000,
        maxOutput: 131_000,
        confidence: "estimate",
        notes: "Estimated equal to GLM-5.1 Data Zone; later validated against real invoice data.",
        sourceNote:
          "Not listed at capture time. Estimated equal to GLM-5.1's Data Zone rate (Fireworks charges 5.1 and 5.2 the same); later matched real invoice data almost exactly.",
        effectiveDate: CAPTURED,
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
    tagline: "Azure resells OpenAI 1:1 with no markup. The catch is deployment type, Responses-API-only variants, and a not-yet-listed GPT-5.6.",
    intro: [
      "Azure OpenAI matches OpenAI's direct pricing 1:1, so no resale markup. What changes is the deployment type on Microsoft Foundry (Global, Data Zone, Regional; see below). GPT-5.6 (Sol / Terra / Luna) hit GA on 2026-07-09 but isn't on Azure's public page yet, so the rates below are OpenAI's direct rates, a high-confidence estimate via the 1:1 pattern.",
    ],
    entries: [
      {
        model: "GPT-5.6 Sol",
        tier: "Global",
        inputUsd: 5.0,
        cachedUsd: 0.5,
        outputUsd: 30.0,
        confidence: "estimate",
        notes: "Flagship (hardest reasoning / coding / agentic). GA 2026-07-09.",
        sourceNote:
          "OpenAI direct rate, not on Azure's page yet. High-confidence estimate for Azure via the 1:1 pattern. GPT-5.6 bills cache writes at 1.25x uncached input; reads stay ~90% off.",
        effectiveDate: "2026-07-09",
      },
      {
        model: "GPT-5.6 Terra",
        tier: "Global",
        inputUsd: 2.5,
        cachedUsd: 0.25,
        outputUsd: 15.0,
        confidence: "estimate",
        notes: "Balanced production tier. GA 2026-07-09.",
        sourceNote: "Direct OpenAI rate; high-confidence estimate for Azure via the 1:1 pattern.",
        effectiveDate: "2026-07-09",
      },
      {
        model: "GPT-5.6 Luna",
        tier: "Global",
        inputUsd: 1.0,
        cachedUsd: 0.1,
        outputUsd: 6.0,
        confidence: "estimate",
        notes: "Fast / cheap, high-volume. GA 2026-07-09.",
        sourceNote: "Direct OpenAI rate; high-confidence estimate for Azure via the 1:1 pattern.",
        effectiveDate: "2026-07-09",
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
    tagline: "A focused Flash option for lower-cost coding and agentic workloads.",
    intro: [
      "Gemini 3.5 Flash is the catalog's focused Gemini option for lower-cost coding and agentic workloads.",
    ],
    entries: [
      {
        model: "Gemini 3.5 Flash",
        tier: "Global",
        inputUsd: 1.5,
        cachedUsd: null,
        outputUsd: 9.0,
        confidence: "official",
        notes: "~25% cheaper than 3.1 Pro; beats it on coding/agentic benchmarks.",
        sourceNote: "Google pricing page.",
        effectiveDate: CAPTURED,
      },
    ],
  },

  {
    slug: "xai",
    name: "Grok",
    org: "xAI",
    tagline: "Grok 4.5 is direct-API only for now; Microsoft Foundry resells the 4.x line up to Grok-4.3 with no cache meter.",
    intro: [
      "xAI's flagship Grok 4.5 (500K context, configurable reasoning) currently ships only on xAI's own API. Microsoft Foundry hosts the older Grok line as serverless listings — currently topping out at Grok-4.3 Global — with published input/output rates but no cached-input column on any Grok meter.",
    ],
    entries: [
      {
        model: "Grok 4.5",
        host: "xAI direct API",
        tier: "Direct",
        inputUsd: 2.0,
        cachedUsd: 0.5,
        cachedConfidence: "estimate",
        outputUsd: 6.0,
        contextWindow: 500_000,
        confidence: "official",
        notes: "Flagship. All rates double for requests with ≥200K prompt tokens ($4 input / $12 output).",
        sourceNote:
          "Input/output/context from xAI's official models page. Cached input ($0.50/M, 75% off) is listed by OpenRouter and third-party trackers but not on xAI's own docs page yet.",
        effectiveDate: "2026-07-19",
      },
      {
        model: "Grok-4.3",
        tier: "Global",
        inputUsd: 1.25,
        cachedUsd: null,
        outputUsd: 2.5,
        confidence: "official",
        notes: "Newest Grok on Foundry; no cached-input meter published.",
        sourceNote: "Microsoft Foundry Models pricing page (Grok tab), captured 2026-07-19.",
        effectiveDate: "2026-07-19",
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
        title: "No cache meter on any Foundry Grok listing",
        tone: "info",
        body: [
          "Foundry's Grok table publishes only input and output columns — no cached input on any tier. xAI's direct API does discount cache hits (~75% off per third-party listings), so cache-heavy workloads currently favor the direct API even before comparing base rates.",
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
