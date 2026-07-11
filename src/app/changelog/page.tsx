import type { Metadata } from "next";
import { changelog, type ChangelogEntry } from "@/data/changelog";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Dated log of pricing changes, model launches, and method updates for llm-spend. LLM pricing changes often, and a reference is only trustworthy if it says when.",
  alternates: { canonical: `${site.url}/changelog` },
};

const TAG_LABEL: Record<NonNullable<ChangelogEntry["tag"]>, string> = {
  launch: "launch",
  pricing: "pricing",
  model: "model",
  methodology: "method",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

export default function ChangelogPage() {
  return (
    <div className="container-page" style={{ paddingBlock: "3rem", maxWidth: "50rem" }}>
      <header className="rise" style={{ marginBottom: "2.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>History</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em" }}>
          Changelog
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.05rem", maxWidth: "42rem" }}>
          LLM pricing moves fast. This log records when a rate changed, a model launched, or the method changed. A
          reference is only trustworthy if it says how fresh it is.
        </p>
      </header>

      <ol style={{ position: "relative", paddingLeft: "1.75rem" }}>
        <div
          aria-hidden
          style={{ position: "absolute", left: "0.35rem", top: "0.5rem", bottom: "0.5rem", width: "1px", background: "var(--border)" }}
        />
        {changelog.map((entry) => (
          <li key={entry.date + entry.title} style={{ position: "relative", paddingBottom: "2rem" }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: "-1.55rem",
                top: "0.4rem",
                width: "0.7rem",
                height: "0.7rem",
                borderRadius: "50%",
                background: "var(--brand)",
                border: "3px solid var(--ink)",
                boxShadow: "0 0 0 1px var(--border)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <time className="mono" dateTime={entry.date} style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {formatDate(entry.date)}
              </time>
              {entry.tag && (
                <span className="badge badge-tier">{TAG_LABEL[entry.tag]}</span>
              )}
            </div>
            <h3 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
              {entry.title}
            </h3>
            {entry.body.map((p, i) => (
              <p key={i} style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: i === 0 ? 0 : "0.5rem" }}>
                {p}
              </p>
            ))}
          </li>
        ))}
      </ol>
    </div>
  );
}
