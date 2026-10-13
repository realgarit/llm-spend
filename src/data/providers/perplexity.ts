import type { Provider } from "../types";

export const perplexity: Provider = {
  slug: "perplexity",
  name: "Perplexity",
  tagline: "A separate API lane for structured decisions, priced on input tokens only.",
  intro: [
    "Perplexity's Decisions API is designed for classification, routing, and rubric scoring. It returns typed answers with probabilities instead of generated text, so this lane is shown separately from generative workload comparisons.",
    "The current model is `pplx-decider-v1.1-27b` at $0.02 per 1M input tokens. Output tokens are free and there is no per-request fee; Perplexity still accepts the older v1 model ID at the current API rate. The model's Apache 2.0 weights are also available from Perplexity's Hugging Face account, while the Azure Foundry feed has no Perplexity token meter.",
  ],
  entries: [
    {
      model: "pplx-decider-v1.1-27b",
      host: "Perplexity Decisions API",
      tier: "Direct",
      inputUsd: 0.02,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes:
        "Current updated multimodal decision model for yes/no classification, multiple-choice selection, and rubric scoring. It returns probabilities instead of generated text; output tokens are free. The API also accepts the older v1 model ID at the current API rate.",
      sourceNote:
        "Perplexity's official API Platform Forum announcement on 2026-10-06 says pplx-decider-v1.1-27b is available at $0.02 per 1M input tokens, half the v1 rate. The official Decisions API guide, captured 2026-10-13, identifies v1.1 as the current model, confirms that v1 remains accepted, and lists the current API-wide $0.02/M input rate, free output, and no per-request fee. The Perplexity Hugging Face model card identifies v1.1 as an update to v1 on the same backbone and lists Apache 2.0. The Azure Retail Prices Foundry query for `pplx-decider` returns no rows, checked 2026-10-13, so this records the Direct API rate only.",
      effectiveDate: "2026-10-06",
    },
  ],
};
