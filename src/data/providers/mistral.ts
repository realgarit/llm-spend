import type { Provider } from "../types";

export const mistral: Provider = {
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
};
