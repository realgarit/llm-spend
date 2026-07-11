import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Rate limits — RPM vs TPM",
  description:
    "Why tokens-per-minute (TPM), not requests-per-minute (RPM), is almost always the binding constraint for large-context agentic workloads — and why some serverless models couple the two.",
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
          Two independent limits govern throughput. For agentic coding, only one of them usually matters — and it is
          not the one people instinctively watch.
        </p>
      </header>

      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "3rem" }}>
        <div className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <div className="mono" style={{ color: "var(--brand)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>RPM</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Requests per minute</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            How many separate API calls you may make each minute, regardless of size. Binds when you make many small
            requests — classification, short completions, high-QPS endpoints.
          </p>
        </div>
        <div className="card" style={{ padding: "1.3rem 1.4rem", borderColor: "var(--brand)" }}>
          <div className="mono" style={{ color: "var(--brand)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>TPM</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Tokens per minute</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            How many tokens (input + output) you may process each minute. Binds when each request is large — which is
            exactly the agentic-coding case, where a single request can carry tens of thousands of context tokens.
          </p>
        </div>
      </section>

      <section className="prose" style={{ maxWidth: "44rem", marginBottom: "3rem" }}>
        <SectionHeading eyebrow="The key insight" title="TPM is almost always the binding constraint" />
        <p>
          RPM and TPM are <strong>independent</strong> limits. For large-context agentic workloads — many tens of
          thousands of tokens per request — you will exhaust your token budget long before your request budget. A single
          agentic turn that ships 40K tokens of context hits a 100K TPM ceiling in under three requests, while barely
          touching a generous RPM.
        </p>
        <p>
          The practical consequence: when you plan capacity or debug a <span className="mono">429</span>, look at TPM
          first. Raising an RPM quota does nothing if TPM is what you are hitting.
        </p>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <div className="callout callout-warning" style={{ marginBottom: "1rem" }}>
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Watch out</div>
          <h4>Some serverless models couple RPM to TPM</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "0.4rem" }}>
            For some third-party serverless models, RPM is not fully independent — it may be set proportionally to an
            underlying TPM assignment rather than granted separately. The exact ratio is not always published, so after
            any quota increase, <strong style={{ color: "var(--text)" }}>test empirically</strong> rather than assuming
            the documented number holds.
          </p>
        </div>
        <div className="callout callout-insight">
          <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>Insight</div>
          <h4>Fireworks-hosted models often ship far higher default TPM</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "0.4rem" }}>
            On Azure Foundry, Fireworks-hosted models frequently get a much higher default TPM (e.g.{" "}
            <span className="mono">500K</span>) than natively-hosted equivalents (e.g. <span className="mono">100K</span>
            ) — a meaningful practical advantage that stacks on top of their better cache economics.
          </p>
        </div>
      </section>

      <section className="card-2" style={{ padding: "1.4rem 1.5rem" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Rules of thumb</h3>
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.92rem" }}>
          <li>▪ Large-context agentic work → size for <strong style={{ color: "var(--text)" }}>TPM</strong>.</li>
          <li>▪ High-volume small requests → watch <strong style={{ color: "var(--text)" }}>RPM</strong>.</li>
          <li>▪ After a quota bump, <strong style={{ color: "var(--text)" }}>measure</strong> the real ceiling — serverless RPM/TPM coupling is often unpublished.</li>
          <li>▪ Prefer a hosting arrangement with a higher default TPM when your workload is context-heavy.</li>
        </ul>
      </section>
    </div>
  );
}
