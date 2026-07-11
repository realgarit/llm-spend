export const site = {
  name: "llm-spend",
  tagline: "What LLM APIs actually cost.",
  description:
    "A data-driven reference on LLM API pricing, prompt-cache economics, and how to verify real costs — not sticker prices. USD and CHF, every rate sourced.",
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
