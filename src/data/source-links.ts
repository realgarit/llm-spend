import type { ProviderSlug, SourceLink } from "./types";

const OFFICIAL_SOURCES: Record<ProviderSlug, SourceLink> = {
  kimi: { label: "Moonshot Kimi pricing", href: "https://platform.kimi.ai/docs/pricing/chat-k3" },
  deepseek: { label: "DeepSeek pricing", href: "https://api-docs.deepseek.com/quick_start/pricing" },
  glm: { label: "Z.ai pricing", href: "https://docs.z.ai/guides/overview/pricing" },
  "openai-azure": {
    label: "Azure Retail Prices API — Foundry Models",
    href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27",
  },
  claude: { label: "Anthropic pricing", href: "https://platform.claude.com/docs/en/about-claude/pricing" },
  gemini: { label: "Gemini API pricing", href: "https://ai.google.dev/gemini-api/docs/pricing" },
  xai: { label: "xAI pricing", href: "https://docs.x.ai/developers/pricing" },
  qwen: { label: "Model Studio pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
  mistral: { label: "Mistral inference pricing", href: "https://docs.mistral.ai/inference/pricing" },
  minimax: { label: "MiniMax pay-as-you-go", href: "https://platform.minimax.io/docs/guides/pricing-paygo" },
  embeddings: {
    label: "Azure Retail Prices API — Foundry Models and embeddings",
    href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27",
  },
};

export function officialSourceFor(providerSlug: ProviderSlug): SourceLink {
  return OFFICIAL_SOURCES[providerSlug];
}
