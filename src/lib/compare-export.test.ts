import assert from "node:assert/strict";
import test from "node:test";
import type { Confidence, Tier } from "@/data/types";
import { BASE_RATE_LABEL } from "@/lib/rates";
import type { ComparedRow } from "@/lib/scenario";
import { buildCompareCsv } from "./compare-export";
import type { CompareDecisionState } from "./compare-state";

/** Minimal fixture builder — mirrors compare-insights.test.ts's `compared()`. */
function compared({
  id = "row",
  provider = "Example",
  model = "Example Model",
  host,
  tier = "Direct",
  inputUsd = 1.925,
  cachedUsd = 0.165,
  outputUsd = 3.828,
  confidence = "official",
  cachedConfidence = confidence,
  label = null,
  totalUsd = 10,
}: {
  id?: string;
  provider?: string;
  model?: string;
  host?: string;
  tier?: Tier;
  inputUsd?: number;
  cachedUsd?: number | null;
  outputUsd?: number;
  confidence?: Confidence;
  cachedConfidence?: Confidence;
  label?: string | null;
  totalUsd?: number;
} = {}): ComparedRow {
  return {
    row: {
      id,
      provider,
      providerSlug: provider.toLocaleLowerCase().replaceAll(" ", "-"),
      model,
      host,
      tier,
      inputUsd,
      cachedUsd,
      outputUsd,
      confidence,
      cachedConfidence,
      effectiveDate: "2026-08-30",
    },
    resolved: {
      inputUsd,
      cachedUsd,
      outputUsd,
      confidence,
      cachedConfidence,
      variant: null,
      label,
    },
    cost: {
      freshInputUsd: totalUsd * 0.4,
      cachedInputUsd: cachedUsd === null ? 0 : totalUsd * 0.1,
      outputUsd: cachedUsd === null ? totalUsd * 0.6 : totalUsd * 0.5,
      totalUsd,
      cacheApplied: cachedUsd !== null,
      blendedInputPerMUsd: cachedUsd ?? inputUsd,
    },
    scenarioPriced: label !== null,
    preview: null,
  };
}

const state: CompareDecisionState = {
  workload: { inputTokens: 60_000_000, outputTokens: 210_000, cacheHitRate: 0.9 },
  scenario: { time: { mode: "now" }, serviceTier: "standard" },
  filters: { query: "", provider: "all", deployment: "all", cacheOnly: false, officialOnly: false },
  sort: { key: "total", dir: "asc" },
  selectedLaneIds: [],
};

/** Deliberately NOT the real 0.805 site rate, so a test failure would expose the export bypassing this parameter. */
const usdToChf = (usd: number) => usd * 2;

test("buildCompareCsv emits a deterministic header row, even for zero rows", () => {
  assert.equal(
    buildCompareCsv([], state, usdToChf),
    "Scenario,Provider,Model,Host,Tier,Variant,Input USD,Cached USD,Output USD,Total USD,Total CHF,Confidence",
  );
});

test("buildCompareCsv projects scenario label, lane identity, resolved rates, and USD/CHF totals from already-resolved values", () => {
  const csv = buildCompareCsv(
    [
      compared({
        provider: "DeepSeek",
        model: "DeepSeek-V4 Pro",
        host: "Fireworks-hosted",
        tier: "DataZone",
        inputUsd: 1.925,
        cachedUsd: 0.165,
        outputUsd: 3.828,
        totalUsd: 10,
        confidence: "official",
      }),
    ],
    state,
    usdToChf,
  );

  const [header, row] = csv.split("\r\n");
  assert.equal(header, "Scenario,Provider,Model,Host,Tier,Variant,Input USD,Cached USD,Output USD,Total USD,Total CHF,Confidence");
  assert.equal(
    row,
    "Now · Standard,DeepSeek,DeepSeek-V4 Pro,Fireworks-hosted,DataZone,Base rate,1.925,0.165,3.828,10,20,official",
  );
});

test("buildCompareCsv leaves the cached-rate cell blank when the row has no cache meter", () => {
  const csv = buildCompareCsv([compared({ cachedUsd: null })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  assert.equal(row.split(",")[7], "");
});

test("buildCompareCsv names the active variant instead of the base-rate label", () => {
  const csv = buildCompareCsv([compared({ label: "Peak" })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  assert.equal(row.split(",")[5], "Peak");
});

test("buildCompareCsv falls back to rates.ts's shared base-rate label when no variant is priced", () => {
  const csv = buildCompareCsv([compared({ label: null })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  assert.equal(row.split(",")[5], BASE_RATE_LABEL);
});

test("buildCompareCsv quotes a field containing a comma per RFC 4180", () => {
  const csv = buildCompareCsv([compared({ provider: "OpenAI, Azure" })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  assert.ok(row.startsWith('Now · Standard,"OpenAI, Azure",'), row);
});

test("buildCompareCsv doubles an embedded quote and wraps the field per RFC 4180", () => {
  const csv = buildCompareCsv([compared({ model: 'Model "X"' })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  assert.ok(row.includes('"Model ""X"""'), row);
});

test("buildCompareCsv rows are CRLF-separated with no trailing terminator", () => {
  const csv = buildCompareCsv([compared({ id: "a" }), compared({ id: "b" })], state, usdToChf);
  assert.equal(csv.split("\r\n").length, 3); // header + 2 rows
  assert.ok(!csv.endsWith("\r\n"));
  assert.ok(!csv.includes("\n\n")); // no bare LF sneaking in alongside CRLF
});

test("buildCompareCsv preserves the given row order rather than re-sorting", () => {
  const csv = buildCompareCsv(
    [compared({ model: "Zed Model" }), compared({ model: "Alpha Model" })],
    state,
    usdToChf,
  );
  const [, first, second] = csv.split("\r\n");
  assert.ok(first.includes("Zed Model"));
  assert.ok(second.includes("Alpha Model"));
});

test("buildCompareCsv derives the CHF total via the injected converter, never a hardcoded FX rate", () => {
  const csv = buildCompareCsv([compared({ totalUsd: 4 })], state, (usd) => usd * 3);
  const [, row] = csv.split("\r\n");
  const cells = row.split(",");
  assert.equal(cells[9], "4"); // Total USD is untouched by the converter
  assert.equal(cells[10], "12"); // Total CHF = injected converter(4) = 12
});

test("buildCompareCsv never leaks NaN or Infinity text into a cell", () => {
  const csv = buildCompareCsv([compared({ totalUsd: Number.NaN })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  assert.ok(!row.includes("NaN"), row);
  assert.ok(!row.includes("Infinity"), row);
});

test("buildCompareCsv preserves DeepSeek-precision rates (six decimal places) without float noise", () => {
  const csv = buildCompareCsv([compared({ inputUsd: 0.435, cachedUsd: 0.003625, outputUsd: 0.87 })], state, usdToChf);
  const [, row] = csv.split("\r\n");
  const cells = row.split(",");
  assert.equal(cells[6], "0.435");
  assert.equal(cells[7], "0.003625");
  assert.equal(cells[8], "0.87");
});
