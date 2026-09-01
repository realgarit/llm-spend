import type { Metadata } from "next";
import { buildCompareRows } from "@/data/compare-data";
import { FreshnessDashboard } from "@/components/freshness-dashboard";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Freshness & provenance",
  description:
    "Catalog audit age, official/derived/estimate confidence distribution, upcoming scheduled rate changes, and provider source coverage for every tracked lane.",
  alternates: { canonical: `${site.url}/freshness` },
};

export default function FreshnessPage() {
  const rows = buildCompareRows();
  // Build-time basis for resolving audit age and scheduled-change boundaries —
  // same pattern as compare/page.tsx's, models/[laneId]/page.tsx's and
  // budget/page.tsx's buildAtMs (see freshness-dashboard.tsx / lib/use-now.ts).
  // The client dashboard re-resolves on the visitor's real clock after mount.
  const buildAtMs = Date.now();

  return (
    <div className="container-page freshness-page">
      <header className="rise freshness-intro">
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Provenance</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
          Freshness and provenance command center
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.05rem", maxWidth: "46rem" }}>
          How current the last full catalog audit is, how much of it is officially published versus derived or
          estimated, what changes on a schedule and when, and where every rate traces back to.
        </p>
      </header>

      <FreshnessDashboard rows={rows} buildAtMs={buildAtMs} />
    </div>
  );
}
