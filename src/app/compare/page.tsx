import type { Metadata } from "next";
import { buildCompareRows } from "@/data/compare-data";
import { CompareExplorer } from "@/components/compare-explorer";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Compare & cost calculator",
  description:
    "Sortable cross-provider LLM pricing plus a workload cost calculator. Real blended cost per model in USD and CHF, with an adjustable cache-hit rate.",
  alternates: { canonical: `${site.url}/compare` },
};

export default function ComparePage() {
  const rows = buildCompareRows();
  // Build-time basis for resolving scenario-aware rates — same pattern as
  // pricing-table.tsx's buildAtMs (see rate-cell.tsx / lib/use-now.ts). The
  // client component re-resolves on the visitor's real clock after mount.
  const buildAtMs = Date.now();
  return (
    <div className="container-page compare-page">
      <header className="rise compare-intro">
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Cross-provider</div>
        <h1>
          Compare cost, not sticker price
        </h1>
        <p>
          Shape a workload and see the lowest-cost purchasable lanes across Microsoft Foundry and direct APIs.
          Every result stays traceable to the complete rate table below.
        </p>
      </header>
      <CompareExplorer rows={rows} buildAtMs={buildAtMs} />
    </div>
  );
}
