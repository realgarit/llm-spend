# llm-spend

**What LLM APIs actually cost.** A data-driven reference on LLM API pricing, prompt-cache economics, and how to verify real costs instead of trusting sticker prices — every rate shown in both **USD and CHF**, and clearly marked when it is reconciled from billing (`derived`) or pattern-inferred (`estimate`) rather than published (`official`).

Live focus areas:

- The **"don't trust the sticker price"** framework (7-point narrative) + a 6-step method for verifying real costs, including how to back-solve an undocumented cache rate from a billing export.
- One page per provider (Kimi, DeepSeek, GLM, OpenAI / Azure OpenAI, Claude, Gemini, embeddings) with full pricing tables and the quirks that never make the pricing page (hidden cache meters, Responses-API-only models, deployment-tier premiums).
- A **sortable cross-provider table + interactive workload cost calculator** that computes real blended cost per model (adjustable input/output tokens and cache-hit rate).
- A **cache-economics** deep-dive (the $12.42 → $1.74 story), an **RPM-vs-TPM** explainer, and a dated **changelog**.

## Stack

| Concern       | Choice                                                    |
| ------------- | --------------------------------------------------------- |
| Framework     | Next.js 15 (App Router) + React 19, TypeScript            |
| Styling       | Tailwind CSS v4 (CSS-first `@theme`) + a small design system in `globals.css` |
| Fonts         | IBM Plex Sans (UI), IBM Plex Mono (all numerics, tabular), Newsreader (editorial accents) via `next/font` |
| Hosting       | Azure Static Web Apps — **hybrid Next.js (preview)**, Free tier |
| CI/CD         | GitHub Actions → `Azure/static-web-apps-deploy@v1` on push to `main` |

Design direction: technical / editorial, dark-first with a light mode (`prefers-color-scheme` + a manual toggle persisted to `localStorage`, set pre-paint to avoid FOUC).

## Project layout

```
src/
  app/
    page.tsx                 # home: framework + methodology
    providers/[slug]/page.tsx# per-provider pages (static params)
    compare/page.tsx         # sortable table + cost calculator (client)
    cache-economics/page.tsx # cache case study (server-computed sweep)
    rate-limits/page.tsx     # RPM vs TPM
    changelog/page.tsx       # dated changelog
    sitemap.ts / robots.ts   # SEO, generated
    icon.svg                 # code-generated favicon
    globals.css              # design system + Tailwind theme
  components/                # header, footer, tables, price cells, calculator
  data/
    types.ts                 # Provider / PricingEntry / Confidence model
    currency.ts              # USD_TO_CHF + all formatting (single source)
    providers.ts             # ALL pricing data (edit here)
    changelog.ts             # changelog entries
    compare-data.ts          # flattened rows for the client compare view
  lib/
    calc.ts                  # workload cost math (cache-split blending)
    site.ts                  # site name, nav, links
```

## Data model

All pricing lives in typed data files under `src/data`. Prices are stored in **USD per 1M tokens only**; CHF is always derived at render time from a single constant.

`PricingEntry` (`src/data/types.ts`):

| Field              | Meaning                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `model`            | Display name, e.g. `DeepSeek-V4 Pro`                                |
| `host`             | Optional hosting note, e.g. `Fireworks-hosted`, `DeepSeek direct API` |
| `tier`             | `Global` \| `DataZone` \| `Regional` \| `Direct`                    |
| `inputUsd`         | USD / 1M input tokens                                               |
| `cachedUsd`        | USD / 1M cached input tokens, or `null` when there is no cache meter |
| `cachedConfidence` | Optional — confidence for the cached rate when it differs from the row (e.g. official input/output but a billing-derived cache rate) |
| `outputUsd`        | USD / 1M output tokens (`0` for input-only models like embeddings) |
| `contextWindow` / `maxOutput` | Optional token counts                                     |
| `confidence`       | `official` \| `derived` \| `estimate` — drives the badge and the `†`/`‡` marker |
| `notes` / `sourceNote` | Inline note and provenance of the number                       |
| `effectiveDate`    | ISO `YYYY-MM-DD` the rate was captured / takes effect              |

### Currency

`src/data/currency.ts` holds `USD_TO_CHF = 0.805` and every formatter. Change that one constant to re-base the whole site. Every price renders as both currencies (e.g. `$1.75 / CHF 1.41`). This is a **reference rate, not a live FX feed** (disclosed in the footer).

### Confidence is a first-class concept

Distinguishing published prices from reconstructed ones is a core theme:

- **official** — from a published pricing page (no marker).
- **derived** `†` — back-calculated from a real billing / cost-management export.
- **estimate** `‡` — inferred from an established pattern, not yet published.

Use `cachedConfidence` to mark just the cache cell — e.g. DeepSeek V4 Pro has official input/output but a `derived` cache rate reconciled from a billing export.

## Adding a new model entry

1. Open `src/data/providers.ts` and find the relevant provider (or add a new one; new providers also need a `ProviderSlug` in `types.ts`, and a route is generated automatically).
2. Add a `PricingEntry` to that provider's `entries` array. **USD only.** Do not compute CHF.
3. Set `confidence` honestly:
   - On an official page → `official`.
   - Reconciled from a billing export → `derived` (put the reconciliation in `sourceNote`).
   - Pattern-inferred / not yet published → `estimate`.
   - Official row but billing-derived cache rate → keep `confidence: "official"` and add `cachedConfidence: "derived"`.
4. Add an `effectiveDate` (ISO).
5. If the change is notable (new model, price move, methodology update), add a dated entry to `src/data/changelog.ts`.
6. Run `npm run typecheck && npm run lint && npm run build`. The compare table, calculator, sitemap, and cache-economics sweep pick the entry up automatically.

To re-base currency: change `USD_TO_CHF` in `src/data/currency.ts`.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint
npm run build      # production build (also produces .next/standalone for SWA)
```

## Deploy — Azure Static Web Apps (hybrid Next.js, Free tier)

This app deploys as a **hybrid** Next.js site (App Router, server components) to Azure Static Web Apps, whose hybrid Next.js support is currently a **preview** feature.

**Config choices (and why):**

- `next.config.ts` sets `output: "standalone"`. Standalone is **not required** for hybrid, but the Free tier caps app size at **250 MB**; Next.js Output File Tracing keeps the deployed app well under that. The `build` script copies `.next/static` and `public` into `.next/standalone` per Microsoft's standalone instructions.
- The GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) uses `Azure/static-web-apps-deploy@v1` with:
  - `app_location: "/"` — app at the repo root.
  - `api_location: ""` — no linked API (linked backends are not available on Free/hybrid anyway).
  - `output_location: ""` — **must be empty** for hybrid. (`out` would signal a static export, which this app is not.)
- No `staticwebapp.config.json`: in hybrid mode navigation fallback is unsupported and route rewrites/redirects must live in `next.config` — none are needed here, so the file is omitted (it also has a 20 KB cap and takes precedence over `next.config`, which is easy to get wrong).
- Node 20+ (Next.js 15 requirement) is set both in the workflow (`actions/setup-node`) and via `engines.node` in `package.json`, which Oryx honors for its own build.

**Setup:**

1. Create a Static Web App in the Azure portal (Plan type **Free**, Source **GitHub**, Build preset **Next.js**; leave App location `/`, Api location and Output location empty).
2. Ensure the repo secret **`AZURE_STATIC_WEB_APPS_API_TOKEN`** is set (the portal wires this up when it creates its own workflow; this repo ships its own workflow using the same secret name).
3. Push to `main` — the workflow builds and deploys.

Docs: [Deploy hybrid Next.js on Azure Static Web Apps (Preview)](https://learn.microsoft.com/azure/static-web-apps/deploy-nextjs-hybrid).

## Data provenance

Prices are cross-verified against official pricing pages and, where a rate is not published, reconciled from real Cost Management billing exports (grouped by meter) or inferred from an established pattern — always flagged accordingly. See the methodology on the home page and the cache-economics case study.

## License

[MIT](LICENSE).
