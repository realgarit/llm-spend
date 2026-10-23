import type { Provider } from "../types";

export const openaiDecisions: Provider = {
  slug: "openai-decisions",
  name: "OpenAI Decisions API",
  org: "OpenAI",
  tagline: "GPT-6 Luna's general-availability Decisions API discounts cached input.",
  intro: [
    "OpenAI's generally available Decisions API is a direct endpoint for classification, routing, and rubric scoring. It returns typed answers and probabilities instead of generated text, and currently uses GPT-6 Luna.",
    "OpenAI lists $0.10 per 1M uncached input tokens, $0.01 per 1M cached input tokens, and no output-token charge. Cache writes cost $0.125/M for a 30-minute lifetime or $0.25/M for 12 hours; the comparison schema does not represent cache-write fees. Regional processing premiums and long-context input multipliers apply. The Azure Retail Prices feed has no GPT-6 Luna Decisions meter, so this remains a Direct-only lane outside generative workload comparisons.",
  ],
  entries: [
    {
      model: "GPT-6 Luna (Decisions API)",
      host: "OpenAI Decisions API",
      tier: "Direct",
      inputUsd: 0.1,
      cachedUsd: 0.01,
      outputUsd: 0,
      contextWindow: 1_050_000,
      confidence: "official",
      notes:
        "Generally available at `/v1/decisions`. Uncached input costs $0.10/M, cached input $0.01/M, and output is free. Cache writes cost $0.125/M for 30 minutes or $0.25/M for 12 hours and are billed separately from this row. Regional processing premiums and long-context input multipliers apply.",
      sourceNote:
        "OpenAI's Decisions API guide, checked 2026-10-23, marks `/v1/decisions` generally available and lists $0.10/M uncached input, no output-token charge, and cache pricing that matches standard GPT-6 Luna rates. OpenAI's API pricing page, checked 2026-10-23, lists GPT-6 Luna at $0.01/M cached input, $0.125/M for 30-minute cache writes, and $0.25/M for 12-hour writes. Regional processing premiums and long-context input multipliers apply. The GPT-6 Luna model page lists a 1,050,000-token context window. An Azure Retail Prices query for Azure OpenAI product meters containing `decision` returned zero rows on 2026-10-23, so no Foundry rate is inferred.",
      effectiveDate: "2026-10-22",
    },
  ],
};
