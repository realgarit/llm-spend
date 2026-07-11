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
 * launches, or the methodology is revised — this is what keeps the site
 * trustworthy over time.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-07-11",
    title: "Site launch",
    tag: "launch",
    body: [
      "llm-spend goes live with the current dataset: Kimi, DeepSeek, GLM, OpenAI / Azure OpenAI, Claude, Gemini, and embeddings — all prices in USD and CHF (reference rate 1 USD ≈ 0.805 CHF).",
      "Includes the \"don't trust the sticker price\" methodology, the cache-economics deep-dive, an interactive workload cost calculator, and the RPM-vs-TPM explainer.",
    ],
  },
  {
    date: "2026-07-09",
    title: "GPT-5.6 (Sol / Terra / Luna) reaches GA",
    tag: "model",
    body: [
      "OpenAI's GPT-5.6 family reached general availability: Sol (flagship), Terra (balanced), and Luna (fast / cheap). Not yet on Azure's public pricing page — listed here at OpenAI's direct rates as a high-confidence estimate for Azure given the established 1:1 pattern.",
      "GPT-5.6 also changes cache-write billing to 1.25x the uncached input rate (previously the standard input rate); cache reads remain a ~90% discount.",
    ],
  },
  {
    date: "2026-07-01",
    title: "DeepSeek cuts direct API pricing 75%",
    tag: "pricing",
    body: [
      "DeepSeek's own direct API dropped V4 Pro to $0.435 / CHF 0.35 input — $0.87 / CHF 0.70 output, and V4 Flash to $0.14 / CHF 0.11 — $0.28 / CHF 0.23. This widened the gap to cloud-resold \"Global\" tiers, one of which has been reported at ~4.5x the direct price.",
    ],
  },
  {
    date: "2026-06-15",
    title: "Hidden cache meters reconciled from billing exports",
    tag: "methodology",
    body: [
      "Cost Management CSV exports grouped by meter revealed undocumented cached-input meters on DeepSeek V4 Pro / V4 Flash \"Global\" and Kimi K2.7. Back-solving against known input/output rates yielded derived cache rates (~$0.145/M for V4 Pro, ~$0.028/M for V4 Flash, ~$0.19/M for Kimi). All flagged as derived pending official publication.",
    ],
  },
];
