import type { Confidence, Tier } from "@/data/types";
import { formatChf, formatUsd } from "@/data/currency";

const CONF_LABEL: Record<Confidence, string> = {
  official: "official",
  derived: "derived",
  estimate: "estimate",
};

const CONF_TITLE: Record<Confidence, string> = {
  official: "Taken from an official, published pricing page.",
  derived: "Back-calculated from a real billing / cost-management export, not published.",
  estimate: "Inferred from an established pricing pattern, not yet published.",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className={`badge badge-${confidence}`} title={CONF_TITLE[confidence]}>
      {CONF_LABEL[confidence]}
    </span>
  );
}

/**
 * How a tier reads on screen.
 *
 * `Tier` is a routing/hosting value, but three of its four members
 * (Global / DataZone / Regional) are Microsoft Foundry deployment tiers while
 * the fourth is the model developer's own API — the single most load-bearing
 * distinction on this site, and until now it lived only in a hover tooltip.
 * So the platform is named in the badge itself: "Foundry · Global" against
 * "Direct API". `platform` is rendered de-emphasized so the tier still reads
 * as the primary word and the column does not visually double in weight.
 *
 * Display only. The `Tier` union in data/types.ts is unchanged, and so is
 * everything keyed off it (sort order, row keys, filters).
 */
const TIER_DISPLAY: Record<Tier, { platform?: string; label: string; title: string }> = {
  Global: {
    platform: "Foundry",
    label: "Global",
    title:
      "Microsoft Foundry, Global tier: routed to any datacenter (cheapest, highest throughput).",
  },
  DataZone: {
    platform: "Foundry",
    label: "Data Zone",
    title: "Microsoft Foundry, Data Zone tier: US or EU only (~10% premium over Global).",
  },
  Regional: {
    platform: "Foundry",
    label: "Regional",
    title: "Microsoft Foundry, Regional tier: pinned to a single region (most restrictive).",
  },
  Direct: {
    label: "Direct API",
    title: "Not Foundry — the model developer's own first-party API, billed by them directly.",
  },
};

/**
 * The tier badge, shared by the provider tables and the compare table so the
 * wording can only ever be defined once.
 */
export function TierBadge({ tier }: { tier: Tier }) {
  const { platform, label, title } = TIER_DISPLAY[tier] ?? { label: tier, title: undefined };
  return (
    <span className="badge badge-tier" title={title}>
      {platform && <span className="tier-platform">{platform} ·</span>}
      {label}
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
  live = false,
}: {
  usd: number | null;
  confidence?: Confidence;
  muted?: boolean;
  /**
   * Set when `usd`/`confidence` can change after mount, e.g. a rate-variant
   * cell that re-resolves on the visitor's real clock (see use-now.ts). Adds
   * `suppressHydrationWarning` to the text nodes that may legitimately differ
   * between the server's build-time render and the client's live one. Leave
   * false (the default) for ordinary, never-changing rates.
   */
  live?: boolean;
}) {
  if (usd === null) {
    return <span className="mono" style={{ color: "var(--text-faint)" }}>—</span>;
  }
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.25 }}>
      <span
        className="mono tnum"
        style={{ fontWeight: 500, color: muted ? "var(--text-muted)" : "var(--text)" }}
        suppressHydrationWarning={live}
      >
        {formatUsd(usd)}
        <Mark confidence={confidence} />
      </span>
      <span
        className="mono tnum"
        style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}
        suppressHydrationWarning={live}
      >
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
