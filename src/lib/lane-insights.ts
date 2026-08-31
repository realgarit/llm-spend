import type { ComparedRow } from "@/lib/scenario";

/**
 * Pure derivations for a single lane's `/models/[laneId]` cost-anatomy page:
 * the workload-cost breakdown by dimension, transparently cost-comparable
 * alternatives, and same-model Direct-vs-Foundry markup.
 *
 * Every function here consumes already-resolved `ComparedRow`s (see
 * lib/scenario.ts) — this file never re-derives a rate or a workload cost
 * itself. It only reshapes and compares numbers `compareRowUnderScenario`
 * already computed, matching the site-wide rule that every cost/rate value
 * comes from scenario.ts/rates.ts/calc.ts and is never duplicated.
 */

/** A workload's cost for one lane, split by dimension. Always sums to `totalUsd`. */
export interface CostComponents {
  freshInputUsd: number;
  cachedInputUsd: number;
  outputUsd: number;
  totalUsd: number;
}

/**
 * Extract the anatomy page's cost breakdown from an already-priced row.
 *
 * A thin projection of `ComparedRow.cost` (see `CostBreakdown` in lib/calc.ts)
 * down to the four fields the anatomy page decomposes into fresh input /
 * cached input / output. `cacheApplied` and `blendedInputPerMUsd` stay
 * available on `compared.cost` directly for callers that want them; this
 * just names the four that must visibly sum to the workload total. No
 * arithmetic happens here — `computeCost` already did it, so
 * `freshInputUsd + cachedInputUsd + outputUsd === totalUsd` holds exactly
 * because it held on the source `CostBreakdown`, missing-cache-meter rows
 * included (their `cachedInputUsd` is `0`, not `null`/`NaN` — the page
 * renders the explicit "no cache meter" state itself, from
 * `resolved.cachedUsd === null`, not from a hole in this breakdown).
 */
export function costComponents(compared: ComparedRow): CostComponents {
  const { freshInputUsd, cachedInputUsd, outputUsd, totalUsd } = compared.cost;
  return { freshInputUsd, cachedInputUsd, outputUsd, totalUsd };
}

/** Width of the "cost-comparable" band, as a fraction of the target's workload cost. */
const COST_BAND_FRACTION = 0.25;

/** One lane judged cost-comparable to a `costComparableAlternatives` target. */
export interface CostComparableAlternative {
  compared: ComparedRow;
  /** `compared` minus target, in USD. Positive costs more than the target; negative costs less. */
  deltaUsd: number;
  /**
   * `deltaUsd` as a percent of the target's own cost, rounded to the nearest
   * integer. `0` (never `null`) when the target's cost is exactly `$0` — the
   * project-wide zero-baseline convention this design doc's "Zero-cost rows
   * use a zero-percent delta baseline without division errors" states, and
   * `shortlistDeltas` in shortlist.ts already established: `deltaUsd` stays
   * fully meaningful at a $0 baseline (cost - 0 = cost), only its percentage
   * framing is mathematically undefined, and `0` says "no percentage signal"
   * without forcing every caller to branch on a `null`.
   */
  deltaPercent: number;
  /** True when this alternative shares the target's provider. */
  sameProvider: boolean;
}

/**
 * Lanes "cost-comparable" to `target` under the workload/scenario already
 * baked into every row's `.cost` — same provider first, then ranked by how
 * close their workload cost sits to the target's.
 *
 * **Reading of the design doc's admittedly ambiguous "same provider first,
 * then lanes within ±25% workload cost, sorted by absolute cost difference
 * and stable lane identity"** (a deliberate judgment call, recorded here and
 * pinned by tests in lane-insights.test.ts, not a self-evident spec): the
 * ±25% band is a hard MEMBERSHIP filter —
 * `|compared.cost.totalUsd - target.cost.totalUsd| <= 0.25 * target.cost.totalUsd`
 * decides whether a lane appears here at all. "Same provider first" is a SORT
 * key applied only within that already-qualifying set, ahead of cost
 * difference and lane-id tiebreaks.
 *
 * The alternative reading — always including every same-provider lane
 * regardless of price, then topping up with an in-band cross-provider tail —
 * was rejected: this section is titled and copy-labeled "cost-comparable",
 * and a same-provider lane priced far outside the band would misrepresent
 * that label (and this site's standing rule against implying anything beyond
 * cost — "never labeled as quality alternatives" appears in the very same
 * design-doc sentence) far more than it would help a reader compare like
 * with like. The grammar supports this reading too: "within ±25% workload
 * cost" restricts *which* lanes qualify; "sorted by absolute cost difference
 * and stable lane identity" is introduced by "sorted by", describing an
 * ordering, not a second population stage.
 *
 * The target's own lane is always excluded. Ties on both "same provider" and
 * exact cost difference fall back to `compared.row.id` — the stable lane id
 * from lib/lane-id.ts — so the result never depends on the input array's
 * order, the same rule Task 1's lane identity work established for the
 * catalog itself.
 *
 * At a `$0` target cost the band radius is `$0`, so only other exactly-`$0`
 * lanes qualify — the literal consequence of the ±25% formula applied
 * consistently, not a special case.
 */
export function costComparableAlternatives(
  target: ComparedRow,
  rows: ComparedRow[],
  limit: number,
): CostComparableAlternative[] {
  const targetTotal = target.cost.totalUsd;
  const bandRadius = Math.abs(targetTotal) * COST_BAND_FRACTION;

  const alternatives: CostComparableAlternative[] = rows
    .filter((candidate) => candidate.row.id !== target.row.id)
    .filter((candidate) => Math.abs(candidate.cost.totalUsd - targetTotal) <= bandRadius)
    .map((candidate) => {
      const deltaUsd = candidate.cost.totalUsd - targetTotal;
      const deltaPercent = targetTotal === 0 ? 0 : Math.round((deltaUsd / targetTotal) * 100);
      return {
        compared: candidate,
        deltaUsd,
        deltaPercent,
        sameProvider: candidate.row.providerSlug === target.row.providerSlug,
      };
    });

  alternatives.sort((a, b) => {
    if (a.sameProvider !== b.sameProvider) return a.sameProvider ? -1 : 1;
    const diff = Math.abs(a.deltaUsd) - Math.abs(b.deltaUsd);
    if (diff !== 0) return diff;
    return a.compared.row.id.localeCompare(b.compared.row.id);
  });

  return alternatives.slice(0, Math.max(0, limit));
}

/** One same-model lane on the opposite side of the Direct/Foundry divide from a `sameModelDeploymentComparison` target. */
export interface DeploymentMarkup {
  compared: ComparedRow;
  /**
   * Foundry cost minus Direct cost, in USD — positive means the Foundry lane
   * costs more (a "markup"); negative means Foundry undercuts Direct (it
   * happens — see e.g. the DeepSeek-V4 Flash Fireworks Data Zone lane, which
   * undercuts its own Global tier).
   */
  deltaUsd: number;
  /**
   * `deltaUsd` as a percent of the Direct-side cost, rounded. `0` (never
   * `null`) at a $0 Direct baseline — the same zero-baseline convention as
   * `costComparableAlternatives` above.
   */
  deltaPercent: number;
}

export interface SameModelDeploymentComparison {
  /** True when `target` itself is the Direct-tier lane. */
  targetIsDirect: boolean;
  /**
   * Same-model lane(s) on the opposite side of the Direct/Foundry divide from
   * `target`, each compared individually against it. Sorted by stable lane id
   * for order-independence (see `costComparableAlternatives`). Empty when the
   * catalog has no counterpart for this model (a Direct-only or Foundry-only
   * family, e.g. Qwen has no Foundry meter at all) — render this as the
   * design doc's "explicit unavailable state", never a silently blank
   * section.
   */
  comparisons: DeploymentMarkup[];
}

/**
 * Same-model Direct-vs-Foundry markup for `target`.
 *
 * A catalog model can have more than one Direct-tier row (DeepSeek-V4 Pro has
 * both a DeepSeek-direct and a Fireworks-direct listing, at very different
 * prices), so there is no single well-defined "the" Direct baseline to pick
 * once and reuse. Instead every same-model row on the opposite side of the
 * Direct/Foundry divide from `target` gets its own comparison, computed
 * directly against `target`'s own price — no arbitrary tie-break needed, and
 * the markup shown is always specifically "this Foundry lane vs this Direct
 * lane", never an averaged or arbitrarily-picked stand-in. Peer Direct-vs-
 * Direct or Foundry-vs-Foundry pairs for the same model are deliberately out
 * of scope here — that is a different comparison than "Direct vs Foundry
 * markup", which is what this function and the design doc's wording name.
 *
 * `deltaUsd`/`deltaPercent` are always oriented "Foundry minus Direct" — this
 * site's own provider commentary already frames Foundry pricing as a markup
 * over Direct (see e.g. the DeepSeek quirks) — regardless of which side
 * `target` happens to be on: if `target` is Direct, its Foundry counterparts
 * are marked up over `target`; if `target` is a Foundry lane, it is marked up
 * over each Direct counterpart found.
 *
 * "Same model" is (`providerSlug`, `model`) equality — the catalog keeps a
 * model's display name byte-identical across every tier/host row for the
 * same underlying model (a convention this file relies on rather than
 * reinvents; see lane-insights.test.ts's real-catalog assertions), so no
 * fuzzy matching is needed or attempted.
 */
export function sameModelDeploymentComparison(
  target: ComparedRow,
  rows: ComparedRow[],
): SameModelDeploymentComparison {
  const targetIsDirect = target.row.tier === "Direct";

  const counterparts = rows.filter(
    (candidate) =>
      candidate.row.id !== target.row.id &&
      candidate.row.providerSlug === target.row.providerSlug &&
      candidate.row.model === target.row.model &&
      (targetIsDirect ? candidate.row.tier !== "Direct" : candidate.row.tier === "Direct"),
  );

  const comparisons: DeploymentMarkup[] = counterparts
    .map((candidate) => {
      const foundryTotal = targetIsDirect ? candidate.cost.totalUsd : target.cost.totalUsd;
      const directTotal = targetIsDirect ? target.cost.totalUsd : candidate.cost.totalUsd;
      const deltaUsd = foundryTotal - directTotal;
      const deltaPercent = directTotal === 0 ? 0 : Math.round((deltaUsd / directTotal) * 100);
      return { compared: candidate, deltaUsd, deltaPercent };
    })
    .sort((a, b) => a.compared.row.id.localeCompare(b.compared.row.id));

  return { targetIsDirect, comparisons };
}
