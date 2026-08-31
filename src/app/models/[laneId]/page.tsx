import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildCompareRows } from "@/data/compare-data";
import { CostAnatomyExplorer } from "@/components/cost-anatomy-explorer";
import { TierBadge } from "@/components/price";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return buildCompareRows().map((row) => ({ laneId: row.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ laneId: string }>;
}): Promise<Metadata> {
  const { laneId } = await params;
  const row = buildCompareRows().find((r) => r.id === laneId);
  if (!row) return { title: "Lane not found" };

  const title = `${row.model} cost anatomy — ${row.provider}`;
  return {
    title,
    description: `Cost breakdown, rate state, provenance, and cost-comparable alternatives for ${row.model} on ${row.provider} (${row.tier}${row.host ? `, ${row.host}` : ""}).`,
    alternates: { canonical: `${site.url}/models/${row.id}` },
  };
}

export default async function LaneDetailPage({
  params,
}: {
  params: Promise<{ laneId: string }>;
}) {
  const { laneId } = await params;
  const rows = buildCompareRows();
  const target = rows.find((r) => r.id === laneId);
  if (!target) notFound();

  // Build-time basis for resolving scenario-aware rates — same pattern as
  // compare/page.tsx's buildAtMs (see cost-anatomy-explorer.tsx / lib/use-now.ts).
  // The client explorer re-resolves on the visitor's real clock after mount.
  const buildAtMs = Date.now();

  return (
    <div className="container-page" style={{ paddingBlock: "3rem" }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: "0.8rem", color: "var(--text-faint)", marginBottom: "1.5rem" }}>
        <Link href="/">Home</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <Link href="/compare">Compare</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "var(--text)" }}>{target.model}</span>
      </nav>

      <header className="rise" style={{ marginBottom: "2.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Cost anatomy</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
          {target.model}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
            {target.provider}
            {target.host ? ` · ${target.host}` : ""}
          </span>
          <TierBadge tier={target.tier} />
        </div>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.05rem", maxWidth: "46rem" }}>
          Fresh input / cached input / output cost breakdown, active and scheduled rates, provenance, same-model
          deployment markup, and cost-comparable alternatives for this purchasable lane.
        </p>
      </header>

      <CostAnatomyExplorer target={target} rows={rows} buildAtMs={buildAtMs} />
    </div>
  );
}
