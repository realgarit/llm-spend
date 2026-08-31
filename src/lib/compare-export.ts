import { BASE_RATE_LABEL } from "@/lib/rates";
import type { ComparedRow, ScheduledPreview } from "@/lib/scenario";
import { scenarioLabel, type CompareDecisionState } from "@/lib/compare-state";

/**
 * RFC 4180 CSV projection of the compare table's visible result set.
 *
 * Reads only already-resolved `ComparedRow` values (`row`, `resolved`, `cost`)
 * — the same numbers a `resolveRate`/`compareRowUnderScenario` call already
 * produced for the table. Nothing here re-derives a rate, re-applies a
 * variant, or recomputes a cost: this is strictly a projection, so it can
 * never disagree with what the visible table shows at export time.
 *
 * One column set, in this fixed order, for every export:
 * Scenario, Provider, Model, Host, Tier, Variant, Input USD, Cached USD,
 * Output USD, Total USD, Total CHF, Confidence. "Scenario" is the same
 * `scenarioLabel(state)` string repeated on every row (there is no separate
 * preamble line) so a reader who opens the file without its context still
 * knows what point in time and service tier it was priced under. "Input /
 * Cached / Output USD" are the row's per-1M-token rates; "Total USD / CHF"
 * are the whole-workload cost from `cost.totalUsd`. "Variant" additionally
 * marks a previewed-but-not-yet-billing rate — see {@link variantField}.
 */
export function buildCompareCsv(
  rows: ComparedRow[],
  state: CompareDecisionState,
  usdToChf: (usd: number) => number,
): string {
  const scenario = scenarioLabel(state);
  const lines = [CSV_HEADER.map(csvField).join(",")];

  for (const { row, resolved, cost, preview } of rows) {
    const fields = [
      scenario,
      row.provider,
      row.model,
      row.host ?? "",
      row.tier,
      variantField(resolved.label ?? BASE_RATE_LABEL, preview),
      formatCsvNumber(resolved.inputUsd),
      resolved.cachedUsd === null ? "" : formatCsvNumber(resolved.cachedUsd),
      formatCsvNumber(resolved.outputUsd),
      formatCsvNumber(cost.totalUsd),
      formatCsvNumber(usdToChf(cost.totalUsd)),
      resolved.confidence,
    ];
    lines.push(fields.map(csvField).join(","));
  }

  // CRLF per RFC 4180. No trailing terminator after the last line — the spec
  // only requires records to be CRLF-*delimited*, not CRLF-terminated.
  return lines.join("\r\n");
}

/**
 * The Variant cell for one row: the active rate's label, plus — when
 * `preview` is non-null — a suffix marking that the rate has not started
 * billing yet.
 *
 * This is the CSV equivalent of the table's `ScheduledPreviewLabel`
 * (compare-explorer.tsx), whose whole documented point is that a scheduled
 * rate can never be mistaken for what the row bills today. Without this, a
 * previewed row and a genuinely live one produced an identical cell here —
 * the one distinction the UI works hardest to preserve was lost on export.
 * Uses an absolute ISO instant rather than the UI's relative "in 3 days"
 * phrasing, since a CSV cell has no live clock to render a countdown against.
 */
function variantField(label: string, preview: ScheduledPreview | null): string {
  if (preview === null) return label;
  const starts = preview.startsAt === null ? "" : `, starts ${preview.startsAt.toISOString()}`;
  return `${label} (preview${starts})`;
}

const CSV_HEADER = [
  "Scenario",
  "Provider",
  "Model",
  "Host",
  "Tier",
  "Variant",
  "Input USD",
  "Cached USD",
  "Output USD",
  "Total USD",
  "Total CHF",
  "Confidence",
] as const;

/** RFC 4180 field escaping: quote and double-escape when a comma, quote, or line break is present. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Render a finite USD number as a plain, unformatted decimal string — no `$`
 * prefix, no thousands separator — so the cell stays a real number to a
 * spreadsheet rather than currency-formatted text. Fixed to 6 decimal places
 * (enough for every catalog rate; DeepSeek's cached input is $0.003625, the
 * finest-grained figure in the data) with trailing zeros trimmed, which also
 * absorbs ordinary floating-point noise from `computeCost`'s arithmetic.
 *
 * Guards non-finite input defensively: every value here comes from an
 * already-resolved row, so NaN/Infinity should not occur, but per the "never
 * let NaN/Infinity leak into a CSV cell" rule this renders an explicit blank
 * rather than the literal text "NaN" or "Infinity" that `toFixed` would
 * otherwise produce.
 */
function formatCsvNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(6).replace(/\.?0+$/, "");
}
