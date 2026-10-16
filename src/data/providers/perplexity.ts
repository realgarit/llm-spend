import type { Provider } from "../types";

export const perplexity: Provider = {
  slug: "perplexity",
  name: "Perplexity",
  tagline: "Perplexity's Agent API hosts NVIDIA Nemotron 3.5 Super; its separate Decisions API charges input tokens only.",
  intro: [
    "Perplexity's Agent API provides models from multiple developers through one API. Its published rates can differ from the model developer's own API prices. The current NVIDIA Nemotron 3.5 Super route accepts text input and costs $0.20/$0.04/$0.50 per 1M input/cached-input/output tokens.",
    "Perplexity's separate Decisions API is designed for classification, routing, and rubric scoring. It returns typed answers with probabilities instead of generated text, so this lane is shown separately from generative workload comparisons. Its current model is `pplx-decider-v1.1-27b` at $0.02/M input; output is free, there is no per-request fee, and the older v1 model ID remains accepted at the current rate.",
  ],
  entries: [
    {
      model: "NVIDIA Nemotron 3.5 Super",
      host: "Perplexity Agent API",
      tier: "Direct",
      inputUsd: 0.2,
      cachedUsd: 0.04,
      outputUsd: 0.5,
      contextWindow: 1_048_576,
      maxOutput: 131_072,
      confidence: "official",
      notes:
        "Perplexity's hosted Agent API route is text-input only. Its token prices belong to Perplexity's endpoint and may differ from NVIDIA's own services.",
      effectiveDate: "2026-10-16",
      sourceNote:
        "Perplexity's Agent API model list, captured 2026-10-16, includes `perplexity/nemotron-3.5-super-120b-a12b` under NVIDIA at $0.20/M input, $0.04/M cached input, and $0.50/M output, with a 1,048,576-token context and 131,072 max output. Perplexity identifies the route as text-input only and notes that Agent API rates can differ from model developers' list prices. NVIDIA announced Nemotron 3.5 Super VL on 2026-10-15 and lists Perplexity as an adoption partner. Perplexity's October changelog does not give an exact route rollout date; the stored 2026-10-16 effective date is the first verification date, not an asserted launch date. The Azure Retail Prices feed and Microsoft's current Fireworks model catalog have no Nemotron 3.5 Super VL pay-per-token lane.",
    },
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
