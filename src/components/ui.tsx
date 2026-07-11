import type { ProviderQuirk } from "@/data/types";

export function Callout({ quirk }: { quirk: ProviderQuirk }) {
  const tone = quirk.tone ?? "info";
  const label = tone === "warning" ? "Watch out" : tone === "insight" ? "Insight" : "Note";
  return (
    <div className={`callout callout-${tone}`}>
      <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>{label}</div>
      <h4>{quirk.title}</h4>
      {quirk.body.map((p, i) => (
        <p key={i} style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: i === 0 ? 0 : "0.6rem" }}>
          {p}
        </p>
      ))}
    </div>
  );
}

export function ConfidenceLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 1rem",
        alignItems: "center",
        fontSize: "0.8rem",
        color: "var(--text-muted)",
      }}
    >
      <span className="eyebrow" style={{ marginRight: "0.25rem" }}>Confidence</span>
      <span style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
        <span className="badge badge-official">official</span> published page
      </span>
      <span style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
        <span className="badge badge-derived">derived</span> reconciled from billing <span className="mark mark-derived">†</span>
      </span>
      <span style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
        <span className="badge badge-estimate">estimate</span> pattern-inferred <span className="mark mark-estimate">‡</span>
      </span>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>{eyebrow}</div>}
      <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</h2>
      {children && <p style={{ color: "var(--text-muted)", marginTop: "0.6rem", maxWidth: "44rem" }}>{children}</p>}
    </div>
  );
}

export function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "1.1rem 1.2rem" }}>
      <div
        className="mono tnum"
        style={{
          fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: accent ? "var(--brand)" : "var(--text)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{label}</div>
    </div>
  );
}
