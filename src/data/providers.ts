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
        notes:
          "First-party published cache-hit, cache-miss, and output rates after the 75% direct price cut. Peak/off-peak billing begins 2026-08-16 16:00 UTC (peak 01:00-04:00 & 06:00-10:00 UTC): off-peak $0.022/$0.66/$1.98, peak $0.044/$1.32/$3.96 — see the changelog for detail.",
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
        notes:
          "First-party published cache-hit, cache-miss, and output rates. Peak/off-peak billing begins 2026-08-16 16:00 UTC (peak 01:00-04:00 & 06:00-10:00 UTC): off-peak $0.007/$0.22/$0.66, peak $0.014/$0.44/$1.32 — see the changelog for detail.",
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
        tier: "DataZone",
        inputUsd: 1.91,
        cachedUsd: 0.16,
        outputUsd: 3.83,
        contextWindow: 1_000_000,
        confidence: "official",
        notes: "First-party Foundry Data Zone deployment — slightly cheaper than the Fireworks-hosted Data Zone lane below ($1.925/$0.165/$3.828).",
        sourceNote:
          "Azure Retail Prices API, product \"Azure Deepseek Models\": 'V4 Pro Inp DZ Tokens' $0.00191/1K, 'V4 Pro cached DZ Tokens' $0.00016/1K (effective 2026-07-01), 'V4 Pro Outp DZ Tokens' $0.00383/1K, consistent across 22 commercial regions. Captured 2026-07-27.",
        effectiveDate: "2026-07-27",
      },
      {
        model: "DeepSeek-V4 Pro",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.925,
        cachedUsd: 0.165,
        outputUsd: 3.828,
        confidence: "official",
        notes: "~10% above the Fireworks direct rate: the Data Zone premium. This is the Fireworks-hosted lane; a cheaper first-party Foundry Data Zone deployment also exists (see above).",
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
      "The original GLM-5 is still generally available and is the cheapest lane in this family: $1.10/M input and $3.52/M output on Foundry Data Zone, roughly 29% and 27% under 5.1 and 5.2, with the same 200K window as 5.1. If you do not need 5.2's 1M context, it is the value pick rather than a superseded model.",
      "GLM-5-Turbo sits between GLM-5 and 5.1/5.2 at $1.20/M input and $4.00/M output, and is Z.ai-direct only with no Foundry meter.",
    ],
    entries: [
      {
        model: "GLM 5",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.1,
        cachedUsd: 0.22,
        outputUsd: 3.52,
        contextWindow: 200_000,
        maxOutput: 128_000,
        confidence: "official",
        notes: "The cheapest GLM lane on Foundry: ~29% below 5.1/5.2 on input and ~27% below on output, for the same 200K window as 5.1.",
        sourceNote:
          "Azure Retail Prices API 'FW GLM 5' meters, captured 2026-07-25 (effective 2026-06-01): input $0.0011/1K, output $0.00352/1K, cached input $0.00022/1K. Each is exactly 1.1x the Z.ai direct rate, the standard Data Zone premium. No Global-tier meter is published for GLM 5, matching 5.1 and 5.2.",
        effectiveDate: "2026-06-01",
      },
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
        model: "GLM-5",
        host: "Z.ai direct API",
        tier: "Direct",
        inputUsd: 1.0,
        cachedUsd: 0.2,
        outputUsd: 3.2,
        contextWindow: 200_000,
        maxOutput: 128_000,
        confidence: "official",
        notes: "Z.ai publishes a cached-input rate for GLM-5 ($0.20/M). Cached-input storage is currently free for a limited time, a billing dimension this catalog does not model.",
        sourceNote:
          "Z.ai official pricing page, captured 2026-07-25: input $1, cached input $0.2, output $3.2 per 1M tokens. Model page lists a 200K window and 128K max output. The 'Limited-time Free' marker on that page applies only to the separate Cached Input Storage column, not to these rates.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GLM-5-Turbo",
        host: "Z.ai direct API",
        tier: "Direct",
        inputUsd: 1.2,
        cachedUsd: 0.24,
        outputUsd: 4.0,
        contextWindow: 200_000,
        maxOutput: 128_000,
        confidence: "official",
        notes: "Agentic / tool-calling variant priced between GLM-5 and GLM-5.1/5.2; no Foundry meter, so Z.ai direct is the only lane.",
        sourceNote:
          "Z.ai official pricing page (docs.z.ai/guides/overview/pricing), captured 2026-07-29: $1.20/M input, $0.24/M cached input, $4.00/M output. The model page (docs.z.ai/guides/llm/glm-5-turbo) lists a 200K window and 128K max output and positions it as optimized for agentic long-chain execution and high-throughput tool calling. A full sweep of Azure's Foundry catalog on 2026-07-29 found no GLM-5-Turbo meter — only GLM 5, 5.1 and 5.2 are resold there.",
        effectiveDate: "2026-07-29",
      },
      {
        model: "GLM-5.1",
        host: "Z.ai direct API",
        tier: "Direct",
        inputUsd: 1.4,
        cachedUsd: 0.26,
        outputUsd: 4.4,
        contextWindow: 200_000,
        confidence: "official",
        notes: "Z.ai is the family's first-party API; input/output already matched Z.ai exactly, and the cache rate is now sourced from there too.",
        sourceNote:
          "Z.ai official pricing page (docs.z.ai/guides/overview/pricing), captured 2026-07-26: $1.40/M input, $0.26/M cached input, $4.40/M output. Vendor label corrected from 'Fireworks direct API' to 'Z.ai direct API' — Z.ai is the developer's own API per this catalog's Direct-tier definition, and previously had no cached-input figure recorded.",
        effectiveDate: "2026-07-26",
      },
      {
        model: "GLM-5.2",
        host: "Z.ai direct API",
        tier: "Direct",
        inputUsd: 1.4,
        cachedUsd: 0.26,
        outputUsd: 4.4,
        contextWindow: 1_000_000,
        maxOutput: 131_000,
        confidence: "official",
        notes: "Identical direct rate to GLM-5.1. Z.ai is the family's first-party API.",
        sourceNote:
          "Z.ai official pricing page (docs.z.ai/guides/overview/pricing), captured 2026-07-26: $1.40/M input, $0.26/M cached input, $4.40/M output (5.1 and 5.2 priced identically). Vendor label corrected from 'Fireworks direct API' to 'Z.ai direct API', matching the GLM-5 Direct row and closing the family's mixed-vendor Direct lane.",
        effectiveDate: "2026-07-26",
      },
    ],
    quirks: [
      {
        title: "GLM 5's Data Zone rate is a clean 1.1x",
        tone: "insight",
        body: [
          "All three of GLM 5's Foundry Data Zone meters land at exactly 1.1x the Z.ai direct rate: $1.00 to $1.10 input, $0.20 to $0.22 cached, $3.20 to $3.52 output. Two independently published sources agreeing on all three dimensions is the strongest confirmation this catalog gets that both numbers are right.",
        ],
      },
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
      "That 1:1 parity broke for two of the three GPT-5.6 variants on 2026-07-30, when OpenAI cut its direct-API rates for Terra by 20% (to $2.00/$0.20/$12.00) and Luna by 80% (to $0.20/$0.02/$1.20). As of the 2026-08-04 sweep, the corresponding Azure Foundry Global meters had not moved, so Foundry now runs at a premium over direct for those two variants — about 1.25x on Terra and roughly 5x on Luna. Sol is unaffected; both its direct and Foundry rates remain $5.00/$0.50/$30.00.",
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
        notes:
          "Balanced production tier. GA 2026-07-09. OpenAI cut the direct-API rate 20% on 2026-07-30 (now $2.00/$0.20/$12.00 direct); this Foundry meter had not followed as of the 2026-08-04 sweep, so Azure now runs about 1.25x direct.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 terra Std Gl, effective 2026-07-01; captured 2026-07-21). Data Zone +10% and long-context ($5/$0.50/$22.50) meters also published. Re-swept 2026-08-04: meter unchanged at $2.50/$0.25/$15.00, still effective 2026-07-01. OpenAI's changelog confirms a direct-API cut effective 2026-07-30 to $2.00/$0.20/$12.00 (developers.openai.com/api/docs/pricing, developers.openai.com/api/docs/changelog) — breaks the Foundry=direct 1:1 parity that had held since 2026-07-21.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.6 Terra Long Context",
        tier: "Global",
        inputUsd: 5.0,
        cachedUsd: 0.5,
        outputUsd: 22.5,
        confidence: "official",
        notes:
          "Long Context tier; all meters roughly double the short-context rates. OpenAI cut the direct-API long-context rate 20% on 2026-07-30 (now $4.00/$0.40/$18.00 direct); this Foundry meter had not followed as of the 2026-08-04 sweep.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 terra LongCo Std Gl, effective 2026-07-01; captured 2026-07-26). Re-swept 2026-08-04: meter unchanged at $5.00/$0.50/$22.50, still effective 2026-07-01. OpenAI's changelog confirms a direct-API cut effective 2026-07-30 to $4.00/$0.40/$18.00 (developers.openai.com/api/docs/pricing) — same 20% cut as the short-context Terra row; Foundry has not followed as of this sweep.",
        effectiveDate: "2026-07-26",
      },
      {
        model: "GPT-5.6 Luna",
        tier: "Global",
        inputUsd: 1.0,
        cachedUsd: 0.1,
        outputUsd: 6.0,
        confidence: "official",
        notes:
          "Fast / cheap, high-volume. GA 2026-07-09. OpenAI cut the direct-API rate 80% on 2026-07-30 (now $0.20/$0.02/$1.20 direct); this Foundry meter had not followed as of the 2026-08-04 sweep, so Azure now runs about 5x direct.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 luna Std Gl, effective 2026-07-01; captured 2026-07-21). Data Zone +10% and long-context ($2/$0.20/$9) meters also published. Re-swept 2026-08-04: meter unchanged at $1.00/$0.10/$6.00, still effective 2026-07-01. OpenAI's changelog confirms a direct-API cut effective 2026-07-30 to $0.20/$0.02/$1.20 (developers.openai.com/api/docs/pricing, developers.openai.com/api/docs/changelog) — breaks the Foundry=direct 1:1 parity that had held since 2026-07-21.",
        effectiveDate: "2026-07-21",
      },
      {
        model: "GPT-5.6 Luna Long Context",
        tier: "Global",
        inputUsd: 2.0,
        cachedUsd: 0.2,
        outputUsd: 9.0,
        confidence: "official",
        notes:
          "Long Context tier; all meters roughly double the short-context rates. OpenAI cut the direct-API long-context rate 80% on 2026-07-30 (now $0.40/$0.04/$1.80 direct); this Foundry meter had not followed as of the 2026-08-04 sweep.",
        sourceNote:
          "Azure Retail Prices API 'Foundry Models' meters (5.6 luna LongCo Std Gl, effective 2026-07-01; captured 2026-07-26). Re-swept 2026-08-04: meter unchanged at $2.00/$0.20/$9.00, still effective 2026-07-01. OpenAI's changelog confirms a direct-API cut effective 2026-07-30 to $0.40/$0.04/$1.80 (developers.openai.com/api/docs/pricing) — same 80% cut as the short-context Luna row; Foundry has not followed as of this sweep.",
        effectiveDate: "2026-07-26",
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
        notes: "This is the US/EU data zone rate (1.10x Global). APAC data-zone regions (australiaeast, centralindia, eastasia, japaneast, japanwest, jioindiawest, koreacentral, southeastasia, southindia) price higher, at 1.20x Global: $6.00/M input, $0.60/M cached, $36.00/M output.",
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
        cachedUsd: 0.175,
        outputUsd: 14.0,
        confidence: "official",
        notes: "The -codex variant is Responses-API only.",
        sourceNote:
          "Azure OpenAI pricing page. Cached input re-verified against the Azure Retail Prices API (serviceName 'Foundry Models'), captured 2026-07-26: exact meter value is $0.175/M, correcting the earlier rounded $0.18/M.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.2 / Codex",
        tier: "Global",
        inputUsd: 1.75,
        cachedUsd: 0.175,
        outputUsd: 14.0,
        confidence: "official",
        notes: "The -codex variant is Responses-API only.",
        sourceNote:
          "Azure OpenAI pricing page. Cached input re-verified against the Azure Retail Prices API (serviceName 'Foundry Models'), captured 2026-07-26: exact meter value is $0.175/M, correcting the earlier rounded $0.18/M.",
        effectiveDate: CAPTURED,
      },
      {
        model: "GPT-5.2 / Codex",
        tier: "DataZone",
        inputUsd: 1.925,
        cachedUsd: 0.1925,
        outputUsd: 15.4,
        confidence: "official",
        notes: "This is the US/EU data zone rate (1.10x Global). APAC data-zone regions (australiaeast, centralindia, eastasia, japaneast, japanwest, jioindiawest, koreacentral, southeastasia, southindia) price higher, at 1.20x Global: $2.10/M input, $0.21/M cached, $16.80/M output.",
        sourceNote:
          "Azure OpenAI pricing page. Input and cached input re-verified against the Azure Retail Prices API (serviceName 'Foundry Models'), captured 2026-07-26: exact meter values are $1.925/M input and $0.1925/M cached input, correcting the earlier rounded $1.93/$0.2. Output ($15.40/M) was already exact.",
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
        title: "Data Zone is two prices, not one — APAC costs more",
        tone: "warning",
        body: [
          "For Microsoft's first-party OpenAI lines, \"Data Zone\" isn't a single premium. Two disjoint region sets carry different rates: US/EU data zone (centralus, eastus, eastus2, francecentral, germanywestcentral, northcentralus, polandcentral, southcentralus, spaincentral, swedencentral, westeurope, westus, westus3, and on some models northeurope) bills at exactly 1.10x Global, while APAC data zone (australiaeast, centralindia, eastasia, japaneast, japanwest, jioindiawest, koreacentral, southeastasia, southindia) bills at exactly 1.20x Global. The APAC rows are effective 2026-06-01, added roughly six months after the US/EU rows for GPT-5.2.",
          "Concretely: GPT-5.2 Data Zone runs $1.925/$0.1925/$15.40 in US/EU but $2.10/$0.21/$16.80 in APAC; GPT-5.5 short-context runs $5.50/$0.55/$33.00 in US/EU but $6.00/$0.60/$36.00 in APAC (long-context scales the same way). A customer deploying in an APAC region pays a real 20% premium over Global, not the 10% the catalog's single Data Zone row implies — budget accordingly.",
          "GPT-5.3 chat and the entire GPT-5.6 family (Sol/Terra/Luna) have no APAC data-zone rows at all yet — Data Zone there is still a single US/EU-only price. And this split is exclusive to Microsoft's first-party OpenAI-hosted lines: Grok, Kimi, GLM, MiniMax, Mistral, and DeepSeek (both native and Fireworks-hosted) all publish a single Data Zone rate with no APAC surcharge. Captured from the Azure Retail Prices API on 2026-07-27.",
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
        title: "Terra and Luna: Foundry now costs more than direct",
        tone: "warning",
        body: [
          "OpenAI cut GPT-5.6 Terra and Luna's direct-API rates on 2026-07-30 — Terra by 20% (to $2.00/$0.20/$12.00), Luna by 80% (to $0.20/$0.02/$1.20) — but the matching Azure Foundry Global meters had not moved as of the 2026-08-04 sweep. The 1:1 parity that held since GA now only holds for Sol ($5.00/$0.50/$30.00 either way); Foundry runs about 1.25x direct on Terra and roughly 5x direct on Luna. Watch the Foundry meters for a matching cut before assuming parity again.",
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
  },

  {
    slug: "gemini",
    name: "Gemini",
    org: "Google",
    tagline: "Gemini 3.7 Flash is the new flagship, and Gemini 3.6 Flash's price is halved to match it — both $0.75/$0.075/$3.75 per M through year-end.",
    intro: [
      "Gemini 3.7 Flash is now the catalog's flagship Gemini model for agentic and multimodal work. The same pricing update halved Gemini 3.6 Flash to match it exactly: both now $0.75/M input, $0.075/M cached, $3.75/M output, a promotional rate published through 2026-12-31 that reverts to $1.50/$0.15/$7.50 on 2027-01-01. Gemini 3.5 Flash remains listed for comparison, unchanged at $1.50/$0.15/$9.00.",
    ],
    entries: [
      {
        model: "Gemini 3.7 Flash",
        tier: "Global",
        inputUsd: 0.75,
        cachedUsd: 0.075,
        outputUsd: 3.75,
        confidence: "official",
        notes:
          "New flagship Flash model; same promotional structure as 3.6 Flash — $0.75/$0.075/$3.75 through 2026-12-31, reverting to $1.50/$0.15/$7.50 on 2027-01-01. Priced identically to 3.6 Flash on every dimension.",
        sourceNote:
          "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14; page stamped \"Last updated 2026-08-13 UTC\", same page as the 3.6 Flash row below. Google describes it as \"Our most capable Flash model for agentic workflows and multimodal reasoning.\" The reversion date is published inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\" Batch/Flex bill at 50% of standard, Priority at 1.8x — tiers this schema does not model.",
        effectiveDate: "2026-08-14",
      },
      {
        model: "Gemini 3.6 Flash",
        tier: "Global",
        inputUsd: 0.75,
        cachedUsd: 0.075,
        outputUsd: 3.75,
        confidence: "official",
        notes:
          "Promotional rate (50% off standard pricing) through 2026-12-31; reverts to $1.50/$0.15/$7.50 per M on 2027-01-01.",
        sourceNote:
          "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14; page stamped \"Last updated 2026-08-13 UTC\" and publishes the reversion date inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\" Also bills a separate cache-storage dimension at $1.00 per 1M tokens per hour, not modeled by this schema.",
        effectiveDate: "2026-08-14",
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
    tagline: "Grok 4.6 is direct-API only for now; Microsoft Foundry resells the 4.x line up to Grok-4.3, which now carries a published cache meter.",
    intro: [
      "xAI's flagship Grok 4.6 (500K context), released 2026-08-12, currently ships only on xAI's own API, superseding Grok 4.5 as the headline model. Microsoft Foundry hosts the older Grok line as serverless listings — currently topping out at Grok-4.3 Global — with published input/output rates and, as of the 2026-07-23 recheck, a published cached-input meter on Grok-4.3 ($0.20/M).",
    ],
    entries: [
      {
        model: "Grok 4.6",
        host: "xAI direct API",
        tier: "Direct",
        inputUsd: 2.0,
        cachedUsd: 0.5,
        outputUsd: 6.0,
        contextWindow: 500_000,
        confidence: "official",
        notes:
          "xAI's new flagship, released 2026-08-12 and labeled 'Latest' in xAI's docs, superseding Grok 4.5 as the headline model. 500K context; text+image input, text output. All rates double for requests with ≥200K prompt tokens ($4 input / $1 cached / $12 output). Cached input is higher than Grok 4.5's ($0.50 vs $0.30); input and output prices are identical.",
        sourceNote:
          "xAI's official pricing page (docs.x.ai/developers/pricing): $2/M input, $0.50/M cached input, $6/M output, 500K context, doubling to $4/$1/$12 for prompts ≥200K tokens. Release confirmed by docs.x.ai/developers/release-notes, entry dated August 12, 2026. Both pages read via raw DOM, captured 2026-08-12. No Microsoft Foundry/Azure meter exists for Grok 4.6 as of a full Azure Retail Prices API sweep the same day — 0 hits for '4.6'.",
        effectiveDate: "2026-08-12",
      },
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
        model: "Grok-4.3",
        tier: "DataZone",
        inputUsd: 1.375,
        cachedUsd: 0.22,
        outputUsd: 2.75,
        confidence: "official",
        notes: "Data Zone premium: exactly 1.1x the Global rate on all three meters. Long-context (≥200K prompt) DZ meters also exist, billing at $2.75 in / $5.50 out / $0.44 cached per M.",
        sourceNote:
          "Azure Retail Prices API '4.3 Inp/Cached Inp/Outp DZ' meters, effective 2026-05-01, captured 2026-07-26: $1.375/M input, $0.22/M cached input, $2.75/M output — a clean 1.1x the tracked Global rate ($1.25/$0.20/$2.50). Long-context 'L' DZ meters re-verified 2026-07-28: '4.3 Inp DZ L Tokens' $0.00275/1K ($2.75/M), '4.3 Cached Inp DZ L Tokens' $0.00044/1K ($0.44/M), '4.3 Outp DZ L Tokens' $0.0055/1K ($5.50/M) — matching the Global long-context row's 2x pattern at the same 1.1x DZ premium.",
        effectiveDate: "2026-07-26",
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
    tagline: "Qwen3.8 Max is now the flagship at a plain $2/$6 per-token rate, above Qwen3.7 Max's 50%-off promo — but on Microsoft Foundry it's still GPU-hour managed compute only, no per-token meter.",
    intro: [
      "Qwen3.8 Max is now Alibaba's flagship, GA with a plain $2/M input, $6/M output rate — no promotional discount. Qwen3.7 Max remains available just below it at a limited-time 50%-off promo rate ($1.25/$3.75 effective) with no published end date, alongside Qwen3.7 Plus at 20% off; the Qwen3.6 line (Plus, Flash) remains listed at stable rates. All prices are Alibaba Cloud Model Studio's International (Singapore) endpoint.",
      "Qwen3.6 Max Preview is scheduled for deprecation on 2026-10-10, with Qwen3.7 Max named as its replacement. On Microsoft Foundry, Qwen models are available only as Managed Compute — dedicated GPU-hour billing ($4–8 per compute hour) with no serverless per-token listing, so there is no Foundry token rate to compare.",
    ],
    entries: [
      {
        model: "Qwen3.8 Max",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 2.0,
        cachedUsd: 0.2,
        cachedConfidence: "derived",
        outputUsd: 6.0,
        contextWindow: 1_000_000,
        confidence: "official",
        notes:
          "New flagship, GA (not preview); text plus image/video understanding. Single price tier across the full 1M window; thinking and non-thinking modes priced the same. Plain rate — no promotional discount, unlike Qwen3.7 Max. 1M-token free quota for 90 days.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-08-04 (confirmed via direct DOM inspection, not WebFetch's summarizer, per the established gotcha on this page): $2/M input, $6/M output, single 0<Token≤1M band, Non-Thinking and Thinking modes priced identically, no 'List price / Limited-time off' label. Cached input derived as 10% of input per the official context-cache rule (explicit cache hits), the same convention used across the rest of the Qwen family. A separate Global deployment-scope table on the same page prices this model lower, at $1.65/M input and $4.951/M output; the tracked lane is International, matching every other Qwen row here. Resolves the qwen3.8-max per-token-pricing watch item open since 2026-07-23.",
        effectiveDate: "2026-08-04",
      },
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
          "Current flagship. Effective rate under a limited-time 50% discount (list $2.50/M in, $7.50/M out) covering all four billing items — input, output, explicit cache creation, and explicit cache hits. Discount is officially scheduled to end 2026-08-31; reverts to list ($2.50 in / $0.25 cached / $7.50 out) from 2026-09-01. Single price tier across the full 1M window; thinking and non-thinking modes priced the same.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-07-20: list $2.5/$7.5 marked 'Limited-time 50% off', still with no end-date text as of a 2026-08-10 re-check. Cached input derived as 10% of effective input per the official context-cache rule (explicit cache hits). Alibaba Cloud's campaign page ('Qwen3.8-Max is Here') states, in two places, that the discount 'runs until August 31, 2026' and applies to all 4 billing items — input, output, explicit cache creation, and explicit cache hit; captured 2026-08-10.",
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
        model: "Qwen3.7 Flash",
        host: "Model Studio (Intl)",
        tier: "Direct",
        inputUsd: 0.1,
        cachedUsd: 0.01,
        cachedConfidence: "derived",
        outputUsd: 0.4,
        confidence: "official",
        notes:
          "Full tier ladder: 0-32K $0.030 in / $0.130 out; 32K-256K $0.100 in / $0.400 out (rate shown, matching the band tracked for the Qwen3.6 Flash row); 256K-1M $0.200 in / $0.800 out.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint, snapshot qwen3.7-flash-2026-07-15, captured 2026-07-26. Rate shown is the 32K<tokens≤256K band, chosen to match the context band tracked for the existing Qwen3.6 Flash row (≤256K) so the two are directly comparable. Cached input derived as 10% of input per the official context-cache rule (explicit cache hits), same shape as the rest of the Qwen family.",
        effectiveDate: "2026-07-26",
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
        notes:
          "Thinking-only preview; rates shown are the ≤128K tier (128K-256K bills $2/$12). Scheduled for deprecation on 2026-10-10; Alibaba lists Qwen3.7 Max as the replacement.",
        sourceNote:
          "Alibaba Cloud Model Studio pricing page, International endpoint, re-verified 2026-08-01. Cached input derived as 10% of input per the official context-cache doc, which lists this model as supported. Alibaba's official model-lifecycle page schedules qwen3.6-max-preview for deprecation on 2026-10-10 and names qwen3.7-max as the replacement.",
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
          "Azure Retail Prices API 'MM3.5 Inp/Outp glbl' meters at $0.0015/1K and $0.0075/1K ($1.50/M and $7.50/M), effective 2026-06-01 across 44 regions (including all 9 APAC regions); the only 2026-07-01 Global row is the malaysiawest region onboarding at the same price. Captured 2026-07-23, date corrected 2026-07-28. Announced via the Microsoft–Mistral partnership on 2026-07-21. No cached-input meter published on any tier.",
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
        cachedUsd: 0.15,
        outputUsd: 7.5,
        confidence: "official",
        notes: "mistral-medium-latest; identical to the Foundry Global rate. Cached input now officially published at $0.15/M (previously derived from Mistral's -90% cache discount rule).",
        sourceNote:
          "Mistral's consolidated inference pricing page (docs.mistral.ai/inference/pricing), captured 2026-08-14: Mistral Medium 3.5 lists Input $1.5, Cached input $0.15, Output $7.5 per M (mode STANDARD/USD) — the cached rate is now a directly published dollar figure, superseding the earlier -90%-rule derivation from mistral.ai/pricing/api. Model card (docs.mistral.ai/models/mistral-medium-3-5-26-04) corroborates the $1.50/$7.50 input/output rate. Neither Foundry tier publishes a cached-input meter at all (re-confirmed against the Azure Retail Prices API in today's sweep), so those rows stay null.",
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
        title: "Foundry has no cache meter; the direct API's $0.15/M cache rate is now official",
        tone: "warning",
        body: [
          "Neither Foundry tier publishes a cached-input meter for Mistral Medium 3.5, so Foundry workloads pay full input price on every call. The direct-API cached rate ($0.15/M) used to be derived as 10% of the $1.50 input price from a published -90% discount rule with no dollar figure; Mistral's new consolidated inference pricing page now publishes $0.15/M directly, so the number is unchanged but the confidence is upgraded to official. Models like Grok-4.3 ($0.20/M cached, official) or the Kimi K2 line ($0.10–$0.16/M cached, official) remain cheaper for cache-heavy use on Foundry.",
        ],
      },
    ],
  },

  {
    slug: "minimax",
    name: "MiniMax",
    org: "MiniMax AI",
    tagline: "MiniMax M2.5 and MiniMax 3 are resold on Microsoft Foundry as Data Zone-only serverless listings; the direct API adds M2.7 and M3 as the current lineup for comparison.",
    intro: [
      "MiniMax's M2.5 and MiniMax 3 models are resold on Microsoft Foundry exclusively as Data Zone serverless listings — there is no published Global-tier meter for either model, the same situation as the GLM family. Both carry an officially published cached-input meter.",
      "MiniMax's own direct API is now shown alongside those Foundry lanes as the comparison baseline. On MiniMax's pricing page, M2.5 has moved to a collapsed 'Legacy Models' section, while M2.7 and MiniMax M3 are the current generation.",
    ],
    entries: [
      {
        model: "MiniMax M2.5",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 0.33,
        cachedUsd: 0.033,
        outputUsd: 1.32,
        confidence: "official",
        notes:
          "Foundry Data Zone-only listing; no Global-tier meter published. MiniMax now lists M2.5 under 'Legacy Models' on its own pricing page, with M2.7 and MiniMax M3 as the current generation.",
        sourceNote:
          "Azure Retail Prices API 'FW MiniMax M2.5 Inp/Cache/Outp DZ' meters at $0.00033/1K, $0.000033/1K, and $0.00132/1K ($0.33/M, $0.033/M, and $1.32/M), effective 2026-06-01, captured 2026-07-26. MiniMax's own pricing page (platform.minimax.io/docs/guides/pricing-paygo), checked 2026-07-29, moved M2.5 into a collapsed 'Legacy Models' section; the Foundry meter is unchanged.",
        effectiveDate: "2026-07-26",
      },
      {
        model: "MiniMax 3",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 0.33,
        cachedUsd: 0.066,
        outputUsd: 1.32,
        confidence: "official",
        notes: "Foundry Data Zone-only listing; no Global-tier meter published. Same input/output as M2.5, double the cached-input rate.",
        sourceNote:
          "Azure Retail Prices API 'FW MiniMax 3 Inp/Cache/Outp DZ' meters at $0.00033/1K, $0.000066/1K, and $0.00132/1K ($0.33/M, $0.066/M, and $1.32/M), effective 2026-06-01, captured 2026-07-26.",
        effectiveDate: "2026-07-26",
      },
      {
        model: "MiniMax M3",
        host: "MiniMax direct API",
        tier: "Direct",
        inputUsd: 0.3,
        cachedUsd: 0.06,
        outputUsd: 1.2,
        confidence: "official",
        notes:
          "Current flagship; rates shown are the ≤512K input band — above 512K it bills $0.60/M input, $0.12/M cached, $2.40/M output. The Foundry Data Zone lane is exactly 1.1x these rates. A 'priority' service tier bills 1.5x.",
        sourceNote:
          "MiniMax official pricing page (platform.minimax.io/docs/guides/pricing-paygo), captured 2026-07-29: ≤512K input band $0.30/M input, $0.06/M cache read, $1.20/M output; >512K band $0.60/$0.12/$2.40. The page labels these rates 'Permanent 50% off' with the struck-through list price at exactly 2x ($0.60/$0.12/$2.40 for the ≤512K band) and states no end date. Foundry's 'FW MiniMax 3' Data Zone meters are 1.1x the discounted rate, not the list rate. No cache-write dimension is published for M3.",
        effectiveDate: "2026-07-29",
      },
      {
        model: "MiniMax M2.7",
        host: "MiniMax direct API",
        tier: "Direct",
        inputUsd: 0.3,
        cachedUsd: 0.06,
        outputUsd: 1.2,
        confidence: "official",
        notes:
          "Current-generation model with no Foundry meter — direct API only. A '-highspeed' variant bills $0.60/M input and $2.40/M output at the same $0.06/M cache read.",
        sourceNote:
          "MiniMax official pricing page (platform.minimax.io/docs/guides/pricing-paygo), captured 2026-07-29: $0.30/M input, $0.06/M cache read, $1.20/M output, plus a $0.375/M cache-write charge this catalog's schema does not model. Unlike M3, M2.7 carries no 'Permanent 50% off' label. A full Azure Foundry sweep on 2026-07-29 found no MiniMax M2.7 meter on any tier.",
        effectiveDate: "2026-07-29",
      },
    ],
    quirks: [
      {
        title: "Data Zone-only, like the GLM family",
        tone: "info",
        body: [
          "Neither MiniMax M2.5 nor MiniMax 3 has a published Global-tier meter on Microsoft Foundry — Data Zone is the only serverless tier, matching the pattern already seen with the GLM family. Both share the same $0.33/M input and $1.32/M output; MiniMax 3 doubles the cached-input rate to $0.066/M versus M2.5's $0.033/M.",
        ],
      },
      {
        title: "'Permanent 50% off' is still a promo label",
        tone: "warning",
        body: [
          "MiniMax presents M3's rates as a permanent 50% discount, with the list price shown struck through at exactly 2x and no stated end date. Foundry's Data Zone meters track the discounted rate at 1.1x, so if the discount ever lapses, both lanes would move together.",
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
        confidence: "derived",
        notes:
          "Best RAG / code-retrieval pick. Matryoshka dims 256/512/1024/1536 (default 1536); input_type query/document distinction. Cohere no longer publishes a per-token Embed rate on its own pricing page; the figure is corroborated by Microsoft's live Foundry meter, which reads exactly $0.12/M.",
        sourceNote:
          "Cohere delisted per-token Embed pricing from cohere.com/pricing between 2025-07-16 and 2025-08-09; the 2025-07-16 Internet Archive snapshot still shows $0.12 per 1M tokens for Embed 4. cohere.com/pricing now lists only Model Vault dedicated-instance rates (Embed 4 Small $4.00/hr, Embed 4 Medium $5.00/hr) and docs.cohere.com points back to that page. Rate retained because Azure's 'Embed v4 Txt Glbl Tokens' meter reads exactly $0.00012/1K ($0.12/M), captured 2026-07-29. Downgraded from official to derived: no first-party Cohere page publishes this rate today.",
        effectiveDate: "2026-07-29",
      },
      {
        model: "Cohere Embed v4",
        tier: "Global",
        inputUsd: 0.12,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes:
          "Same $0.12/M as the direct lane but officially metered — currently the only published source for this rate; image embeddings bill separately at $0.47/M image tokens.",
        sourceNote:
          "Azure Retail Prices API 'Embed v4 Txt Glbl Tokens' at $0.00012/1K ($0.12/M) across 39 commercial regions, effective 2026-02-01, captured 2026-07-29. Companion 'Embed v4 Img Glbl Tokens' meter is $0.00047/1K ($0.47/M). US Gov regions price higher ($0.15/M) and are excluded per the commercial-majority convention.",
        effectiveDate: "2026-02-01",
      },
      {
        model: "Cohere Embed v4",
        tier: "DataZone",
        inputUsd: 0.132,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes: "Exactly 1.1x the Global rate, the standard Data Zone premium.",
        sourceNote:
          "Azure Retail Prices API 'Embed v4 Txt DZ Tokens' at $0.000132/1K ($0.132/M) across 21 commercial regions, effective 2025-11-01, captured 2026-07-29. Companion 'Embed v4 Img DZ Tokens' meter is $0.000517/1K ($0.517/M). US Gov regions ($0.165/M) excluded.",
        effectiveDate: "2025-11-01",
      },
      {
        model: "OpenAI text-embedding-3-large",
        tier: "Global",
        inputUsd: 0.13,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        sourceNote:
          "Azure Retail Prices API 'text-embedding-3-large-glbl Tokens' meter: $0.00013/1K ($0.13/M) across 17 commercial regions, effective 2024-06-01, captured 2026-08-07. developers.openai.com/api/docs/pricing no longer lists per-token embeddings rates. Corroborated by developers.openai.com/api/docs/guides/embeddings, which quotes 9,615 pages per USD at ~800 tokens/page — inverting to exactly $0.13/M. US Gov Cloud bills this model under a separate 'text-embedding-3-large-regional Tokens' meter at $0.163/M, excluded per the commercial-majority convention.",
        effectiveDate: "2024-06-01",
      },
      {
        model: "OpenAI text-embedding-3-small",
        tier: "Global",
        inputUsd: 0.02,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes: "Cheapest solid option.",
        sourceNote:
          "Azure Retail Prices API 'text-embedding-3-small-glbl Tokens' meter: $0.00002/1K ($0.02/M) across 17 commercial regions, effective 2024-06-01, captured 2026-08-07. developers.openai.com/api/docs/pricing no longer lists per-token embeddings rates. Corroborated by developers.openai.com/api/docs/guides/embeddings, which quotes 62,500 pages per USD at ~800 tokens/page — inverting to exactly $0.02/M. US Gov Cloud bills this model under a separate 'text-embedding-3-small-regional Tokens' meter at $0.025/M, excluded per the commercial-majority convention.",
        effectiveDate: "2024-06-01",
      },
      {
        model: "OpenAI text-embedding-ada-002",
        tier: "Global",
        inputUsd: 0.1,
        cachedUsd: null,
        outputUsd: 0,
        confidence: "official",
        notes: "Legacy: worse than 3-small on cost and quality. Avoid.",
        sourceNote:
          "Azure Retail Prices API 'embedding-ada-glbl Tokens' meter: $0.0001/1K ($0.10/M) across 15 commercial regions, effective 2024-06-01, captured 2026-08-07. developers.openai.com/api/docs/pricing no longer lists per-token embeddings rates. Corroborated by developers.openai.com/api/docs/guides/embeddings, which quotes 12,500 pages per USD at ~800 tokens/page — inverting to exactly $0.10/M. US Gov Cloud bills this model under a separate 'embedding-ada-regional Tokens' meter at $0.125/M, excluded per the commercial-majority convention.",
        effectiveDate: "2024-06-01",
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
      {
        title: "Foundry Data Zone for embeddings is also two prices",
        tone: "warning",
        body: [
          "The rows above are OpenAI's Global rate. On Microsoft Foundry, text-embedding-3-large and text-embedding-3-small each carry two Data Zone prices, not one: US/EU regions bill 1.10x Global ($0.143/M and $0.022/M), APAC regions (australiaeast, centralindia, eastasia, japaneast, japanwest, jioindiawest, koreacentral, southeastasia, southindia) bill 1.20x Global ($0.156/M and $0.024/M). Same split seen across Microsoft's first-party OpenAI lines; captured from the Azure Retail Prices API on 2026-07-27.",
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
