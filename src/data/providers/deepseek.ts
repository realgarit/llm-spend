import type { Provider } from "../types";

const CAPTURED = "2026-07-11";
const FLASH_TRANSITION = "2026-09-10T04:00:00Z";

export const deepseek: Provider = {
  slug: "deepseek",
  name: "DeepSeek",
  tagline: "V4.1 Flash now lowers the direct API price, while V4 Pro remains available after DeepSeek reversed its planned September 14 reroute. Microsoft Foundry still exposes the older V4 Flash meters with resale markups from ~10% to a reported 4.5x.",
  intro: [
    "DeepSeek V4.1 Flash and V4 Pro ship real 1M-token windows (max output up to 384K). The direct `deepseek-flash` endpoint now serves V4.1 Flash with lower peak/off-peak rates, while legacy V4 Flash names route to the same model. Microsoft Foundry still exposes V4 Flash-named meters, so the current catalog keeps those Foundry rows separate rather than silently relabeling them.",
    "Pricing remains a resale case study: the direct API is cheap, Microsoft Foundry resells it at a markup, and some Foundry tiers bill a cache meter the public page hides. DeepSeek's current API Quick Start and pricing pages now say V4 Pro service continues after 2026-09-14 with billing unchanged, although the September 10 launch article still carries the earlier reroute notice. The catalog therefore retains V4 Pro's separate direct lane and schedule; the Foundry V4 Flash snapshot remains separate, while the direct Flash row carries the September 10 transition and both published schedules.",
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
        "First-party published cache-hit, cache-miss, and output rates after the 75% direct price cut. Peak/off-peak billing began 2026-08-16 16:00 UTC (peak 01:00-04:00 & 06:00-10:00 UTC, Monday to Friday only): off-peak $0.022/$0.66/$1.98, peak $0.044/$1.32/$3.96 — see the changelog for detail. DeepSeek's current API docs say this model remains available after 2026-09-14 with billing unchanged.",
      sourceNote:
        "DeepSeek's own direct (non-cloud-resold) API pricing, including the published cached-input rate. The API Quick Start and Models & Pricing pages, re-read 2026-09-12, state that V4 Pro service continues after September 14, 2026 with billing unchanged; the September 10 launch article still carries the earlier automatic-reroute notice, so the catalog keeps this V4 Pro lane separate and documents the conflict.",
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
            // Monday-Friday. Weekends fall through to the Off-peak variant below.
            utcDaysOfWeek: [1, 2, 3, 4, 5],
          },
          inputUsd: 1.32,
          cachedUsd: 0.044,
          outputUsd: 3.96,
          confidence: "official",
          sourceNote:
            "DeepSeek pricing page (api-docs.deepseek.com/quick_start/pricing/), re-read via raw DOM 2026-08-26. Off-peak is exactly half of peak. Verbatim footnote: \"Peak hours are 01:00 - 04:00 and 06:00 - 10:00 UTC, Monday through Friday (all other hours are off-peak).\" The Chinese edition of the same page agrees, expressing the identical windows in Beijing time (周一至周五 9:00-12:00, 14:00-18:00). Every hour of Saturday and Sunday therefore bills off-peak.",
        },
        {
          label: "Off-peak",
          conditions: { from: "2026-08-16T16:00:00Z" },
          inputUsd: 0.66,
          cachedUsd: 0.022,
          outputUsd: 1.98,
          confidence: "official",
          sourceNote:
            "DeepSeek pricing page (api-docs.deepseek.com/quick_start/pricing/), re-read via raw DOM 2026-08-26. Off-peak is exactly half of peak. Verbatim footnote: \"Peak hours are 01:00 - 04:00 and 06:00 - 10:00 UTC, Monday through Friday (all other hours are off-peak).\" The Chinese edition of the same page agrees, expressing the identical windows in Beijing time (周一至周五 9:00-12:00, 14:00-18:00). Every hour of Saturday and Sunday therefore bills off-peak.",
        },
      ],
    },
    {
      model: "DeepSeek-V4.1 Flash",
      host: "DeepSeek direct API",
      tier: "Direct",
      inputUsd: 0.14,
      cachedUsd: 0.0028,
      outputUsd: 0.28,
      contextWindow: 1_000_000,
      maxOutput: 384_000,
      confidence: "official",
      notes:
        "The `deepseek-flash` endpoint now serves V4.1 Flash. Before 2026-09-10 04:00 UTC, this row's base and legacy variants preserve the V4 Flash schedule; from the transition onward, off-peak is $0.15/$0.003/$0.60 and weekday peak is $0.30/$0.006/$1.20 per M (cache hit / cache miss / output order is shown in the source table; the catalog fields are input / cached input / output).",
      sourceNote:
        "DeepSeek's official API pricing page and September 10 V4.1 Flash announcement, re-read 2026-09-11: `deepseek-flash` is DeepSeek-V4.1-Flash with a 1M context and 384K maximum output; legacy `deepseek-v4-flash` names route to it. The base fields retain the pre-transition V4 Flash off-peak rate for deterministic historical resolution, while the variants below carry the current V4.1 Flash schedule.",
      effectiveDate: "2026-09-10",
      variants: [
        {
          label: "Peak",
          conditions: {
            from: FLASH_TRANSITION,
            utcHourWindows: [
              { startHourUtc: 1, endHourUtc: 4 },
              { startHourUtc: 6, endHourUtc: 10 },
            ],
            // Monday-Friday. Weekends fall through to the Off-peak variant below.
            utcDaysOfWeek: [1, 2, 3, 4, 5],
          },
          inputUsd: 0.3,
          cachedUsd: 0.006,
          outputUsd: 1.2,
          confidence: "official",
          sourceNote:
            "DeepSeek's September 10, 2026 V4.1 Flash announcement and API pricing page, re-read 2026-09-11: the new schedule starts at 04:00 UTC on September 10, off-peak is half of peak, and peak is 01:00-04:00 and 06:00-10:00 UTC Monday-Friday. The published V4.1 Flash peak row is $0.30/M input, $0.006/M cache hit and $1.20/M output.",
        },
        {
          label: "Off-peak",
          conditions: { from: FLASH_TRANSITION },
          inputUsd: 0.15,
          cachedUsd: 0.003,
          outputUsd: 0.6,
          confidence: "official",
          sourceNote:
            "DeepSeek's September 10, 2026 V4.1 Flash announcement and API pricing page, re-read 2026-09-11: off-peak is half of peak and the published V4.1 Flash off-peak row is $0.15/M input, $0.003/M cache hit and $0.60/M output. Weekends and all hours outside the two weekday peak windows are off-peak.",
        },
        {
          label: "Peak (legacy V4 Flash)",
          conditions: {
            from: "2026-08-16T16:00:00Z",
            until: FLASH_TRANSITION,
            utcHourWindows: [
              { startHourUtc: 1, endHourUtc: 4 },
              { startHourUtc: 6, endHourUtc: 10 },
            ],
            utcDaysOfWeek: [1, 2, 3, 4, 5],
          },
          inputUsd: 0.44,
          cachedUsd: 0.014,
          outputUsd: 1.32,
          confidence: "official",
          sourceNote:
            "DeepSeek's prior V4 Flash schedule from the API pricing page, captured 2026-08-26. This bounded variant preserves historical resolution until the V4.1 Flash transition at 2026-09-10 04:00 UTC.",
        },
        {
          label: "Off-peak (legacy V4 Flash)",
          conditions: { from: "2026-08-16T16:00:00Z", until: FLASH_TRANSITION },
          inputUsd: 0.22,
          cachedUsd: 0.007,
          outputUsd: 0.66,
          confidence: "official",
          sourceNote:
            "DeepSeek's prior V4 Flash schedule from the API pricing page, captured 2026-08-26. This bounded variant preserves historical resolution until the V4.1 Flash transition at 2026-09-10 04:00 UTC.",
        },
      ],
    },
    {
      model: "DeepSeek-V4.1 Flash",
      host: "Fireworks-hosted",
      tier: "Global",
      inputUsd: 0.375,
      cachedUsd: 0.008,
      outputUsd: 1.5,
      contextWindow: 1_000_000,
      confidence: "official",
      notes:
        "New Fireworks-hosted Microsoft Foundry Global lane. Its rates are distinct from both DeepSeek's direct API and Fireworks' own direct endpoint.",
      sourceNote:
        "Azure Retail Prices API, productName 'Azure Fireworks Models', captured 2026-09-17: effective 2026-09-01 meters 'FW DS-V4.1-Flash Gl Inp Tokens' $0.000375/1K ($0.375/M), 'FW DS-V4.1-Flash Gl Cd Inp Tokens' $0.000008/1K ($0.008/M), and 'FW DS-V4.1-Flash Gl Opt Tokens' $0.0015/1K ($1.50/M), uniform across 20 commercial Global regions. Fireworks' official model page identifies DeepSeek V4.1 Flash as a ready serverless model with a 1.04M-token context and the direct $0.22/$0.007/$0.66 per M rates; this row is the separately metered Foundry resale lane.",
      effectiveDate: "2026-09-01",
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
      model: "DeepSeek-V4 Flash",
      tier: "DataZone",
      inputUsd: 0.21,
      cachedUsd: 0.031,
      outputUsd: 0.56,
      contextWindow: 1_000_000,
      maxOutput: 384_000,
      confidence: "official",
      notes:
        "First-party Foundry Data Zone deployment: the Global rate x1.10, rounded up to the meter's precision on every dimension. The Fireworks-hosted Data Zone lane below undercuts both this and Global.",
      sourceNote:
        "Azure Retail Prices API, product \"Azure Deepseek Models\": 'V4 Flash Inp DZ Tokens' $0.00021/1K, 'V4 Flash cached DZ Tokens' $0.000031/1K, 'V4 Flash Outp DZ Tokens' $0.00056/1K, uniform across 22 commercial regions. Captured 2026-08-22. Each figure is the Global rate x1.10 rounded up ($0.19 to $0.209 to $0.21; $0.028 to $0.0308 to $0.031; $0.51 to $0.561 to $0.56). The two US-Gov regions price higher, as they do across this whole product; the commercial majority is used here. Microsoft separately publishes a 'V4 Flash 0731' meter set for the newer snapshot at $0.44/$0.014/$1.32 Global — this row tracks the plain 'V4 Flash' meters.",
      effectiveDate: "2026-08-22",
    },
    {
      model: "DeepSeek-V4 Flash",
      host: "Fireworks-hosted",
      tier: "DataZone",
      inputUsd: 0.15,
      cachedUsd: 0.03,
      outputUsd: 0.31,
      confidence: "official",
      notes:
        "The cheapest DeepSeek lane on Foundry, and cheaper than the Global tier — an inversion of the usual pattern, because this is a different host undercutting the first-party listing rather than a tier discount.",
      sourceNote:
        "Azure Retail Prices API, product \"Azure Fireworks Models\": 'FW Deepseek-v4-Flash In DZ Tokens' $0.00015/1K, 'FW Deepseek-v4-Flash Cd In DZ Tokens' $0.00003/1K, 'FW Deepseek-v4-Flash Opt DZ Tokens' $0.00031/1K, effective 2026-08-01, uniform across all 20 commercial Data Zone regions with no US-Gov or rounding outlier. Captured 2026-08-22. Fireworks prices its own hosting, so this is not a multiple of DeepSeek's or Microsoft's rate, and the meter names no model snapshot.",
      effectiveDate: "2026-08-22",
    },
  ],
  quirks: [
    {
      title: "V4 Pro remains available after the planned switch",
      tone: "warning",
      body: [
        "DeepSeek's current API Quick Start and Models & Pricing pages say V4 Pro service continues after September 14, 2026, with billing unchanged. The September 10 V4.1 Flash launch article still says V4 Pro requests would route to Flash at Flash rates from that date, so the official pages are inconsistent; the catalog keeps the published V4 Pro lane and its own peak/off-peak schedule until DeepSeek clarifies the conflict.",
      ],
    },
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
      title: "V4 Flash: Data Zone can be cheaper than Global",
      tone: "insight",
      body: [
        "Data Zone is normally the premium tier — it pins routing to a geography and charges about 10% for it. V4 Flash breaks that. Microsoft's own Data Zone deployment does follow the rule ($0.21 / CHF 0.17 input against $0.19 / CHF 0.15 Global), but the Fireworks-hosted Data Zone listing bills $0.15 / CHF 0.12 input and $0.31 / CHF 0.25 output — below the Global tier on every dimension, and the cheapest DeepSeek lane on Foundry.",
        "The reason is that these are different sellers, not different tiers of one seller. Comparing tier labels across hosts tells you nothing about price; compare the meters. If you were going to accept Data Zone routing anyway, the Fireworks lane is strictly cheaper than staying on Global.",
      ],
    },
    {
      title: "1M context is a real autonomy lever",
      tone: "info",
      body: [
        "V4 Pro and V4.1 Flash carry 1M-token windows (max output up to 384K). Bigger windows mean less forced compaction, so less babysitting.",
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
