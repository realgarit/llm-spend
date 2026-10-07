import type { Provider } from "../types";

export const openaiDecisions: Provider = {
  slug: "openai-decisions",
  name: "OpenAI Decisions API",
  org: "OpenAI",
  tagline: "GPT-6 Luna's typed decision endpoint bills input tokens only.",
  intro: [
    "OpenAI's Decisions API is a direct public-beta endpoint for classification, routing, and rubric scoring. It returns typed answers and probabilities instead of generated text, and currently uses GPT-6 Luna.",
    "OpenAI lists a base rate of $0.10 per 1M input tokens, with no cache-read, cache-write, or output-token charge. Regional processing premiums and long-context input multipliers apply; their adjusted dollar rates are not listed separately here. The current Azure Retail Prices feed has no Decisions-named Foundry meter, so this is a Direct-only lane and remains outside generative workload comparisons.",
  ],
  entries: [
    {
      model: "GPT-6 Luna (Decisions API)",
      host: "OpenAI Decisions API",
      tier: "Direct",
      inputUsd: 0.1,
      cachedUsd: null,
      outputUsd: 0,
      contextWindow: 1_050_000,
      confidence: "official",
      notes:
        "Public beta at `/v1/decisions`; the $0.10/M input rate is the documented base price. There are no cache-read, cache-write, or output-token charges. Regional processing premiums and long-context input multipliers apply, but the guide does not publish their adjusted amounts.",
      sourceNote:
        "OpenAI's Decisions API guide, checked 2026-10-07, documents a $0.10/M input base rate for `gpt-6-luna`, with no cache-read, cache-write, or output-token charge; it also says regional processing premiums and long-context multipliers apply without enumerating adjusted prices. The GPT-6 Luna model page lists a 1,050,000-token context window. An Azure Retail Prices query for Foundry meter names containing `decisions` returned zero rows on 2026-10-07, so no Foundry rate is inferred.",
      effectiveDate: "2026-10-06",
    },
  ],
};
