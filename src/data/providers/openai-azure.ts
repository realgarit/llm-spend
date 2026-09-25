import type { Provider } from "../types";

const CAPTURED = "2026-07-11";

export const openaiAzure: Provider = {
  slug: "openai-azure",
  name: "OpenAI / Azure OpenAI",
  tagline: "GPT-6 Astra, Sol and Luna are available on OpenAI's direct API and Microsoft Foundry; Azure retail meters now confirm Sol/Luna rates and Sol Priority pricing.",
  intro: [
    "Azure OpenAI has historically matched OpenAI's direct pricing 1:1, so no resale markup. What changes is the deployment type on Microsoft Foundry (Global, Data Zone, Regional; see below). GPT-6 Astra is available through OpenAI's direct API and Foundry, with a $10/$1/$50 per M short-context rate, $20/$2/$75 above 272K, and published Global and US Data Zone rates. GPT-6 Sol and Luna became generally available in Foundry on September 22. The Azure Retail Prices API now confirms their Standard Global and US/EU Data Zone meters, effective September 1, and the listed prices match Microsoft's announcement and OpenAI's Direct rates. Azure also publishes GPT-6 Sol Priority Processing meters for Global and US Data Zone; Luna has no Priority meter. Cache-write prices are separately billed and not modeled by this schema, which tracks cached-input reads. OpenAI also lists GPT-Rosalind Research at $5/$0.50/$25 per M for approved life-sciences research, with billing beginning 2026-10-05 and no cache-write charge. GPT-5.6 (Sol / Terra / Luna) hit GA on 2026-07-09 and has official Azure Foundry meters covering cached-input and cache-write plus Data Zone (+10%) and long-context tiers.",
    "That 1:1 parity briefly broke. OpenAI cut Terra and Luna on 2026-07-30 and Foundry took three weeks to follow, with a meter tranche effective 2026-08-01 that restored parity on those two. OpenAI then cut the Sol flagship — to $4.00/$0.40/$20.00 short context and $8.00/$0.80/$30.00 long context, described on its pricing page as promotional and available \"at least through November 21, 2026\". The commercial Foundry retail feed now carries those Sol rates effective 2026-09-01, plus the corresponding 10% Data Zone and Priority Processing meters, so the previous Foundry/direct gap is closed for the published commercial lanes.",
  ],
  entries: [
    {
      model: "GPT-6 Astra",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 10.0,
      cachedUsd: 1.0,
      outputUsd: 50.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "OpenAI API Standard short-context rate. Prompts above 272K input tokens use the separate long-context row below; Batch and Flex are half price, while Fast mode is 2x Standard.",
      sourceNote:
        "OpenAI's official GPT-6 Astra model page (developers.openai.com/api/docs/models/gpt-6-astra), captured 2026-09-07: the live API model is `gpt-6-astra` with a 1,050,000-token context window, 128,000 max output, and $10/M input, $1/M cached input, $12.50/M cache writes and $50/M output. The OpenAI API pricing page confirms the same Standard row and publishes the Batch, Flex and Fast-mode schedules.",
      effectiveDate: "2026-09-07",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 5.0,
          cachedUsd: 0.5,
          outputUsd: 25.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Astra model page, captured 2026-09-07, states that Batch is priced at 50% of Standard; the explicit $5/$0.50/$25 per M values match the OpenAI API pricing table.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex" },
          inputUsd: 5.0,
          cachedUsd: 0.5,
          outputUsd: 25.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Astra model page, captured 2026-09-07, states that Flex is priced at 50% of Standard; the explicit $5/$0.50/$25 per M values match the OpenAI API pricing table.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 20.0,
          cachedUsd: 2.0,
          outputUsd: 100.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Astra model page, captured 2026-09-07, states that Fast mode is priced at 2x the applicable Standard rate; the explicit $20/$2/$100 per M values match the OpenAI API pricing table. The catalog's `priority` service-tier value maps to OpenAI's Fast mode label.",
        },
      ],
    },
    {
      model: "GPT-6 Astra Long Context",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 20.0,
      cachedUsd: 2.0,
      outputUsd: 75.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "OpenAI API Standard long-context rate for prompts above 272K input tokens. Batch and Flex are half price, while Fast mode is 2x Standard.",
      sourceNote:
        "OpenAI's official GPT-6 Astra model page (developers.openai.com/api/docs/models/gpt-6-astra), captured 2026-09-07: prompts above 272K input tokens are charged at 2x input/cache rates and 1.5x output, giving $20/M input, $2/M cached input, $25/M cache writes and $75/M output. The OpenAI API pricing page confirms the same long-context Standard row and publishes the Batch, Flex and Fast-mode schedules.",
      effectiveDate: "2026-09-07",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 10.0,
          cachedUsd: 1.0,
          outputUsd: 37.5,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Astra model page, captured 2026-09-07, states that Batch is priced at 50% of the long-context Standard rate; the explicit $10/$1/$37.50 per M values match the OpenAI API pricing table.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex" },
          inputUsd: 10.0,
          cachedUsd: 1.0,
          outputUsd: 37.5,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Astra model page, captured 2026-09-07, states that Flex is priced at 50% of the long-context Standard rate; the explicit $10/$1/$37.50 per M values match the OpenAI API pricing table.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 40.0,
          cachedUsd: 4.0,
          outputUsd: 150.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Astra model page, captured 2026-09-07, states that Fast mode is priced at 2x the applicable long-context Standard rate; the explicit $40/$4/$150 per M values match the OpenAI API pricing table. The catalog's `priority` service-tier value maps to OpenAI's Fast mode label.",
        },
      ],
    },
    {
      model: "GPT-6 Sol",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 2.0,
      cachedUsd: 0.2,
      outputUsd: 10.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Global Standard short-context rate for prompts up to 272K input tokens. Prompts above 272K use the long-context row below. Batch and Flex are half price; Fast mode is 2x. OpenAI's optional 10% regional-processing premium is not represented as a separate Direct lane.",
      sourceNote:
        "OpenAI's official GPT-6 Sol model page (developers.openai.com/api/docs/models/gpt-6-sol), captured 2026-09-23: standard pricing is $2/M input, $0.20/M cached input, and $10/M output below 272K prompt tokens, with a 1,050,000-token context and 128,000 max output. Cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 1.0,
          cachedUsd: 0.1,
          outputUsd: 5.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Sol model page, captured 2026-09-23, states Batch is 50% of Standard; the explicit $1/$0.10/$5 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex" },
          inputUsd: 1.0,
          cachedUsd: 0.1,
          outputUsd: 5.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Sol model page, captured 2026-09-23, states Flex is 50% of Standard; the explicit $1/$0.10/$5 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 4.0,
          cachedUsd: 0.4,
          outputUsd: 20.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Sol model page, captured 2026-09-23, states Fast mode is 2x Standard; the explicit $4/$0.40/$20 per M rates are stored here. The catalog's `priority` service tier maps to OpenAI Fast mode.",
        },
      ],
    },
    {
      model: "GPT-6 Sol Long Context",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 4.0,
      cachedUsd: 0.4,
      outputUsd: 15.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Global Standard long-context rate for prompts above 272K input tokens. Batch and Flex are half price; Fast mode is 2x. OpenAI's optional regional-processing premium is not represented as a separate Direct lane.",
      sourceNote:
        "OpenAI's official GPT-6 Sol model page (developers.openai.com/api/docs/models/gpt-6-sol), captured 2026-09-23: prompts with more than 272K input tokens use $4/M input, $0.40/M cached input, and $15/M output, with a 1,050,000-token context and 128,000 max output. Cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 2.0,
          cachedUsd: 0.2,
          outputUsd: 7.5,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Sol model page, captured 2026-09-23, states Batch is 50% of the long-context Standard rate; the explicit $2/$0.20/$7.50 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex" },
          inputUsd: 2.0,
          cachedUsd: 0.2,
          outputUsd: 7.5,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Sol model page, captured 2026-09-23, states Flex is 50% of the long-context Standard rate; the explicit $2/$0.20/$7.50 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 8.0,
          cachedUsd: 0.8,
          outputUsd: 30.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Sol model page, captured 2026-09-23, states Fast mode is 2x the long-context Standard rate; the explicit $8/$0.80/$30 per M rates are stored here. The catalog's `priority` service tier maps to OpenAI Fast mode.",
        },
      ],
    },
    {
      model: "GPT-6 Luna",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 0.1,
      cachedUsd: 0.01,
      outputUsd: 0.5,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Global Standard short-context rate for prompts up to 272K input tokens. Prompts above 272K use the long-context row below. Batch and Flex are half price; Fast mode is 2x. OpenAI's optional regional-processing premium is not represented as a separate Direct lane.",
      sourceNote:
        "OpenAI's official GPT-6 Luna model page (developers.openai.com/api/docs/models/gpt-6-luna), captured 2026-09-23: standard pricing is $0.10/M input, $0.01/M cached input, and $0.50/M output below 272K prompt tokens, with a 1,050,000-token context and 128,000 max output. Cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 0.05,
          cachedUsd: 0.005,
          outputUsd: 0.25,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Luna model page, captured 2026-09-23, states Batch is 50% of Standard; the explicit $0.05/$0.005/$0.25 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex" },
          inputUsd: 0.05,
          cachedUsd: 0.005,
          outputUsd: 0.25,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Luna model page, captured 2026-09-23, states Flex is 50% of Standard; the explicit $0.05/$0.005/$0.25 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 0.2,
          cachedUsd: 0.02,
          outputUsd: 1.0,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Luna model page, captured 2026-09-23, states Fast mode is 2x Standard; the explicit $0.20/$0.02/$1 per M rates are stored here. The catalog's `priority` service tier maps to OpenAI Fast mode.",
        },
      ],
    },
    {
      model: "GPT-6 Luna Long Context",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 0.2,
      cachedUsd: 0.02,
      outputUsd: 0.75,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "Global Standard long-context rate for prompts above 272K input tokens. Batch and Flex are half price; Fast mode is 2x. OpenAI's optional regional-processing premium is not represented as a separate Direct lane.",
      sourceNote:
        "OpenAI's official GPT-6 Luna model page (developers.openai.com/api/docs/models/gpt-6-luna), captured 2026-09-23: prompts with more than 272K input tokens use $0.20/M input, $0.02/M cached input, and $0.75/M output, with a 1,050,000-token context and 128,000 max output. Cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Batch",
          conditions: { serviceTier: "batch" },
          inputUsd: 0.1,
          cachedUsd: 0.01,
          outputUsd: 0.375,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Luna model page, captured 2026-09-23, states Batch is 50% of the long-context Standard rate; the explicit $0.10/$0.01/$0.375 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex" },
          inputUsd: 0.1,
          cachedUsd: 0.01,
          outputUsd: 0.375,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Luna model page, captured 2026-09-23, states Flex is 50% of the long-context Standard rate; the explicit $0.10/$0.01/$0.375 per M rates are stored here. Cache-write pricing is outside the schema.",
        },
        {
          label: "Fast mode",
          conditions: { serviceTier: "priority" },
          inputUsd: 0.4,
          cachedUsd: 0.04,
          outputUsd: 1.5,
          confidence: "official",
          sourceNote:
            "OpenAI's official GPT-6 Luna model page, captured 2026-09-23, states Fast mode is 2x the long-context Standard rate; the explicit $0.40/$0.04/$1.50 per M rates are stored here. The catalog's `priority` service tier maps to OpenAI Fast mode.",
        },
      ],
    },
    {
      model: "GPT-Rosalind Research",
      host: "OpenAI direct API",
      tier: "Direct",
      inputUsd: 5.0,
      cachedUsd: 0.5,
      outputUsd: 25.0,
      confidence: "official",
      notes:
        "Specialized life-sciences research model. API access is limited to approved internal research; published billing begins 2026-10-05. No cache-write charge applies.",
      sourceNote:
        "OpenAI's official API pricing page (developers.openai.com/api/docs/pricing), re-read 2026-09-12: `gpt-rosalind-research` is listed at $5/M input, $0.50/M cached input and $25/M output. The same page says billing begins 2026-10-05, cache-write pricing does not apply, and access is limited to approved internal research. The full Azure Retail Prices Foundry feed checked 2026-09-12 contains no Rosalind token meter, so this is a Direct-only lane.",
      effectiveDate: "2026-10-05",
    },
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
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'Azure OpenAI GPT6', captured 2026-09-10: effective 2026-09-01 meters '6-astra ShortCo Inp Std Gl 1M Tokens' $10.00/M, '6-astra ShortCo Cd Inp Std Gl 1M Tokens' $1.00/M, '6-astra ShortCo Cd Wr Std Gl 1M Tokens' $12.50/M and '6-astra ShortCo Opt Std Gl 1M Tokens' $50.00/M, grouped consistently across 27 Global regions. These retail meters confirm the Global figures published in Microsoft's September 3 Foundry announcement; cache writes remain outside this schema.",
      effectiveDate: "2026-09-01",
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
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'Azure OpenAI GPT6', captured 2026-09-10: effective 2026-09-01 meters '6-astra LongCo Inp Std Gl 1M Tokens' $20.00/M, '6-astra LongCo Cd Inp Std Gl 1M Tokens' $2.00/M, '6-astra LongCo Cd Wr Std Gl 1M Tokens' $25.00/M and '6-astra LongCo Opt Std Gl 1M Tokens' $75.00/M, grouped consistently across 27 Global regions. These retail meters confirm the Long Context figures published in Microsoft's September 3 Foundry announcement; cache writes remain outside this schema.",
      effectiveDate: "2026-09-01",
    },
    {
      model: "GPT-6 Astra",
      tier: "DataZone",
      inputUsd: 11.0,
      cachedUsd: 1.1,
      outputUsd: 55.0,
      confidence: "official",
      notes:
        "GPT-6 Astra Standard US Data Zone short-context rate. Microsoft also publishes a $13.75/M cache-write rate; this catalog models cached-input reads, not cache creation. The same retail meter is $12.00/$1.20/$60.00 in a separate 14-region non-US Data Zone group; this catalog keeps one primary Data Zone rate per lane.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'Azure OpenAI GPT6', captured 2026-09-10: effective 2026-09-01 meters '6-astra ShortCo Inp Std DZ 1M Tokens' $11.00/M, '6-astra ShortCo Cd Inp Std DZ 1M Tokens' $1.10/M, '6-astra ShortCo Cd Wr Std DZ 1M Tokens' $13.75/M and '6-astra ShortCo Opt Std DZ 1M Tokens' $55.00/M across seven US regions. The same meter names are $12.00/$1.20/$15.00/$60.00 across 14 non-US regions; the catalog's single DataZone row represents the published US group and records the second group in its note. Cache writes remain outside this schema.",
      effectiveDate: "2026-09-01",
    },
    {
      model: "GPT-6 Astra Long Context",
      tier: "DataZone",
      inputUsd: 22.0,
      cachedUsd: 2.2,
      outputUsd: 82.5,
      confidence: "official",
      notes:
        "GPT-6 Astra Standard US Data Zone long-context rate. Microsoft also publishes a $27.50/M cache-write rate; this catalog models cached-input reads, not cache creation. The same retail meter is $24.00/$2.40/$90.00 in a separate 14-region non-US Data Zone group; this catalog keeps one primary Data Zone rate per lane.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'Azure OpenAI GPT6', captured 2026-09-10: effective 2026-09-01 meters '6-astra LongCo Inp Std DZ 1M Tokens' $22.00/M, '6-astra LongCo Cd Inp Std DZ 1M Tokens' $2.20/M, '6-astra LongCo Cd Wr Std DZ 1M Tokens' $27.50/M and '6-astra LongCo Opt Std DZ 1M Tokens' $82.50/M across seven US regions. The same meter names are $24.00/$2.40/$30.00/$90.00 across 14 non-US regions; the catalog's single DataZone row represents the published US group and records the second group in its note. Cache writes remain outside this schema.",
      effectiveDate: "2026-09-01",
    },
    {
      model: "GPT-6 Sol",
      tier: "Global",
      inputUsd: 2.0,
      cachedUsd: 0.2,
      outputUsd: 10.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes: "GPT-6 Sol Standard Global short-context rate. The published $2.50/M cache-write rate is outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-sol ShortCo Inp Std Gl', 'Cd Inp Std Gl' and 'Opt Std Gl' meters are $2.00/$0.20/$10.00 per M effective 2026-09-01 across 26 Global regions; the companion cache-write meter is $2.50/M and is outside this schema. Microsoft's September 22 Foundry announcement lists GPT-6 Sol as generally available.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Priority",
          conditions: { from: "2026-09-22T00:00:00Z", serviceTier: "priority" },
          inputUsd: 4.0,
          cachedUsd: 0.4,
          outputUsd: 20.0,
          confidence: "official",
          notes: "Foundry Priority Processing (PP); the $5.00/M cache-write meter is outside this schema.",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-25: '6-sol ShortCo Inp PP Gl', 'Cd Inp PP Gl' and 'Opt PP Gl' are $4.00/$0.40/$20.00 per M effective 2026-09-01 across 26 Global regions; the companion cache-write meter is $5.00/M and is outside this schema. Microsoft's September 22 launch confirms Priority Processing for GPT-6 Sol on Global deployments.",
        },
      ],
    },
    {
      model: "GPT-6 Sol Long Context",
      tier: "Global",
      inputUsd: 4.0,
      cachedUsd: 0.4,
      outputUsd: 15.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes: "GPT-6 Sol Standard Global long-context rate for prompts above 272K input tokens. The published $5.00/M cache-write rate is outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-sol LongCo Inp Std Gl', 'Cd Inp Std Gl' and 'Opt Std Gl' meters are $4.00/$0.40/$15.00 per M effective 2026-09-01 across 26 Global regions; the companion cache-write meter is $5.00/M and is outside this schema. Microsoft's September 22 Foundry announcement lists GPT-6 Sol as generally available.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Priority",
          conditions: { from: "2026-09-22T00:00:00Z", serviceTier: "priority" },
          inputUsd: 8.0,
          cachedUsd: 0.8,
          outputUsd: 30.0,
          confidence: "official",
          notes: "Foundry Priority Processing (PP); the $10.00/M cache-write meter is outside this schema.",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-25: '6-sol LongCo Inp PP Gl', 'Cd Inp PP Gl' and 'Opt PP Gl' are $8.00/$0.80/$30.00 per M effective 2026-09-01 across 26 Global regions; the companion cache-write meter is $10.00/M and is outside this schema. Microsoft's September 22 launch confirms Priority Processing for GPT-6 Sol on Global deployments.",
        },
      ],
    },
    {
      model: "GPT-6 Sol",
      tier: "DataZone",
      inputUsd: 2.2,
      cachedUsd: 0.22,
      outputUsd: 11.0,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "GPT-6 Sol Standard US Data Zone short-context rate. The EU Data Zone group is $2.40/$0.24/$12.00 per M; this catalog keeps the US group as its primary Data Zone lane. Priority is also priced for the US group; cache writes are outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-sol ShortCo Inp Std DZ', 'Cd Inp Std DZ' and 'Opt Std DZ' meters are $2.20/$0.22/$11.00 per M effective 2026-09-01 across seven US Data Zone regions; the companion cache-write meter is $2.75/M. The same meters are $2.40/$0.24/$12.00/$3.00 per M across six EU regions. Microsoft's September 22 announcement confirms Standard availability in US and EU Data Zones; cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Priority",
          conditions: { from: "2026-09-22T00:00:00Z", serviceTier: "priority" },
          inputUsd: 4.4,
          cachedUsd: 0.44,
          outputUsd: 22.0,
          confidence: "official",
          notes: "US Data Zone Priority Processing; the retail feed also lists EU meters, but the launch post only confirms US Data Zone Priority availability.",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-25: US-region '6-sol ShortCo Inp PP DZ', 'Cd Inp PP DZ' and 'Opt PP DZ' meters are $4.40/$0.44/$22.00 per M effective 2026-09-01 across seven US Data Zone regions; the companion cache-write meter is $5.50/M. The feed also lists six EU-region PP meters at $4.80/$0.48/$24.00/M (with $6.00/M cache writes), but Microsoft's September 22 launch confirms Priority Processing only for Global and US Data Zone, so this row represents the US offer.",
        },
      ],
    },
    {
      model: "GPT-6 Sol Long Context",
      tier: "DataZone",
      inputUsd: 4.4,
      cachedUsd: 0.44,
      outputUsd: 16.5,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "GPT-6 Sol Standard US Data Zone long-context rate for prompts above 272K input tokens. The EU Data Zone group is $4.80/$0.48/$18.00 per M; this catalog keeps the US group as its primary Data Zone lane. Priority is also priced for the US group; cache writes are outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-sol LongCo Inp Std DZ', 'Cd Inp Std DZ' and 'Opt Std DZ' meters are $4.40/$0.44/$16.50 per M effective 2026-09-01 across seven US Data Zone regions; the companion cache-write meter is $5.50/M. The same meters are $4.80/$0.48/$18.00/$6.00 per M across six EU regions. Microsoft's September 22 announcement confirms Standard availability in US and EU Data Zones; cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
      variants: [
        {
          label: "Priority",
          conditions: { from: "2026-09-22T00:00:00Z", serviceTier: "priority" },
          inputUsd: 8.8,
          cachedUsd: 0.88,
          outputUsd: 33.0,
          confidence: "official",
          notes: "US Data Zone Priority Processing; the retail feed also lists EU meters, but the launch post only confirms US Data Zone Priority availability.",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-25: US-region '6-sol LongCo Inp PP DZ', 'Cd Inp PP DZ' and 'Opt PP DZ' meters are $8.80/$0.88/$33.00 per M effective 2026-09-01 across seven US Data Zone regions; the companion cache-write meter is $11.00/M. The feed also lists six EU-region PP meters at $9.60/$0.96/$36.00/M (with $12.00/M cache writes), but Microsoft's September 22 launch confirms Priority Processing only for Global and US Data Zone, so this row represents the US offer.",
        },
      ],
    },
    {
      model: "GPT-6 Luna",
      tier: "Global",
      inputUsd: 0.1,
      cachedUsd: 0.01,
      outputUsd: 0.5,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes: "GPT-6 Luna Standard Global short-context rate. The published $0.125/M cache-write rate is outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-luna ShortCo Inp Std Gl', 'Cd Inp Std Gl' and 'Opt Std Gl' meters are $0.10/$0.01/$0.50 per M effective 2026-09-01 across 26 Global regions; the companion cache-write meter is $0.125/M and is outside this schema. Microsoft's September 22 Foundry announcement lists GPT-6 Luna as generally available.",
      effectiveDate: "2026-09-22",
    },
    {
      model: "GPT-6 Luna Long Context",
      tier: "Global",
      inputUsd: 0.2,
      cachedUsd: 0.02,
      outputUsd: 0.75,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes: "GPT-6 Luna Standard Global long-context rate for prompts above 272K input tokens. The published $0.25/M cache-write rate is outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-luna LongCo Inp Std Gl', 'Cd Inp Std Gl' and 'Opt Std Gl' meters are $0.20/$0.02/$0.75 per M effective 2026-09-01 across 26 Global regions; the companion cache-write meter is $0.25/M and is outside this schema. Microsoft's September 22 Foundry announcement lists GPT-6 Luna as generally available.",
      effectiveDate: "2026-09-22",
    },
    {
      model: "GPT-6 Luna",
      tier: "DataZone",
      inputUsd: 0.11,
      cachedUsd: 0.011,
      outputUsd: 0.55,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "GPT-6 Luna Standard US Data Zone short-context rate. The EU Data Zone group is $0.12/$0.012/$0.60 per M; this catalog keeps the US group as its primary Data Zone lane. Cache writes are outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-luna ShortCo Inp Std DZ', 'Cd Inp Std DZ' and 'Opt Std DZ' meters are $0.11/$0.011/$0.55 per M effective 2026-09-01 across seven US Data Zone regions; the companion cache-write meter is $0.1375/M. The same meters are $0.12/$0.012/$0.60/$0.15 per M across six EU regions. Microsoft's September 22 announcement confirms Standard availability in US and EU Data Zones; cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
    },
    {
      model: "GPT-6 Luna Long Context",
      tier: "DataZone",
      inputUsd: 0.22,
      cachedUsd: 0.022,
      outputUsd: 0.825,
      contextWindow: 1_050_000,
      maxOutput: 128_000,
      confidence: "official",
      notes:
        "GPT-6 Luna Standard US Data Zone long-context rate for prompts above 272K input tokens. The EU Data Zone group is $0.24/$0.024/$0.90 per M; this catalog keeps the US group as its primary Data Zone lane. Cache writes are outside this schema.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models' and productName 'Azure OpenAI GPT6', captured 2026-09-25: the '6-luna LongCo Inp Std DZ', 'Cd Inp Std DZ' and 'Opt Std DZ' meters are $0.22/$0.022/$0.825 per M effective 2026-09-01 across seven US Data Zone regions; the companion cache-write meter is $0.275/M. The same meters are $0.24/$0.024/$0.90/$0.30 per M across six EU regions. Microsoft's September 22 announcement confirms Standard availability in US and EU Data Zones; cache writes are outside this schema.",
      effectiveDate: "2026-09-22",
    },
    {
      model: "GPT-5.6 Sol",
      tier: "Global",
      inputUsd: 5.0,
      cachedUsd: 0.5,
      outputUsd: 30.0,
      confidence: "official",
      notes:
        "Flagship (hardest reasoning / coding / agentic). GA 2026-07-09. The original Foundry Global meter was $5.00/$0.50/$30.00; a commercial retail tranche effective 2026-09-01 now carries $4.00/$0.40/$20.00, matching OpenAI's promotional direct rate.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', captured 2026-09-14: the original '5.6 sol ShortCo Inp/Cd Inp/Opt Std Gl 1M Tokens' meters were $5.00/$0.50/$30.00 effective 2026-07-01; the commercial '5.6 sol ShortCo Inp Std Gl', '5.6 sol ShortCo Cd Inp Std Gl', '5.6 sol ShortCo Cd Wr Std Gl' and '5.6 sol ShortCo Opt Std Gl 1M Tokens' meters are $4.00/$0.40/$5.00/$20.00 per M effective 2026-09-01 across 24 Global regions. OpenAI's official API pricing page lists the matching $4.00/$0.40/$20.00 direct promotion through at least November 21, 2026; the dated Standard variant below represents the current Azure retail rate.",
      effectiveDate: "2026-07-21",
      variants: [
        {
          label: "Priority",
          conditions: { until: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 10.0,
          cachedUsd: 1.0,
          outputUsd: 60.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API 'Foundry Models', captured 2026-09-14: the pre-promotion '5.6 sol ShortCo Inp/Cd Inp/Opt PP Gl' meters were $10.00/$1.00/$60.00 per M effective 2026-07-01. Azure calls this tier 'PP' (priority processing); it maps to this schema's 'priority' service tier. The later commercial September 1 tranche is represented by the dated Priority variant below.",
        },
        {
          label: "Standard (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z" },
          inputUsd: 4.0,
          cachedUsd: 0.4,
          outputUsd: 20.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol ShortCo Inp Std Gl', '5.6 sol ShortCo Cd Inp Std Gl' and '5.6 sol ShortCo Opt Std Gl 1M Tokens' meters are $4.00/$0.40/$20.00 per M effective 2026-09-01 across 24 Global regions; the companion cache-write meter is $5.00/M and is outside this schema.",
        },
        {
          label: "Priority (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 8.0,
          cachedUsd: 0.8,
          outputUsd: 40.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol ShortCo Inp PP Gl', '5.6 sol ShortCo Cd Inp PP Gl' and '5.6 sol ShortCo Opt PP Gl 1M Tokens' meters are $8.00/$0.80/$40.00 per M effective 2026-09-01 across 24 Global regions; the companion cache-write meter is $10.00/M and is outside this schema. Azure's PP tier maps to this schema's priority service tier.",
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
        "~10% Data Zone premium over the commercial Global Sol rate. The original Foundry Data Zone meter was $5.50/$0.55/$33.00; the commercial September 1, 2026 tranche now carries $4.40/$0.44/$22.00.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', captured 2026-09-14: the commercial '5.6 sol ShortCo Inp Std DZ', '5.6 sol ShortCo Cd Inp Std DZ', '5.6 sol ShortCo Cd Wr Std DZ' and '5.6 sol ShortCo Opt Std DZ 1M Tokens' meters are $4.40/$0.44/$5.50/$22.00 per M effective 2026-09-01 across 13 US/EU Data Zone regions. Separate US-Government rows are $5.50/$0.55/$27.50 and are excluded from the commercial lane.",
      effectiveDate: "2026-07-21",
      variants: [
        {
          label: "Standard (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z" },
          inputUsd: 4.4,
          cachedUsd: 0.44,
          outputUsd: 22.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol ShortCo Inp Std DZ', '5.6 sol ShortCo Cd Inp Std DZ' and '5.6 sol ShortCo Opt Std DZ 1M Tokens' meters are $4.40/$0.44/$22.00 per M effective 2026-09-01 across 13 US/EU Data Zone regions; the companion cache-write meter is $5.50/M and is outside this schema.",
        },
        {
          label: "Priority (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 8.8,
          cachedUsd: 0.88,
          outputUsd: 44.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol ShortCo Inp PP DZ', '5.6 sol ShortCo Cd Inp PP DZ' and '5.6 sol ShortCo Opt PP DZ 1M Tokens' meters are $8.80/$0.88/$44.00 per M effective 2026-09-01 across 13 US/EU Data Zone regions; the companion cache-write meter is $11.00/M and is outside this schema. Azure's PP tier maps to this schema's priority service tier.",
        },
      ],
    },
    {
      model: "GPT-5.6 Sol Long Context",
      tier: "Global",
      inputUsd: 10.0,
      cachedUsd: 1.0,
      outputUsd: 45.0,
      confidence: "official",
      notes:
        "Long Context tier; the original Foundry rate was $10.00/$1.00/$45.00. The commercial September 1, 2026 retail tranche now carries $8.00/$0.80/$30.00, matching OpenAI's direct long-context promotion.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', captured 2026-09-14: the original '5.6 sol LongCo Inp/Cd Inp/Opt Std Gl 1M Tokens' meters were $10.00/$1.00/$45.00 effective 2026-07-01; the commercial '5.6 sol LongCo Inp Std Gl', '5.6 sol LongCo Cd Inp Std Gl', '5.6 sol LongCo Cd Wr Std Gl' and '5.6 sol LongCo Opt Std Gl 1M Tokens' meters are $8.00/$0.80/$10.00/$30.00 per M effective 2026-09-01 across 24 Global regions. OpenAI's official API pricing page lists the matching $8.00/$0.80/$30.00 direct long-context promotion; the dated variants below represent the current Azure retail rates.",
      effectiveDate: "2026-07-21",
      variants: [
        {
          label: "Standard (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z" },
          inputUsd: 8.0,
          cachedUsd: 0.8,
          outputUsd: 30.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol LongCo Inp Std Gl', '5.6 sol LongCo Cd Inp Std Gl' and '5.6 sol LongCo Opt Std Gl 1M Tokens' meters are $8.00/$0.80/$30.00 per M effective 2026-09-01 across 24 Global regions; the companion cache-write meter is $10.00/M and is outside this schema.",
        },
        {
          label: "Priority (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 16.0,
          cachedUsd: 1.6,
          outputUsd: 60.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol LongCo Inp PP Gl', '5.6 sol LongCo Cd Inp PP Gl' and '5.6 sol LongCo Opt PP Gl 1M Tokens' meters are $16.00/$1.60/$60.00 per M effective 2026-09-01 across 25 Global regions; the companion cache-write meter is $20.00/M and is outside this schema. Azure's PP tier maps to this schema's priority service tier.",
        },
      ],
    },
    {
      model: "GPT-5.6 Sol Long Context",
      tier: "DataZone",
      inputUsd: 8.8,
      cachedUsd: 0.88,
      outputUsd: 33.0,
      confidence: "official",
      notes:
        "New commercial Data Zone long-context lane, effective 2026-09-01; it carries the same ~10% Data Zone premium as the short-context row. Priority Processing is also published for this lane.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', captured 2026-09-14: commercial '5.6 sol LongCo Inp Std DZ', '5.6 sol LongCo Cd Inp Std DZ' and '5.6 sol LongCo Opt Std DZ 1M Tokens' meters are $8.80/$0.88/$33.00 per M effective 2026-09-01 across 13 US/EU Data Zone regions. Separate US-Government rows are $11.00/$1.10/$41.25 and are excluded from the commercial lane; the companion cache-write meter is $11.00/M.",
      effectiveDate: "2026-09-01",
      variants: [
        {
          label: "Priority (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 17.6,
          cachedUsd: 1.76,
          outputUsd: 66.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 sol LongCo Inp PP DZ', '5.6 sol LongCo Cd Inp PP DZ' and '5.6 sol LongCo Opt PP DZ 1M Tokens' meters are $17.60/$1.76/$66.00 per M effective 2026-09-01 across 13 US/EU Data Zone regions; the companion cache-write meter is $22.00/M and is outside this schema. Azure's PP tier maps to this schema's priority service tier.",
        },
      ],
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
            "Azure Retail Prices API 'Foundry Models', captured 2026-08-20: '5.6 terra ShortCo Inp PP Gl 1M Tokens' $4.00/M, 'Cd Inp PP Gl' $0.40/M and 'Opt PP Gl' $24.00/M are effective 2026-08-01, exactly 2x this row's Standard Global rate on every dimension. The PP meters were cut alongside the Standard ones, so this tier tracks 2x the post-cut rate. Azure calls this tier 'PP' (priority processing); it maps to this schema's 'priority' service tier, and OpenAI renamed the same tier 'Fast mode' on 2026-07-30. The feed now also publishes LongCo PP meters on the long-context rows effective 2026-09-01.",
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
        "Long Context tier, for prompts past the short-context threshold; input and cached input are 2x the short-context rates, output 1.5x. Cut from $5.00/$0.50/$22.50 in the 2026-08-01 Foundry tranche as the short-context Terra row, matching OpenAI's direct long-context rate exactly. A commercial long-context Priority Processing meter arrived in the 2026-09-01 tranche.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models', captured 2026-09-14: '5.6 terra LongCo Inp Std Gl 1M Tokens' $4.00/M, 'Cd Inp Std Gl' $0.40/M, 'Cd Wr Std Gl' $5.00/M and 'Opt Std Gl' $18.00/M are effective 2026-08-01 across 24 Global regions. The newly published commercial '5.6 terra LongCo Inp PP Gl', '5.6 terra LongCo Cd Inp PP Gl', '5.6 terra LongCo Cd Wr PP Gl' and '5.6 terra LongCo Opt PP Gl 1M Tokens' meters are $8.00/$0.80/$10.00/$36.00 per M effective 2026-09-01 across 25 Global regions; cache writes remain outside this schema.",
      effectiveDate: "2026-08-20",
      variants: [
        {
          label: "Priority (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 8.0,
          cachedUsd: 0.8,
          outputUsd: 36.0,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 terra LongCo Inp PP Gl', '5.6 terra LongCo Cd Inp PP Gl' and '5.6 terra LongCo Opt PP Gl 1M Tokens' meters are $8.00/$0.80/$36.00 per M effective 2026-09-01 across 25 Global regions; the companion cache-write meter is $10.00/M and is outside this schema. Azure's PP tier maps to this schema's priority service tier.",
        },
      ],
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
            "Azure Retail Prices API 'Foundry Models', captured 2026-08-20: '5.6 luna ShortCo Inp PP Gl 1M Tokens' $0.40/M, 'Cd Inp PP Gl' $0.04/M and 'Opt PP Gl' $2.40/M are effective 2026-08-01, exactly 2x this row's Standard Global rate on every dimension. The PP meters were cut alongside the Standard ones, so this tier tracks 2x the post-cut rate. Azure calls this tier 'PP' (priority processing); it maps to this schema's 'priority' service tier, and OpenAI renamed the same tier 'Fast mode' on 2026-07-30. The feed now also publishes LongCo PP meters on the long-context rows effective 2026-09-01.",
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
        "Long Context tier, for prompts past the short-context threshold; input and cached input are 2x the short-context rates, output 1.5x. Cut from $2.00/$0.20/$9.00 in the 2026-08-01 Foundry tranche as the short-context Luna row, matching OpenAI's direct long-context rate exactly. A commercial long-context Priority Processing meter arrived in the 2026-09-01 tranche.",
      sourceNote:
        "Azure Retail Prices API 'Foundry Models', captured 2026-09-14: '5.6 luna LongCo Inp Std Gl 1M Tokens' $0.40/M, 'Cd Inp Std Gl' $0.04/M, 'Cd Wr Std Gl' $0.50/M and 'Opt Std Gl' $1.80/M are effective 2026-08-01 across 24 Global regions. The newly published commercial '5.6 luna LongCo Inp PP Gl', '5.6 luna LongCo Cd Inp PP Gl', '5.6 luna LongCo Cd Wr PP Gl' and '5.6 luna LongCo Opt PP Gl 1M Tokens' meters are $0.80/$0.08/$1.00/$3.60 per M effective 2026-09-01 across 25 Global regions; cache writes remain outside this schema.",
      effectiveDate: "2026-08-20",
      variants: [
        {
          label: "Priority (from 2026-09-01)",
          conditions: { from: "2026-09-01T00:00:00Z", serviceTier: "priority" },
          inputUsd: 0.8,
          cachedUsd: 0.08,
          outputUsd: 3.6,
          confidence: "official",
          sourceNote:
            "Azure Retail Prices API, captured 2026-09-14: commercial '5.6 luna LongCo Inp PP Gl', '5.6 luna LongCo Cd Inp PP Gl' and '5.6 luna LongCo Opt PP Gl 1M Tokens' meters are $0.80/$0.08/$3.60 per M effective 2026-09-01 across 25 Global regions; the companion cache-write meter is $1.00/M and is outside this schema. Azure's PP tier maps to this schema's priority service tier.",
        },
      ],
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
      title: "GPT-6 Astra is now direct and Foundry",
      tone: "info",
      body: [
        "OpenAI's official API model page now lists GPT-6 Astra as the live `gpt-6-astra` model at $10/$1/$50 per M for Standard short context, with a $20/$2/$75 long-context row above 272K input tokens. Batch and Flex are half price and Fast mode is 2x; the catalog maps Fast mode to its shared Priority service-tier selector. Microsoft's Azure Retail Prices API now publishes 16 effective-2026-09-01 Astra token meters under Azure OpenAI GPT6. The Global and seven-region US Data Zone groups match Microsoft's announcement; a separate 14-region non-US Data Zone group is 1.20x Global, so the catalog's primary Data Zone rows explicitly document the regional split.",
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
      title: "Sol's Foundry promotion reached the retail feed",
      tone: "warning",
      body: [
        "OpenAI cut GPT-5.6 Terra and Luna on 2026-07-30, and for three weeks the Azure Foundry meters did not follow. That gap closed on 2026-08-01, when a new Foundry tranche picked up the cut rates on Global, Data Zone, long-context and priority meters alike. Terra and Luna are at 1:1 with OpenAI direct today.",
        "The same lag then appeared for the flagship: OpenAI cut GPT-5.6 Sol on 2026-08-21, while the original Foundry meters remained at $5.00/$0.50/$30.00. The commercial Azure retail feed now contains a September 1 tranche at $4.00/$0.40/$20.00 short context and $8.00/$0.80/$30.00 long context, matching the direct promotional rates; its Data Zone and Priority Processing groups carry the corresponding published premiums.",
        "The direct promotion remains open-ended (at least through November 21, 2026 on OpenAI's page), while Microsoft's Foundry announcement says at least through November 30. The catalog follows the exact Azure retail meter for the current Foundry rate and keeps the original fields so the dated transition remains inspectable.",
        "Worth remembering: when Terra and Luna lagged, Azure support answers and at least one downstream cost tracker described the cut as already applied on Azure while the retail catalog still billed the old rate. The retail meter is what bills you; this time it has caught up.",
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
