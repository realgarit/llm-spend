import type { Provider } from "../types";

export const xai: Provider = {
  slug: "xai",
  name: "Grok",
  org: "xAI",
  tagline: "Grok 4.7 is xAI's current direct-API flagship, while Grok 4.6 remains a Microsoft Foundry Global Standard preview; Foundry Data Zone still tops out at Grok-4.3.",
  intro: [
    "xAI released Grok 4.7 on 2026-09-21 as its current direct-API flagship: 500K context, $2/$0.50/$6 per M for input/cached input/output, and $4/$1/$12 once a prompt reaches the published 200K long-context threshold. The separate fast variant is announced by xAI but is not represented as a second token lane here.",
    "Grok 4.6 (500K context on the direct API), released 2026-08-12, also appears in Microsoft Foundry as a public-preview Global Standard deployment. Foundry documents a 200K-token context window and 128K maximum output for that preview; its current deployment guide lists Global Standard only, while Grok-4.3 remains the newest documented Data Zone lane. The current Foundry feed has no Grok 4.7 meter, so the new flagship is direct-only for now.",
  ],
  entries: [
    {
      model: "Grok 4.7",
      host: "xAI direct API",
      tier: "Direct",
      inputUsd: 2.0,
      cachedUsd: 0.5,
      outputUsd: 6.0,
      contextWindow: 500_000,
      confidence: "official",
      notes:
        "xAI's current flagship for coding and knowledge work, released 2026-09-21. Standard rates are $2/$0.50/$6 per M; requests at or above 200K prompt tokens use the separate long-context lane below. xAI also announces a faster variant at twice the price, but does not expose it as a separate token table on the official pricing page.",
      sourceNote:
        "xAI's official Grok 4.7 announcement (x.ai/news/grok-4-7), published and captured 2026-09-21, states that the model is available through the Grok API from $2/M input and $6/M output, with $0.50/M cached input and a 500K context window. The official model page (docs.x.ai/developers/models/grok-4.7) confirms the same model identity, context and cache rate; xAI's pricing page (docs.x.ai/developers/pricing) publishes the $4/$1/$12 long-context band for requests at or above 200K prompt tokens. A full Azure Retail Prices API sweep captured 2026-09-21 has zero Foundry meters containing 4.7, so this is a Direct-only lane.",
      effectiveDate: "2026-09-21",
    },
    {
      model: "Grok 4.7 Long Context",
      host: "xAI direct API",
      tier: "Direct",
      inputUsd: 4.0,
      cachedUsd: 1.0,
      outputUsd: 12.0,
      contextWindow: 500_000,
      confidence: "official",
      notes:
        "Long-context pricing band for requests at or above 200K prompt tokens. This is a separate comparison lane so the site does not confuse a workload's cumulative monthly input volume with one prompt's context length.",
      sourceNote:
        "xAI's official pricing page (docs.x.ai/developers/pricing), captured 2026-09-21, publishes Grok 4.7 at $4/M input, $1/M cached input and $12/M output for the long-context band beginning at 200K prompt tokens. The model page (docs.x.ai/developers/models/grok-4.7) confirms the 500K context window. The full Azure Retail Prices API sweep captured 2026-09-21 has zero Foundry meters containing 4.7, so this is a Direct-only lane.",
      effectiveDate: "2026-09-21",
    },
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
        "xAI's official pricing page (docs.x.ai/developers/pricing): $2/M input, $0.50/M cached input, $6/M output, 500K context, doubling to $4/$1/$12 for prompts ≥200K tokens. Release confirmed by docs.x.ai/developers/release-notes, entry dated August 12, 2026. Both pages were read via raw DOM on 2026-08-12; the Azure sweep on that date had no 4.6 meter, before Foundry publication on the effective 2026-09-01 tranche.",
      effectiveDate: "2026-08-12",
    },
    {
      model: "Grok 4.6",
      tier: "Global",
      inputUsd: 2.0,
      cachedUsd: 0.5,
      outputUsd: 6.0,
      contextWindow: 200_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Microsoft Foundry public preview, Global Standard only. The Foundry preview documents a 200K context window, distinct from xAI's 500K direct-API window; the current Foundry Global retail meters match xAI's short-context token rates.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'Azure Grok Models', captured 2026-09-11: effective 2026-09-01 meters '4.6 Inp Glbl Tokens' $0.002/1K ($2.00/M), '4.6 Cached Glbl Tokens' $0.0005/1K ($0.50/M), and '4.6 Outp Glbl Tokens' $0.006/1K ($6.00/M), with the commercial majority across 39 regions; the two US Government regions carry a 1.25x outlier and are excluded. Microsoft's current Foundry deployment guide documents Grok 4.6 as preview and Global Standard only, so the separate 4.6 Data Zone meter group is not inferred into this catalog.",
      effectiveDate: "2026-09-01",
    },
    {
      model: "Grok 4.6 Long Context",
      tier: "Global",
      inputUsd: 4.0,
      cachedUsd: 1.0,
      outputUsd: 12.0,
      contextWindow: 200_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Foundry's long-context pricing applies once a prompt reaches 200K input tokens; the preview's documented context window remains 200K. This is a pricing band, not a claim of a larger Foundry context window.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'Azure Grok Models', captured 2026-09-11: effective 2026-09-01 meters '4.6 Inp Glbl L Tokens' $0.004/1K ($4.00/M), '4.6 Cached Glbl L Tokens' $0.001/1K ($1.00/M), and '4.6 Outp Glbl L Tokens' $0.012/1K ($12.00/M), with the commercial majority across 39 regions; the two US Government regions carry a 1.25x outlier and are excluded. The long-context threshold and direct-API schedule are corroborated by xAI's official pricing page.",
      effectiveDate: "2026-09-01",
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
      title: "Grok 4.6 Foundry is Global-only for now",
      tone: "warning",
      body: [
        "Microsoft's current deployment guide lists Grok 4.6 as a public-preview Global Standard model with a 200K context window and 128K maximum output. The Azure Retail Prices feed also emits 4.6 Data Zone meters, but because the current model guide does not list a Data Zone deployment, those meters are deliberately left unmodeled until Microsoft confirms that deployment path.",
      ],
    },
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
};
