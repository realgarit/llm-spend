/**
 * llm-spend brand mark: falling price bars against an axis. A dim wide
 * "sticker price" bar, a mid bar, and a short bright-amber "real cached cost"
 * bar, on a dark rounded tile. The mark reads the site's core thesis: what you
 * actually pay collapses below the sticker price.
 *
 * The tile is intentionally dark in both light and dark themes; the hairline
 * stroke keeps it legible on dark backgrounds. This mirrors the standalone
 * favicon in src/app/icon.svg (a static file with the same artwork).
 */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="14" fill="#0F1115" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="15" y="14" width="3.5" height="35" rx="1.75" fill="#3E4450" />
      <rect x="23" y="14" width="26" height="7" rx="3.5" fill="#4C5361" />
      <rect x="23" y="28" width="17" height="7" rx="3.5" fill="#99A3B4" />
      <rect x="23" y="42" width="9" height="7" rx="3.5" fill="#F6A821" />
    </svg>
  );
}

/** Text wordmark: "llm-spend" in mono with the hyphen in the amber accent. */
export function BrandWordmark({ style }: { style?: React.CSSProperties }) {
  return (
    <span className="mono" style={{ fontWeight: 600, letterSpacing: "-0.01em", ...style }}>
      llm<span style={{ color: "var(--brand)" }}>-</span>spend
    </span>
  );
}
