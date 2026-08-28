import type { Provider } from "../types";

export const embeddings: Provider = {
  slug: "embeddings",
  name: "Embeddings",
  tagline: "The retrieval layer. Input-only pricing, and the cheapest model is rarely the right one for code RAG.",
  intro: [
    "Embedding models bill per million input tokens only, no output meter. Alibaba's new Qwen3.7 text embedding adds a 128K-token multilingual option at $0.07/M input; Cohere remains the strongest code-retrieval choice, while OpenAI's small model remains the budget pick.",
  ],
  entries: [
    {
      model: "Qwen3.7 text embedding",
      host: "Model Studio (Intl)",
      tier: "Direct",
      inputUsd: 0.07,
      cachedUsd: null,
      outputUsd: 0,
      contextWindow: 128_000,
      confidence: "official",
      notes:
        "New multilingual embedding model with configurable 2560/2048/1536/1024/768/512/256 dimensions (1024 default), up to 20 inputs per request and 128K tokens per input line. Input-only billing; no output or cached-input rate is published.",
      sourceNote:
        "Alibaba Cloud Model Studio's official Synchronous API page, last updated 2026-08-26 and captured 2026-08-28: the Singapore/International table lists qwen3.7-text-embedding at $0.07 per 1M input tokens, with a 128,000-token maximum per line and 20-row batches. The same page documents the model ID, dimensions and OpenAI-compatible Singapore endpoint. No output or cached-input charge is listed, so this row is input-only.",
      effectiveDate: "2026-08-28",
    },
    {
      model: "Cohere embed-v-4-0",
      tier: "Direct",
      inputUsd: 0.12,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes:
        "Best RAG / code-retrieval pick. Matryoshka dims 256/512/1024/1536 (default 1536); input_type query/document distinction. Cohere publishes this per-token rate under the 'Advanced retrieval models' tab of its pricing page; Microsoft's live Foundry meter independently reads exactly $0.12/M.",
      sourceNote:
        "Cohere publishes this rate first-party on cohere.com/pricing under the 'Advanced retrieval models' tab, reading verbatim '$0.12 / 1M tokens' for Embed 4 (captured 2026-08-17); the same tab also publishes an image cost of $0.47/1M, a dimension this schema doesn't model. The figure is absent from the page's server-rendered HTML — only the default 'Workplace systems' tab is server-rendered, so this tab must be clicked in a live browser to see it, and Internet Archive snapshots (SSR-only) cannot show it.",
      effectiveDate: "2026-07-29",
    },
    {
      model: "Cohere Embed v4",
      tier: "Global",
      inputUsd: 0.12,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes:
        "Same $0.12/M as the direct lane but officially metered — currently the only published source for this rate; image embeddings bill separately at $0.47/M image tokens.",
      sourceNote:
        "Azure Retail Prices API 'Embed v4 Txt Glbl Tokens' at $0.00012/1K ($0.12/M) across 39 commercial regions, effective 2026-02-01, captured 2026-07-29. Companion 'Embed v4 Img Glbl Tokens' meter is $0.00047/1K ($0.47/M). US Gov regions price higher ($0.15/M) and are excluded per the commercial-majority convention.",
      effectiveDate: "2026-02-01",
    },
    {
      model: "Cohere Embed v4",
      tier: "DataZone",
      inputUsd: 0.132,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes: "Exactly 1.1x the Global rate, the standard Data Zone premium.",
      sourceNote:
        "Azure Retail Prices API 'Embed v4 Txt DZ Tokens' at $0.000132/1K ($0.132/M) across 21 commercial regions, effective 2025-11-01, captured 2026-07-29. Companion 'Embed v4 Img DZ Tokens' meter is $0.000517/1K ($0.517/M). US Gov regions ($0.165/M) excluded.",
      effectiveDate: "2025-11-01",
    },
    {
      model: "OpenAI text-embedding-3-large",
      tier: "Global",
      inputUsd: 0.13,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      sourceNote:
        "Azure Retail Prices API 'text-embedding-3-large-glbl Tokens' meter: $0.00013/1K ($0.13/M) across 17 commercial regions, effective 2024-06-01, captured 2026-08-07. developers.openai.com/api/docs/pricing no longer lists per-token embeddings rates. Corroborated by developers.openai.com/api/docs/guides/embeddings, which quotes 9,615 pages per USD at ~800 tokens/page — inverting to exactly $0.13/M. US Gov Cloud bills this model under a separate 'text-embedding-3-large-regional Tokens' meter at $0.163/M, excluded per the commercial-majority convention.",
      effectiveDate: "2024-06-01",
    },
    {
      model: "OpenAI text-embedding-3-small",
      tier: "Global",
      inputUsd: 0.02,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes: "Cheapest solid option.",
      sourceNote:
        "Azure Retail Prices API 'text-embedding-3-small-glbl Tokens' meter: $0.00002/1K ($0.02/M) across 17 commercial regions, effective 2024-06-01, captured 2026-08-07. developers.openai.com/api/docs/pricing no longer lists per-token embeddings rates. Corroborated by developers.openai.com/api/docs/guides/embeddings, which quotes 62,500 pages per USD at ~800 tokens/page — inverting to exactly $0.02/M. US Gov Cloud bills this model under a separate 'text-embedding-3-small-regional Tokens' meter at $0.025/M, excluded per the commercial-majority convention.",
      effectiveDate: "2024-06-01",
    },
    {
      model: "OpenAI text-embedding-ada-002",
      tier: "Global",
      inputUsd: 0.1,
      cachedUsd: null,
      outputUsd: 0,
      confidence: "official",
      notes: "Legacy: worse than 3-small on cost and quality. Avoid.",
      sourceNote:
        "Azure Retail Prices API 'embedding-ada-glbl Tokens' meter: $0.0001/1K ($0.10/M) across 15 commercial regions, effective 2024-06-01, captured 2026-08-07. developers.openai.com/api/docs/pricing no longer lists per-token embeddings rates. Corroborated by developers.openai.com/api/docs/guides/embeddings, which quotes 12,500 pages per USD at ~800 tokens/page — inverting to exactly $0.10/M. US Gov Cloud bills this model under a separate 'embedding-ada-regional Tokens' meter at $0.125/M, excluded per the commercial-majority convention.",
      effectiveDate: "2024-06-01",
    },
  ],
  quirks: [
    {
      title: "Cheapest isn't best for code retrieval",
      tone: "insight",
      body: [
        "text-embedding-3-small is cheapest at $0.02 / CHF 0.016 per M, but for code RAG Cohere embed-v4 ($0.12 / CHF 0.097 per M) wins on retrieval quality (query/document input_type, Matryoshka dims 256/512/1024/1536). ada-002 ($0.10 / CHF 0.081) is legacy: worse than 3-small on price and quality. No reason to pick it for new work.",
      ],
    },
    {
      title: "A reference retrieval stack",
      tone: "info",
      body: [
        "For code indexing plus RAG: a dedicated embedding model (Cohere embed-v4), a vector store (LanceDB), then a strong coding LLM (DeepSeek V4 Pro, Kimi K2.7 Code, or GLM-5.2) over the retrieved chunks.",
      ],
    },
    {
      title: "Foundry Data Zone for embeddings is also two prices",
      tone: "warning",
      body: [
        "The rows above are OpenAI's Global rate. On Microsoft Foundry, text-embedding-3-large and text-embedding-3-small each carry two Data Zone prices, not one: US/EU regions bill 1.10x Global ($0.143/M and $0.022/M), APAC regions (australiaeast, centralindia, eastasia, japaneast, japanwest, jioindiawest, koreacentral, southeastasia, southindia) bill 1.20x Global ($0.156/M and $0.024/M). Same split seen across Microsoft's first-party OpenAI lines; captured from the Azure Retail Prices API on 2026-07-27.",
      ],
    },
  ],
};
