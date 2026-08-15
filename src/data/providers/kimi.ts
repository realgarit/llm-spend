import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const kimi: Provider = {
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
};
