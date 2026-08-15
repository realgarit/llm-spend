import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const deepseek: Provider = {
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
      variants: [
        {
          label: "Peak",
          conditions: {
            from: "2026-08-16T16:00:00Z",
            utcHourWindows: [
              { startHourUtc: 1, endHourUtc: 4 },
              { startHourUtc: 6, endHourUtc: 10 },
            ],
          },
          inputUsd: 1.32,
          cachedUsd: 0.044,
          outputUsd: 3.96,
          confidence: "official",
          sourceNote:
            "DeepSeek pricing page (api-docs.deepseek.com/quick_start/pricing), captured 2026-08-14. Off-peak is exactly half of peak; peak hours are 01:00-04:00 and 06:00-10:00 UTC.",
        },
        {
          label: "Off-peak",
          conditions: { from: "2026-08-16T16:00:00Z" },
          inputUsd: 0.66,
          cachedUsd: 0.022,
          outputUsd: 1.98,
          confidence: "official",
          sourceNote:
            "DeepSeek pricing page (api-docs.deepseek.com/quick_start/pricing), captured 2026-08-14. Off-peak is exactly half of peak; peak hours are 01:00-04:00 and 06:00-10:00 UTC.",
        },
      ],
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
      variants: [
        {
          label: "Peak",
          conditions: {
            from: "2026-08-16T16:00:00Z",
            utcHourWindows: [
              { startHourUtc: 1, endHourUtc: 4 },
              { startHourUtc: 6, endHourUtc: 10 },
            ],
          },
          inputUsd: 0.44,
          cachedUsd: 0.014,
          outputUsd: 1.32,
          confidence: "official",
          sourceNote:
            "DeepSeek pricing page (api-docs.deepseek.com/quick_start/pricing), captured 2026-08-14. Off-peak is exactly half of peak; peak hours are 01:00-04:00 and 06:00-10:00 UTC.",
        },
        {
          label: "Off-peak",
          conditions: { from: "2026-08-16T16:00:00Z" },
          inputUsd: 0.22,
          cachedUsd: 0.007,
          outputUsd: 0.66,
          confidence: "official",
          sourceNote:
            "DeepSeek pricing page (api-docs.deepseek.com/quick_start/pricing), captured 2026-08-14. Off-peak is exactly half of peak; peak hours are 01:00-04:00 and 06:00-10:00 UTC.",
        },
      ],
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
};
