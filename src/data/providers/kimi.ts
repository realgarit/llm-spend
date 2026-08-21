import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const kimi: Provider = {
  slug: "kimi",
  name: "Kimi",
  org: "Moonshot AI",
  tagline: "Kimi K3 is a 1M-context flagship, now on Microsoft Foundry as well as Moonshot's own API; earlier K2 models are resold on Foundry across tiers.",
  intro: [
    "Kimi K3 is available directly from Moonshot's API for long-horizon coding and knowledge work, and since 2026-08-01 through a Fireworks-hosted Microsoft Foundry Data Zone listing. Earlier K2 models are resold on Foundry at Global and Data Zone tiers, plus Fireworks-hosted listings. These chat models are generation-only, so pair them with an embeddings model for retrieval.",
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
      notes:
        "Cached rate officially published for this tier. A 'highspeed' service tier bills exactly 2x on every dimension.",
      sourceNote: "Official page (input, cached, and output all listed).",
      effectiveDate: CAPTURED,
      variants: [
        {
          label: "Highspeed",
          conditions: { serviceTier: "highspeed" },
          inputUsd: 1.9,
          cachedUsd: 0.38,
          outputUsd: 8.0,
          confidence: "official",
          sourceNote:
            "Moonshot's official pricing page (platform.kimi.ai/docs/pricing/chat-k27-code), captured 2026-08-15 via direct DOM table read: kimi-k2.7-code-highspeed lists $1.90/M input (cache miss), $0.38/M cached input (cache hit), $8.00/M output — exactly 2x kimi-k2.7-code on every dimension, same 262,144-token context window. The page describes it as 'the high-speed version of Kimi K2.7 Code, the same model... but with an output speed of approximately 180 Tokens/s.' Selected via the API's service_tier parameter, matching this schema's 'highspeed' tier.",
        },
      ],
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
      model: "Kimi K3",
      host: "Fireworks-hosted",
      tier: "DataZone",
      inputUsd: 3.3,
      cachedUsd: 0.33,
      outputUsd: 16.5,
      contextWindow: 1_000_000,
      confidence: "official",
      notes:
        "Kimi K3's first Microsoft Foundry lane. Data Zone only — there is no Global meter for K3 under a model-named meter.",
      sourceNote:
        "Azure Retail Prices API, productName 'Azure Fireworks Models', meters 'FW Kimi K3 Inp DZ Tokens' ($0.0033/1K = $3.30/M), 'FW Kimi K3 Cd Inp DZ Tokens' ($0.00033/1K = $0.33/M) and 'FW Kimi K3 Opt DZ Tokens' ($0.0165/1K = $16.50/M), effective 2026-08-01, captured 2026-08-21. One uniform price group across all 20 commercial Data Zone regions, no US-Gov or rounding outlier. Exactly 1.10x Moonshot's direct rate ($3.00/$0.30/$15.00), the same Data Zone premium every other Fireworks-hosted lane on Foundry carries.",
      effectiveDate: "2026-08-21",
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
    {
      title: "K3's other Foundry meters do not name their own dimensions",
      tone: "warning",
      body: [
        "Alongside the clearly-named Fireworks lane tracked here, Microsoft also published six K3 meters under its native 'Azure Kimi' product on 2026-08-01 — but they are labelled 'Model 6' and 'Model 7' with input/output tags that contradict their own prices. 'Model 7 Outp glbl' bills $0.33/M and 'Model 6 Outp DZ' bills $3.00/M, for instance, and no meter is named as cached input at all.",
        "The six prices do form two coherent sets — $3.00/$0.30/$15.00 across 35 regions and $3.30/$0.33/$16.50 across 19 — which look like a Global and a Data Zone lane, and the second set matches the Fireworks meters exactly. But assigning those numbers to input, cached, and output would mean importing the mapping from Moonshot's own price list and presenting the result as an Azure rate. Until Microsoft renames the meters, only the Fireworks Data Zone lane is quoted here, and no Foundry Global row for K3 is claimed.",
      ],
    },
  ],
};
