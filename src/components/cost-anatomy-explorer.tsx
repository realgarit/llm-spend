"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type CompareRow, toPricingEntry } from "@/data/compare-data";
import { formatChf, formatUsd } from "@/data/currency";
import { officialSourceFor } from "@/data/source-links";
import { CATALOG_VERIFIED_AT, FRESHNESS_THRESHOLDS_DAYS } from "@/data/catalog-meta";
import type { Confidence, ProviderSlug } from "@/data/types";
import { DEFAULT_WORKLOAD, formatTokens, type Workload } from "@/lib/calc";
import {
  type CostComparableAlternative,
  type SameModelDeploymentComparison,
  costComparableAlternatives,
  costComponents,
  sameModelDeploymentComparison,
} from "@/lib/lane-insights";
import { formatUtcInstant } from "@/lib/rate-display";
import {
  compareRowUnderScenario,
  DEFAULT_SCENARIO,
  scenarioContexts,
  type ComparedRow,
  type Scenario,
  type ScheduledPreview,
} from "@/lib/scenario";
import { useNow } from "@/lib/use-now";
import { useShortlist } from "@/hooks/use-shortlist";
import { ConfidenceBadge, Mark, TierBadge } from "@/components/price";
import { SectionHeading, Stat } from "@/components/ui";
import { ScenarioControls } from "@/components/scenario-controls";
import { ShortlistContextChips } from "@/components/shortlist-context-chips";
import { VariantStrip } from "@/components/variant-strip";
import { WorkloadCalculator } from "@/components/workload-calculator";
import { WorkloadPresets } from "@/components/workload-presets";

/** How many cost-comparable alternatives the anatomy page shows. Not part of lane-insights.ts's own default — a UI choice, so it lives here. */
const ALTERNATIVES_LIMIT = 6;

/**
 * The interactive explorer behind one lane's `/models/[laneId]` page.
 *
 * Follows the exact same server/client split as `compare-explorer.tsx`: the
 * server page (`app/models/[laneId]/page.tsx`) captures `Date.now()` once as
 * `buildAtMs` and passes it down along with `target` (the lane this page is
 * about) and `rows` (every catalog lane, needed to compute alternatives and
 * same-model markup). Before mount this falls back to `buildAtMs` so the
 * first client render is byte-identical to the server HTML; `useNow()` then
 * takes over post-mount for live countdowns and active-variant marking — see
 * `lib/use-now.ts`.
 *
 * Workload and scenario controls are reused verbatim from the compare page so
 * a visitor can price this one lane under the same conditions they were
 * comparing under. Every dollar figure below comes from `compareRowUnderScenario`
 * (lib/scenario.ts) and the pure projections in `lib/lane-insights.ts` — this
 * file only lays out already-resolved numbers, it never computes a rate or a
 * workload cost itself.
 */
export function CostAnatomyExplorer({
  target,
  rows,
  buildAtMs,
}: {
  target: CompareRow;
  rows: CompareRow[];
  buildAtMs: number;
}) {
  const [workload, setWorkload] = useState<Workload>(DEFAULT_WORKLOAD);
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const now = useNow();
  const liveNow = useMemo(() => now ?? new Date(buildAtMs), [now, buildAtMs]);

  const ctxs = useMemo(
    () => scenarioContexts(scenario, liveNow, workload.inputTokens),
    [scenario, liveNow, workload.inputTokens],
  );
  const compared = useMemo(() => compareRowUnderScenario(target, workload, ctxs), [target, workload, ctxs]);
  const computed = useMemo(() => rows.map((r) => compareRowUnderScenario(r, workload, ctxs)), [rows, workload, ctxs]);

  const deploymentComparison = useMemo(
    () => sameModelDeploymentComparison(compared, computed),
    [compared, computed],
  );
  const alternatives = useMemo(
    () => costComparableAlternatives(compared, computed, ALTERNATIVES_LIMIT),
    [compared, computed],
  );

  // Read-only-minimum shortlist context strip (issue #87) — this route has no
  // URL-driven lane selection of its own, so `useShortlist` is mounted with an
  // empty `urlLaneIds` and purely reflects whatever is already in storage
  // rather than overriding it. `shortlistRows` reads pinned lanes, in pin
  // order, out of the SAME `computed` array the alternatives/deployment
  // sections above already built — never re-priced. Mirrors
  // compare-explorer.tsx's `shortlistRows`.
  const validLaneIds = useMemo(() => new Set(rows.map((r) => r.id)), [rows]);
  const shortlist = useShortlist(validLaneIds, []);
  const shortlistRows = useMemo(() => {
    const byId = new Map(computed.map((entry) => [entry.row.id, entry]));
    return shortlist.laneIds
      .map((id) => byId.get(id))
      .filter((entry): entry is ComparedRow => entry !== undefined);
  }, [computed, shortlist.laneIds]);

  return (
    <div className="anatomy-explorer">
      <ShortlistContextChips rows={shortlistRows} onRemove={shortlist.toggle} />

      <WorkloadPresets workload={workload} onChange={setWorkload} />

      <section className="fine-tune-section" aria-label="Workload and pricing scenario">
        <div className="fine-tune-heading">
          <div className="eyebrow">Fine-tune</div>
          <h2 id="fine-tune-heading">Workload and pricing scenario</h2>
          <p>Adjust the token shape, cache behavior, time window, and service tier. Every number below updates immediately.</p>
        </div>
        <WorkloadCalculator workload={workload} onChange={setWorkload} />
        <ScenarioControls scenario={scenario} onChange={setScenario} />
      </section>

      <RateStateSection target={target} compared={compared} buildAtMs={buildAtMs} liveNow={liveNow} />
      <CostAnatomySection compared={compared} workload={workload} />
      <ProvenanceSection target={target} compared={compared} liveNow={liveNow} />
      <DeploymentMarkupSection comparison={deploymentComparison} />
      <AlternativesSection alternatives={alternatives} workload={workload} />

      <section className="hairline anatomy-footer-nav" style={{ paddingTop: "2rem", marginTop: "1rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Keep exploring</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          <Link href={`/providers/${target.providerSlug}`} className="btn">
            {target.provider} pricing →
          </Link>
          <Link href="/compare" className="btn btn-primary">
            Back to compare →
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rate state
// ---------------------------------------------------------------------------

function RateStateSection({
  target,
  compared,
  buildAtMs,
  liveNow,
}: {
  target: CompareRow;
  compared: ComparedRow;
  buildAtMs: number;
  liveNow: Date;
}) {
  const cachedConfidence = compared.resolved.cachedConfidence ?? compared.resolved.confidence;
  const hasVariants = Boolean(target.variants && target.variants.length > 0);

  return (
    <section className="anatomy-section anatomy-rate-state" aria-label="Rate state">
      <SectionHeading eyebrow="Rate state" title="What this lane charges right now">
        Priced under the workload and scenario above. The full published schedule below always shows every variant
        regardless of which scenario is selected.
      </SectionHeading>

      {compared.scenarioPriced &&
        (compared.preview ? (
          <PreviewNotice preview={compared.preview} liveNow={liveNow} />
        ) : (
          <p
            className="mono anatomy-scenario-badge"
            style={{ color: "var(--brand)", fontSize: "0.82rem", marginBottom: "1rem" }}
            title="Priced under the selected scenario — differs from this lane's flat base rate"
            suppressHydrationWarning
          >
            {compared.resolved.label ?? "Scenario"} — priced under the selected scenario, differs from the flat listed rate
          </p>
        ))}

      <div className="anatomy-rate-grid" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <RateStat label="Input / 1M" usd={compared.resolved.inputUsd} confidence={compared.resolved.confidence} />
        <RateStat
          label="Cached input / 1M"
          usd={compared.resolved.cachedUsd}
          confidence={cachedConfidence}
          unavailableLabel="No cache meter on this lane"
        />
        <RateStat label="Output / 1M" usd={compared.resolved.outputUsd} confidence={compared.resolved.confidence} />
      </div>

      {hasVariants && (
        <div style={{ marginTop: "1.25rem" }}>
          <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>Full published schedule</div>
          <VariantStrip entry={toPricingEntry(target)} isEmbeddings={false} buildAtMs={buildAtMs} />
        </div>
      )}
    </section>
  );
}

function RateStat({
  label,
  usd,
  confidence,
  unavailableLabel = "Not available",
}: {
  label: string;
  usd: number | null;
  confidence: Confidence;
  unavailableLabel?: string;
}) {
  return (
    <div className="card anatomy-rate-stat" style={{ padding: "1rem 1.1rem", minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>{label}</div>
      {usd === null ? (
        <div className="mono" style={{ color: "var(--text-faint)", fontSize: "0.9rem" }}>{unavailableLabel}</div>
      ) : (
        <>
          <div className="mono tnum" style={{ fontSize: "1.25rem", fontWeight: 600 }} suppressHydrationWarning>
            {formatUsd(usd)}
            <Mark confidence={confidence} />
          </div>
          <div className="mono tnum" style={{ fontSize: "0.78rem", color: "var(--text-faint)" }} suppressHydrationWarning>
            {formatChf(usd)}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Annotation for a lane priced at a rate that has not started billing yet —
 * a local adaptation of `compare-explorer.tsx`'s private `ScheduledPreviewLabel`
 * for this page's layout (that component isn't exported, and the two pages'
 * surrounding markup differ enough that a shared component isn't a clean fit).
 * Same underlying data (`ScheduledPreview` from lib/scenario.ts) and the same
 * rule: a scheduled-but-not-yet-active rate is never shown as though it were
 * the live price.
 */
function PreviewNotice({ preview, liveNow }: { preview: ScheduledPreview; liveNow: Date }) {
  const { variant, startsAt } = preview;
  const starts = startsAt === null ? null : formatUtcInstant(startsAt, liveNow);
  return (
    <div className="callout callout-warning anatomy-preview-notice" style={{ marginBottom: "1.1rem" }} suppressHydrationWarning>
      <div className="eyebrow" style={{ marginBottom: "0.3rem" }}>Preview only — not billing yet</div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
        The numbers below show <strong style={{ color: "var(--text)" }}>{variant.label}</strong>
        {starts ? `, which takes effect ${starts}` : ", which has no confirmed start instant"}. This lane still bills
        at its base rate until then — this is a preview of the selected scenario, not what you would be charged right
        now.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost anatomy
// ---------------------------------------------------------------------------

function CostAnatomySection({
  compared,
  workload,
}: {
  compared: ComparedRow;
  workload: Workload;
}) {
  const parts = costComponents(compared);
  const hasCache = compared.resolved.cachedUsd !== null;

  return (
    <section className="anatomy-section anatomy-breakdown" aria-label="Cost anatomy">
      <SectionHeading eyebrow="Cost anatomy" title="Where this workload's cost goes">
        {formatTokens(workload.inputTokens)} input tokens ({Math.round(workload.cacheHitRate * 100)}% cache hit) and{" "}
        {formatTokens(workload.outputTokens)} output tokens, at the resolved rate above.
      </SectionHeading>

      <div className="anatomy-parts-grid" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <Stat value={formatUsd(parts.freshInputUsd)} label={`Fresh input · ${formatChf(parts.freshInputUsd)}`} />
        {hasCache ? (
          <Stat value={formatUsd(parts.cachedInputUsd)} label={`Cached input · ${formatChf(parts.cachedInputUsd)}`} />
        ) : (
          <div className="card anatomy-unavailable-stat" style={{ padding: "1.1rem 1.2rem", minWidth: 0 }}>
            <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-faint)" }}>Not available</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              Cached input — no cache meter on this lane
            </div>
          </div>
        )}
        <Stat value={formatUsd(parts.outputUsd)} label={`Output · ${formatChf(parts.outputUsd)}`} />
        <Stat value={formatUsd(parts.totalUsd)} label={`Workload total · ${formatChf(parts.totalUsd)}`} accent />
      </div>

      <p className="mono anatomy-sum-proof" style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "0.9rem" }} suppressHydrationWarning>
        {formatUsd(parts.freshInputUsd)} + {hasCache ? formatUsd(parts.cachedInputUsd) : formatUsd(0)} + {formatUsd(parts.outputUsd)} = {formatUsd(parts.totalUsd)}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

type Freshness = { status: "current" | "review-due" | "stale"; ageDays: number };

/**
 * Age-bucket the catalog audit timestamp against `FRESHNESS_THRESHOLDS_DAYS`
 * (data/catalog-meta.ts) — current ≤7 days, review due ≤30, else stale, per
 * the design doc's fixed thresholds. Returns null only if the constant itself
 * or `nowMs` is somehow unparseable/non-finite, so the page can render an
 * explicit "unavailable" state instead of a bad date.
 */
function catalogFreshness(nowMs: number): Freshness | null {
  const auditedMs = Date.parse(CATALOG_VERIFIED_AT);
  if (!Number.isFinite(auditedMs) || !Number.isFinite(nowMs)) return null;
  const ageDays = Math.max(0, Math.floor((nowMs - auditedMs) / 86_400_000));
  const status: Freshness["status"] =
    ageDays <= FRESHNESS_THRESHOLDS_DAYS.currentMax
      ? "current"
      : ageDays <= FRESHNESS_THRESHOLDS_DAYS.reviewDueMax
        ? "review-due"
        : "stale";
  return { status, ageDays };
}

const FRESHNESS_LABEL: Record<Freshness["status"], string> = {
  current: "current",
  "review-due": "review due",
  stale: "stale",
};

function ProvenanceSection({
  target,
  compared,
  liveNow,
}: {
  target: CompareRow;
  compared: ComparedRow;
  liveNow: Date;
}) {
  const source = officialSourceFor(target.providerSlug as ProviderSlug);
  const freshness = catalogFreshness(liveNow.getTime());
  const cachedConfidence = compared.resolved.cachedConfidence ?? compared.resolved.confidence;

  return (
    <section className="anatomy-section anatomy-provenance" aria-label="Provenance">
      <SectionHeading eyebrow="Provenance" title="How much to trust these numbers" />

      <div className="anatomy-provenance-dims" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem 1.2rem", alignItems: "center", marginBottom: "1rem" }}>
        <ProvenanceDim label="Input" confidence={compared.resolved.confidence} />
        <ProvenanceDim label="Cached input" confidence={compared.resolved.cachedUsd === null ? null : cachedConfidence} />
        <ProvenanceDim label="Output" confidence={compared.resolved.confidence} />
      </div>

      {target.notes && (
        <p style={{ color: "var(--text-muted)", maxWidth: "44rem", fontSize: "0.92rem" }}>{target.notes}</p>
      )}
      {target.sourceNote && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "44rem", marginTop: "0.6rem" }}>{target.sourceNote}</p>
      )}

      <div
        className="anatomy-provenance-footer"
        style={{ marginTop: "1.1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem", alignItems: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}
      >
        <a href={source.href} target="_blank" rel="noreferrer" className="link-underline">{source.label}</a>
        <span>Rate effective {target.effectiveDate}</span>
        {freshness ? (
          <span className="mono">
            Catalog audited {freshness.ageDays === 0 ? "today" : `${freshness.ageDays}d ago`} — {FRESHNESS_LABEL[freshness.status]}
          </span>
        ) : (
          <span className="mono" style={{ color: "var(--text-faint)" }}>Catalog freshness not available</span>
        )}
      </div>
    </section>
  );
}

function ProvenanceDim({ label, confidence }: { label: string; confidence: Confidence | null }) {
  if (confidence === null) {
    return (
      <span className="anatomy-provenance-dim" style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
        <span className="eyebrow" style={{ textTransform: "none", letterSpacing: 0 }}>{label}</span>
        <span className="mono" style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>not available</span>
      </span>
    );
  }
  return (
    <span className="anatomy-provenance-dim" style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
      <span className="eyebrow" style={{ textTransform: "none", letterSpacing: 0 }}>{label}</span>
      <ConfidenceBadge confidence={confidence} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Same-model deployment markup
// ---------------------------------------------------------------------------

function DeploymentMarkupSection({ comparison }: { comparison: SameModelDeploymentComparison }) {
  return (
    <section className="anatomy-section anatomy-deployment" aria-label="Same-model deployment markup">
      <SectionHeading eyebrow="Direct vs Foundry" title="Same-model deployment markup">
        {comparison.targetIsDirect
          ? "How much more Microsoft Foundry charges for this exact model, over this Direct rate."
          : "How much this Foundry lane costs over the same model's Direct API rate."}
      </SectionHeading>

      {comparison.comparisons.length === 0 ? (
        <p className="callout callout-info" style={{ maxWidth: "44rem" }}>
          Not available — no {comparison.targetIsDirect ? "Microsoft Foundry" : "Direct API"} listing exists for this
          exact model in the catalog.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data anatomy-deployment-table">
            <thead>
              <tr>
                <th>Lane</th>
                <th>Deployment</th>
                <th className="num-h">Workload cost</th>
                <th className="num-h" title="Foundry cost minus Direct cost — positive means Foundry costs more, negative means Foundry undercuts Direct">
                  Foundry markup
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.comparisons.map((c) => (
                <tr key={c.compared.row.id}>
                  <td>
                    <Link href={`/models/${c.compared.row.id}`} className="link-underline">{c.compared.row.model}</Link>
                    {c.compared.row.host && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>{c.compared.row.host}</div>
                    )}
                  </td>
                  <td><TierBadge tier={c.compared.row.tier} /></td>
                  <td className="num mono tnum" suppressHydrationWarning>{formatUsd(c.compared.cost.totalUsd)}</td>
                  <td
                    className="num mono tnum"
                    style={{ color: c.deltaUsd > 0 ? "var(--estimate)" : c.deltaUsd < 0 ? "var(--official)" : "var(--text-muted)" }}
                    suppressHydrationWarning
                  >
                    {formatSignedUsd(c.deltaUsd)} ({formatSignedPercent(c.deltaPercent)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Cost-comparable alternatives
// ---------------------------------------------------------------------------

function AlternativesSection({
  alternatives,
  workload,
}: {
  alternatives: CostComparableAlternative[];
  workload: Workload;
}) {
  return (
    <section className="anatomy-section anatomy-alternatives" aria-label="Cost-comparable alternatives">
      <SectionHeading eyebrow="Cost-comparable" title="Other lanes within ±25% of this workload's cost">
        Same provider first, then ranked by cost proximity, for {formatTokens(workload.inputTokens)} in /{" "}
        {formatTokens(workload.outputTokens)} out. This is a cost ranking only — never a quality recommendation.
      </SectionHeading>

      {alternatives.length === 0 ? (
        <p className="callout callout-info" style={{ maxWidth: "44rem" }}>
          Not available — no other catalog lane falls within ±25% of this workload&rsquo;s cost right now. Adjust the
          workload above, or browse the full <Link href="/compare" className="link-underline">comparison table</Link>.
        </p>
      ) : (
        <ul
          className="anatomy-alternatives-list"
          style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", listStyle: "none", padding: 0, margin: 0 }}
        >
          {alternatives.map((alt) => (
            <li key={alt.compared.row.id} className="card anatomy-alternative-card" style={{ padding: "1rem 1.1rem", minWidth: 0 }}>
              <Link href={`/models/${alt.compared.row.id}`} className="link-underline" style={{ fontWeight: 500 }}>
                {alt.compared.row.model}
              </Link>
              <div style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "0.2rem" }}>
                {alt.compared.row.provider}
                {alt.compared.row.host ? ` · ${alt.compared.row.host}` : ""}
                {alt.sameProvider && (
                  <span className="badge" style={{ marginLeft: "0.4rem" }}>Same provider</span>
                )}
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <TierBadge tier={alt.compared.row.tier} />
              </div>
              <div className="mono tnum" style={{ marginTop: "0.6rem", fontSize: "1.05rem", fontWeight: 600 }} suppressHydrationWarning>
                {formatUsd(alt.compared.cost.totalUsd)}
              </div>
              <div className="mono tnum" style={{ fontSize: "0.76rem", color: "var(--text-faint)" }} suppressHydrationWarning>
                {formatChf(alt.compared.cost.totalUsd)}
              </div>
              <div
                className="mono"
                style={{ fontSize: "0.78rem", marginTop: "0.35rem", color: alt.deltaUsd === 0 ? "var(--text-muted)" : alt.deltaUsd > 0 ? "var(--estimate)" : "var(--official)" }}
                suppressHydrationWarning
              >
                {formatSignedUsd(alt.deltaUsd)} ({formatSignedPercent(alt.deltaPercent)}) vs this lane
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Small signed-number formatters shared by the markup and alternatives sections.
// ---------------------------------------------------------------------------

/** "+$1.23" / "-$1.23" / "$0.00" — never a bare negative-looking "$-1.23". */
function formatSignedUsd(deltaUsd: number): string {
  if (deltaUsd === 0) return formatUsd(0);
  return `${deltaUsd > 0 ? "+" : "-"}${formatUsd(Math.abs(deltaUsd))}`;
}

/** "+20%" / "-20%" / "0%" — a negative percent already carries its own "-", so it is never doubled. */
function formatSignedPercent(deltaPercent: number): string {
  return deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`;
}
