import type { Provider } from "../types";

export const qwen: Provider = {
  slug: "qwen",
  name: "Qwen",
  org: "Alibaba",
  tagline: "Qwen3.8 Max is now the flagship at a plain $2/$6 per-token rate, above Qwen3.7 Max's 50%-off promo — but on Microsoft Foundry it's still GPU-hour managed compute only, no per-token meter.",
  intro: [
    "Qwen3.8 Max is now Alibaba's flagship, GA with a plain $2/M input, $6/M output rate — no promotional discount. Qwen3.7 Max remains available just below it at a limited-time 50%-off promo rate ($1.25/$3.75 effective) with no published end date, alongside Qwen3.7 Plus at 20% off; the Qwen3.6 line (Plus, Flash) remains listed at stable rates. All prices are Alibaba Cloud Model Studio's International (Singapore) endpoint.",
    "Qwen3.6 Max Preview is scheduled for deprecation on 2026-10-10, with Qwen3.7 Max named as its replacement. On Microsoft Foundry, Qwen models are available only as Managed Compute — dedicated GPU-hour billing ($4–8 per compute hour) with no serverless per-token listing, so there is no Foundry token rate to compare.",
  ],
  entries: [
    {
      model: "Qwen3.8 Max",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 2.0,
      cachedUsd: 0.2,
      cachedConfidence: "derived",
      outputUsd: 6.0,
      contextWindow: 1_000_000,
      confidence: "official",
      notes:
        "New flagship, GA (not preview); text plus image/video understanding. Single price tier across the full 1M window; thinking and non-thinking modes priced the same. Plain rate — no promotional discount, unlike Qwen3.7 Max. 1M-token free quota for 90 days.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-08-04 (confirmed via direct DOM inspection, not WebFetch's summarizer, per the established gotcha on this page): $2/M input, $6/M output, single 0<Token≤1M band, Non-Thinking and Thinking modes priced identically, no 'List price / Limited-time off' label. Cached input derived as 10% of input per the official context-cache rule (explicit cache hits), the same convention used across the rest of the Qwen family. A separate Global deployment-scope table on the same page prices this model lower, at $1.65/M input and $4.951/M output; the tracked lane is International, matching every other Qwen row here. Resolves the qwen3.8-max per-token-pricing watch item open since 2026-07-23.",
      effectiveDate: "2026-08-04",
    },
    {
      model: "Qwen3.7 Max (Promo)",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 1.25,
      cachedUsd: 0.125,
      cachedConfidence: "derived",
      outputUsd: 3.75,
      contextWindow: 1_000_000,
      confidence: "official",
      notes:
        "Current flagship. Effective rate under a limited-time 50% discount (list $2.50/M in, $7.50/M out) covering all four billing items — input, output, explicit cache creation, and explicit cache hits. Discount is officially scheduled to end 2026-08-31; reverts to list ($2.50 in / $0.25 cached / $7.50 out) from 2026-09-01. Single price tier across the full 1M window; thinking and non-thinking modes priced the same.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-07-20: list $2.5/$7.5 marked 'Limited-time 50% off', still with no end-date text as of a 2026-08-10 re-check. Cached input derived as 10% of effective input per the official context-cache rule (explicit cache hits). Alibaba Cloud's campaign page ('Qwen3.8-Max is Here') states, in two places, that the discount 'runs until August 31, 2026' and applies to all 4 billing items — input, output, explicit cache creation, and explicit cache hit; captured 2026-08-10.",
      effectiveDate: "2026-07-20",
      variants: [
        {
          label: "List price (from September)",
          conditions: { from: "2026-09-01T00:00:00Z" },
          inputUsd: 2.5,
          cachedUsd: 0.25,
          outputUsd: 7.5,
          confidence: "official",
          cachedConfidence: "derived",
          sourceNote:
            "Alibaba Cloud campaign page (alibabacloud.com/en/campaign/qwen-discount), captured 2026-08-14: the discount 'runs until August 31, 2026'. Cached input derived as 10% of input per Alibaba's published context-cache rule, mirroring the row's cachedConfidence.",
        },
      ],
    },
    {
      model: "Qwen3.7 Plus (Promo)",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 0.32,
      cachedUsd: 0.032,
      cachedConfidence: "derived",
      outputUsd: 1.28,
      contextWindow: 1_000_000,
      confidence: "official",
      notes:
        "Effective rate under a limited-time 20% discount (list $0.40/$1.60); no promo end date published. Rates shown are ≤256K prompt tokens; 256K–1M bills $0.96/$3.84 effective ($1.20/$4.80 list). Thinking and non-thinking output priced the same.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint, captured 2026-07-20: list prices marked 'Limited-time 20% off'. Cached input derived as 10% of effective input per the official context-cache rule.",
      effectiveDate: "2026-07-20",
    },
    {
      model: "Qwen3.6 Plus",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 0.5,
      cachedUsd: 0.05,
      cachedConfidence: "derived",
      outputUsd: 3.0,
      contextWindow: 1_000_000,
      confidence: "official",
      notes: "Tiered: rates shown are ≤256K prompt tokens; 256K-1M bills $2/M input, $6/M output.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint. Cached input derived as 10% of input per the official context-cache doc (explicit hits 10%, creation 125%, implicit hits 20%), which lists this model as supported.",
      effectiveDate: "2026-07-19",
    },
    {
      model: "Qwen3.6 Flash",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 0.25,
      cachedUsd: 0.025,
      cachedConfidence: "derived",
      outputUsd: 1.5,
      confidence: "official",
      notes: "Cheap tier; 50% batch-inference discount also published.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint (≤256K tier). Cached input derived as 10% of input per the official context-cache doc, which lists this model as supported.",
      effectiveDate: "2026-07-19",
    },
    {
      model: "Qwen3.7 Flash",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 0.1,
      cachedUsd: 0.01,
      cachedConfidence: "derived",
      outputUsd: 0.4,
      confidence: "official",
      notes:
        "Full tier ladder: 0-32K $0.030 in / $0.130 out; 32K-256K $0.100 in / $0.400 out (rate shown, matching the band tracked for the Qwen3.6 Flash row); 256K-1M $0.200 in / $0.800 out.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint, snapshot qwen3.7-flash-2026-07-15, captured 2026-07-26. Rate shown is the 32K<tokens≤256K band, chosen to match the context band tracked for the existing Qwen3.6 Flash row (≤256K) so the two are directly comparable. Cached input derived as 10% of input per the official context-cache rule (explicit cache hits), same shape as the rest of the Qwen family.",
      effectiveDate: "2026-07-26",
    },
    {
      model: "Qwen3.6 Max Preview",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 1.3,
      cachedUsd: 0.13,
      cachedConfidence: "derived",
      outputUsd: 7.8,
      confidence: "official",
      notes:
        "Thinking-only preview; rates shown are the ≤128K tier (128K-256K bills $2/$12). Scheduled for deprecation on 2026-10-10; Alibaba lists Qwen3.7 Max as the replacement.",
      sourceNote:
        "Alibaba Cloud Model Studio pricing page, International endpoint, re-verified 2026-08-01. Cached input derived as 10% of input per the official context-cache doc, which lists this model as supported. Alibaba's official model-lifecycle page schedules qwen3.6-max-preview for deprecation on 2026-10-10 and names qwen3.7-max as the replacement.",
      effectiveDate: "2026-07-19",
    },
  ],
  quirks: [
    {
      title: "No per-token Qwen meter on Foundry",
      tone: "warning",
      body: [
        "Microsoft Foundry hosts Qwen models (e.g. the Qwen3-VL family) only via Managed Compute: dedicated A100/H100/MI300 GPUs at $4-8 / CHF 3.22-6.44 per compute hour. There is no serverless per-token Qwen listing on the Foundry pricing page — neither native nor Fireworks-hosted — so cost per token depends entirely on your utilization.",
      ],
    },
    {
      title: "Endpoint pricing differs sharply",
      tone: "info",
      body: [
        "The Chinese-mainland (Beijing) endpoint is far cheaper than International: Qwen3.6 Plus drops from $0.50 / CHF 0.40 to ~$0.276 / CHF 0.22 input and from $3.00 / CHF 2.42 to ~$1.65 / CHF 1.33 output. The catalog lists International (Singapore) rates as the realistic option for most non-China deployments.",
      ],
    },
    {
      title: "Cache rule now officially documented",
      tone: "insight",
      body: [
        "Model Studio's Context Cache doc now states the billing rule outright: explicit cache hits at 10% of the input rate, explicit cache creation at 125% (5-minute validity), and implicit cache hits at 20% — the same shape as Anthropic's model, plus a pricier implicit path. The doc lists every Qwen model in this catalog as supported, so cached rates here are upgraded from estimate to derived (10% of the billed input rate; still no per-model dollar figures published).",
      ],
    },
    {
      title: "Flagship pricing is promotional",
      tone: "warning",
      body: [
        "Qwen3.7 Max ($1.25 / CHF 1.01 input, $3.75 / CHF 3.02 output effective) and Qwen3.7 Plus ($0.32 / CHF 0.26 input, $1.28 / CHF 1.03 output effective, ≤256K) are billed under limited-time discounts of 50% and 20% off list — with no published end date. If the promos lapse, Max reverts to $2.50/$7.50 and Plus to $0.40/$1.60. Budget against list price for anything long-lived.",
      ],
    },
  ],
};
