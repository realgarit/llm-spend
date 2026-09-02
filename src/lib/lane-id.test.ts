import assert from "node:assert/strict";
import test from "node:test";
import { buildCompareRows, type CompareRow } from "@/data/compare-data";
import { chatEntries } from "@/data/providers";
import { assertUniqueLaneIds, laneId } from "@/lib/lane-id";

test("builds a deterministic lane id from the stable lane identity", () => {
  assert.equal(
    laneId({
      providerSlug: "openai-azure",
      model: "GPT-5.6 Terra",
      tier: "Global",
      host: "Microsoft-hosted",
    }),
    "openai-azure--gpt-5-6-terra--global--microsoft-hosted",
  );
});

test("normalizes punctuation and whitespace in lane identity segments", () => {
  assert.equal(
    laneId({
      providerSlug: "Qwen",
      model: " Qwen 3.8 / Max (International) ",
      tier: "DataZone",
      host: "Model Studio: Intl.",
    }),
    "qwen--qwen-3-8-max-international--datazone--model-studio-intl",
  );
});

test("distinguishes lanes that differ by tier or host", () => {
  const base = { providerSlug: "deepseek", model: "DeepSeek-V4 Pro" };

  assert.notEqual(laneId({ ...base, tier: "Global" }), laneId({ ...base, tier: "DataZone" }));
  assert.notEqual(
    laneId({ ...base, tier: "DataZone", host: "Native" }),
    laneId({ ...base, tier: "DataZone", host: "Fireworks-hosted" }),
  );
});

test("catalog lane ids are stable regardless of catalog order", () => {
  const rows = buildCompareRows();
  const reordered = [...rows].reverse();

  assert.deepEqual(reordered.map((row) => row.id).sort(), rows.map((row) => row.id).sort());
  for (const row of rows) {
    assert.equal(row.id, laneId(row));
  }
});

test("rejects duplicate lane ids with the colliding id", () => {
  const row = buildCompareRows()[0];
  const duplicate: CompareRow = { ...row };

  assert.throws(() => assertUniqueLaneIds([row, duplicate]), new RegExp(row.id));
});

test("buildCompareRows rejects a duplicate catalog lane before it reaches the UI", () => {
  const entries = chatEntries();

  assert.throws(() => buildCompareRows([...entries, entries[0]]), /Duplicate lane id/);
});

test("catalog has 68 unique stable lane ids", () => {
  const rows = buildCompareRows();

  assert.equal(rows.length, 68);
  assertUniqueLaneIds(rows);
});
