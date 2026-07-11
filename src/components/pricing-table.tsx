import type { Provider } from "@/data/types";
import { formatTokens } from "@/lib/calc";
import { ConfidenceBadge, PriceStacked } from "./price";

const TIER_TITLE: Record<string, string> = {
  Global: "Global — routed to any datacenter (cheapest, highest throughput).",
  DataZone: "Data Zone — constrained to US or EU (~10% premium).",
  Regional: "Regional — single specific region (most restrictive).",
  Direct: "Direct — the provider's own first-party API.",
};

export function PricingTable({ provider }: { provider: Provider }) {
  const isEmbeddings = provider.slug === "embeddings";
  const showContext = provider.entries.some((e) => e.contextWindow);

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>Model</th>
            <th>Tier / Host</th>
            {showContext && <th className="num-h">Context</th>}
            <th className="num-h">Input</th>
            {!isEmbeddings && <th className="num-h">Cached</th>}
            {!isEmbeddings && <th className="num-h">Output</th>}
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {provider.entries.map((e, i) => (
            <tr key={`${e.model}-${e.tier}-${e.host ?? ""}-${i}`}>
              <td>
                <div style={{ fontWeight: 500 }}>{e.model}</div>
                {e.notes && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.15rem", maxWidth: "26rem" }}>
                    {e.notes}
                  </div>
                )}
              </td>
              <td>
                <span className="badge badge-tier" title={TIER_TITLE[e.tier]}>{e.tier}</span>
                {e.host && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.2rem" }}>{e.host}</div>
                )}
              </td>
              {showContext && (
                <td className="num" style={{ color: "var(--text-muted)" }}>
                  {e.contextWindow ? formatTokens(e.contextWindow) : "—"}
                  {e.maxOutput && (
                    <div style={{ fontSize: "0.68rem", color: "var(--text-faint)" }}>
                      {formatTokens(e.maxOutput)} max out
                    </div>
                  )}
                </td>
              )}
              <td className="num">
                <PriceStacked usd={e.inputUsd} confidence={e.confidence} />
              </td>
              {!isEmbeddings && (
                <td className="num">
                  <PriceStacked
                    usd={e.cachedUsd}
                    confidence={e.cachedConfidence ?? e.confidence}
                    muted
                  />
                </td>
              )}
              {!isEmbeddings && (
                <td className="num">
                  <PriceStacked usd={e.outputUsd} confidence={e.confidence} />
                </td>
              )}
              <td>
                <ConfidenceBadge confidence={e.confidence} />
                {e.sourceNote && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.3rem", maxWidth: "24rem" }}>
                    {e.sourceNote}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
