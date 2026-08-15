import { Fragment } from "react";
import type { Provider } from "@/data/types";
import { formatTokens } from "@/lib/calc";
import { ConfidenceBadge, PriceStacked } from "./price";
import { RateCells } from "./rate-cell";
import { VariantStrip } from "./variant-strip";

const TIER_TITLE: Record<string, string> = {
  Global: "Global: routed to any datacenter (cheapest, highest throughput).",
  DataZone: "Data Zone: US or EU only (~10% premium).",
  Regional: "Regional: single region (most restrictive).",
  Direct: "Direct: the provider's own first-party API.",
};

export function PricingTable({ provider }: { provider: Provider }) {
  const isEmbeddings = provider.slug === "embeddings";
  const showContext = provider.entries.some((e) => e.contextWindow);
  // Columns in the header below: Model, Tier/Host, [Context], Input,
  // [Cached, Output], Confidence — used as the colSpan for a variant row's
  // full-width strip.
  const totalCols = 4 + (showContext ? 1 : 0) + (isEmbeddings ? 0 : 2);
  // Build-time basis for resolving variant rates. On this force-static site
  // that's effectively "now" for the server-rendered HTML; the client
  // components below re-resolve on the visitor's real clock after mount (see
  // rate-cell.tsx / variant-strip.tsx / lib/use-now.ts).
  const buildAtMs = Date.now();

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
          {provider.entries.map((e, i) => {
            const hasVariants = Boolean(e.variants && e.variants.length > 0);
            const rowKey = `${e.model}-${e.tier}-${e.host ?? ""}-${i}`;

            return (
              <Fragment key={rowKey}>
                <tr>
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
                  {hasVariants ? (
                    <RateCells entry={e} isEmbeddings={isEmbeddings} buildAtMs={buildAtMs} />
                  ) : (
                    <>
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
                    </>
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
                {hasVariants && (
                  <tr className="variant-row">
                    <td colSpan={totalCols}>
                      <VariantStrip entry={e} isEmbeddings={isEmbeddings} buildAtMs={buildAtMs} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
