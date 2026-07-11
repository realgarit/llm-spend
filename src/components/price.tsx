import type { Confidence } from "@/data/types";
import { formatChf, formatUsd } from "@/data/currency";

const CONF_LABEL: Record<Confidence, string> = {
  official: "official",
  derived: "derived",
  estimate: "estimate",
};

const CONF_TITLE: Record<Confidence, string> = {
  official: "Taken from an official, published pricing page.",
  derived: "Back-calculated from a real billing / cost-management export — not published.",
  estimate: "Inferred from an established pricing pattern — not yet published.",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className={`badge badge-${confidence}`} title={CONF_TITLE[confidence]}>
      {CONF_LABEL[confidence]}
    </span>
  );
}

/** Superscript dagger marking a non-official number. */
export function Mark({ confidence }: { confidence: Confidence }) {
  if (confidence === "official") return null;
  const symbol = confidence === "derived" ? "†" : "‡";
  return (
    <sup className={`mark mark-${confidence}`} title={CONF_TITLE[confidence]}>
      {symbol}
    </sup>
  );
}

/**
 * Stacked dual-currency price cell: USD prominent, CHF muted beneath.
 * `confidence` (when not "official") adds a dagger to flag the number.
 */
export function PriceStacked({
  usd,
  confidence = "official",
  muted = false,
}: {
  usd: number | null;
  confidence?: Confidence;
  muted?: boolean;
}) {
  if (usd === null) {
    return <span className="mono" style={{ color: "var(--text-faint)" }}>—</span>;
  }
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.25 }}>
      <span
        className="mono tnum"
        style={{ fontWeight: 500, color: muted ? "var(--text-muted)" : "var(--text)" }}
      >
        {formatUsd(usd)}
        <Mark confidence={confidence} />
      </span>
      <span className="mono tnum" style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
        {formatChf(usd)}
      </span>
    </span>
  );
}

/** Inline single-line dual price: "$1.75 / CHF 1.41". */
export function PriceInline({ usd, confidence = "official" }: { usd: number; confidence?: Confidence }) {
  return (
    <span className="mono tnum" style={{ whiteSpace: "nowrap" }}>
      {formatUsd(usd)} <span style={{ color: "var(--text-faint)" }}>/ {formatChf(usd)}</span>
      <Mark confidence={confidence} />
    </span>
  );
}
