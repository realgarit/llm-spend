import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Rate limits: RPM vs TPM",
  description:
    "Why tokens-per-minute (TPM), not requests-per-minute (RPM), is usually the binding limit for large-context agentic workloads, and why some Microsoft Foundry serverless models couple the two.",
  alternates: { canonical: `${site.url}/rate-limits` },
};

export default function RateLimitsPage() {
  return (
    <div className="container-page" style={{ paddingBlock: "3rem", maxWidth: "56rem" }}>
      <header className="rise" style={{ marginBottom: "2.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Quotas</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
          RPM vs TPM
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.1rem", maxWidth: "44rem" }}>
          Two limits govern throughput. For agentic coding only one usually matters, and it&rsquo;s not the one people
          watch.
        </p>
      </header>

      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "3rem" }}>
        <div className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <div className="mono" style={{ color: "var(--brand)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>RPM</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Requests per minute</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            How many API calls per minute, regardless of size. Binds on many small requests: classification, short
            completions, high-QPS endpoints.
          </p>
        </div>
        <div className="card" style={{ padding: "1.3rem 1.4rem", borderColor: "var(--brand)" }}>
          <div className="mono" style={{ color: "var(--brand)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>TPM</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Tokens per minute</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            How many tokens (input + output) per minute. Binds when requests are large, which is the agentic-coding
            case, where one request carries tens of thousands of context tokens.
          </p>
        </div>
      </section>

      <section className="prose" style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
        <SectionHeading eyebrow="The key insight" title="TPM is almost always the binding constraint" />
        <p>
          RPM and TPM are <strong>independent</strong>. For large-context agentic work you exhaust the token budget long
          before the request budget: a single 40K-token turn hits a 100K TPM ceiling in under three requests while
          barely touching RPM.
        </p>
        <p>
          So when you plan capacity or debug a <span className="mono">429</span>, look at TPM first. Raising RPM does
          nothing if TPM is the wall.
        </p>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <div className="callout callout-warning" style={{ marginBottom: "1rem" }}>
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Watch out</div>
          <h4>Some serverless models couple RPM to TPM</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "0.4rem" }}>
            For some third-party serverless models on Microsoft Foundry, RPM isn&rsquo;t fully independent. It may scale
            with the underlying TPM assignment instead of being granted separately. The ratio isn&rsquo;t always
            published, so <strong style={{ color: "var(--text)" }}>test after any quota increase</strong> instead of
            trusting the documented number.
          </p>
        </div>
        <div className="callout callout-insight">
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Insight</div>
          <h4>Fireworks-hosted models often ship far higher default TPM</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "0.4rem" }}>
            On Microsoft Foundry, Fireworks-hosted models often get much higher default TPM (e.g.{" "}
            <span className="mono">500K</span>) than natively-hosted ones (e.g. <span className="mono">100K</span>), a
            real advantage on top of their better cache economics.
          </p>
        </div>
      </section>

      <section className="card-2" style={{ padding: "1.4rem 1.5rem" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Rules of thumb</h3>
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.92rem" }}>
          <li>▪ Large-context agentic work → size for <strong style={{ color: "var(--text)" }}>TPM</strong>.</li>
          <li>▪ High-volume small requests → watch <strong style={{ color: "var(--text)" }}>RPM</strong>.</li>
          <li>▪ After a quota bump, <strong style={{ color: "var(--text)" }}>measure</strong> the real ceiling. Serverless RPM/TPM coupling is often unpublished.</li>
          <li>▪ Prefer a hosting arrangement with a higher default TPM when your workload is context-heavy.</li>
        </ul>
      </section>
    </div>
  );
}
