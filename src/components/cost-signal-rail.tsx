import React from "react";
import { formatChf, formatUsd } from "@/data/currency";
import type { CostLeader, CostLeaders } from "@/lib/compare-insights";
import { TierBadge } from "@/components/price";

export function CostSignalRail({ leaders }: { leaders: CostLeaders }) {
  return (
    <section className="signal-section" aria-labelledby="cost-signal-heading">
      <div className="signal-heading-row">
        <div>
          <div className="eyebrow">Cost signal</div>
          <h2 id="cost-signal-heading">Lowest cost for this workload</h2>
        </div>
        <div className="signal-median mono">
          {leaders.medianTotalUsd === null || leaders.medianTotalUsd === 0
            ? "Median unavailable"
            : `Filtered median ${formatUsd(leaders.medianTotalUsd)} · ${formatChf(leaders.medianTotalUsd)}`}
        </div>
      </div>
      <div className="signal-rail">
        <SignalCard label="Overall lowest" leader={leaders.overall} unavailableLabel="No matching lane" />
        <SignalCard label="Foundry lowest" leader={leaders.foundry} unavailableLabel="No matching Foundry lane" />
        <SignalCard label="Direct lowest" leader={leaders.direct} unavailableLabel="No matching direct lane" />
      </div>
    </section>
  );
}

function SignalCard({
  label,
  leader,
  unavailableLabel,
}: {
  label: string;
  leader: CostLeader | null;
  unavailableLabel: string;
}) {
  if (!leader) {
    return (
      <article className="signal-card signal-card-empty">
        <div className="signal-card-label eyebrow">{label}</div>
        <div className="signal-empty">{unavailableLabel}</div>
        <div className="signal-context">Adjust the filters to restore this lane.</div>
      </article>
    );
  }

  const { row, cost, resolved } = leader.compared;
  const medianContext =
    leader.belowMedianPercent === null
      ? "Median unavailable"
      : leader.belowMedianPercent > 0
        ? `${leader.belowMedianPercent}% below filtered median`
        : leader.belowMedianPercent < 0
          ? `${Math.abs(leader.belowMedianPercent)}% above filtered median`
          : "Matches filtered median";

  return (
    <article className="signal-card">
      <div className="signal-card-label eyebrow">{label}</div>
      <div className="signal-model">{row.model}</div>
      <div className="signal-meta">
        <span>{row.provider}</span>
        <TierBadge tier={row.tier} />
      </div>
      <div className="signal-price-row">
        <div className="signal-price mono tnum" suppressHydrationWarning>{formatUsd(cost.totalUsd)}</div>
        <div className="signal-chf mono" suppressHydrationWarning>{formatChf(cost.totalUsd)}</div>
      </div>
      <div className="signal-context">
        {medianContext}
        {leader.compared.scenarioPriced && resolved.label ? ` · ${resolved.label}` : ""}
      </div>
    </article>
  );
}
