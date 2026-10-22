import type { Provider } from "../types";

export const perplexity: Provider = {
  slug: "perplexity",
  name: "Perplexity",
  tagline: "Perplexity's Agent API hosts NVIDIA Nemotron 3.5 Super and DeepSeek V4 Pro; its Decisions API now has v1.2 and Flash v1.2 input-only lanes.",
  intro: [
    "Perplexity's Agent API provides models from multiple developers through one API. Its published rates can differ from the model developer's own API prices. The NVIDIA Nemotron 3.5 Super route accepts text input and costs $0.20/$0.04/$0.50 per 1M input/cached-input/output tokens. Perplexity also publishes a single DeepSeek V4 Pro rate of $1.32/$0.044/$3.96 per 1M input/cached-input/output tokens, matching DeepSeek's direct peak rate.",
    "Perplexity's separate Decisions API is designed for classification, routing, and rubric scoring. It returns typed answers with probabilities instead of generated text, so these lanes are shown separately from generative workload comparisons. The current 27B model is `pplx-decider-v1.2` at $0.02/M input, and the new 4B Flash model is $0.01/M; output is free, with no per-request fee. The old v1.1 and v1 model IDs still select v1.2.",
  ],
  entries: [
    {
      model: "DeepSeek V4 Pro",
      host: "Perplexity Agent API",
      tier: "Direct",
      inputUsd: 1.32,
      cachedUsd: 0.044,
      outputUsd: 3.96,
      confidence: "official",
      notes:
        "Perplexity-hosted route `perplexity/deepseek-v4-pro-0813`. Its published rate matches DeepSeek Direct's weekday peak rate; Perplexity lists no off-peak schedule or optional service tier.",
      effectiveDate: "2026-10-20",
      sourceNote:
        "Perplexity's Agent API model list, checked 2026-10-20, includes `perplexity/deepseek-v4-pro-0813` at $1.32/M input, $0.044/M cached input, and $3.96/M output, with no optional service tier listed. Perplexity says its Agent API rates may differ from provider list prices. DeepSeek's current Models & Pricing page gives the same prices as the direct API's weekday peak rate and half those rates off-peak. Perplexity's October 2026 changelog lists DeepSeek V4 Pro as a new Agent API model but does not give a rollout day; the 2026-10-20 effective date is the first verification date, not an asserted launch date.",
    },
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
      model: "pplx-decider-v1.2",
      host: "Perplexity Decisions API",
      tier: "Direct",
      inputUsd: 0.02,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes:
        "Current 27B decision model for yes/no classification, multiple-choice selection, and rubric scoring. It accepts text and images, returns probabilities instead of generated text, and has free output with no per-request fee. Requests naming the older v1.1 or v1 IDs still select this model.",
      sourceNote:
        "Perplexity's official October 2026 API changelog and current Decisions API pricing page, captured 2026-10-22, identify `pplx-decider-v1.2` as the 27B model at $0.02 per 1M input tokens, with free output and no request fee. The changelog says v1.2 replaces v1.1; older v1.1 and v1 IDs still resolve to v1.2. Perplexity does not publish the exact rollout day, so 2026-10-22 is the first verification date, not an asserted launch date. The Azure Retail Prices Foundry query for `pplx-decider` returns no rows, checked 2026-10-22, so this remains a Direct API lane.",
      effectiveDate: "2026-10-22",
    },
    {
      model: "pplx-decider-flash-v1.2",
      host: "Perplexity Decisions API",
      tier: "Direct",
      inputUsd: 0.01,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes:
        "New 4B Flash decision model for yes/no classification, multiple-choice selection, and rubric scoring. It accepts text and images, returns probabilities instead of generated text, and has free output with no per-request fee.",
      sourceNote:
        "Perplexity's official October 2026 API changelog and current Decisions API pricing page, captured 2026-10-22, list `pplx-decider-flash-v1.2` as a new 4B model at $0.01 per 1M input tokens, with free output and no request fee. Perplexity does not publish the exact rollout day, so 2026-10-22 is the first verification date, not an asserted launch date. The Azure Retail Prices Foundry query for `pplx-decider` returns no rows, checked 2026-10-22, so this remains a Direct API lane.",
      effectiveDate: "2026-10-22",
    },
  ],
};
