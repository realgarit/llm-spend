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
