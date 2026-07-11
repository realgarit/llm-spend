import Link from "next/link";
import { providers } from "@/data/providers";
import { USD_TO_CHF } from "@/data/currency";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="hairline" style={{ marginTop: "5rem", background: "var(--surface)" }}>
      <div className="container-page" style={{ paddingBlock: "2.5rem" }}>
        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <span
                aria-hidden
                className="mono"
                style={{
                  width: "1.4rem",
                  height: "1.4rem",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "0.35rem",
                  background: "var(--brand)",
                  color: "#0a0c10",
                  fontWeight: 700,
                }}
              >
                $
              </span>
              <span style={{ fontWeight: 600 }}>{site.name}</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "22rem" }}>
              {site.tagline} A living reference — verify against your own billing exports before you commit.
            </p>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: "0.7rem" }}>Pages</div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} style={{ color: "var(--text-muted)" }} className="hover:text-fg">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: "0.7rem" }}>Providers</div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
              {providers.map((p) => (
                <li key={p.slug}>
                  <Link href={`/providers/${p.slug}`} style={{ color: "var(--text-muted)" }}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="hairline"
          style={{
            marginTop: "2rem",
            paddingTop: "1.25rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem 1.5rem",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
            color: "var(--text-faint)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1.1rem" }}>
            <span>
              <a href={`${site.githubUrl}/blob/main/LICENSE`} target="_blank" rel="noreferrer noopener" className="link-underline">
                MIT License
              </a>
            </span>
            <span>
              <a href={site.githubUrl} target="_blank" rel="noreferrer noopener" className="link-underline">
                github.com/realgarit/llm-spend
              </a>
            </span>
            <span>Prices verified against real billing exports.</span>
          </div>
          <div className="mono">
            USD→CHF reference rate {USD_TO_CHF} · not a live FX feed
          </div>
        </div>
      </div>
    </footer>
  );
}
