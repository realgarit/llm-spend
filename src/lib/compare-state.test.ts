import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_CUSTOM_HOUR_UTC } from "@/lib/scenario";
import {
  decodeCompareState,
  encodeCompareState,
  scenarioLabel,
  type CompareDecisionState,
} from "./compare-state";

const laneIds = new Set(["openai--gpt-5-6--direct", "deepseek--v4--global"]);

const defaults: CompareDecisionState = {
  workload: { inputTokens: 60_000_000, outputTokens: 210_000, cacheHitRate: 0.9 },
  scenario: { time: { mode: "now" }, serviceTier: "standard" },
  filters: { query: "", provider: "all", deployment: "all", cacheOnly: false, officialOnly: false },
  sort: { key: "total", dir: "asc" },
  selectedLaneIds: [],
};

test("decodeCompareState reads every shareable decision field and prunes unknown lanes", () => {
  const state = decodeCompareState(
    "?v=1&input=120000&output=3000&cache=0.25&time=custom&hour=17&tier=priority&q=GPT%205&provider=OpenAI&deployment=direct&cacheOnly=1&officialOnly=1&sort=outputUsd&dir=desc&lanes=deepseek--v4--global,missing,openai--gpt-5-6--direct",
    laneIds,
  );

  assert.deepEqual(state, {
    workload: { inputTokens: 120_000, outputTokens: 3_000, cacheHitRate: 0.25 },
    scenario: { time: { mode: "custom", customHourUtc: 17 }, serviceTier: "priority" },
    filters: { query: "GPT 5", provider: "OpenAI", deployment: "direct", cacheOnly: true, officialOnly: true },
    sort: { key: "outputUsd", dir: "desc" },
    selectedLaneIds: ["deepseek--v4--global", "openai--gpt-5-6--direct"],
  });
});

test("decodeCompareState falls back field-by-field for malformed values", () => {
  const state = decodeCompareState(
    "v=1&input=-1&output=1.5&cache=Infinity&time=tomorrow&hour=24&tier=turbo&deployment=regional&sort=money&dir=sideways&cacheOnly=0&officialOnly=yes&lanes=missing",
    laneIds,
  );

  assert.deepEqual(state, defaults);
});

test("decodeCompareState accepts safe workload boundaries and ignores a custom hour outside custom mode", () => {
  const state = decodeCompareState("v=1&input=0&output=9007199254740991&cache=0&time=peak&hour=19", laneIds);

  assert.deepEqual(state.workload, { inputTokens: 0, outputTokens: Number.MAX_SAFE_INTEGER, cacheHitRate: 0 });
  assert.deepEqual(state.scenario, { time: { mode: "peak" }, serviceTier: "standard" });
});

test("decodeCompareState resets unsupported future versions to all defaults", () => {
  assert.deepEqual(decodeCompareState("v=2&input=1&time=peak&lanes=openai--gpt-5-6--direct", laneIds), defaults);
});

test("decodeCompareState falls back to the default custom hour when it is out of range, keeping custom mode", () => {
  const expected = { time: { mode: "custom" as const, customHourUtc: DEFAULT_CUSTOM_HOUR_UTC }, serviceTier: "standard" as const };

  assert.deepEqual(decodeCompareState("v=1&time=custom&hour=-1", laneIds).scenario, expected);
  assert.deepEqual(decodeCompareState("v=1&time=custom&hour=24", laneIds).scenario, expected);
  assert.deepEqual(decodeCompareState("v=1&time=custom&hour=noon", laneIds).scenario, expected);
});

test("decodeCompareState rejects a cache hit rate outside 0..1, field-by-field", () => {
  assert.equal(decodeCompareState("v=1&cache=-0.1", laneIds).workload.cacheHitRate, defaults.workload.cacheHitRate);
  assert.equal(decodeCompareState("v=1&cache=1.5", laneIds).workload.cacheHitRate, defaults.workload.cacheHitRate);
  // 1 is the valid upper boundary, unlike 1.5 above.
  assert.equal(decodeCompareState("v=1&cache=1", laneIds).workload.cacheHitRate, 1);
});

test("encodeCompareState omits defaults and emits canonical ordered fields", () => {
  assert.equal(encodeCompareState(defaults), "");

  assert.equal(
    encodeCompareState({
      workload: { inputTokens: 120_000, outputTokens: 3_000, cacheHitRate: 0.25 },
      scenario: { time: { mode: "custom", customHourUtc: 17 }, serviceTier: "priority" },
      filters: { query: "GPT 5", provider: "OpenAI", deployment: "direct", cacheOnly: true, officialOnly: true },
      sort: { key: "outputUsd", dir: "desc" },
      selectedLaneIds: ["openai--gpt-5-6--direct", "deepseek--v4--global", "openai--gpt-5-6--direct"],
    }),
    "v=1&input=120000&output=3000&cache=0.25&time=custom&hour=17&tier=priority&q=GPT+5&provider=OpenAI&deployment=direct&cacheOnly=1&officialOnly=1&sort=outputUsd&dir=desc&lanes=deepseek--v4--global%2Copenai--gpt-5-6--direct",
  );
});

test("encodeCompareState omits non-finite workload values instead of encoding NaN or Infinity", () => {
  const encoded = encodeCompareState({
    ...defaults,
    workload: { inputTokens: Number.NaN, outputTokens: Number.POSITIVE_INFINITY, cacheHitRate: Number.NEGATIVE_INFINITY },
  });

  assert.ok(!encoded.includes("NaN"), encoded);
  assert.ok(!encoded.includes("Infinity"), encoded);
  // Every workload field failed its validity predicate and was omitted
  // entirely, so only the version marker remains (hasChanges is still true —
  // NaN/Infinity are never equal to the defaults — but nothing unsafe is
  // encoded on their behalf).
  assert.equal(encoded, "v=1");
  // Decoding what WAS encoded falls back to the documented default for every
  // omitted field, per the fix's contract.
  assert.deepEqual(decodeCompareState(encoded, laneIds).workload, defaults.workload);
});

test("scenarioLabel is a stable human-readable summary for CSV exports", () => {
  assert.equal(scenarioLabel(defaults), "Now · Standard");
  assert.equal(
    scenarioLabel({ ...defaults, scenario: { time: { mode: "custom", customHourUtc: 17 }, serviceTier: "priority" } }),
    "Custom 17:00 UTC · Priority",
  );
});
