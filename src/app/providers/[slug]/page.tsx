import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider, providers, providerSlugs } from "@/data/providers";
import { PricingTable } from "@/components/pricing-table";
import { Callout, ConfidenceLegend, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return providerSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = getProvider(slug);
  if (!provider) return { title: "Provider not found" };
  const title = `${provider.name} pricing${provider.org ? ` (${provider.org})` : ""}`;
  return {
    title,
    description: `${provider.name} LLM API pricing in USD and CHF — ${provider.tagline}`,
    alternates: { canonical: `${site.url}/providers/${provider.slug}` },
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = getProvider(slug);
  if (!provider) notFound();

  const others = providers.filter((p) => p.slug !== provider.slug);

  return (
    <div className="container-page" style={{ paddingBlock: "3rem", maxWidth: "68rem" }}>
      <nav style={{ fontSize: "0.8rem", color: "var(--text-faint)", marginBottom: "1.5rem" }}>
        <Link href="/" className="hover:text-fg">Home</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span>Providers</span>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "var(--text)" }}>{provider.name}</span>
      </nav>

      <header className="rise" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
            {provider.name}
          </h1>
          {provider.org && <span className="mono" style={{ color: "var(--text-faint)" }}>{provider.org}</span>}
        </div>
        <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: "1.05rem", maxWidth: "46rem" }}>
          {provider.tagline}
        </p>
        <div className="prose" style={{ marginTop: "1.25rem", maxWidth: "46rem" }}>
          {provider.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </header>

      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }}>Pricing</h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-faint)" }} className="mono">per 1M tokens · USD / CHF</span>
        </div>
        <PricingTable provider={provider} />
        <div style={{ marginTop: "1rem" }}>
          <ConfidenceLegend />
        </div>
      </section>

      {provider.quirks && provider.quirks.length > 0 && (
        <section style={{ marginBottom: "3rem" }}>
          <SectionHeading eyebrow="Field notes" title="Quirks & gotchas" />
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {provider.quirks.map((q, i) => (
              <Callout key={i} quirk={q} />
            ))}
          </div>
        </section>
      )}

      <section className="hairline" style={{ paddingTop: "2rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Other providers</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          {others.map((p) => (
            <Link key={p.slug} href={`/providers/${p.slug}`} className="btn" style={{ fontSize: "0.83rem" }}>
              {p.name}
            </Link>
          ))}
          <Link href="/compare" className="btn btn-primary" style={{ fontSize: "0.83rem" }}>
            Compare all →
          </Link>
        </div>
      </section>
    </div>
  );
}
