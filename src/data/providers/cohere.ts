import type { Provider } from "../types";

export const cohere: Provider = {
  slug: "cohere",
  name: "Cohere",
  org: "Cohere",
  tagline: "Rerank 5 direct API rates are $0.05/M tokens for Pro and $0.02/M for Fast.",
  intro: [
    "Cohere released Rerank 5 Pro and Fast on October 21. Its current API pricing page lists $0.05 and $0.02 per 1M tokens, respectively; both models have a 32K context window.",
    "These are input-only retrieval lanes, not generative chat models, so they stay out of generation comparisons. Cohere lists Rerank 5 as available in Microsoft Foundry, but Microsoft's current family pricing table and Azure Retail Prices feed expose only Rerank 4 search-unit rates. No Foundry Rerank 5 token rate is inferred.",
  ],
  entries: [
    {
      model: "Rerank 5 Pro",
      host: "Cohere API",
      tier: "Direct",
      inputUsd: 0.05,
      cachedUsd: null,
      outputUsd: 0,
      contextWindow: 32_768,
      confidence: "official",
      notes:
        "Direct Rerank API rate; no separate cached-input or generated-output rate is published. Retrieval scoring only; excluded from generation comparisons. No Foundry token rate is listed.",
      sourceNote:
        "Cohere's Rerank 5 launch post, published 2026-10-21, and the live Advanced retrieval models tab of its API pricing page, captured 2026-10-22, publish $0.05 per 1M tokens for Pro. Cohere's model documentation gives a 32K context window. Cohere lists the model as available through Microsoft Foundry, but Microsoft's current Foundry family pricing table lists only Rerank v4 by 1K searches and the Azure Retail Prices query has only v4 search meters; no Foundry Rerank 5 token rate is inferred.",
      effectiveDate: "2026-10-21",
    },
    {
      model: "Rerank 5 Fast",
      host: "Cohere API",
      tier: "Direct",
      inputUsd: 0.02,
      cachedUsd: null,
      outputUsd: 0,
      contextWindow: 32_768,
      confidence: "official",
      notes:
        "Direct Rerank API rate; no separate cached-input or generated-output rate is published. Retrieval scoring only; excluded from generation comparisons. No Foundry token rate is listed.",
      sourceNote:
        "Cohere's Rerank 5 launch post, published 2026-10-21, and the live Advanced retrieval models tab of its API pricing page, captured 2026-10-22, publish $0.02 per 1M tokens for Fast. The current pricing page says Fast has the same context window as Pro; Cohere's model documentation gives Pro a 32K context window. Cohere lists the model as available through Microsoft Foundry, but Microsoft's current Foundry family pricing table lists only Rerank v4 by 1K searches and the Azure Retail Prices query has only v4 search meters; no Foundry Rerank 5 token rate is inferred.",
      effectiveDate: "2026-10-21",
    },
  ],
};
