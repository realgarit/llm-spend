# AAA Cost Decision Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement every acceptance criterion in roadmap issues #75–#80 as one connected, static-compatible cost decision workspace.

**Architecture:** Pure TypeScript modules own stable lane identity, URL/CSV projection, shortlist invariants, anatomy, budget math, and freshness derivation. Client components coordinate browser state and render those outputs; catalog rates are always resolved through `scenario.ts`/`rates.ts`. Playwright verifies production-build behavior, accessibility, visuals, responsiveness, and budgets.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, node:test/tsx, Playwright Chromium, axe-core, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-30-aaa-decision-workspace-design.md`

## Global Constraints

- Keep the canonical default URL exactly `/compare`; encode only non-default state under version `v=1`.
- Never describe a cost leader or alternative as higher quality, “better,” or universally recommended.
- Every rate and cost uses `resolveRate`, `compareRowUnderScenario`, or `computeCost`; do not duplicate pricing constants.
- Stable lane ids derive from provider, model, tier, and host and must not depend on catalog order.
- Browser persistence is versioned, defensive, account-free, and static-hosting compatible.
- Numeric outputs must be finite or render an explicit unavailable state.
- Preserve the existing carbon/amber technical-editorial system, light/dark modes, visible focus, and reduced motion.
- Add one dated `2026-08-30` changelog entry for the customer-visible comparison capabilities.
- Ship through branch, PR, CI, merge, deployment verification, issue closure, and cleanup.

---

### Task 1: Stable lane identity and shared provenance metadata

**Files:**
- Create: `src/lib/lane-id.ts`
- Create: `src/lib/lane-id.test.ts`
- Create: `src/data/catalog-meta.ts`
- Create: `src/data/source-links.ts`
- Modify: `src/data/compare-data.ts`
- Modify: `src/data/types.ts`

**Interfaces:**
- Produces: `laneId(input: { providerSlug: string; model: string; tier: Tier; host?: string }): string`
- Produces: `assertUniqueLaneIds(rows: CompareRow[]): void`
- Produces: `CATALOG_VERIFIED_AT`, `FRESHNESS_THRESHOLDS_DAYS`, and `officialSourceFor(providerSlug)`.
- Extends: `CompareRow` with `effectiveDate`, `notes`, `sourceNote`, and stable `id`.

- [ ] **Step 1: Write failing identity tests** for slug determinism, punctuation normalization, host/tier distinction, catalog-order independence, and duplicate rejection.
- [ ] **Step 2: Run `npm test -- src/lib/lane-id.test.ts`** and confirm failure because `lane-id.ts` does not exist.
- [ ] **Step 3: Implement the minimal identity/source metadata** and project catalog fields through `buildCompareRows()`.
- [ ] **Step 4: Run the focused test and the full `npm test`**; confirm all tests pass and snapshot the lane count/uniqueness in the test.
- [ ] **Step 5: Commit** with `feat: add stable lane identity`.

### Task 2: Versioned compare URL state and exact CSV export

**Files:**
- Create: `src/lib/compare-state.ts`
- Create: `src/lib/compare-state.test.ts`
- Create: `src/lib/compare-export.ts`
- Create: `src/lib/compare-export.test.ts`

**Interfaces:**
- Produces: `CompareDecisionState` containing workload, scenario, filters, sort, and `selectedLaneIds`.
- Produces: `decodeCompareState(search: string, validLaneIds: ReadonlySet<string>): CompareDecisionState`.
- Produces: `encodeCompareState(state: CompareDecisionState): string` returning `""` for defaults.
- Produces: `scenarioLabel(state): string` and `buildCompareCsv(rows: ComparedRow[], state, usdToChf): string`.

- [ ] **Step 1: Write failing codec tests** for every field, default omission, negative/non-finite/malformed values, unknown lanes, and future versions.
- [ ] **Step 2: Run the focused state test** and observe the missing-module failure.
- [ ] **Step 3: Implement field-level defensive parsing and canonical encoding** with deterministic key order.
- [ ] **Step 4: Write failing CSV tests** using commas, quotes, missing cache, variant labels, USD/CHF totals, and deterministic headers.
- [ ] **Step 5: Run the export test** and observe the missing projection.
- [ ] **Step 6: Implement RFC 4180 CSV projection** from already-resolved rows only.
- [ ] **Step 7: Run both focused tests and `npm test`**.
- [ ] **Step 8: Commit** with `feat: add shareable compare state and CSV export`.

### Task 3: Shortlist invariants, persistence, and deltas

**Files:**
- Create: `src/lib/shortlist.ts`
- Create: `src/lib/shortlist.test.ts`
- Create: `src/hooks/use-shortlist.ts`
- Create: `src/components/shortlist-tray.tsx`

**Interfaces:**
- Produces: `SHORTLIST_LIMIT = 4`, `normalizeShortlist`, `toggleShortlistLane`, and `shortlistDeltas`.
- Produces: `useShortlist(validLaneIds, urlLaneIds)` with ordered `laneIds`, `toggle`, `reset`, and `message`.
- Consumes: stable `CompareRow.id` and `ComparedRow.cost.totalUsd`.

- [ ] **Step 1: Write failing pure tests** for uniqueness, order, 4-lane rejection, removed-lane pruning, zero baseline, and currency/percent deltas.
- [ ] **Step 2: Run the shortlist test** and verify expected missing-module failure.
- [ ] **Step 3: Implement the pure shortlist state machine and versioned storage codec**.
- [ ] **Step 4: Run focused and full unit tests**.
- [ ] **Step 5: Implement the storage hook and controlled tray** with storage exception handling, `aria-live`, 2-lane minimum, reset, and accessible remove controls.
- [ ] **Step 6: Add component source assertions** for `aria-pressed`, explicit names, and limit copy; run them failing then passing.
- [ ] **Step 7: Commit** with `feat: add persistent shortlist tray`.

### Task 4: Static lane cost-anatomy pages

**Files:**
- Create: `src/lib/lane-insights.ts`
- Create: `src/lib/lane-insights.test.ts`
- Create: `src/app/models/[laneId]/page.tsx`
- Create: `src/components/cost-anatomy-explorer.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/components/compare-explorer.tsx`

**Interfaces:**
- Produces: `costComponents(compared): { freshInputUsd; cachedInputUsd; outputUsd; totalUsd }`.
- Produces: `costComparableAlternatives(target, rows, limit)` and `sameModelDeploymentComparison(target, rows)`.
- Produces: static params for every stable lane id and detail metadata.

- [ ] **Step 1: Write failing anatomy tests** proving component sums, missing-cache state, ±25% cost-band selection, same-provider priority, stable ordering, and Direct/Foundry markup.
- [ ] **Step 2: Run the focused test** and verify the failure is missing behavior.
- [ ] **Step 3: Implement the pure insight functions** using `ComparedRow` values.
- [ ] **Step 4: Run focused and full unit tests**.
- [ ] **Step 5: Implement the static route and client explorer** with workload/scenario controls, USD/CHF anatomy, active/scheduled variants, per-dimension confidence, source link, deployment markup, and explicitly cost-comparable alternatives.
- [ ] **Step 6: Link every compare row model to its detail route and add every lane to the sitemap**.
- [ ] **Step 7: Run `npm run typecheck`, `npm run lint`, and the route build**.
- [ ] **Step 8: Commit** with `feat: add lane cost anatomy pages`.

### Task 5: Monthly budget and break-even planner

**Files:**
- Create: `src/lib/budget.ts`
- Create: `src/lib/budget.test.ts`
- Create: `src/app/budget/page.tsx`
- Create: `src/components/budget-planner.tsx`

**Interfaces:**
- Produces: `projectMonthlyBudget(input, resolvedRate): BudgetProjection`.
- Produces: `requiredCacheHitRate(input, resolvedRate): BreakEvenResult`.
- Produces: `deploymentCacheCrossover(input, directRate, foundryRate): CrossoverResult`.

- [ ] **Step 1: Write failing formula tests** for monthly tokens/spend, growth, headroom/overrun, affordable volume, zero/huge inputs, and CHF conversion.
- [ ] **Step 2: Run and observe the expected missing-module failure**.
- [ ] **Step 3: Implement finite clamped projection math** without pricing constants.
- [ ] **Step 4: Write failing cache-target and deployment-crossover tests** for finite, already-met, impossible, missing-cache, parallel-cost, and in-range crossover states.
- [ ] **Step 5: Implement both solvers and run focused/full unit tests**.
- [ ] **Step 6: Implement the responsive planner route** with labeled numeric inputs, lane/scenario selection, named comparison lanes, result summary, and directional boundary copy.
- [ ] **Step 7: Commit** with `feat: add monthly budget planner`.

### Task 6: Freshness and provenance command center

**Files:**
- Create: `src/lib/freshness.ts`
- Create: `src/lib/freshness.test.ts`
- Create: `src/app/freshness/page.tsx`
- Create: `src/components/freshness-dashboard.tsx`

**Interfaces:**
- Produces: `buildFreshnessRecords(rows, now)`, `freshnessStatus`, `confidenceCounts`, `scheduledChanges`, and `filterFreshnessRecords`.
- Consumes: audit date, effective date, structured variants, confidence fields, cache meter, and official source registry.

- [ ] **Step 1: Write failing tests** for 7/8/30/31-day boundaries, confidence counts, missing cache, derived cached confidence, schedule deduplication/order, expiry versus time-of-day classification, and composed filters.
- [ ] **Step 2: Run and verify the expected failure**.
- [ ] **Step 3: Implement pure derivation/filter functions** without changing catalog confidence.
- [ ] **Step 4: Run focused and full unit tests**.
- [ ] **Step 5: Implement the static dashboard** with trust pulse, documented thresholds, filters, upcoming timeline, provider/source coverage, lane anchors, and explicit empty/current states.
- [ ] **Step 6: Commit** with `feat: add pricing freshness command center`.

### Task 7: Integrate the decision workspace UI and customer-visible release notes

**Files:**
- Modify: `src/components/compare-explorer.tsx`
- Modify: `src/components/compare-filters.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/lib/site.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/data/changelog.ts`
- Modify: `src/data/changelog.test.ts`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: URL codec, export projection, shortlist hook/tray, stable detail links, budget and freshness routes.
- Produces: copy/export feedback, popstate restoration, pin controls, responsive decision spine, and navigation.

- [ ] **Step 1: Add failing component/source tests** for copy/export labels, row pin controls, detail links, shortlist semantics, new navigation, and dated changelog language.
- [ ] **Step 2: Run the focused tests and confirm they fail for missing UI**.
- [ ] **Step 3: Integrate initial URL hydration, replace-state synchronization, popstate restore, copy fallback, local CSV download, and URL-selected lanes**.
- [ ] **Step 4: Integrate tray/pins and route links without changing pricing resolution timing**.
- [ ] **Step 5: Add named responsive CSS** for the decision spine, anatomy, planner, freshness dashboard, and narrow layouts; preserve visible focus and reduced motion.
- [ ] **Step 6: Update navigation, sitemap, changelog, and AGENTS working notes**.
- [ ] **Step 7: Run unit tests, typecheck, lint, and build**.
- [ ] **Step 8: Commit** with `feat: connect AAA cost decision workspace`.

### Task 8: Automated AAA browser quality gate

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/helpers.ts`
- Create: `tests/e2e/routes.spec.ts`
- Create: `tests/e2e/compare.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `tests/e2e/visual.spec.ts`
- Create: `tests/e2e/performance.spec.ts`
- Create: `tests/e2e/README.md`
- Create: `tests/e2e/visual.spec.ts-snapshots/*.png`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces scripts: `test:e2e`, `test:e2e:update`, and `test:all`.
- Produces helper `installPageGuards(page)` for console, request, overflow, hydration, and non-finite-value failures.

- [ ] **Step 1: Add Playwright and axe dependencies** and explicit local scripts.
- [ ] **Step 2: Write route/guard tests first** for required legacy/new pages, console/request failures, overflow, and non-finite text; run against the current build and observe failures for missing new routes/controls.
- [ ] **Step 3: Add compare-flow tests** for presets, combined filters, sort, scenario, empty recovery, pins, tray, share/export, back/forward, mobile navigation, reduced motion, and keyboard-only operation.
- [ ] **Step 4: Add axe scans** with serious/critical threshold zero on home, compare, detail, budget, and freshness.
- [ ] **Step 5: Add performance assertions** for LCP ≤4,000ms, CLS ≤0.1, JS ≤500KB compressed, and route payload ≤1.5MB.
- [ ] **Step 6: Capture and review four compare baselines** at 1280px/375px in light/dark; commit only intentional images.
- [ ] **Step 7: Update CI** to install Chromium, build, run browser tests, and upload reports/screenshots/traces on failure.
- [ ] **Step 8: Run browser tests twice** to expose state or timing flakiness, then run the complete local gate.
- [ ] **Step 9: Commit** with `test: add AAA frontend quality gate`.

### Task 9: Completion audit, review, and delivery

**Files:**
- Modify as required by verified review findings.

**Interfaces:**
- Consumes: issue bodies #75–#80, this plan, test/build output, browser screenshots, CI status, deployment SHA, and production behavior.

- [ ] **Step 1: Re-read every acceptance criterion in #75–#80** and record authoritative evidence or a gap for each checkbox.
- [ ] **Step 2: Run fresh `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e`**; read complete output and retain counts.
- [ ] **Step 3: Request an independent code review** against `origin/main...HEAD`; fix every Critical/Important finding with a failing regression test first.
- [ ] **Step 4: Re-run the complete gate and inspect desktop/mobile light/dark screenshots** after review changes.
- [ ] **Step 5: Push, open one PR linking #75–#80, and monitor all checks**; remediate failures without force-push.
- [ ] **Step 6: Merge after green CI, verify deployment run and production routes against the merge SHA, then close #75–#80 and umbrella #81** with evidence links.
- [ ] **Step 7: Remove the remote/local feature branch and owned worktree, prune worktrees, fast-forward local `main`, and verify a clean synchronized checkout**.
