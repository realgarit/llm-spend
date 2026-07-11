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
  return (
    <div className="container-page" style={{ paddingBlock: "3rem" }}>
      <header className="rise" style={{ maxWidth: "48rem", marginBottom: "2.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Cross-provider</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
          Compare cost, not sticker price
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.05rem" }}>
          Set a workload (the default is a real agentic session: 60M input / 210K output tokens at 90% cache hit) and
          sort every chat model by what it would actually bill. Prices per 1M tokens; totals in USD and CHF.
        </p>
      </header>
      <CompareExplorer rows={rows} />
    </div>
  );
}
