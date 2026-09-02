export const site = {
  name: "llm-spend",
  tagline: "What LLM APIs actually cost.",
  description:
    "Real LLM API prices in USD and CHF. Measured mostly on Microsoft Foundry (formerly Azure AI Foundry), plus direct APIs, with hidden cache meters flagged and every rate sourced.",
  url: "https://llmspend.realgar.ch",
  githubUrl: "https://github.com/realgarit/llm-spend",
  author: "realgarit",
} as const;

/**
 * Primary navigation, in decision order: compare lanes, plan a month against a
 * budget, then check how fresh and how sourced the underlying rates are.
 * `SiteHeader` marks an item active with `pathname.startsWith(href)`, so every
 * href here must be a distinct top-level segment.
 */
export const nav = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/budget", label: "Budget" },
  { href: "/freshness", label: "Freshness" },
  { href: "/cache-economics", label: "Cache economics" },
  { href: "/rate-limits", label: "Rate limits" },
  { href: "/changelog", label: "Changelog" },
] as const;
