<p align="center">
  <img src=".github/banner.svg" alt="llm-spend — What LLM APIs actually cost." width="900">
</p>

<p align="center">
  <a href="https://github.com/realgarit/llm-spend/actions/workflows/azure-static-web-apps.yml"><img src="https://github.com/realgarit/llm-spend/actions/workflows/azure-static-web-apps.yml/badge.svg" alt="Deploy status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-F6A821?style=flat" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=nextdotjs" alt="Next.js 15">
  <a href="https://llmcost.realgar.ch"><img src="https://img.shields.io/badge/live-llmcost.realgar.ch-F6A821?style=flat" alt="Live site"></a>
</p>

A reference for what LLM APIs actually cost. It lists real, measured rates per provider, flags hidden cache meters that pricing pages leave out, and shows every price in USD and CHF. Numbers that come from billing reconciliation or a pattern are marked as such, so you can tell a published rate from a derived one.

Live site: **https://llmcost.realgar.ch**

## Stack

Next.js 15, TypeScript, Tailwind v4, deployed to Azure Static Web Apps (hybrid Next.js).

## Adding a model

All pricing lives in `src/data/`. Provider tables are in `src/data/providers.ts`, the data model is in `src/data/types.ts`, and the changelog is in `src/data/changelog.ts`. Store USD per 1M tokens only; CHF is derived at render time. Add an entry to a provider's `entries` array:

```ts
{
  model: "DeepSeek-V4 Pro",
  tier: "Global",
  inputUsd: 1.74,
  cachedUsd: 0.145,        // null if the tier has no cache meter
  outputUsd: 6.98,
  confidence: "official",  // "derived" and "estimate" render a marker
  sourceNote: "Official pricing page.",
  effectiveDate: "2026-07-11",
}
```

Then add a line to `src/data/changelog.ts`.

## Local dev

```bash
npm install
npm run dev      # http://localhost:3000
```

Before pushing: `npm run build`, `npm run typecheck`, `npm run lint`.

## Deploy

Push to `main`. GitHub Actions builds the app and deploys it to Azure Static Web Apps.

## License

MIT. See [LICENSE](./LICENSE).
