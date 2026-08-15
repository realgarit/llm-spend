import type { Provider } from "../types";

export const xai: Provider = {
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
};
