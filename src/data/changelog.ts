export interface ChangelogEntry {
  /** ISO date YYYY-MM-DD. */
  date: string;
  title: string;
  /** Paragraphs / bullet lines of body text. */
  body: string[];
  tag?: "launch" | "pricing" | "model" | "methodology";
}

/**
 * Dated changelog. Newest first. Add an entry whenever a rate changes, a model
 * launches, or the methodology is revised. This is what keeps the site
 * trustworthy over time.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-07-21",
    title: "GPT-5.6 Azure rates confirmed official; Sol Data Zone and Long Context added",
    tag: "pricing",
    body: [
      "Azure's Retail Prices API now publishes Foundry meters for the whole GPT-5.6 family (effective 2026-07-01), confirming the 1:1 pattern: Sol $5/$30, Terra $2.50/$15, Luna $1/$6 per M tokens on Global, cached input at 10% of input, cache writes at 1.25x. All three entries upgraded from estimate to official.",
      "Added two Sol rows now that the meters are public: Data Zone at $5.50/$0.55/$33 (~10% premium over Global) and Long Context Global at $10/$1/$45. Terra and Luna have matching Data Zone and long-context meters, noted on their entries.",
      "Checked with no change needed: Grok 4.5 still has no Foundry meter (the retail catalog tops out at the Grok-4.x meters already tracked), and Qwen still has no serverless per-token Foundry meter (only Qwen3 32B fine-tuning hosting meters exist).",
    ],
  },
  {
    date: "2026-07-20",
    title: "Qwen3.7 flagships added; Alibaba cache rule confirmed official",
    tag: "model",
    body: [
      "Added Alibaba's current flagship family, missed in yesterday's Qwen capture: Qwen3.7 Max at $1.25/M input, $3.75/M output effective (list $2.50/$7.50 under a limited-time 50% discount with no published end date; single price tier across a 1M-token window) and Qwen3.7 Plus at $0.32/$1.28 effective ≤256K, $0.96/$3.84 beyond (list rates under a 20% limited-time discount). Both priced on Model Studio's International (Singapore) endpoint.",
      "Alibaba's Context Cache doc now officially states the billing rule — explicit cache hits at 10% of input, cache creation at 125%, implicit hits at 20% — and lists every catalog Qwen model as supported. All Qwen cached-input rates upgraded from estimate to derived (10% of the billed input rate).",
      "Checked with no change needed: Grok 4.5 is still absent from Microsoft Foundry (the Grok tab still tops out at Grok-4.3 Global, $1.25/$2.50, no cache meters), Qwen still has no serverless per-token Foundry listing, and GPT-5.6 is still not on Azure's public OpenAI pricing page.",
    ],
  },
  {
    date: "2026-07-19",
    title: "Grok (xAI) and Qwen (Alibaba) added to the catalog",
    tag: "model",
    body: [
      "Added Grok: the new flagship Grok 4.5 at xAI's direct rates ($2/M input, $6/M output, 500K context; all meters double at ≥200K prompt tokens; cached input ~$0.50/M per third-party listings, flagged estimate). Grok 4.5 is not on Microsoft Foundry yet — the Foundry lineup tops out at Grok-4.3 Global ($1.25/$2.50) and Grok 4.1 Fast ($0.20/$0.50), and no Foundry Grok listing publishes a cached-input meter.",
      "Added Qwen: Alibaba Model Studio International rates for Qwen3.6 Plus ($0.50/$3.00 up to 256K, $2/$6 beyond), Qwen3.6 Flash ($0.25/$1.50), and Qwen3.6 Max Preview ($1.30/$7.80). Cache hits bill at ~10% of input per the published context-cache rule (marked estimate pending per-model confirmation). On Foundry, Qwen is Managed Compute only (GPU-hour, $4-8/hr) — there is no serverless per-token Qwen meter to compare.",
    ],
  },
  {
    date: "2026-07-17",
    title: "Kimi K3 added; outdated catalog entries pruned",
    tag: "model",
    body: [
      "Added Kimi K3's direct API pricing: $3/M cache-miss input, $0.30/M cache-hit input, and $15/M output. K3 is available now with a 1M-token context window.",
      "Removed older GPT-5, DeepSeek, Kimi Thinking, Gemini 3 Pro, and Claude Opus 4.8 Fast Mode entries to keep the comparison catalog focused on relevant current options.",
    ],
  },
  {
    date: "2026-07-17",
    title: "DeepSeek direct cache rates and Azure meter provenance corrected",
    tag: "pricing",
    body: [
      "Added DeepSeek's first-party V4 Pro ($0.003625/M) and V4 Flash ($0.0028/M) cache-hit rates, so the calculator now applies the selected cache-hit rate to direct API estimates.",
      "Upgraded Azure Global V4 Pro ($0.145/M) and V4 Flash ($0.028/M) cached-input rates from derived to official after confirming the exact meters in Azure's public retail catalog. Billing exports reconcile to those published rates.",
    ],
  },
  {
    date: "2026-07-14",
    title: "Claude cache pricing: multiplier → explicit published rates",
    tag: "pricing",
    body: [
      "Anthropic's pricing page now publishes per-model cache hit rates (e.g., Opus 4.8 cache read = $0.50/MTok, Sonnet 5 = $0.20/MTok intro / $0.30 standard, Fable 5 / Mythos 5 = $1.00/MTok), replacing the earlier multiplier approximation. All Claude entries updated with exact `cachedUsd` values.",
    ],
  },
  {
    date: "2026-07-14",
    title: "Claude Fable 5 and Mythos 5 added",
    tag: "model",
    body: [
      "Added Claude Fable 5 ($10 / $50 per MTok input/output) and Claude Mythos 5 ($10 / $50, limited availability) — Anthropic's next-gen frontier models — matching their published direct pricing. Same cache model as other Claude models: reads ~10% of input, writes ~1.25x input.",
    ],
  },
  {
    date: "2026-07-12",
    title: "Heads-up: non-Global Foundry prices rising 2026-09-01",
    tag: "pricing",
    body: [
      "Per the Azure Foundry Models pricing page, EU Data Zone and other non-US Regional deployment prices are set to increase on 2026-09-01. Global deployments are unchanged. No specific increase amount is published yet, so budget for a change and re-check closer to the date.",
    ],
  },
  {
    date: "2026-07-12",
    title: "Microsoft Foundry rebrand; Claude now GA and Azure-hosted",
    tag: "model",
    body: [
      "Microsoft renamed Azure AI Foundry to Microsoft Foundry. The site now uses the new name throughout; older entries below keep their original wording as a historical record.",
      "Claude Opus 4.8, Sonnet 5, and Haiku 4.5 are now GA and natively hosted on Microsoft Foundry (Azure-hosted, not just resold), billed through Azure via Claude Consumption Units (CCU) instead of the old per-model Azure meters. Added Sonnet 5 Foundry pricing, mirroring the direct rates: $2 / $10 per M input/output through 2026-08-31, then $3 / $15 per M from 2026-09-01. Microsoft doesn't publish a separate CCU-to-dollar ratio or an independent Foundry-native price, so the effective $/M is inherited from Anthropic's direct rate.",
    ],
  },
  {
    date: "2026-07-11",
    title: "Site launch",
    tag: "launch",
    body: [
      "llm-spend goes live: Kimi, DeepSeek, GLM, OpenAI / Azure OpenAI, Claude, Gemini, and embeddings, all in USD and CHF (reference 1 USD ≈ 0.805 CHF). Prices measured mostly on Azure AI Foundry, plus direct APIs.",
      "Includes the sticker-price methodology, the cache-economics case study, a workload cost calculator, and the RPM-vs-TPM explainer.",
    ],
  },
  {
    date: "2026-07-09",
    title: "GPT-5.6 (Sol / Terra / Luna) reaches GA",
    tag: "model",
    body: [
      "OpenAI's GPT-5.6 family hit GA: Sol (flagship), Terra (balanced), Luna (fast / cheap). Not on Azure's public page yet, so listed at OpenAI's direct rates as a high-confidence estimate for Azure via the 1:1 pattern.",
      "GPT-5.6 also bills cache writes at 1.25x the uncached input rate (was the standard input rate); reads stay ~90% off.",
    ],
  },
  {
    date: "2026-07-01",
    title: "DeepSeek cuts direct API pricing 75%",
    tag: "pricing",
    body: [
      "DeepSeek's direct API dropped V4 Pro to $0.435 / CHF 0.35 input, $0.87 / CHF 0.70 output, and V4 Flash to $0.14 / CHF 0.11 input, $0.28 / CHF 0.23 output. That widened the gap to cloud \"Global\" tiers, one reported at ~4.5x the direct price.",
    ],
  },
  {
    date: "2026-06-15",
    title: "Hidden cache meters reconciled from billing exports",
    tag: "methodology",
    body: [
      "Azure Cost Management exports grouped by meter revealed undocumented cached-input meters on DeepSeek V4 Pro / V4 Flash \"Global\" and Kimi K2.7 in Azure AI Foundry. Back-solving against known input/output rates gave derived cache rates (~$0.145/M for V4 Pro, ~$0.028/M for V4 Flash, ~$0.19/M for Kimi). Flagged derived pending official publication.",
    ],
  },
];
