import assert from "node:assert/strict";
import test from "node:test";
import type { ComparedRow } from "@/lib/scenario";
import {
  SHORTLIST_COMPARE_MIN,
  SHORTLIST_LIMIT,
  normalizeShortlist,
  parseStoredShortlist,
  serializeShortlist,
  shortlistDeltas,
  toggleShortlistLane,
} from "@/lib/shortlist";

/** Minimal but fully-shaped `ComparedRow` fixture, mirroring the `compared()` helper in compare-insights.test.ts. */
function compared(id: string, totalUsd: number): ComparedRow {
  return {
    row: {
      id,
      provider: "Example",
      providerSlug: "example",
      model: `Model ${id}`,
      tier: "Direct",
      inputUsd: 1,
      cachedUsd: 0.1,
      outputUsd: 4,
      confidence: "official",
      cachedConfidence: "official",
      effectiveDate: "2026-08-30",
    },
    resolved: {
      inputUsd: 1,
      cachedUsd: 0.1,
      outputUsd: 4,
      confidence: "official",
      cachedConfidence: "official",
      variant: null,
      label: null,
    },
    cost: {
      freshInputUsd: totalUsd * 0.4,
      cachedInputUsd: totalUsd * 0.1,
      outputUsd: totalUsd * 0.5,
      totalUsd,
      cacheApplied: true,
      blendedInputPerMUsd: 0.2,
    },
    scenarioPriced: false,
    preview: null,
  };
}

// --- constants ---

test("SHORTLIST_LIMIT is 4 and SHORTLIST_COMPARE_MIN is 2", () => {
  assert.equal(SHORTLIST_LIMIT, 4);
  assert.equal(SHORTLIST_COMPARE_MIN, 2);
  assert.ok(SHORTLIST_COMPARE_MIN <= SHORTLIST_LIMIT);
});

// --- normalizeShortlist ---

test("normalizeShortlist dedupes, keeping the first occurrence's position", () => {
  const valid = new Set(["a", "b", "c"]);
  assert.deepEqual(normalizeShortlist(["a", "b", "a", "c", "b"], valid), ["a", "b", "c"]);
});

test("normalizeShortlist prunes ids absent from the catalog without reordering survivors", () => {
  const valid = new Set(["a", "c"]);
  assert.deepEqual(normalizeShortlist(["a", "removed-1", "b-is-invalid", "c"], valid), ["a", "c"]);
});

test("normalizeShortlist silently caps a bulk external list (URL/storage) at SHORTLIST_LIMIT, keeping the earliest ids", () => {
  const valid = new Set(["a", "b", "c", "d", "e"]);
  assert.deepEqual(normalizeShortlist(["a", "b", "c", "d", "e"], valid), ["a", "b", "c", "d"]);
});

test("normalizeShortlist returns an empty list for empty input", () => {
  assert.deepEqual(normalizeShortlist([], new Set(["a"])), []);
});

test("normalizeShortlist prunes and dedupes together, order preserved", () => {
  const valid = new Set(["a", "b"]);
  assert.deepEqual(normalizeShortlist(["missing", "a", "b", "a", "also-missing"], valid), ["a", "b"]);
});

// --- toggleShortlistLane ---

test("toggleShortlistLane adds an unselected lane below the cap", () => {
  assert.deepEqual(toggleShortlistLane(["a"], "b"), { ids: ["a", "b"], message: null });
});

test("toggleShortlistLane removes an already-selected lane (idempotent unpin)", () => {
  assert.deepEqual(toggleShortlistLane(["a", "b", "c"], "b"), { ids: ["a", "c"], message: null });
});

test("toggleShortlistLane is exclusive: toggling twice returns to the original state with no duplicate", () => {
  const afterAdd = toggleShortlistLane(["a"], "b");
  assert.deepEqual(afterAdd.ids, ["a", "b"]);
  const afterRemove = toggleShortlistLane(afterAdd.ids, "b");
  assert.deepEqual(afterRemove.ids, ["a"]);
});

test("toggleShortlistLane rejects a 5th selection with a clear message, leaving the shortlist unchanged", () => {
  const full = ["a", "b", "c", "d"];
  const result = toggleShortlistLane(full, "e");
  assert.deepEqual(result.ids, full);
  assert.notEqual(result.message, null);
  assert.match(result.message ?? "", /4/);
});

test("toggleShortlistLane still allows removing a lane while the shortlist is at the cap", () => {
  const full = ["a", "b", "c", "d"];
  assert.deepEqual(toggleShortlistLane(full, "c"), { ids: ["a", "b", "d"], message: null });
});

test("toggleShortlistLane never produces a duplicate id", () => {
  const result = toggleShortlistLane(["a", "b"], "a");
  assert.deepEqual(result.ids, ["b"]);
  assert.equal(new Set(result.ids).size, result.ids.length);
});

// --- shortlistDeltas ---

test("shortlistDeltas marks the cheapest lane as the baseline and computes finite currency/percent deltas", () => {
  const deltas = shortlistDeltas([compared("a", 10), compared("b", 4), compared("c", 6)]);
  assert.deepEqual(
    deltas.map((d) => [d.compared.row.id, d.isBaseline, d.deltaUsd, d.deltaPercent]),
    [
      ["a", false, 6, 150],
      ["b", true, 0, 0],
      ["c", false, 2, 50],
    ],
  );
});

test("shortlistDeltas preserves the given row order rather than sorting by cost", () => {
  const deltas = shortlistDeltas([compared("expensive", 10), compared("cheap", 2)]);
  assert.deepEqual(deltas.map((d) => d.compared.row.id), ["expensive", "cheap"]);
});

test("shortlistDeltas marks every tied-cheapest lane as baseline", () => {
  const deltas = shortlistDeltas([compared("a", 4), compared("b", 4), compared("c", 8)]);
  assert.deepEqual(deltas.map((d) => d.isBaseline), [true, true, false]);
  assert.deepEqual(deltas.map((d) => d.deltaUsd), [0, 0, 4]);
});

test("shortlistDeltas uses a zero-percent delta baseline when the cheapest lane is free, without a division error", () => {
  const deltas = shortlistDeltas([compared("free", 0), compared("paid", 5)]);
  assert.deepEqual(
    deltas.map((d) => [d.compared.row.id, d.isBaseline, d.deltaUsd, d.deltaPercent]),
    [
      ["free", true, 0, 0],
      ["paid", false, 5, 0],
    ],
  );
  assert.ok(deltas.every((d) => Number.isFinite(d.deltaUsd) && Number.isFinite(d.deltaPercent)));
});

test("shortlistDeltas: every lane free at once is still all-baseline with finite zero deltas", () => {
  const deltas = shortlistDeltas([compared("a", 0), compared("b", 0)]);
  assert.deepEqual(
    deltas.map((d) => [d.isBaseline, d.deltaUsd, d.deltaPercent]),
    [
      [true, 0, 0],
      [true, 0, 0],
    ],
  );
});

test("shortlistDeltas returns an empty list for an empty shortlist", () => {
  assert.deepEqual(shortlistDeltas([]), []);
});

test("shortlistDeltas on a single lane treats it as its own baseline", () => {
  const deltas = shortlistDeltas([compared("solo", 7)]);
  assert.equal(deltas.length, 1);
  assert.equal(deltas[0].isBaseline, true);
  assert.equal(deltas[0].deltaUsd, 0);
  assert.equal(deltas[0].deltaPercent, 0);
});

test("shortlistDeltas rounds percent deltas to the nearest integer", () => {
  const deltas = shortlistDeltas([compared("base", 3), compared("other", 4)]);
  // (4 - 3) / 3 * 100 = 33.333...
  assert.equal(deltas[1].deltaPercent, 33);
});

// --- storage codec ---

test("serializeShortlist / parseStoredShortlist round-trip", () => {
  const ids = ["a", "b", "c"];
  assert.deepEqual(parseStoredShortlist(serializeShortlist(ids)), ids);
});

test("serializeShortlist / parseStoredShortlist round-trip an empty shortlist", () => {
  assert.deepEqual(parseStoredShortlist(serializeShortlist([])), []);
});

test("parseStoredShortlist falls back to an empty list for missing, malformed, or unversioned data", () => {
  assert.deepEqual(parseStoredShortlist(null), []);
  assert.deepEqual(parseStoredShortlist(""), []);
  assert.deepEqual(parseStoredShortlist("not json"), []);
  assert.deepEqual(parseStoredShortlist("null"), []);
  assert.deepEqual(parseStoredShortlist("42"), []);
  assert.deepEqual(parseStoredShortlist("[]"), []);
  assert.deepEqual(parseStoredShortlist(JSON.stringify({ ids: ["a"] })), []); // missing v
  assert.deepEqual(parseStoredShortlist(JSON.stringify({ v: 2, ids: ["a"] })), []); // unsupported future version
  assert.deepEqual(parseStoredShortlist(JSON.stringify({ v: 1, ids: "not-an-array" })), []);
});

test("parseStoredShortlist drops non-string entries defensively", () => {
  assert.deepEqual(parseStoredShortlist(JSON.stringify({ v: 1, ids: ["a", 1, null, "b", {}] })), ["a", "b"]);
});

test("parseStoredShortlist never throws on adversarial input", () => {
  for (const raw of [null, "", "{", "{{{", "[1,2,3", JSON.stringify({ v: 1, ids: null })]) {
    assert.doesNotThrow(() => parseStoredShortlist(raw));
  }
});
