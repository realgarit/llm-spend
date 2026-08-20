import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const openaiAzure: Provider = {
  slug: "openai-azure",
  name: "OpenAI / Azure OpenAI",
  tagline: "Azure resells OpenAI 1:1 with no markup. The catch is deployment type and Responses-API-only variants.",
  intro: [
    "Azure OpenAI matches OpenAI's direct pricing 1:1, so no resale markup. What changes is the deployment type on Microsoft Foundry (Global, Data Zone, Regional; see below). GPT-5.6 (Sol / Terra / Luna) hit GA on 2026-07-09 and now has official Azure Foundry meters confirming the 1:1 pattern, including cached-input and cache-write meters plus Data Zone (+10%) and long-context tiers.",
    "That 1:1 parity broke for three weeks. OpenAI cut its direct-API rates on 2026-07-30 — Terra by 20% (to $2.00/$0.20/$12.00) and Luna by 80% (to $0.20/$0.02/$1.20) — and the Azure Foundry meters did not follow, leaving Foundry at roughly 1.25x direct on Terra and 5x on Luna. Foundry has now caught up: a new meter tranche effective 2026-08-01, confirmed in the Azure Retail Prices API on 2026-08-20, replaces the old Terra and Luna rates with the cut ones on every dimension and every tier. Parity is restored across all three variants.",
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
      variants: [
        {
          label: "Priority",
          conditions: { serviceTier: "priority" },
          inputUsd: 10.0,
          cachedUsd: 1.0,
          outputUsd: 60.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API 'Foundry Models', queried live 2026-08-15 for meterName containing both '5.6' and 'pp' (444 items, no pagination): '5.6 sol ShortCo Inp PP Gl' $10.00/M, '5.6 sol ShortCo Cd Inp PP Gl' $1.00/M, '5.6 sol ShortCo Opt PP Gl' $60.00/M — exactly 2x this row's Standard Global rate on every dimension, uniform across all 24 Global regions sampled, single effective date 2026-07-01. Azure calls this tier 'PP' (priority processing) in its meter names; it maps to this schema's 'priority' service tier. Short-context (ShortCo) only — a full sweep of the same query found zero 'LongCo' PP meters for any GPT-5.6 variant.",
        },
      ],
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
      inputUsd: 2.0,
      cachedUsd: 0.2,
      outputUsd: 12.0,
      confidence: "official",
      notes:
        "Balanced production tier. GA 2026-07-09. Cut 20% from $2.50/$0.25/$15.00 — Foundry matched OpenAI's 2026-07-30 direct-API cut with a meter tranche effective 2026-08-01, restoring 1:1 parity. Cache write bills at $2.50/M (1.25x input).",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models', full paged sweep captured 2026-08-20: '5.6 terra ShortCo Inp Std Gl 1M Tokens' $2.00/M, 'Cd Inp Std Gl' $0.20/M, 'Cd Wr Std Gl' $2.50/M, 'Opt Std Gl' $12.00/M — all effective 2026-08-01, and the superseded 2026-07-01 tranche ($2.50/$0.25/$15.00) no longer appears for any terra meter. Matches OpenAI's direct rate exactly (developers.openai.com/api/docs/pricing, read via raw DOM the same day). Data Zone meters moved with it, to $2.20/$0.22/$13.20 across 13 US/EU regions.",
      effectiveDate: "2026-08-20",
      variants: [
        {
          label: "Priority",
          conditions: { serviceTier: "priority" },
          inputUsd: 4.0,
          cachedUsd: 0.4,
          outputUsd: 24.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API 'Foundry Models', full paged sweep captured 2026-08-20: '5.6 terra ShortCo Inp PP Gl 1M Tokens' $4.00/M, 'Cd Inp PP Gl' $0.40/M, 'Opt PP Gl' $24.00/M — effective 2026-08-01, exactly 2x this row's Standard Global rate on every dimension. The PP meters were cut alongside the Standard ones, so this tier tracks 2x the post-cut rate (it read $5.00/$0.50/$30.00 before 2026-08-01). Azure calls this tier 'PP' (priority processing); it maps to this schema's 'priority' service tier, and OpenAI renamed the same tier 'Fast mode' on 2026-07-30. Short-context (ShortCo) only — zero 'LongCo' PP meters exist for any GPT-5.6 variant.",
        },
      ],
    },
    {
      model: "GPT-5.6 Terra Long Context",
      tier: "Global",
      inputUsd: 4.0,
      cachedUsd: 0.4,
      outputUsd: 18.0,
      confidence: "official",
      notes:
        "Long Context tier, for prompts past the short-context threshold; input and cached input are 2x the short-context rates, output 1.5x. Cut from $5.00/$0.50/$22.50 in the same 2026-08-01 Foundry tranche as the short-context Terra row, matching OpenAI's direct long-context rate exactly.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models', full paged sweep captured 2026-08-20: '5.6 terra LongCo Inp Std Gl 1M Tokens' $4.00/M, 'Cd Inp Std Gl' $0.40/M, 'Cd Wr Std Gl' $5.00/M, 'Opt Std Gl' $18.00/M — effective 2026-08-01, with no 2026-07-01 terra tranche remaining. Equals OpenAI's published direct long-context rate for gpt-5.6-terra ($4.00/$0.40/$18.00), read via raw DOM from developers.openai.com/api/docs/pricing the same day. No LongCo priority (PP) meter exists for any GPT-5.6 variant.",
      effectiveDate: "2026-08-20",
    },
    {
      model: "GPT-5.6 Luna",
      tier: "Global",
      inputUsd: 0.2,
      cachedUsd: 0.02,
      outputUsd: 1.2,
      confidence: "official",
      notes:
        "Fast / cheap, high-volume. GA 2026-07-09. Cut 80% from $1.00/$0.10/$6.00 — Foundry matched OpenAI's 2026-07-30 direct-API cut with a meter tranche effective 2026-08-01, restoring 1:1 parity. Now the cheapest tracked lane on Foundry. Cache write bills at $0.25/M (1.25x input).",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models', full paged sweep captured 2026-08-20: '5.6 luna ShortCo Inp Std Gl 1M Tokens' $0.20/M, 'Cd Inp Std Gl' $0.02/M, 'Cd Wr Std Gl' $0.25/M, 'Opt Std Gl' $1.20/M — all effective 2026-08-01, and the superseded 2026-07-01 tranche ($1.00/$0.10/$6.00) no longer appears for any luna meter. Matches OpenAI's direct rate exactly (developers.openai.com/api/docs/pricing, read via raw DOM the same day). Data Zone meters moved with it, to $0.22/$0.022/$1.32 across 13 US/EU regions.",
      effectiveDate: "2026-08-20",
      variants: [
        {
          label: "Priority",
          conditions: { serviceTier: "priority" },
          inputUsd: 0.4,
          cachedUsd: 0.04,
          outputUsd: 2.4,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API 'Foundry Models', full paged sweep captured 2026-08-20: '5.6 luna ShortCo Inp PP Gl 1M Tokens' $0.40/M, 'Cd Inp PP Gl' $0.04/M, 'Opt PP Gl' $2.40/M — effective 2026-08-01, exactly 2x this row's Standard Global rate on every dimension. The PP meters were cut alongside the Standard ones, so this tier tracks 2x the post-cut rate (it read $2.00/$0.20/$12.00 before 2026-08-01). Azure calls this tier 'PP' (priority processing); it maps to this schema's 'priority' service tier, and OpenAI renamed the same tier 'Fast mode' on 2026-07-30. Short-context (ShortCo) only — zero 'LongCo' PP meters exist for any GPT-5.6 variant.",
        },
      ],
    },
    {
      model: "GPT-5.6 Luna Long Context",
      tier: "Global",
      inputUsd: 0.4,
      cachedUsd: 0.04,
      outputUsd: 1.8,
      confidence: "official",
      notes:
        "Long Context tier, for prompts past the short-context threshold; input and cached input are 2x the short-context rates, output 1.5x. Cut from $2.00/$0.20/$9.00 in the same 2026-08-01 Foundry tranche as the short-context Luna row, matching OpenAI's direct long-context rate exactly.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models', full paged sweep captured 2026-08-20: '5.6 luna LongCo Inp Std Gl 1M Tokens' $0.40/M, 'Cd Inp Std Gl' $0.04/M, 'Cd Wr Std Gl' $0.50/M, 'Opt Std Gl' $1.80/M — effective 2026-08-01, with no 2026-07-01 luna tranche remaining. Equals OpenAI's published direct long-context rate for gpt-5.6-luna ($0.40/$0.04/$1.80), read via raw DOM from developers.openai.com/api/docs/pricing the same day. No LongCo priority (PP) meter exists for any GPT-5.6 variant.",
      effectiveDate: "2026-08-20",
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
        "A third split is now appearing, and it is the one to watch. Microsoft announced that from 2026-09-01 the EU data zone rises from 1.10x to 1.20x, applying only to models Foundry launches on or after that date — existing models are grandfathered, so nothing in this catalog changes on that day. The first meter with that shape has already shipped: a newly listed gpt-5-chat-latest snapshot bills its data-zone output at $33.00/M in seven US regions (1.10x Global) but $36.00/M in six EU regions (1.20x) — francecentral, germanywestcentral, polandcentral, spaincentral, swedencentral and westeurope. Expect new EU data-zone deployments to cost 20% over Global, not 10%. Captured from the Azure Retail Prices API on 2026-08-20.",
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
      title: "Terra and Luna: Foundry has caught up with the direct-API cut",
      tone: "info",
      body: [
        "OpenAI cut GPT-5.6 Terra and Luna's direct-API rates on 2026-07-30 — Terra by 20% (to $2.00/$0.20/$12.00), Luna by 80% (to $0.20/$0.02/$1.20) — and for three weeks the Azure Foundry meters did not follow, leaving Foundry at roughly 1.25x direct on Terra and 5x on Luna. That gap is closed: a Foundry meter tranche effective 2026-08-01, confirmed in the Azure Retail Prices API on 2026-08-20, carries the cut rates on Global, Data Zone, long-context and priority meters alike, and the old 2026-07-01 rates are gone from the catalog entirely. All three GPT-5.6 variants are back at 1:1 with OpenAI direct.",
        "Worth remembering for next time: the meters lagged the announcement by about three weeks, and during that window Azure's own support answers and at least one downstream cost tracker described the cut as already applied on Azure when the retail catalog still billed the old rate. The retail meter is what bills you.",
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
