"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type CompareRow, toPricingEntry } from "@/data/compare-data";
import { formatChf, formatUsd } from "@/data/currency";
import {
  type BreakEvenResult,
  type BudgetInput,
  type CrossoverResult,
  type RateBasis,
  DEFAULT_BUDGET_INPUT,
  UNBOUNDED_AFFORDABLE_REQUESTS_PER_DAY,
  deploymentCacheCrossover,
  projectMonthlyBudget,
  requiredCacheHitRate,
} from "@/lib/budget";
import { type Workload, formatTokens } from "@/lib/calc";
import { type DeploymentMarkup, sameModelDeploymentComparison } from "@/lib/lane-insights";
import {
  DEFAULT_SCENARIO,
  type Scenario,
  compareRowUnderScenario,
  effectivePreviewContext,
  scenarioContexts,
  scenarioToRateContext,
} from "@/lib/scenario";
import { useNow } from "@/lib/use-now";
import { TierBadge } from "@/components/price";
import { SectionHeading, Stat } from "@/components/ui";
import { ScenarioControls } from "@/components/scenario-controls";
import { WorkloadCalculator } from "@/components/workload-calculator";

/**
 * The interactive planner behind `/budget`.
 *
 * Same server/client hydration split as `compare-explorer.tsx` and
 * `cost-anatomy-explorer.tsx`: the server page (`app/budget/page.tsx`)
 * captures `Date.now()` once as `buildAtMs` and passes it down with `rows`
 * (the full catalog, for the lane selector). Before mount this falls back to
 * `buildAtMs` so the first client render is byte-identical to the server
 * HTML; `useNow()` takes over post-mount — see `lib/use-now.ts`.
 *
 * Every dollar/percentage figure below comes from `lib/budget.ts`
 * (`projectMonthlyBudget`, `requiredCacheHitRate`, `deploymentCacheCrossover`)
 * or `lib/lane-insights.ts` (`sameModelDeploymentComparison`, reused verbatim
 * to find a lane's Direct/Foundry counterpart(s) rather than re-deriving that
 * matching logic here). This file only wires already-computed results into
 * labeled inputs and directional copy — it never computes a rate or a
 * workload cost itself.
 */
export function BudgetPlanner({ rows, buildAtMs }: { rows: CompareRow[]; buildAtMs: number }) {
  const now = useNow();
  const liveNow = useMemo(() => now ?? new Date(buildAtMs), [now, buildAtMs]);

  const [selectedLaneId, setSelectedLaneId] = useState<string>(rows[0]?.id ?? "");
  const [perRequest, setPerRequest] = useState<Workload>(DEFAULT_BUDGET_INPUT.perRequest);
  const [requestsPerDay, setRequestsPerDay] = useState(DEFAULT_BUDGET_INPUT.requestsPerDay);
  const [activeDaysPerMonth, setActiveDaysPerMonth] = useState(DEFAULT_BUDGET_INPUT.activeDaysPerMonth);
  const [monthlyGrowthPercent, setMonthlyGrowthPercent] = useState(DEFAULT_BUDGET_INPUT.monthlyGrowthPercent);
  const [monthlyBudgetUsd, setMonthlyBudgetUsd] = useState(DEFAULT_BUDGET_INPUT.monthlyBudgetUsd);
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selectedLaneId) ?? rows[0],
    [rows, selectedLaneId],
  );

  const budgetInput: BudgetInput = useMemo(
    () => ({ perRequest, requestsPerDay, activeDaysPerMonth, monthlyGrowthPercent, monthlyBudgetUsd }),
    [perRequest, requestsPerDay, activeDaysPerMonth, monthlyGrowthPercent, monthlyBudgetUsd],
  );

  // The one scenario-resolved PREVIEW basis every lane priced on this page
  // shares — contextTokens is perRequest.inputTokens (a genuine single-prompt
  // size, unlike the compare page's monthly-aggregate stand-in — see
  // scenarioToRateContext's doc comment) so a future context-band variant
  // would already read the right prompt size here.
  //
  // This is the RAW preview context only — pricing an entry off it directly
  // would let any non-"now" Time scenario (Peak/Off-peak/Custom) preview ANY
  // not-yet-started variant on that row, not just genuinely time-of-day-scoped
  // ones (e.g. it would silently reveal Gemini's 2027-01-01 price reversion
  // four months early). Every actual pricing site below — rateBasis, and each
  // crossover counterpart — narrows this per-entry via effectivePreviewContext
  // before use, exactly like compareRowUnderScenario already does for
  // comparedRows.
  const ctx = useMemo(
    () => scenarioToRateContext(scenario, liveNow, perRequest.inputTokens),
    [scenario, liveNow, perRequest.inputTokens],
  );

  const rateBasis: RateBasis | null = useMemo(() => {
    if (!selectedRow) return null;
    const entry = toPricingEntry(selectedRow);
    return { entry, ctx: effectivePreviewContext(entry, ctx) };
  }, [selectedRow, ctx]);

  const projection = useMemo(
    () => (rateBasis ? projectMonthlyBudget(budgetInput, rateBasis) : null),
    [budgetInput, rateBasis],
  );
  const breakEven = useMemo(
    () => (rateBasis ? requiredCacheHitRate(budgetInput, rateBasis) : null),
    [budgetInput, rateBasis],
  );

  // Built once per scenario/workload change so sameModelDeploymentComparison
  // (lane-insights.ts, Task 4) can reuse its already-tested matching logic —
  // its own cost numbers aren't read here, only .row identity fields, but
  // deltaUsd/deltaPercent from the SAME comparisons are reused below for
  // "who's cheaper right now" copy, so building real ComparedRows (rather
  // than a matching-only stub) is what lets that reuse happen honestly.
  const scenarioCtxs = useMemo(
    () => scenarioContexts(scenario, liveNow, perRequest.inputTokens),
    [scenario, liveNow, perRequest.inputTokens],
  );
  const comparedRows = useMemo(
    () => rows.map((row) => compareRowUnderScenario(row, perRequest, scenarioCtxs)),
    [rows, perRequest, scenarioCtxs],
  );
  const selectedCompared = useMemo(
    () => comparedRows.find((c) => c.row.id === selectedRow?.id) ?? null,
    [comparedRows, selectedRow],
  );
  const deploymentComparison = useMemo(
    () => (selectedCompared ? sameModelDeploymentComparison(selectedCompared, comparedRows) : null),
    [selectedCompared, comparedRows],
  );

  const crossovers = useMemo(() => {
    if (!deploymentComparison || !rateBasis) return [];
    return deploymentComparison.comparisons.map((markup) => {
      const counterpartEntry = toPricingEntry(markup.compared.row);
      const counterpartRate: RateBasis = { entry: counterpartEntry, ctx: effectivePreviewContext(counterpartEntry, ctx) };
      const directRate = deploymentComparison.targetIsDirect ? rateBasis : counterpartRate;
      const foundryRate = deploymentComparison.targetIsDirect ? counterpartRate : rateBasis;
      return { markup, result: deploymentCacheCrossover(budgetInput, directRate, foundryRate) };
    });
  }, [deploymentComparison, rateBasis, ctx, budgetInput]);

  if (!selectedRow || !rateBasis || !projection || !breakEven) {
    return (
      <p className="callout callout-info" style={{ maxWidth: "44rem" }}>
        Not available — the catalog has no lanes to plan against.
      </p>
    );
  }

  return (
    <div className="budget-planner">
      <section className="card-2 budget-section budget-lane-section" style={{ padding: "1.4rem 1.5rem", marginBottom: "1.75rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Lane</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1.1rem" }}>Which lane are you planning for?</h2>
        <LaneSelect rows={rows} selectedId={selectedRow.id} onChange={setSelectedLaneId} />
        <div style={{ marginTop: "0.9rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span style={{ color: "var(--text-muted)" }}>
            {selectedRow.provider}
            {selectedRow.host ? ` · ${selectedRow.host}` : ""}
          </span>
          <TierBadge tier={selectedRow.tier} />
          <Link href={`/models/${selectedRow.id}`} className="link-underline" style={{ fontSize: "0.82rem" }}>
            Full cost anatomy →
          </Link>
        </div>
      </section>

      <section className="fine-tune-section budget-section" aria-label="Workload and pricing scenario">
        <div className="fine-tune-heading">
          <div className="eyebrow">Fine-tune</div>
          <h2>Per-request workload and monthly assumptions</h2>
          <p>Shape one request, then say how often it runs. Every number below updates immediately.</p>
        </div>
        <WorkloadCalculator workload={perRequest} onChange={setPerRequest} />
        <ScenarioControls scenario={scenario} onChange={setScenario} />
        <MonthlyAssumptions
          requestsPerDay={requestsPerDay}
          onRequestsPerDayChange={setRequestsPerDay}
          activeDaysPerMonth={activeDaysPerMonth}
          onActiveDaysPerMonthChange={setActiveDaysPerMonth}
          monthlyGrowthPercent={monthlyGrowthPercent}
          onMonthlyGrowthPercentChange={setMonthlyGrowthPercent}
          monthlyBudgetUsd={monthlyBudgetUsd}
          onMonthlyBudgetUsdChange={setMonthlyBudgetUsd}
        />
      </section>

      <ProjectionSection projection={projection} monthlyBudgetUsd={monthlyBudgetUsd} laneLabel={selectedRow.model} />
      <BreakEvenSection breakEven={breakEven} monthlyBudgetUsd={monthlyBudgetUsd} laneLabel={selectedRow.model} />
      <CrossoverSection
        targetLabel={selectedRow.model}
        targetIsDirect={deploymentComparison?.targetIsDirect ?? null}
        crossovers={crossovers}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lane selector
// ---------------------------------------------------------------------------

/**
 * A plain, grouped `<select>` over the whole catalog — deliberately not the
 * compare page's full filter UI (the brief's own call: "keep it simple, this
 * isn't the compare page's full filter UI"). Grouped by provider via
 * `<optgroup>` purely so ~66 options are scannable; no re-sorting beyond that
 * — `rows` already arrives grouped by provider from `buildCompareRows()`.
 */
function LaneSelect({
  rows,
  selectedId,
  onChange,
}: {
  rows: CompareRow[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const byProvider = useMemo(() => {
    const groups = new Map<string, CompareRow[]>();
    for (const row of rows) {
      const list = groups.get(row.provider) ?? [];
      list.push(row);
      groups.set(row.provider, list);
    }
    return groups;
  }, [rows]);

  return (
    <div>
      <label htmlFor="budget-lane" className="eyebrow" style={{ display: "block", marginBottom: "0.5rem" }}>
        Purchasable lane
      </label>
      <select
        id="budget-lane"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", maxWidth: "36rem" }}
      >
        {[...byProvider.entries()].map(([provider, providerRows]) => (
          <optgroup key={provider} label={provider}>
            {providerRows.map((row) => (
              <option key={row.id} value={row.id}>
                {row.model}
                {row.host ? ` — ${row.host}` : ""} ({row.tier})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// New per-month inputs (requests/day, active days, growth, budget)
// ---------------------------------------------------------------------------

function MonthlyAssumptions({
  requestsPerDay,
  onRequestsPerDayChange,
  activeDaysPerMonth,
  onActiveDaysPerMonthChange,
  monthlyGrowthPercent,
  onMonthlyGrowthPercentChange,
  monthlyBudgetUsd,
  onMonthlyBudgetUsdChange,
}: {
  requestsPerDay: number;
  onRequestsPerDayChange: (v: number) => void;
  activeDaysPerMonth: number;
  onActiveDaysPerMonthChange: (v: number) => void;
  monthlyGrowthPercent: number;
  onMonthlyGrowthPercentChange: (v: number) => void;
  monthlyBudgetUsd: number;
  onMonthlyBudgetUsdChange: (v: number) => void;
}) {
  return (
    <div
      className="card-2 budget-monthly-assumptions"
      style={{ padding: "1.1rem 1.25rem", marginTop: "1.1rem", display: "grid", gap: "1.2rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      <PlainNumberField
        id="budget-requests-per-day"
        label="Requests / day"
        value={requestsPerDay}
        onChange={onRequestsPerDayChange}
      />
      <PlainNumberField
        id="budget-active-days"
        label="Active days / month"
        value={activeDaysPerMonth}
        onChange={onActiveDaysPerMonthChange}
      />
      <PlainNumberField
        id="budget-growth"
        label="Monthly growth"
        suffix="%"
        value={monthlyGrowthPercent}
        onChange={onMonthlyGrowthPercentChange}
      />
      <PlainNumberField
        id="budget-monthly-budget"
        label="Monthly budget"
        suffix="USD"
        value={monthlyBudgetUsd}
        onChange={onMonthlyBudgetUsdChange}
      />
    </div>
  );
}

function PlainNumberField({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow" style={{ display: "block", marginBottom: "0.5rem" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw.trim() === "") {
              onChange(0);
              return;
            }
            const parsed = Number(raw);
            // Number.isFinite (not just !Number.isNaN): a number input syntactically
            // accepts scientific notation like "1e400", which Number() parses straight
            // to Infinity. Rejecting that here — the same way NaN was already rejected —
            // keeps this state finite at the source, so monthlyBudgetUsd (echoed verbatim
            // in prose below via formatPlain, bypassing budget.ts's own sanitization)
            // can never become "$Infinity" text. A huge-but-finite value still passes
            // through unchanged; only literal Infinity/-Infinity is refused.
            if (Number.isFinite(parsed)) onChange(parsed);
          }}
          style={{ width: "100%" }}
        />
        {suffix && (
          <span className="mono" style={{ color: "var(--text-faint)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monthly projection
// ---------------------------------------------------------------------------

function ProjectionSection({
  projection,
  monthlyBudgetUsd,
  laneLabel,
}: {
  projection: ReturnType<typeof projectMonthlyBudget>;
  monthlyBudgetUsd: number;
  laneLabel: string;
}) {
  const overrun = projection.headroomUsd < 0;
  const affordableLabel =
    projection.affordableRequestsPerDay >= UNBOUNDED_AFFORDABLE_REQUESTS_PER_DAY
      ? "Effectively unlimited (this lane is free for the shape you set)"
      : `${formatCount(projection.affordableRequestsPerDay)} / day`;

  return (
    <section className="budget-section budget-projection" aria-label="Monthly projection">
      <SectionHeading eyebrow="Projection" title="One representative month">
        {laneLabel}, at {formatCount(projection.effectiveRequestsPerDay)} requests/day after growth — a single
        projected month, not a compounding multi-month forecast.
      </SectionHeading>

      <div
        className="budget-projection-grid"
        style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        <Stat value={formatCount(projection.effectiveRequestsPerDay)} label="Effective requests/day (after growth)" />
        <Stat value={formatTokens(projection.monthlyInputTokens)} label="Monthly input tokens" />
        <Stat value={formatTokens(projection.monthlyOutputTokens)} label="Monthly output tokens" />
        <Stat value={formatUsd(projection.monthlySpendUsd)} label={`Monthly spend · ${formatChf(projection.monthlySpendUsd)}`} accent />
        <Stat value={affordableLabel} label="Affordable requests/day at this budget" />
      </div>

      <p
        className={`callout ${overrun ? "callout-warning" : "callout-info"} budget-headroom-copy`}
        style={{ marginTop: "1.1rem" }}
        suppressHydrationWarning
      >
        {overrun
          ? `This projection overruns your $${formatPlain(monthlyBudgetUsd)} budget by ${formatUsd(Math.abs(projection.headroomUsd))} (${formatChf(Math.abs(projection.headroomUsd))}).`
          : `This projection has ${formatUsd(projection.headroomUsd)} (${formatChf(projection.headroomUsd)}) of headroom under your $${formatPlain(monthlyBudgetUsd)} budget.`}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Cache break-even
// ---------------------------------------------------------------------------

function BreakEvenSection({
  breakEven,
  monthlyBudgetUsd,
  laneLabel,
}: {
  breakEven: BreakEvenResult;
  monthlyBudgetUsd: number;
  laneLabel: string;
}) {
  return (
    <section className="budget-section budget-break-even" aria-label="Cache hit rate break-even">
      <SectionHeading eyebrow="Break-even" title="Cache hit rate needed to hit budget">
        The cache hit rate {laneLabel} would need, holding volume and growth fixed, to spend no more than your $
        {formatPlain(monthlyBudgetUsd)} monthly budget.
      </SectionHeading>
      <p className="callout callout-info budget-break-even-copy" suppressHydrationWarning>
        {breakEvenCopy(breakEven, monthlyBudgetUsd)}
      </p>
    </section>
  );
}

function breakEvenCopy(result: BreakEvenResult, monthlyBudgetUsd: number): string {
  switch (result.status) {
    case "no-cache-meter":
      return "This lane has no cache meter — cache hit rate has no effect on its price, so it is not a lever here.";
    case "already-within-budget":
      return `Already within budget even with zero caching: spend at 0% cache hit is ${formatUsd(result.monthlySpendAtNoCacheUsd)}, under your $${formatPlain(monthlyBudgetUsd)} budget.`;
    case "impossible":
      return `Out of reach at this volume: even 100% cache hit would still cost ${formatUsd(result.monthlySpendAtFullCacheUsd)}, ${formatUsd(result.monthlySpendAtFullCacheUsd - monthlyBudgetUsd)} over your $${formatPlain(monthlyBudgetUsd)} budget.`;
    case "required":
      return `You need at least ${formatPercent(result.hitRate)} cache hit rate to stay within budget — spend at that rate is ${formatUsd(result.monthlySpendUsd)}.`;
    default:
      return "Not available.";
  }
}

// ---------------------------------------------------------------------------
// Direct vs Foundry cache crossover
// ---------------------------------------------------------------------------

function CrossoverSection({
  targetLabel,
  targetIsDirect,
  crossovers,
}: {
  targetLabel: string;
  targetIsDirect: boolean | null;
  crossovers: { markup: DeploymentMarkup; result: CrossoverResult }[];
}) {
  return (
    <section className="budget-section budget-crossover" aria-label="Direct vs Foundry cache crossover">
      <SectionHeading eyebrow="Direct vs Foundry" title="Where deployment lanes cross over">
        {targetIsDirect === true
          ? `The cache hit rate where a Microsoft Foundry lane for the same model as ${targetLabel} becomes cheaper or stays pricier.`
          : targetIsDirect === false
            ? `The cache hit rate where ${targetLabel} on Foundry crosses the same model's Direct API price.`
            : "Same-model Direct vs Foundry crossover for this lane."}
      </SectionHeading>

      {crossovers.length === 0 ? (
        <p className="callout callout-info" style={{ maxWidth: "44rem" }}>
          Not available — no {targetIsDirect ? "Microsoft Foundry" : "Direct API"} listing exists for this exact
          model in the catalog.
        </p>
      ) : (
        <ul className="budget-crossover-list" style={{ display: "grid", gap: "0.85rem", listStyle: "none", padding: 0, margin: 0 }}>
          {crossovers.map(({ markup, result }) => (
            <li key={markup.compared.row.id} className="card budget-crossover-card" style={{ padding: "1.05rem 1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 500 }}>vs</span>
                <Link href={`/models/${markup.compared.row.id}`} className="link-underline">
                  {markup.compared.row.model}
                  {markup.compared.row.host ? ` — ${markup.compared.row.host}` : ""}
                </Link>
                <TierBadge tier={markup.compared.row.tier} />
              </div>
              <p className="mono" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }} suppressHydrationWarning>
                At your current cache hit rate, {markup.deltaUsd === 0 ? "these two lanes cost the same" : `${markup.deltaUsd > 0 ? "the Foundry lane" : "the Direct lane"} costs ${formatSignedUsd(markup.deltaUsd)} (${formatSignedPercent(markup.deltaPercent)})`}.
              </p>
              <p style={{ marginTop: "0.5rem" }} suppressHydrationWarning>
                {crossoverCopy(result)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function crossoverCopy(result: CrossoverResult): string {
  switch (result.status) {
    case "always-equal":
      return "These two lanes cost exactly the same at every cache hit rate, for this per-request shape.";
    case "no-crossover":
      return `The ${result.cheaperLane === "direct" ? "Direct" : "Foundry"} lane is cheaper across the entire 0-100% cache hit range for this per-request shape — the lines never cross.`;
    case "crosses":
      return `These two lanes cost the same at ${formatPercent(result.hitRate)} cache hit rate — which lane is cheaper flips there.`;
    default:
      return "Not available.";
  }
}

// ---------------------------------------------------------------------------
// Small formatters local to this page
// ---------------------------------------------------------------------------

/** Compact integer-ish count, e.g. "12,345" or "1.2M" via formatTokens for very large volumes. */
function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000) return formatTokens(Math.round(n));
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** A budget/USD figure with no currency symbol, for inline "$X" sentences that already supply the "$" themselves. Defense-in-depth finiteness guard, mirroring formatCount below: this renders the raw monthlyBudgetUsd state directly rather than a budget.ts-sanitized value. */
function formatPlain(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2);
}

function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/** "+$1.23" / "-$1.23" / "$0.00" — never a bare negative-looking "$-1.23". Mirrors cost-anatomy-explorer.tsx's formatter. */
function formatSignedUsd(deltaUsd: number): string {
  if (deltaUsd === 0) return formatUsd(0);
  return `${deltaUsd > 0 ? "+" : "-"}${formatUsd(Math.abs(deltaUsd))}`;
}

/** "+20%" / "-20%" / "0%" — a negative percent already carries its own "-", so it is never doubled. */
function formatSignedPercent(deltaPercent: number): string {
  return deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`;
}
