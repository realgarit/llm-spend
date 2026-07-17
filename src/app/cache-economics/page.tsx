import type { Metadata } from "next";
import Link from "next/link";
import { getProvider } from "@/data/providers";
import { formatChf, formatUsd, formatDual } from "@/data/currency";
import { computeCost, DEFAULT_WORKLOAD, formatTokens } from "@/lib/calc";
import { SectionHeading, Stat } from "@/components/ui";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cache economics",
  description:
    "A worked case study on prompt caching: how a 97% hit rate cut a bill from $12.42 to $1.74, why cache reads and writes are priced the way they are, and why caching often beats model choice.",
  alternates: { canonical: `${site.url}/cache-economics` },
};

// Illustrate a hit-rate sweep against a real model with a real cache meter.
const V4_PRO = getProvider("deepseek")!.entries.find(
  (e) => e.model === "DeepSeek-V4 Pro" && e.tier === "Global"
)!;
const HIT_RATES = [0, 0.5, 0.8, 0.9, 0.97, 0.99];


export default function CacheEconomicsPage() {
  const sweep = HIT_RATES.map((hit) => ({
    hit,
    cost: computeCost(V4_PRO, { ...DEFAULT_WORKLOAD, cacheHitRate: hit }),
  }));
  const noCache = sweep[0].cost.totalUsd;
  const best = sweep[sweep.length - 1].cost.totalUsd;
  const reductionPct = Math.round((1 - best / noCache) * 100);

  const proCached90 = computeCost(V4_PRO, { ...DEFAULT_WORKLOAD, cacheHitRate: 0.9 }).totalUsd;

  return (
    <div className="container-page" style={{ paddingBlock: "3rem", maxWidth: "60rem" }}>
      <header className="rise" style={{ marginBottom: "2.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Deep dive · case study</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          The bill that fell{" "}
          <span className="display" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--brand)" }}>
            86%
          </span>{" "}
          without changing the model
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "1.1rem", fontSize: "1.1rem", maxWidth: "44rem" }}>
          Prompt caching is the biggest lever on real agentic coding costs, usually bigger than which model you pick.
          Here&rsquo;s the arithmetic.
        </p>
      </header>

      <section style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "3rem" }}>
        <Stat value={formatUsd(12.42)} label="Same task, cache off (CHF 10.00)" />
        <Stat value={formatUsd(1.74)} label="Same task, 97% cache hit (CHF 1.40)" accent />
        <Stat value="97%" label="Cache-hit rate that produced it" />
        <Stat value="86%" label="Bill reduction, model unchanged" accent />
      </section>

      <section className="prose" style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
        <SectionHeading eyebrow="What happened" title="A 97% cache-hit rate did the work" />
        <p>
          The same agentic coding task ran twice against the same model. Priced naively at the flat input rate it would
          have cost <strong>{formatDual(12.42)}</strong>. Actual billed cost, at a measured{" "}
          <strong>97% cache-hit rate</strong>, was <strong>{formatDual(1.74)}</strong>.
        </p>
        <p>
          Nothing about the model changed. 97% of the input tokens (the stable prefix of system prompt and codebase that
          repeats every turn) came from cache instead of being re-billed in full. So the first question about an agentic
          workload isn&rsquo;t &ldquo;which model?&rdquo; but &ldquo;what&rsquo;s your hit rate, and does this tier even
          have a cache meter?&rdquo;
        </p>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <SectionHeading eyebrow="The mechanism" title="How cache reads and writes are priced">
          Two rates, not one. Both decide the curve.
        </SectionHeading>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <div className="callout callout-insight">
            <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Cache read</div>
            <h4>~10% of the input price</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
              Reusing a cached prefix costs about a tenth of fresh input. Claude reads run ~10% of input; Azure&rsquo;s
              published cache meter lands nearby (DeepSeek V4 Pro ~{formatUsd(0.145)} vs {formatUsd(1.74)} fresh, ~91.7% off).
            </p>
          </div>
          <div className="callout callout-warning">
            <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Cache write</div>
            <h4>~1.25× the input price, once</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
              Writing a prefix into cache costs a one-time premium, ~1.25x input on Claude and on GPT-5.6. It&rsquo;s
              amortized across every later read, so a prefix reused many times pays the write once and banks the ~90%
              discount.
            </p>
          </div>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "1rem", maxWidth: "44rem" }}>
          Caching wins when a large context is <strong style={{ color: "var(--text)" }}>reused</strong>: a stable system
          prompt and codebase re-sent across dozens of turns, exactly where costs otherwise spiral.
        </p>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <SectionHeading eyebrow="The curve" title="Workload cost vs cache-hit rate">
          The same {formatTokens(DEFAULT_WORKLOAD.inputTokens)} input / {formatTokens(DEFAULT_WORKLOAD.outputTokens)}{" "}
          output workload against DeepSeek-V4 Pro Global (published Azure cache rate {formatUsd(0.145)}/M). Watch the total
          collapse as the hit rate climbs.
        </SectionHeading>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th className="num-h">Cache hit</th>
                <th className="num-h">Fresh input</th>
                <th className="num-h">Cached input</th>
                <th className="num-h">Output</th>
                <th className="num-h">Total (USD)</th>
                <th className="num-h">Total (CHF)</th>
                <th>vs no cache</th>
              </tr>
            </thead>
            <tbody>
              {sweep.map(({ hit, cost }) => {
                const saved = Math.round((1 - cost.totalUsd / noCache) * 100);
                return (
                  <tr key={hit}>
                    <td className="num" style={{ fontWeight: 600 }}>{Math.round(hit * 100)}%</td>
                    <td className="num" style={{ color: "var(--text-muted)" }}>{formatUsd(cost.freshInputUsd)}</td>
                    <td className="num" style={{ color: "var(--text-muted)" }}>{formatUsd(cost.cachedInputUsd)}</td>
                    <td className="num" style={{ color: "var(--text-muted)" }}>{formatUsd(cost.outputUsd)}</td>
                    <td className="num" style={{ fontWeight: 600, color: hit === 0.99 ? "var(--official)" : "var(--text)" }}>
                      {formatUsd(cost.totalUsd)}
                    </td>
                    <td className="num" style={{ color: "var(--text-faint)" }}>{formatChf(cost.totalUsd)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ flex: 1, height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden", minWidth: "60px" }}>
                          <div
                            style={{
                              width: `${Math.max(2, 100 - saved)}%`,
                              height: "100%",
                              background: hit === 0 ? "var(--estimate)" : "var(--brand)",
                            }}
                          />
                        </div>
                        <span className="mono tnum" style={{ fontSize: "0.75rem", color: saved > 0 ? "var(--official)" : "var(--text-faint)", width: "3rem", textAlign: "right" }}>
                          {saved > 0 ? `−${saved}%` : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-faint)", marginTop: "0.8rem" }}>
          Cache rate for V4 Pro is published in Azure&rsquo;s retail catalog and reconciles to billing exports. At a{" "}
          {Math.round(HIT_RATES[HIT_RATES.length - 1] * 100)}% hit rate this workload drops {reductionPct}% versus no
          caching ({formatUsd(noCache)} → {formatUsd(best)}).
        </p>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <SectionHeading eyebrow="The punchline" title="Caching beats model choice" />
        <div className="callout callout-insight" style={{ maxWidth: "44rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            On this workload, DeepSeek-V4 <strong style={{ color: "var(--text)" }}>Pro</strong> at a 90% cache-hit rate
            costs <strong style={{ color: "var(--text)" }}>{formatUsd(proCached90)}</strong>. Compare models using the
            blended cost at your observed cache-hit rate, not their headline input price: a model with a slightly higher
            fresh-input rate can still be cheaper once a stable prompt and codebase are repeatedly reused.
          </p>
        </div>
        <p style={{ color: "var(--text-muted)", marginTop: "1.25rem", maxWidth: "44rem" }}>
          Before you downgrade a model to save money, check whether the tier has a cache meter and what your real hit
          rate is. The lever is usually caching, not the model. See the{" "}
          <Link href="/compare" className="link-underline">interactive calculator</Link> to test your own numbers, or the{" "}
          <Link href="/" className="link-underline">verification method</Link> for finding an undocumented cache rate.
        </p>
      </section>
    </div>
  );
}
