import type { Provider } from "../types";

export const minimax: Provider = {
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
        "Current flagship; rates shown are the ≤512K input band — above 512K it bills $0.60/M input, $0.12/M cached, $2.40/M output. The Foundry Data Zone lane is exactly 1.1x these rates. A 'priority' service tier bills 1.5x standard, now modeled below.",
      sourceNote:
        "MiniMax official pricing page (platform.minimax.io/docs/guides/pricing-paygo), captured 2026-07-29: ≤512K input band $0.30/M input, $0.06/M cache read, $1.20/M output; >512K band $0.60/$0.12/$2.40. The page labels these rates 'Permanent 50% off' with the struck-through list price at exactly 2x ($0.60/$0.12/$2.40 for the ≤512K band) and states no end date. Foundry's 'FW MiniMax 3' Data Zone meters are 1.1x the discounted rate, not the list rate. No cache-write dimension is published for M3.",
      effectiveDate: "2026-07-29",
      variants: [
        {
          label: "Priority",
          conditions: { serviceTier: "priority" },
          inputUsd: 0.45,
          cachedUsd: 0.09,
          outputUsd: 1.8,
          confidence: "official",
          sourceNote:
            "MiniMax official pricing page (platform.minimax.io/docs/guides/pricing-paygo), captured 2026-08-15 via direct DOM table read of the page's \"Priority\" tab — a distinct <Tab title=\"Priority*\" id=\"priority\"> panel alongside \"Standard\", confirmed against the page's own embedded source. ≤512K input band: $0.45/M input, $0.09/M cache read, $1.80/M output — exactly 1.5x the current discounted Standard rate, matching the page's own footnote verbatim: \"Priority provides priority admission for faster response times and improved request reliability. Set service_tier to priority to enable it. Pricing is 1.5x standard.\" This Priority tab exists only for MiniMax M3; the MiniMax M2.7 table on the same page has no tab split and no Priority option, so no variant is added to the M2.7 row.",
        },
      ],
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
};
