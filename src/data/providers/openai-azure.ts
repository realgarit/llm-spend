import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const openaiAzure: Provider = {
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
};
