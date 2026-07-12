import Link from "next/link";
import { providers } from "@/data/providers";
import { formatUsd } from "@/data/currency";
import { ConfidenceLegend, SectionHeading, Stat } from "@/components/ui";

export const dynamic = "force-static";

const NARRATIVE: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Blended cost depends on your input:output ratio",
    body: "Output usually costs 3-4x input. Two models with the same input rate can differ 2x on a real workload, so your token split matters more than the headline price.",
  },
  {
    n: "02",
    title: "Prompt caching is the single biggest lever",
    body: "Often bigger than model choice. A task that costs $12.42 / CHF 10 without cache came in at $1.74 / CHF 1.40 at a 97% hit rate.",
  },
  {
    n: "03",
    title: "Microsoft Foundry can publish incomplete pricing",
    body: "Foundry's public pages often skip the cached-input column for third-party models even though the cache meter exists and gets billed. A billing export exposes it.",
  },
  {
    n: "04",
    title: "Resale markups vary wildly",
    body: "From near 0% (resold at the provider's own rate), to ~10% (Data Zone vs Global), to as much as 4.5x (a 'Global' tier vs the direct API, per public support forums).",
  },
  {
    n: "05",
    title: "Context window is a real autonomy lever",
    body: "Bigger windows (1M tokens on DeepSeek V4 and GLM-5.2) mean less forced context compaction, so less babysitting on long runs.",
  },
  {
    n: "06",
    title: "Benchmark leaders don't always win",
    body: "GPT-5.3-Codex tops coding benchmarks but can lag in real agentic work, with poor context retention, versus DeepSeek V4 Pro and GLM-5.2.",
  },
  {
    n: "07",
    title: "Don't trust in-app 'estimated cost' widgets",
    body: "Portal estimates can show $0 or wildly wrong numbers while real charges pile up. Trust billing exports grouped by meter instead.",
  },
];

const METHOD: { n: string; body: string }[] = [
  { n: "1", body: "Get the provider's published per-million rate for input, output, and cached input if it's listed." },
  { n: "2", body: "Run a real workload and read the actual billed cost from Azure Cost Management, not a chat client's estimate." },
  { n: "3", body: "If real cost is far below the flat-rate math, suspect an undocumented cache discount before assuming a bug." },
  { n: "4", body: "Export a cost report grouped by meter, not by service name. Match known meters to confirmed rates to back out token counts, then solve for the unknown: cached_rate = cached_meter_cost / cached_token_count." },
  { n: "5", body: "Cross-check those token counts against the usage dashboards to validate your assumptions." },
  { n: "6", body: "Treat anything not on an official page as an estimate, not fact. Re-check once real numbers land or a billing cycle closes." },
];

function fromPrice(slug: string): number {
  const p = providers.find((x) => x.slug === slug)!;
  return Math.min(...p.entries.map((e) => e.inputUsd));
}

export default function HomePage() {
  return (
    <div className="container-page" style={{ paddingBlock: "3rem" }}>
      {/* Hero */}
      <section className="rise" style={{ maxWidth: "52rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>
          LLM API pricing · prompt-cache economics · cost verification
        </div>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: "-0.035em",
          }}
        >
          What LLM APIs{" "}
          <span className="display" style={{ fontStyle: "italic", fontWeight: 400 }}>
            actually
          </span>{" "}
          cost.
        </h1>
        <p style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)", color: "var(--text-muted)", marginTop: "1.4rem", maxWidth: "40rem" }}>
          Real LLM API prices, in{" "}
          <span className="mono" style={{ color: "var(--text)" }}>USD</span> and{" "}
          <span className="mono" style={{ color: "var(--text)" }}>CHF</span>. Every number is sourced, and when a rate
          comes from billing data instead of a pricing page, we say so. Mostly measured on Microsoft Foundry (formerly
          Azure AI Foundry), plus direct APIs to compare against.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.8rem" }}>
          <Link href="/compare" className="btn btn-primary">Open the cost calculator →</Link>
          <Link href="/cache-economics" className="btn">Read the cache case study</Link>
        </div>
      </section>

      {/* Stat band */}
      <section
        className="rise"
        style={{ marginTop: "3rem", display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", animationDelay: "0.08s" }}
      >
        <Stat value="97%" label="Cost cut from caching alone, measured" accent />
        <Stat value="$12.42→$1.74" label="Same task, cache off vs on (CHF 10 → 1.40)" />
        <Stat value="4.5×" label="Widest cloud resale markup vs direct" />
        <Stat value="7" label="Providers, all in USD + CHF" />
      </section>

      {/* Provider index */}
      <section style={{ marginTop: "4.5rem" }}>
        <SectionHeading eyebrow="Reference" title="Providers">
          One page each: the full table in USD and CHF, plus the quirks a pricing page hides, like cache meters,
          Responses-API-only models, and deployment-tier premiums.
        </SectionHeading>
        <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {providers.map((p) => (
            <Link
              key={p.slug}
              href={`/providers/${p.slug}`}
              className="card"
              style={{ padding: "1.2rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.6rem", transition: "border-color 0.15s ease" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>{p.name}</span>
                {p.org && <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>{p.org}</span>}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1 }}>{p.tagline}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-faint)" }}>
                  from <span className="mono" style={{ color: "var(--brand)" }}>{formatUsd(fromPrice(p.slug))}</span>
                  <span style={{ color: "var(--text-faint)" }}> /M in</span>
                </span>
                <span className="mono" style={{ color: "var(--brand)" }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Core narrative */}
      <section style={{ marginTop: "5rem" }}>
        <SectionHeading eyebrow="The framework" title="Don't trust the sticker price">
          Seven things that decide what you actually pay. None of them is the headline number.
        </SectionHeading>
        <div style={{ display: "grid", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden" }}>
          <div style={{ display: "grid", gap: "1px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }} className="narrative-grid">
            {NARRATIVE.map((item) => (
              <article key={item.n} style={{ background: "var(--surface)", padding: "1.4rem 1.5rem" }}>
                <div className="mono" style={{ color: "var(--brand)", fontSize: "0.85rem", marginBottom: "0.6rem" }}>{item.n}</div>
                <h3 style={{ fontWeight: 600, fontSize: "1.02rem", marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>{item.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section style={{ marginTop: "5rem" }}>
        <SectionHeading eyebrow="Reusable method" title="How to verify real LLM costs">
          Six steps for finding what a workload really costs, including how to back out an undocumented cache rate from a
          billing export.
        </SectionHeading>
        <ol style={{ display: "flex", flexDirection: "column", gap: "0.75rem", counterReset: "step" }}>
          {METHOD.map((s) => (
            <li key={s.n} className="card" style={{ display: "flex", gap: "1rem", padding: "1.1rem 1.25rem", alignItems: "flex-start" }}>
              <span
                className="mono"
                style={{
                  flexShrink: 0,
                  width: "1.9rem",
                  height: "1.9rem",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "0.5rem",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                {s.n}
              </span>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", paddingTop: "0.15rem" }}>
                {renderStep(s.body)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card-2" style={{ marginTop: "3rem", padding: "1.25rem 1.4rem" }}>
        <ConfidenceLegend />
      </section>

      <style>{`
        @media (min-width: 900px) {
          .narrative-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

/** Render a methodology step, monospacing any inline formula. */
function renderStep(text: string) {
  const marker = "cached_rate = cached_meter_cost / cached_token_count";
  if (!text.includes(marker)) return text;
  const [before, after] = text.split(marker);
  return (
    <>
      {before}
      <code className="mono" style={{ color: "var(--brand)", background: "var(--brand-soft)", padding: "0.05rem 0.35rem", borderRadius: "0.3rem" }}>
        {marker}
      </code>
      {after}
    </>
  );
}
