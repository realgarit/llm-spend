export const site = {
  name: "llm-spend",
  tagline: "What LLM APIs actually cost.",
  description:
    "Real LLM API prices in USD and CHF. Measured mostly on Azure AI Foundry, plus direct APIs, with hidden cache meters flagged and every rate sourced.",
  url: "https://llmcost.realgar.ch",
  githubUrl: "https://github.com/realgarit/llm-spend",
  author: "realgarit",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/cache-economics", label: "Cache economics" },
  { href: "/rate-limits", label: "Rate limits" },
  { href: "/changelog", label: "Changelog" },
] as const;
