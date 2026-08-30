# AAA Cost Decision Workspace Design

**Date:** 2026-08-30  
**Status:** Approved by the accepted GitHub issue specifications #75–#80 and the user's instruction to continue until all are implemented  
**Primary journey:** Compare → shortlist → inspect → budget → share → verify

## Product thesis

llm-spend already answers which purchasable lane costs least for a selected workload. The complete roadmap turns that cockpit into a durable decision workspace: a technical buyer can preserve the exact scenario, keep two to four finalists, inspect why each lane costs what it does, test monthly affordability, and audit source freshness without an account or unsupported quality claims.

The release stays entirely client/static compatible. URL query state, local storage, static route generation, and catalog metadata provide persistence; no database, authentication, or server mutation is introduced.

## Audience and job

**Audience:** engineers, technical buyers, and FinOps practitioners comparing direct APIs and Microsoft Foundry deployment lanes.

**Single job:** turn sourced token rates into a decision artifact that can be checked, compared, budgeted, and handed to another person.

## Approaches considered

### Separate feature pages with independent controls

This is simple to implement, but forces users to reconstruct the same workload and lane choices on every page. It would make six shipped issues feel like six demos.

### One oversized compare page

This preserves state naturally, but would stack dense detail, planning, and provenance tools below an already substantial table. Mobile and keyboard navigation would deteriorate.

### Connected decision workspace — selected

Keep `/compare` as the coordinator, add a persistent shortlist tray as the decision spine, and create focused static routes for lane anatomy, budget planning, and provenance. A versioned URL codec carries shareable state; local storage carries shortlist continuity. Every route uses the same pure pricing resolver and stable lane identity.

## Visual direction

The existing technical-editorial system remains: IBM Plex Sans for interface language, IBM Plex Mono for rates and controls, and Newsreader only for restrained editorial accents.

### Palette

- **Carbon ink** `#0a0c10`: dark engineering field.
- **Instrument panel** `#101319`: primary data surfaces.
- **Raised graphite** `#161a22`: nested controls and drawers.
- **Signal amber** `#f5b544`: active decision state and primary actions.
- **Verified green** `#34d399`: official evidence and positive headroom.
- **Trace blue** `#5aa2ff`: derived evidence and secondary comparison paths.

The light palette remains the existing warm-paper counterpart. Confidence colors keep their semantic meaning. No new decorative color system is introduced.

### Layout and signature

The signature is the **decision spine**: a restrained fixed tray that names the selected lanes, the active workload label, and the next available action. Expanded, it becomes the side-by-side comparison surface. On detail and budget routes, compact shortlist chips preserve the context without competing with the page's single job.

```text
COMPARE
┌──────────────────────────────────────────────────────────────┐
│ workload + scenario + filters + exact results                │
│ [pin] Lane A        $…    [pin] Lane B       $…              │
└──────────────────────────────────────────────────────────────┘
╔ DECISION SPINE · 2/4 ════════════════════════════════════════╗
║ Lane A  ×   Lane B  ×    [Compare shortlist] [Budget]       ║
╚══════════════════════════════════════════════════════════════╝

SHORTLIST EXPANDED
┌──────────────────┬──────────────────┬────────────────────────┐
│ Lane A · lowest  │ Lane B +$ / +%   │ Lane C +$ / +%         │
│ total + anatomy  │ total + anatomy  │ total + anatomy        │
└──────────────────┴──────────────────┴────────────────────────┘

LANE DETAIL                BUDGET                    FRESHNESS
┌ cost anatomy ┐           ┌ monthly run-rate ┐      ┌ trust pulse ┐
│ input/cache  │           │ headroom/overrun │      │ filters     │
│ output       │           │ break-even       │      │ timeline    │
└ alternatives ┘           └ capacity         ┘      └ source grid ┘
```

The aesthetic risk is a persistent bottom instrument on a content-heavy pricing site. It is justified because the shortlist is the user's working set; the tray earns its space by preserving decisions across the workflow. It collapses to one compact row, never obscures focused content, and disappears when empty.

## Stable lane identity

Every catalog lane receives a deterministic slug derived from provider slug, model, tier, and host. Identity must not depend on array position. Duplicate slugs are a build/test failure rather than silently receiving a changing suffix.

The same slug powers compare row links, URL selection, local storage, detail routes, sitemap entries, budget lane selection, and freshness row anchors. Unknown slugs are ignored in shared state and render the normal not-found route for details.

## Shareable scenario and export

`/compare` uses a versioned compact query schema. Version `1` represents workload input/output/cache, time mode/custom UTC hour, service tier, filters, sort key/direction, and selected lane slugs. Defaults are omitted, so the canonical initial URL stays `/compare`.

Parsing is defensive: unknown keys are ignored; malformed, negative, non-finite, or future-version values fall back per field to documented defaults. Query state is restored on first client render and on `popstate`. User changes replace the current history entry; “Copy scenario link” creates a complete URL and reports success or failure in a non-blocking live region.

CSV export projects the exact already-resolved rows used by the visible result table at the same instant. It includes scenario label, provider, model, host, tier, active variant, resolved input/cache/output rates, total USD/CHF, and confidence. RFC 4180 escaping and deterministic column order are required.

## Persistent shortlist

Rows expose a 40px pin/unpin control with `aria-pressed` and an explicit accessible name. Selection is ordered, unique, and capped at four. A fifth selection is rejected with a clear tray message; at least two lanes are required for the expanded comparison.

Versioned local storage retains valid lane slugs after refresh. URL selection takes precedence when present and then synchronizes storage. Missing catalog rows are pruned without reordering survivors. Reset clears both in-memory and stored selection.

The expanded tray shows resolved total USD/CHF, input/cache/output, blended input, tier, host, confidence, and active variant. The cheapest shortlisted lane is the cost baseline; every other lane shows absolute and percentage delta. Copy remains “lowest cost in this shortlist,” never “best.”

## Cost-anatomy routes

Each lane has a statically generated `/models/[laneId]` page. An interactive client explorer reuses workload and scenario controls and resolves the lane through the existing rate resolver. Cost is decomposed into fresh input, cached input, and output, with USD and CHF totals that sum to the displayed workload total.

The page shows active rate state, scheduled boundaries from structured variants, and per-dimension provenance badges. Missing cache meters are explicit. Same-model Direct/Foundry lanes show absolute and percentage markup. Cost-comparable alternatives are selected transparently: same provider first, then lanes within ±25% workload cost, sorted by absolute cost difference and stable lane identity. They are never labeled as quality alternatives.

## Monthly budget planner

`/budget` accepts a per-request workload, requests per day, active days per month, monthly growth percentage, monthly budget, and selected lane. It resolves published rates through the same scenario path as compare.

Outputs include monthly input/output tokens, monthly spend USD/CHF, headroom or overrun, and affordable requests per day. Calculations clamp invalid/negative input to zero and return directional explicit states instead of `NaN` or `Infinity`.

Cache break-even solves the hit rate required for the selected lane to meet budget. It returns already-within-budget, impossible-even-at-full-cache, no-cache-meter, or a finite percentage. Direct/Foundry break-even compares same-model lanes and solves the cache hit rate where their per-request costs cross; when rates never cross within 0–100%, the page states which lane remains cheaper across the range.

## Freshness and provenance command center

`/freshness` derives a lane trust record from catalog metadata. A single catalog audit timestamp records the last full verification sweep; each lane also retains its effective date and source note. Freshness age is calculated from the audit timestamp, not inferred from the price effective date.

Thresholds are visible and fixed in code/documentation: current ≤7 days, review due 8–30 days, stale >30 days. Freshness never changes confidence. Filters cover stale, derived, estimated, scheduled-to-change, and missing-cache rows.

Upcoming changes are extracted from variant `from`/`until` instants, deduplicated, and ordered. Plain date expiry is labeled promotion/rate expiry; recurring hour/day variants are labeled time-of-day pricing. Provider source links come from a central official-source registry already shared by lane detail and freshness views. Empty states state the audit instant and what filters were applied.

## AAA quality gate

Playwright runs against a production build in CI. Browser checks cover home, compare, a provider, cache economics, rate limits, changelog, lane detail, budget, and freshness. Compare tests exercise presets, combined filters, sorting, scenario controls, empty recovery, pinning, shortlist expansion, share state, export, back/forward, mobile navigation, and keyboard focus.

`@axe-core/playwright` reports no serious or critical violations on representative routes. A shared guard fails on console/page errors, failed same-origin requests, document-level horizontal overflow, hydration diagnostics, or visible `NaN`/`Infinity`.

Four reviewed compare-page baselines cover 1280px and 375px in light and dark themes. Updating baselines requires the explicit `npm run test:e2e:update` command; CI never updates them. Performance budgets are documented and asserted: LCP ≤4,000ms in CI, CLS ≤0.1, JavaScript transfer ≤500KB compressed per route, and total route payload ≤1.5MB. Reduced-motion and keyboard-only smoke tests are required.

## Error and boundary behavior

- Clipboard failure leaves the comparison intact and exposes a selectable URL fallback.
- CSV generation is local; download failure never mutates state.
- Local-storage read/write failures fall back to the in-memory shortlist.
- Unknown or removed lane slugs are pruned.
- Zero-cost rows use a zero-percent delta baseline without division errors.
- Detail alternatives and break-even sections render explicit unavailable states when no comparable lane exists.
- All numeric displays receive finite values or explicit unavailable copy.
- Focus remains visible, motion is removed under `prefers-reduced-motion`, and the document never overflows horizontally.

## Acceptance mapping

- **#75:** URL codec, history synchronization, copy feedback, and CSV projection.
- **#76:** stable selection, local persistence, decision spine, and side-by-side deltas.
- **#77:** static lane routes, anatomy, variants, provenance, alternatives, and sitemap.
- **#78:** monthly projection, capacity, cache target, and Direct/Foundry crossover.
- **#79:** audit metadata, trust filters, scheduled timeline, and official source registry.
- **#80:** browser flows, axe, visual baselines, performance budgets, guardrails, artifacts, keyboard, and reduced motion.

## Non-goals

- model-quality scoring, benchmark synthesis, or “best model” recommendations;
- accounts, cloud-saved projects, alerts, or collaborative editing;
- catalog pricing changes or new provider coverage;
- PDF export;
- server-side persistence or API endpoints.
