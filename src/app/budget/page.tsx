import type { Metadata } from "next";
import { buildCompareRows } from "@/data/compare-data";
import { BudgetPlanner } from "@/components/budget-planner";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Monthly budget planner",
  description:
    "Project a per-request workload into monthly spend, headroom, and capacity for any purchasable lane, plus the cache hit rate needed to hit budget and where a Direct lane crosses its Microsoft Foundry counterpart.",
  alternates: { canonical: `${site.url}/budget` },
};

export default function BudgetPage() {
  const rows = buildCompareRows();
  // Build-time basis for resolving scenario-aware rates — same pattern as
  // compare/page.tsx's and models/[laneId]/page.tsx's buildAtMs (see
  // budget-planner.tsx / lib/use-now.ts). The client planner re-resolves on
  // the visitor's real clock after mount.
  const buildAtMs = Date.now();

  return (
    <div className="container-page budget-page">
      <header className="rise budget-intro">
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Planning</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
          Monthly budget and break-even planner
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.05rem", maxWidth: "46rem" }}>
          Shape a single request, project it across a month of traffic, and see whether it fits your budget — plus
          the cache hit rate that would make it fit, and where a Direct lane crosses its Microsoft Foundry
          counterpart. Every figure traces to the same rate resolver the compare page uses.
        </p>
      </header>

      <BudgetPlanner rows={rows} buildAtMs={buildAtMs} />
    </div>
  );
}
