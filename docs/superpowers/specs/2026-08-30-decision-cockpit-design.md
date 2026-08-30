# LLM Cost Decision Cockpit Design

**Date:** 2026-08-30  
**Status:** Approved for autonomous implementation by the user’s explicit instruction to proceed end to end  
**Primary surface:** `/compare`

## Product diagnosis

llm-spend already has the difficult foundation: a sourced catalog, Microsoft Foundry and direct-API lanes, conditional rates, real workload math, USD/CHF totals, cache economics, and visible confidence markers. The current comparison page exposes that foundation faithfully, but it behaves like a long spreadsheet. A visitor must configure the workload, understand the scenario controls, scan up to 66 rows, and infer the useful conclusion alone.

The next release should shorten the path from “I have a workload” to “I understand the cost leaders and can inspect why.” It must not imply model quality, recommend a model as universally best, or introduce unsourced benchmark claims. Its job is narrower and more defensible: make cost decisions fast while keeping the complete evidence table available.

## Approaches considered

### 1. Site-wide visual rebrand

This would create the largest visual delta, but the current technical/editorial identity is already distinctive and appropriate. A rebrand would mostly rearrange a good shell while leaving the spreadsheet-like decision flow unchanged.

### 2. Guided multi-step wizard

A wizard could be friendly for first-time visitors, but it would hide the catalog and slow down expert users who want to compare several scenarios quickly. It would also imply that the site knows more about workload suitability than its data model currently supports.

### 3. Decision cockpit — selected

Keep the complete table, but place a compact decision layer above it: illustrative workload presets, a three-channel cost-signal rail, filters that map to real catalog dimensions, an explicit sort control, and a mobile-native presentation. This gives novices an immediate answer and experts a faster instrument without changing pricing semantics.

## Audience and job

**Audience:** engineers, technical buyers, and FinOps practitioners evaluating Microsoft Foundry and first-party LLM API costs.

**Single job:** show which purchasable lanes cost least for the selected workload and scenario, then make the underlying rates easy to inspect.

## Visual direction

The existing “technical editorial” identity remains the base. The cockpit should feel like a calibrated cost instrument, not a generic SaaS dashboard.

### Palette

- **Carbon ink** `#0a0c10`: dark canvas and engineering-grid field.
- **Instrument panel** `#101319`: primary result surfaces.
- **Raised graphite** `#161a22`: controls and nested surfaces.
- **Signal amber** `#f5b544`: active workload, selected sort, and primary cost signal.
- **Verified green** `#34d399`: official/lowest-cost semantic state.
- **Cool trace** `#5aa2ff`: Foundry/direct lane differentiation and derived evidence.

Light mode continues to use the existing warm-paper counterpart. No new decorative gradients are introduced.

### Type

- **IBM Plex Sans:** interface copy and model names.
- **IBM Plex Mono:** all controls, rates, labels, and instrument readouts.
- **Newsreader italic:** only the existing editorial brand accent; it does not enter dense cockpit UI.

### Layout and signature

The signature is a **cost-signal rail**: three adjacent readouts for the lowest-cost lane overall, the lowest Foundry lane, and the lowest direct-API lane. Each readout shows the model, deployment context, workload total, and its difference from the current result-set median. A thin amber signal track visually binds the three readouts.

```text
┌─────────────────────────────────────────────────────────────────────┐
│ COMPARE COST, NOT STICKER PRICE                                     │
│ [Agentic session] [RAG-heavy] [Support] [Batch extraction]          │
├──────────────────────┬──────────────────────┬───────────────────────┤
│ OVERALL LOWEST       │ FOUNDRY LOWEST       │ DIRECT LOWEST         │
│ Qwen…        $1.22   │ GPT…         $2.53   │ Qwen…          $1.22  │
│ 81% below median     │ 60% below median     │ 81% below median      │
└──────────────────────┴──────────────────────┴───────────────────────┘
│ Workload controls / rate scenario                                  │
│ Search…  Provider  Deployment  Cache meter  Official only  Sort    │
├─────────────────────────────────────────────────────────────────────┤
│ Full sortable results table / responsive result cards              │
└─────────────────────────────────────────────────────────────────────┘
```

The deliberate aesthetic risk is instrument-like density at the top of the page. It is justified by the subject: this is a cost-analysis tool. Everything below the signal rail stays quiet and highly legible.

## Interaction design

### Workload presets

Four presets set the existing workload inputs; they are examples, not benchmark claims:

- **Agentic session:** the existing 60M input / 210K output / 90% cache example.
- **RAG-heavy:** 10M input / 100K output / 80% cache.
- **Customer support:** 5M input / 1M output / 40% cache.
- **Batch extraction:** 20M input / 2M output / 0% cache.

The active preset is derived by exact equality with the current workload. Editing an input removes the active state without losing the custom values. Preset buttons expose `aria-pressed`.

### Cost-signal rail

The rail recomputes from the currently filtered result set and selected pricing scenario. It contains:

- overall lowest workload cost;
- lowest Microsoft Foundry workload cost;
- lowest direct-API workload cost;
- median workload cost for context;
- percentage below the median for each leader when meaningful.

Labels use “lowest cost,” never “best model.” When a filter removes one lane, that readout becomes an explicit unavailable state rather than reusing another lane.

### Filters and sorting

Filters operate on source-backed row properties:

- free-text search across provider, model, host, and tier;
- provider;
- deployment: all, Microsoft Foundry, direct API;
- cache meter: all or published/derived cache rate available;
- confidence: all or fully official row rates.

The sort select gives keyboard and mobile users an explicit equivalent to table-header sorting. Header sorting remains available on desktop and stays synchronized with the select. A single “Clear filters” action resets all filters but does not alter workload or scenario.

### Empty state

When no rows match, the table is replaced by a concise explanation and a “Clear filters” button. The cost-signal rail remains in place with unavailable readouts, so the page does not jump dramatically.

### Responsive behavior

At narrow widths, each existing table row becomes a two-column cost card using the same semantic table markup. Model and provider lead; workload total receives visual priority; tier and three unit rates remain visible; the table header is hidden because the explicit sort select remains available. The document itself must never overflow the viewport.

The initial view shows the top 12 lanes under the active sort. A clearly labeled control expands to the complete filtered catalog and can collapse back to the top 12. Cost leaders and the filtered median always use the complete filtered set, not only the visible slice.

## Architecture

`src/lib/compare-insights.ts` owns pure decision logic: preset definitions, filter predicates, lane classification, median calculation, and cost-leader selection. It accepts `ComparedRow[]` and has no React dependency.

`src/components/workload-presets.tsx` renders the preset controls. `src/components/cost-signal-rail.tsx` renders leaders passed to it; it does not calculate them. `src/components/compare-filters.tsx` renders controlled filter/sort inputs and the result summary.

`src/components/compare-explorer.tsx` remains the state coordinator. It computes scenario-priced rows, applies pure filters, sorts results, derives leaders, and renders the table. Pricing resolution stays in `src/lib/scenario.ts`; no pricing or catalog semantics move into UI code.

Page-specific layout rules use named classes in `globals.css`, replacing new inline-style sprawl. Existing generic tokens and the site shell remain intact.

## Accessibility and copy requirements

- Every text/number input has an explicit `id` and associated `label`.
- Presets use `aria-pressed`; filter groups use visible labels.
- The results summary is an `aria-live="polite"` region.
- Sort state is represented by the select and `aria-sort` on the active column header.
- Focus order follows the visible flow: presets, workload, scenario, filters, results.
- Mobile cards retain table semantics and do not duplicate screen-reader content.
- All interactive targets are at least 40px high; focus indicators use signal amber.
- Reduced-motion behavior remains respected.
- Copy says “lowest cost for this workload,” never “recommended” or “best.”

## Error and boundary behavior

- Empty or invalid numeric input continues to resolve safely to zero through the existing workload parser.
- A missing cached rate excludes a row only when the cache-meter filter is active; it never changes the row’s math.
- Official-only requires both base and cached confidence to be official when a cache meter exists.
- Median for an even result count is the mean of the two center values.
- Percentage-below-median is omitted when median cost is zero.
- Scenario previews retain their current explicit “preview” labeling.

## Acceptance criteria

1. Four workload presets update all three workload dimensions and expose a correct pressed state.
2. Cost leaders recompute after workload, scenario, filter, or live rate changes and never claim model quality.
3. Search, provider, deployment, cache-meter, and official-only filters compose correctly.
4. The explicit sort control and sortable table headers stay synchronized.
5. No-result combinations render a directional empty state with one-action recovery.
6. At 375px, results are legible cards with no document-level horizontal overflow.
7. The initial result set is limited to 12 lanes, and the show-all/show-top control preserves the current sort and filters.
8. Labels, `aria-pressed`, `aria-sort`, keyboard sorting, focus treatment, and reduced motion meet the accessibility requirements above.
9. Pure decision logic is covered by tests that were observed failing before implementation.
10. The full test, typecheck, lint, and production build commands succeed.
11. Live browser QA covers desktop, 375px mobile, theme behavior, keyboard focus, preset selection, combined filters, sorting, progressive disclosure, and empty-state recovery.

## Non-goals for this release

- model-quality scoring or benchmark recommendations;
- persisted accounts, favorites, or alerts;
- shareable URL state;
- CSV/PDF export;
- catalog data or pricing changes;
- a site-wide rebrand.
