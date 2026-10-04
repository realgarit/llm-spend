import type { Provider } from "../types";

export const perplexity: Provider = {
  slug: "perplexity",
  name: "Perplexity",
  tagline: "A separate API lane for structured decisions, priced on input tokens only.",
  intro: [
    "Perplexity's Decisions API is designed for classification, routing, and rubric scoring. It returns typed answers with probabilities instead of generated text, so this lane is shown separately from generative workload comparisons.",
    "Perplexity lists `pplx-decider-v1-27b` at $0.04 per 1M input tokens. Output tokens are free and there is no per-request fee. The model's Apache 2.0 weights are also available from Perplexity's Hugging Face account; the current Azure Foundry feed has no Perplexity token meter.",
  ],
  entries: [
    {
      model: "pplx-decider-v1-27b",
      host: "Perplexity Decisions API",
      tier: "Direct",
      inputUsd: 0.04,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes:
        "Specialized decision model for yes/no classification, multiple-choice selection, and rubric scoring. It returns probabilities instead of generated text; output tokens are free.",
      sourceNote:
        "Perplexity's official API pricing page (checked 2026-10-04) lists pplx-decider-v1-27b at $0.04 per 1M input tokens, with free output tokens and no per-request fee. Its official Decisions API guide confirms structured probability outputs for yes/no, choice, and rubric scoring. The Perplexity Hugging Face model card identifies Qwen3.8-27B as the base model and Apache 2.0 as the license. The Azure Retail Prices Foundry feed and a model-name query both return no Perplexity meter, checked 2026-10-04, so this records the Direct API rate only.",
      effectiveDate: "2026-10-04",
    },
  ],
};
