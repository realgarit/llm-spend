# Decision Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the compare page into a decision cockpit that surfaces cost leaders, workload presets, precise filters, accessible sorting, and mobile-native results without changing pricing semantics.

**Architecture:** Pure comparison insight logic lives in `src/lib/compare-insights.ts`; focused controlled React components render presets, leaders, and filters; `CompareExplorer` coordinates state and the existing scenario resolver. Responsive behavior is applied to the existing semantic table so mobile and assistive technology do not receive duplicated result sets.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Tailwind v4/global CSS, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-08-30-decision-cockpit-design.md`

## Global Constraints

- Do not alter catalog prices, availability, rate resolution, confidence provenance, or changelog data.
- Use “lowest cost for this workload”; do not imply model quality or universal recommendations.
- Preserve static generation and the existing build-time/live-clock hydration pattern.
- Reuse IBM Plex Sans, IBM Plex Mono, Newsreader, and the existing palette tokens.
- Maintain visible focus, reduced motion, semantic table markup, and no document-level mobile overflow.
- New decision logic must follow red-green-refactor and be covered by real pure-function tests.

---

### Task 1: Pure workload, filtering, and cost-leader model

**Files:**
- Create: `src/lib/compare-insights.ts`
- Create: `src/lib/compare-insights.test.ts`

**Interfaces:**
- Consumes: `ComparedRow` from `@/lib/scenario` and `Workload` from `@/lib/calc`.
- Produces: `WORKLOAD_PRESETS`, `CompareFilters`, `DEFAULT_COMPARE_FILTERS`, `filterComparedRows(rows, filters)`, `buildCostLeaders(rows)`, and `workloadMatchesPreset(workload, preset)`.

- [ ] **Step 1: Write failing tests for preset identity and exact workload matching**

  Assert that the four preset ids are `agentic`, `rag`, `support`, and `batch`; assert that exact values match and a one-token edit returns false.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `npm test -- src/lib/compare-insights.test.ts`  
  Expected: FAIL because `@/lib/compare-insights` does not exist.

- [ ] **Step 3: Add preset definitions and exact matching**

  Implement immutable preset records with `id`, `label`, `description`, and a complete `Workload`; compare all three workload fields exactly.

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `npm test -- src/lib/compare-insights.test.ts`  
  Expected: preset tests PASS.

- [ ] **Step 5: Write failing composition tests for search, deployment, cache, and confidence filters**

  Use real-shaped `ComparedRow` fixtures. Prove case-insensitive host/model search, Foundry/direct classification by tier, cache-meter exclusion, official cached-confidence handling, and combined predicates.

- [ ] **Step 6: Run the focused test and verify RED**

  Run: `npm test -- src/lib/compare-insights.test.ts`  
  Expected: FAIL because `filterComparedRows` is not implemented.

- [ ] **Step 7: Implement filter predicates**

  Normalize search with `trim().toLocaleLowerCase()`. Classify `tier === "Direct"` as direct and every other tier as Foundry. Treat a row with no cache meter as not cache-capable. For official-only, require official base confidence and official cached confidence when cached input exists.

- [ ] **Step 8: Write failing tests for median and lane leaders**

  Prove odd/even medians, lowest overall/Foundry/direct selection, unavailable lane behavior, and zero-median percentage handling.

- [ ] **Step 9: Implement `buildCostLeaders` minimally and rerun focused tests**

  Sort a copy by `cost.totalUsd`, compute the median from sorted totals, and return leader records containing the row plus `belowMedianPercent: number | null`.

- [ ] **Step 10: Run the complete suite**

  Run: `npm test`  
  Expected: all existing and new tests PASS with zero failures.

### Task 2: Preset and cost-signal components

**Files:**
- Create: `src/components/workload-presets.tsx`
- Create: `src/components/cost-signal-rail.tsx`
- Modify: `src/components/workload-calculator.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `WORKLOAD_PRESETS`, `workloadMatchesPreset`, `CostLeaders`, and existing currency/token formatters.
- Produces: `<WorkloadPresets workload onChange />` and `<CostSignalRail leaders />`.

- [ ] **Step 1: Render controlled workload presets**

  Each button uses `type="button"`, `aria-pressed={workloadMatchesPreset(...)}`, the preset label, and a short token/cache description. Clicking sends a fresh workload object to `onChange`.

- [ ] **Step 2: Associate number-field labels with inputs**

  Extend `NumberField` with an `id`, pass `workload-input` and `workload-output`, set `htmlFor`, and retain the current parsing behavior.

- [ ] **Step 3: Render the cost-signal rail**

  Use three semantic articles labeled Overall lowest, Foundry lowest, and Direct lowest. Show model, provider/tier, USD and CHF workload totals, and median context. Render “No matching lane” for null leaders.

- [ ] **Step 4: Add named cockpit/preset/signal classes**

  Use existing color tokens. Add a single amber track on the rail, quiet borders, 40px preset targets, clear pressed states, and a stacked mobile layout. Respect `prefers-reduced-motion`.

- [ ] **Step 5: Verify type safety and buildability**

  Run: `npm run typecheck`  
  Expected: exit 0.

### Task 3: Filter/sort toolbar and responsive result cards

**Files:**
- Create: `src/components/compare-filters.tsx`
- Modify: `src/components/compare-explorer.tsx`
- Modify: `src/app/compare/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CompareFilters`, `DEFAULT_COMPARE_FILTERS`, provider names, `SortKey`, and `SortDir`.
- Produces: controlled `<CompareFilterBar ... />`; the explorer composes filters and leaders before sorting.

- [ ] **Step 1: Add controlled filter and sort UI**

  Render labeled search, provider select, deployment segmented control, cache-meter checkbox, official-only checkbox, sort select, count summary, and clear action. Sort values map to exact `{ key, dir }` pairs.

- [ ] **Step 2: Integrate the pure filter pipeline**

  In `CompareExplorer`, compute scenario-priced rows, apply `filterComparedRows`, derive `buildCostLeaders(filtered)`, then sort for the table. Presets render above the workload calculator; the rail renders immediately after presets.

- [ ] **Step 3: Synchronize sort UI and table headers**

  The sort select reads current `sortKey`/`sortDir`. Header clicks update the same state. Set `aria-sort` to `ascending` or `descending` only on the active header.

- [ ] **Step 4: Add the recovery empty state**

  When `sorted.length === 0`, replace the table with a descriptive result-empty panel and a button that restores `DEFAULT_COMPARE_FILTERS`.

- [ ] **Step 5: Convert the table to cards at the mobile breakpoint**

  Add `data-label` to numerical/tier cells. Under 720px hide the table header, turn rows into a two-column grid, make model span both columns, prioritize workload total, and keep provider/tier/input/cache/output visible. Confirm `.table-wrap` and the document do not overflow.

- [ ] **Step 6: Add progressive result disclosure**

  Show the top 12 lanes under the active sort by default. Add a show-all/show-top control without changing the workload, scenario, filters, sort, leader computation, or median computation.

- [ ] **Step 7: Refine page hierarchy and explanatory copy**

  Shorten the intro, identify presets as illustrative, place the full calculator under a “Fine-tune workload” heading, and condense the table footnote without removing pricing/confidence explanations.

- [ ] **Step 8: Run automated verification**

  Run: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`  
  Expected: every command exits 0 with no test failures, type errors, lint errors, or build errors.

### Task 4: Visual, responsive, and interaction QA

**Files:**
- Modify as findings require: `src/app/globals.css`, `src/components/compare-explorer.tsx`, `src/components/compare-filters.tsx`, `src/components/workload-presets.tsx`, `src/components/cost-signal-rail.tsx`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: the built app at a local URL.
- Produces: verified desktop/mobile interaction behavior and a dated Working notes entry.

- [ ] **Step 1: Start the production build locally**

  Run: `npm run build` then `npm start` on an available local port.  
  Expected: `/compare` returns HTTP 200.

- [ ] **Step 2: Verify the primary desktop flow visually**

  At 1280×720, capture the initial cockpit, activate each preset, combine deployment/cache/confidence filters, change sorting from the select and a table header, and recover from a no-result state.

- [ ] **Step 3: Verify mobile behavior visually**

  At 375×812, confirm the signal rail stacks, controls remain usable, rows read as cards, mobile navigation opens/closes, and `document.documentElement.scrollWidth <= innerWidth`.

- [ ] **Step 4: Verify accessibility behavior**

  Tab through presets, workload inputs, scenario controls, filters, and sort; confirm visible focus, pressed states, associated labels, `aria-sort`, and no keyboard trap. Emulate or inspect reduced-motion behavior.

- [ ] **Step 5: Inspect console and network health**

  Confirm no critical browser console errors, hydration errors, failed requests, `NaN`, `Infinity`, or invalid currency text.

- [ ] **Step 6: Record durable context**

  Append a dated `AGENTS.md` Working notes entry naming the decision-cockpit architecture, the cost-only language boundary, the pure helper location, and the visual acceptance evidence.

- [ ] **Step 7: Run final fresh verification**

  Run: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`  
  Expected: all commands exit 0 on the exact tree to be committed.

## Self-review

- **Spec coverage:** presets, leaders, filters, synchronized sorting, empty state, mobile cards, accessibility, boundaries, and visual QA each map to a task above.
- **Placeholder scan:** the plan contains no TBD/TODO/implement-later placeholders and every command names its expected result.
- **Type consistency:** `CompareFilters`, `CostLeaders`, `WORKLOAD_PRESETS`, `filterComparedRows`, `buildCostLeaders`, and `workloadMatchesPreset` are defined in Task 1 and consumed by Tasks 2–3 with the same names.
