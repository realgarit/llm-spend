import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const openaiAzure: Provider = {
  slug: "openai-azure",
  name: "OpenAI / Azure OpenAI",
  tagline: "GPT-6 Astra is now the newest Foundry-only frontier lane, while Azure still trails OpenAI direct on the GPT-5.6 Sol promotion. Deployment type and Responses-API-only variants are the other catches.",
  intro: [
    "Azure OpenAI has historically matched OpenAI's direct pricing 1:1, so no resale markup. What changes is the deployment type on Microsoft Foundry (Global, Data Zone, Regional; see below). GPT-6 Astra is now generally available in Foundry with published Standard Global and Standard US Data Zone rates; its cache-write prices are published but not modeled by this schema, which tracks cache reads. GPT-5.6 (Sol / Terra / Luna) hit GA on 2026-07-09 and has official Azure Foundry meters covering cached-input and cache-write plus Data Zone (+10%) and long-context tiers.",
    "That 1:1 parity is not holding. OpenAI cut Terra and Luna on 2026-07-30 and Foundry took three weeks to follow, with a meter tranche effective 2026-08-01 that restored parity on those two. Then on 2026-08-21 OpenAI cut the Sol flagship — to $4.00/$0.40/$20.00 short context and $8.00/$0.80/$30.00 long context, described on its pricing page as promotional and available \"at least through November 21, 2026\" — and the Foundry Sol meters have not moved. Every Sol row below is the Azure meter, still on its original 2026-07-01 tranche, which now runs 1.25x OpenAI's direct input rate and 1.50x its direct output rate. Terra and Luna remain at parity.",
  ],
  entries: [
    {
      model: "GPT-6 Astra",
      tier: "Global",
      inputUsd: 10.0,
      cachedUsd: 1.0,
      outputUsd: 50.0,
      confidence: "official",
      notes:
        "GPT-6 Astra Standard Global short-context rate. Microsoft also publishes a $12.50/M cache-write rate; this catalog models cached-input reads, not cache creation.",
      sourceNote:
        "Microsoft Azure Foundry announcement (https://azure.microsoft.com/en-us/blog/gpt-6-astra-frontier-intelligence-for-work-now-generally-available-in-microsoft-foundry/), published 2026-09-03 and captured 2026-09-05: the GPT-6 Astra pricing table lists Standard Global short context at $10.00/M input, $1.00/M cached input, $12.50/M cached writes and $50.00/M output. A fresh full paged Azure Retail Prices API sweep on 2026-09-05 found no meter containing Astra or GPT-6 yet, so this row follows Microsoft's published Foundry table pending retail-meter publication. Cache writes are outside this schema.",
      effectiveDate: "2026-09-03",
    },
    {
      model: "GPT-6 Astra Long Context",
      tier: "Global",
      inputUsd: 20.0,
      cachedUsd: 2.0,
      outputUsd: 75.0,
      confidence: "official",
      notes:
        "GPT-6 Astra Standard Global long-context rate. Microsoft also publishes a $25.00/M cache-write rate; this catalog models cached-input reads, not cache creation.",
      sourceNote:
        "Microsoft Azure Foundry announcement (https://azure.microsoft.com/en-us/blog/gpt-6-astra-frontier-intelligence-for-work-now-generally-available-in-microsoft-foundry/), published 2026-09-03 and captured 2026-09-05: the GPT-6 Astra pricing table lists Standard Global long context at $20.00/M input, $2.00/M cached input, $25.00/M cached writes and $75.00/M output. A fresh full paged Azure Retail Prices API sweep on 2026-09-05 found no meter containing Astra or GPT-6 yet, so this row follows Microsoft's published Foundry table pending retail-meter publication. Cache writes are outside this schema.",
      effectiveDate: "2026-09-03",
    },
    {
      model: "GPT-6 Astra",
      tier: "DataZone",
      inputUsd: 11.0,
      cachedUsd: 1.1,
      outputUsd: 55.0,
      confidence: "official",
      notes:
        "GPT-6 Astra Standard US Data Zone short-context rate. Microsoft also publishes a $13.75/M cache-write rate; this catalog models cached-input reads, not cache creation.",
      sourceNote:
        "Microsoft Azure Foundry announcement (https://azure.microsoft.com/en-us/blog/gpt-6-astra-frontier-intelligence-for-work-now-generally-available-in-microsoft-foundry/), published 2026-09-03 and captured 2026-09-05: the GPT-6 Astra pricing table lists Standard Data Zone (US) short context at $11.00/M input, $1.10/M cached input, $13.75/M cached writes and $55.00/M output. A fresh full paged Azure Retail Prices API sweep on 2026-09-05 found no meter containing Astra or GPT-6 yet, so this row follows Microsoft's published Foundry table pending retail-meter publication. Cache writes are outside this schema.",
      effectiveDate: "2026-09-03",
    },
    {
      model: "GPT-6 Astra Long Context",
      tier: "DataZone",
      inputUsd: 22.0,
      cachedUsd: 2.2,
      outputUsd: 82.5,
      confidence: "official",
      notes:
        "GPT-6 Astra Standard US Data Zone long-context rate. Microsoft also publishes a $27.50/M cache-write rate; this catalog models cached-input reads, not cache creation.",
      sourceNote:
        "Microsoft Azure Foundry announcement (https://azure.microsoft.com/en-us/blog/gpt-6-astra-frontier-intelligence-for-work-now-generally-available-in-microsoft-foundry/), published 2026-09-03 and captured 2026-09-05: the GPT-6 Astra pricing table lists Standard Data Zone (US) long context at $22.00/M input, $2.20/M cached input, $27.50/M cached writes and $82.50/M output. A fresh full paged Azure Retail Prices API sweep on 2026-09-05 found no meter containing Astra or GPT-6 yet, so this row follows Microsoft's published Foundry table pending retail-meter publication. Cache writes are outside this schema.",
      effectiveDate: "2026-09-03",
    },
    {
      model: "GPT-5.6 Sol",
      tier: "Global",
      inputUsd: 5.0,
      cachedUsd: 0.5,
      outputUsd: 30.0,
      confidence: "official",
      notes:
        "Flagship (hardest reasoning / coding / agentic). GA 2026-07-09. No longer at parity with OpenAI direct: OpenAI cut Sol to $4.00/$0.40/$20.00 on 2026-08-21 as promotional pricing, and this Foundry meter has not followed — Foundry is 1.25x direct on input and cached input, and 1.50x on output.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models' meters (5.6 sol Std Gl, effective 2026-07-01; captured 2026-07-21, re-verified unchanged in a full paged sweep on 2026-08-22 — all sol meters still carry the single 2026-07-01 tranche, with no 2026-08-01 tranche of the kind that carried the Terra and Luna cuts). Cache write bills at 1.25x uncached input ($6.25/M meter); reads stay ~90% off. OpenAI's own rate for gpt-5.6-sol, read via raw DOM from developers.openai.com/api/docs/pricing on 2026-08-22, is $4.00/$0.40/$20.00 with a $5.00/M cache write, labelled promotional and \"available at least through November 21, 2026\".",
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
      notes:
        "~10% Data Zone premium over Global. Because the Global Sol meter did not follow OpenAI's 2026-08-21 promotional cut, this row is roughly 1.38x OpenAI's direct input rate and 1.65x its direct output rate.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models' meters (5.6 sol Std DZ, effective 2026-07-01; captured 2026-07-21, re-verified unchanged 2026-08-22 across the 13 US/EU Data Zone regions).",
      effectiveDate: "2026-07-21",
    },
    {
      model: "GPT-5.6 Sol Long Context",
      tier: "Global",
      inputUsd: 10.0,
      cachedUsd: 1.0,
      outputUsd: 45.0,
      confidence: "official",
      notes:
        "Long Context tier; all meters roughly double the short-context rates. Also left behind by OpenAI's 2026-08-21 promotional Sol cut, which took the direct long-context rate to $8.00/$0.80/$30.00 — so Foundry is 1.25x direct on input and 1.50x on output here too.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models' meters (5.6 sol LongCo Std Gl, effective 2026-07-01; captured 2026-07-21, re-verified unchanged 2026-08-22). OpenAI's direct long-context rate for gpt-5.6-sol, read via raw DOM on 2026-08-22, is $8.00/$0.80/$30.00 with a $10.00/M cache write.",
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
      title: "GPT-6 Astra is Foundry-only in this catalog",
      tone: "info",
      body: [
        "Microsoft announced GPT-6 Astra generally available in Foundry with Standard Global and Standard US Data Zone deployment options. The four rows above use the official announcement's published input, cached-input and output prices; its separate cache-write prices are called out but not modeled here. The full Azure Retail Prices API sweep captured 2026-09-05 did not yet expose an Astra/GPT-6 token meter, so re-check the retail feed before treating the published table as a billing-meter confirmation.",
      ],
    },
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
      title: "Sol is now the model Foundry has not repriced",
      tone: "warning",
      body: [
        "OpenAI cut GPT-5.6 Terra and Luna on 2026-07-30, and for three weeks the Azure Foundry meters did not follow. That gap closed on 2026-08-01, when a new Foundry tranche picked up the cut rates on Global, Data Zone, long-context and priority meters alike. Terra and Luna are at 1:1 with OpenAI direct today.",
        "The same thing has now happened to the flagship. On 2026-08-21 OpenAI cut GPT-5.6 Sol to $4.00/$0.40/$20.00 short context and $8.00/$0.80/$30.00 long context — its pricing page calls this promotional and \"available at least through November 21, 2026\" — while every Sol meter in the Azure retail catalog still sits on its original 2026-07-01 tranche at $5.00/$0.50/$30.00. Running Sol on Foundry Global costs 25% more per input token and 50% more per output token than going direct to OpenAI, and Data Zone stacks its usual 10% on top of that.",
        "Two things follow. If you are on Foundry for Sol specifically and have no data-residency requirement, the direct API is materially cheaper for as long as the promotion runs. And because OpenAI framed the cut as promotional with an open-ended \"at least through\" date rather than a fixed reversion, no reversion rate is published — this catalog does not stage a future price it cannot cite, so the Sol rows track the Azure meter and the gap is described here instead.",
        "Worth remembering: when Terra and Luna lagged, Azure support answers and at least one downstream cost tracker described the cut as already applied on Azure while the retail catalog still billed the old rate. The retail meter is what bills you.",
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
