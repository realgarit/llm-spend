import assert from "node:assert/strict";
import test from "node:test";

import { resolveRate } from "../lib/rates";
import type { PricingEntry } from "./types";
import { getProvider, providers } from "./providers";

/**
 * Migration tests for the rate variants added to the DeepSeek, Gemini and Qwen
 * rows (see docs/superpowers/specs/2026-08-14-rate-variants-design.md). These
 * assert against the real catalog data in providers.ts, not fixtures — the
 * generic resolver semantics (matching order, half-open windows, etc.) are
 * already pinned by src/lib/rates.test.ts against synthetic entries.
 */

function directDeepSeek(model: string): PricingEntry {
  const provider = getProvider("deepseek");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === model && candidate.host === "DeepSeek direct API",
  );

  assert.ok(entry, `Expected a direct DeepSeek ${model} entry`);
  return entry;
}

function geminiFlash(model: string): PricingEntry {
  const provider = getProvider("gemini");
  const entry = provider?.entries.find((candidate) => candidate.model === model);

  assert.ok(entry, `Expected a Gemini ${model} entry`);
  return entry;
}

function qwenMaxPromo(): PricingEntry {
  const provider = getProvider("qwen");
  const entry = provider?.entries.find((candidate) => candidate.model === "Qwen3.7 Max (Promo)");

  assert.ok(entry, "Expected the Qwen3.7 Max (Promo) entry");
  return entry;
}

function kimiK27Code(): PricingEntry {
  const provider = getProvider("kimi");
  const entry = provider?.entries.find((candidate) => candidate.model === "Kimi K2.7 Code");

  assert.ok(entry, "Expected the Kimi K2.7 Code entry");
  return entry;
}

function minimaxM3(): PricingEntry {
  const provider = getProvider("minimax");
  const entry = provider?.entries.find(
    (candidate) => candidate.model === "MiniMax M3" && candidate.host === "MiniMax direct API",
  );

  assert.ok(entry, "Expected the MiniMax M3 (direct API) entry");
  return entry;
}

function gpt56Global(model: string): PricingEntry {
  const provider = getProvider("openai-azure");
  const entry = provider?.entries.find((candidate) => candidate.model === model && candidate.tier === "Global");

  assert.ok(entry, `Expected a Global ${model} entry`);
  return entry;
}

const at = (iso: string) => ({ now: new Date(iso) });

// ---------------------------------------------------------------------------
// DeepSeek-V4 Pro (Direct)
// ---------------------------------------------------------------------------

test("DeepSeek-V4 Pro (Direct) resolves to today's base rate before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-15T12:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.435);
  assert.equal(resolved.cachedUsd, 0.003625);
  assert.equal(resolved.outputUsd, 0.87);
});

test("DeepSeek-V4 Pro (Direct) stays on the base rate one second before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-16T15:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.435);
});

test("DeepSeek-V4 Pro (Direct) flips to a variant at the exact switch instant", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-16T16:00:00Z"));

  // 16:00 UTC falls outside both peak windows (01:00-04:00, 06:00-10:00), so
  // this is specifically the Off-peak variant, not just "not base".
  assert.notEqual(resolved.variant, null);
  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.66);
  assert.equal(resolved.cachedUsd, 0.022);
  assert.equal(resolved.outputUsd, 1.98);
});

test("DeepSeek-V4 Pro (Direct) resolves Peak inside a peak window", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-17T02:00:00Z"));

  assert.equal(resolved.label, "Peak");
  assert.equal(resolved.inputUsd, 1.32);
  assert.equal(resolved.cachedUsd, 0.044);
  assert.equal(resolved.outputUsd, 3.96);
  assert.equal(resolved.confidence, "official");
});

test("DeepSeek-V4 Pro (Direct) resolves Off-peak outside the peak windows", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Pro"), at("2026-08-17T12:00:00Z"));

  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.66);
  assert.equal(resolved.cachedUsd, 0.022);
  assert.equal(resolved.outputUsd, 1.98);
  assert.equal(resolved.confidence, "official");
});

// ---------------------------------------------------------------------------
// DeepSeek-V4 Flash (Direct)
// ---------------------------------------------------------------------------

test("DeepSeek-V4 Flash (Direct) resolves to today's base rate before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-15T12:00:00Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.14);
  assert.equal(resolved.cachedUsd, 0.0028);
  assert.equal(resolved.outputUsd, 0.28);
});

test("DeepSeek-V4 Flash (Direct) stays on the base rate one second before the switch", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-16T15:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.14);
});

test("DeepSeek-V4 Flash (Direct) flips to a variant at the exact switch instant", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-16T16:00:00Z"));

  assert.notEqual(resolved.variant, null);
  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.22);
  assert.equal(resolved.cachedUsd, 0.007);
  assert.equal(resolved.outputUsd, 0.66);
});

test("DeepSeek-V4 Flash (Direct) resolves Peak inside a peak window", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-17T02:00:00Z"));

  assert.equal(resolved.label, "Peak");
  assert.equal(resolved.inputUsd, 0.44);
  assert.equal(resolved.cachedUsd, 0.014);
  assert.equal(resolved.outputUsd, 1.32);
});

test("DeepSeek-V4 Flash (Direct) resolves Off-peak outside the peak windows", () => {
  const resolved = resolveRate(directDeepSeek("DeepSeek-V4 Flash"), at("2026-08-17T12:00:00Z"));

  assert.equal(resolved.label, "Off-peak");
  assert.equal(resolved.inputUsd, 0.22);
  assert.equal(resolved.cachedUsd, 0.007);
  assert.equal(resolved.outputUsd, 0.66);
});

// ---------------------------------------------------------------------------
// Peak is exactly 2x off-peak, on every dimension, for both DeepSeek rows.
// ---------------------------------------------------------------------------

test("DeepSeek peak rates are exactly 2x their matching off-peak rates", () => {
  for (const model of ["DeepSeek-V4 Pro", "DeepSeek-V4 Flash"]) {
    const variants = directDeepSeek(model).variants ?? [];
    const peak = variants.find((v) => v.label === "Peak");
    const offPeak = variants.find((v) => v.label === "Off-peak");

    assert.ok(peak, `${model} is missing a Peak variant`);
    assert.ok(offPeak, `${model} is missing an Off-peak variant`);
    assert.equal(peak.inputUsd, offPeak.inputUsd * 2, `${model} input`);
    assert.equal(peak.cachedUsd, (offPeak.cachedUsd as number) * 2, `${model} cached`);
    assert.equal(peak.outputUsd, offPeak.outputUsd * 2, `${model} output`);
  }
});

// ---------------------------------------------------------------------------
// Gemini 3.6 / 3.7 Flash promo reversion
// ---------------------------------------------------------------------------

for (const model of ["Gemini 3.6 Flash", "Gemini 3.7 Flash"]) {
  test(`${model} stays at the promo rate through the last instant of 2026`, () => {
    const resolved = resolveRate(geminiFlash(model), at("2026-12-31T23:59:59Z"));

    assert.equal(resolved.variant, null);
    assert.equal(resolved.inputUsd, 0.75);
    assert.equal(resolved.cachedUsd, 0.075);
    assert.equal(resolved.outputUsd, 3.75);
  });

  test(`${model} reverts to list price at the first instant of 2027`, () => {
    const resolved = resolveRate(geminiFlash(model), at("2027-01-01T00:00:00Z"));

    assert.equal(resolved.label, "Standard (from 2027)");
    assert.equal(resolved.inputUsd, 1.5);
    assert.equal(resolved.cachedUsd, 0.15);
    assert.equal(resolved.outputUsd, 7.5);
    assert.equal(resolved.confidence, "official");
  });
}

// ---------------------------------------------------------------------------
// Qwen3.7 Max (Promo) expiry
// ---------------------------------------------------------------------------

test("Qwen3.7 Max (Promo) stays at the discounted rate through the last instant of August", () => {
  const resolved = resolveRate(qwenMaxPromo(), at("2026-08-31T23:59:59Z"));

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 1.25);
  assert.equal(resolved.cachedUsd, 0.125);
  assert.equal(resolved.outputUsd, 3.75);
});

test("Qwen3.7 Max (Promo) reverts to list price at the first instant of September", () => {
  const resolved = resolveRate(qwenMaxPromo(), at("2026-09-01T00:00:00Z"));

  assert.equal(resolved.label, "List price (from September)");
  assert.equal(resolved.inputUsd, 2.5);
  assert.equal(resolved.cachedUsd, 0.25);
  assert.equal(resolved.outputUsd, 7.5);
  assert.equal(resolved.confidence, "official");
  // The row's cachedConfidence ("derived") is mirrored onto the variant rather
  // than left to fall back to the row's overall (official) confidence.
  assert.equal(resolved.cachedConfidence, "derived");
});

// ---------------------------------------------------------------------------
// Kimi K2.7 Code — Highspeed service tier (Moonshot's naming; 2x standard)
// ---------------------------------------------------------------------------

test("Kimi K2.7 Code resolves the Highspeed variant under the highspeed service tier", () => {
  const resolved = resolveRate(kimiK27Code(), { now: new Date("2026-08-20T12:00:00Z"), serviceTier: "highspeed" });

  assert.equal(resolved.label, "Highspeed");
  assert.equal(resolved.inputUsd, 1.9);
  assert.equal(resolved.cachedUsd, 0.38);
  assert.equal(resolved.outputUsd, 8.0);
  assert.equal(resolved.confidence, "official");
});

test("Kimi K2.7 Code stays on its base rate without a service tier (defaults to standard)", () => {
  const standard = resolveRate(kimiK27Code(), { now: new Date("2026-08-20T12:00:00Z") });
  const explicitStandard = resolveRate(kimiK27Code(), {
    now: new Date("2026-08-20T12:00:00Z"),
    serviceTier: "standard",
  });

  for (const resolved of [standard, explicitStandard]) {
    assert.equal(resolved.variant, null);
    assert.equal(resolved.inputUsd, 0.95);
    assert.equal(resolved.cachedUsd, 0.19);
    assert.equal(resolved.outputUsd, 4.0);
  }
});

// ---------------------------------------------------------------------------
// Gemini 3.6 / 3.7 Flash — Batch, Flex, Priority, each combined with the
// existing 2027-01-01 promo-reversion date. Batch and Flex are numerically
// identical (both exactly 50% of Standard) but are distinct ServiceTier
// values, so both are asserted independently rather than assumed equal.
// ---------------------------------------------------------------------------

const GEMINI_TIER_CASES = [
  {
    tier: "batch" as const,
    label: "Batch",
    labelAfter: "Batch (from 2027)",
    before: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
    after: { inputUsd: 0.75, cachedUsd: 0.075, outputUsd: 3.75 },
  },
  {
    tier: "flex" as const,
    label: "Flex",
    labelAfter: "Flex (from 2027)",
    before: { inputUsd: 0.375, cachedUsd: 0.0375, outputUsd: 1.875 },
    after: { inputUsd: 0.75, cachedUsd: 0.075, outputUsd: 3.75 },
  },
  {
    tier: "priority" as const,
    label: "Priority",
    labelAfter: "Priority (from 2027)",
    before: { inputUsd: 1.35, cachedUsd: 0.135, outputUsd: 6.75 },
    after: { inputUsd: 2.7, cachedUsd: 0.27, outputUsd: 13.5 },
  },
];

for (const model of ["Gemini 3.6 Flash", "Gemini 3.7 Flash"]) {
  for (const { tier, label, labelAfter, before, after } of GEMINI_TIER_CASES) {
    test(`${model} resolves ${label}'s promo-period numbers before 2027`, () => {
      const resolved = resolveRate(geminiFlash(model), {
        now: new Date("2026-12-31T23:59:59Z"),
        serviceTier: tier,
      });

      assert.equal(resolved.label, label);
      assert.equal(resolved.inputUsd, before.inputUsd);
      assert.equal(resolved.cachedUsd, before.cachedUsd);
      assert.equal(resolved.outputUsd, before.outputUsd);
      assert.equal(resolved.confidence, "official");
    });

    test(`${model} resolves ${label}'s post-reversion numbers from 2027-01-01`, () => {
      const resolved = resolveRate(geminiFlash(model), {
        now: new Date("2027-01-01T00:00:00Z"),
        serviceTier: tier,
      });

      assert.equal(resolved.label, labelAfter);
      assert.equal(resolved.inputUsd, after.inputUsd);
      assert.equal(resolved.cachedUsd, after.cachedUsd);
      assert.equal(resolved.outputUsd, after.outputUsd);
      assert.equal(resolved.confidence, "official");
    });
  }

  test(`${model} is unaffected by the new tier variants when no service tier is given`, () => {
    const before = resolveRate(geminiFlash(model), { now: new Date("2026-12-31T23:59:59Z") });
    assert.equal(before.variant, null);
    assert.equal(before.inputUsd, 0.75);
    assert.equal(before.cachedUsd, 0.075);
    assert.equal(before.outputUsd, 3.75);

    const after = resolveRate(geminiFlash(model), { now: new Date("2027-01-01T00:00:00Z") });
    assert.equal(after.label, "Standard (from 2027)");
    assert.equal(after.inputUsd, 1.5);
    assert.equal(after.cachedUsd, 0.15);
    assert.equal(after.outputUsd, 7.5);
  });
}

// ---------------------------------------------------------------------------
// MiniMax M3 (Direct) — Priority service tier (exactly 1.5x standard)
// ---------------------------------------------------------------------------

test("MiniMax M3 (Direct) resolves the Priority variant under the priority service tier", () => {
  const resolved = resolveRate(minimaxM3(), { now: new Date("2026-08-20T12:00:00Z"), serviceTier: "priority" });

  assert.equal(resolved.label, "Priority");
  assert.equal(resolved.inputUsd, 0.45);
  assert.equal(resolved.cachedUsd, 0.09);
  assert.equal(resolved.outputUsd, 1.8);
  assert.equal(resolved.confidence, "official");
});

test("MiniMax M3 (Direct) stays on its base rate without a service tier", () => {
  const resolved = resolveRate(minimaxM3(), { now: new Date("2026-08-20T12:00:00Z") });

  assert.equal(resolved.variant, null);
  assert.equal(resolved.inputUsd, 0.3);
  assert.equal(resolved.cachedUsd, 0.06);
  assert.equal(resolved.outputUsd, 1.2);
});

// ---------------------------------------------------------------------------
// GPT-5.6 Sol / Terra / Luna (Global) — Priority ("PP" in Azure's own meter
// names) service tier, exactly 2x each row's own Standard Global rate.
// ---------------------------------------------------------------------------

const GPT56_PRIORITY_CASES = [
  {
    model: "GPT-5.6 Sol",
    base: { inputUsd: 5.0, cachedUsd: 0.5, outputUsd: 30.0 },
    priority: { inputUsd: 10.0, cachedUsd: 1.0, outputUsd: 60.0 },
  },
  {
    model: "GPT-5.6 Terra",
    base: { inputUsd: 2.0, cachedUsd: 0.2, outputUsd: 12.0 },
    priority: { inputUsd: 4.0, cachedUsd: 0.4, outputUsd: 24.0 },
  },
  {
    model: "GPT-5.6 Luna",
    base: { inputUsd: 0.2, cachedUsd: 0.02, outputUsd: 1.2 },
    priority: { inputUsd: 0.4, cachedUsd: 0.04, outputUsd: 2.4 },
  },
];

for (const { model, base, priority } of GPT56_PRIORITY_CASES) {
  test(`${model} (Global) resolves the Priority variant at exactly 2x its Standard rate`, () => {
    const resolved = resolveRate(gpt56Global(model), {
      now: new Date("2026-08-20T12:00:00Z"),
      serviceTier: "priority",
    });

    assert.equal(resolved.label, "Priority");
    assert.equal(resolved.inputUsd, priority.inputUsd);
    assert.equal(resolved.cachedUsd, priority.cachedUsd);
    assert.equal(resolved.outputUsd, priority.outputUsd);
    assert.equal(resolved.inputUsd, base.inputUsd * 2);
    assert.equal(resolved.cachedUsd, (base.cachedUsd as number) * 2);
    assert.equal(resolved.outputUsd, base.outputUsd * 2);
    assert.equal(resolved.confidence, "official");
  });

  test(`${model} (Global) stays on its base rate without a service tier`, () => {
    const resolved = resolveRate(gpt56Global(model), { now: new Date("2026-08-20T12:00:00Z") });

    assert.equal(resolved.variant, null);
    assert.equal(resolved.inputUsd, base.inputUsd);
    assert.equal(resolved.cachedUsd, base.cachedUsd);
    assert.equal(resolved.outputUsd, base.outputUsd);
  });
}

// ---------------------------------------------------------------------------
// Guard: this migration must not change what the site shows today. Rendering
// still reads the flat inputUsd/cachedUsd/outputUsd fields directly (variants
// are not consumed until Phase 3), so every row's resolved rate "now" must
// equal its base rate exactly.
// ---------------------------------------------------------------------------

// Rows that are EXPECTED to resolve to a non-null variant once the pinned
// `now` above is bumped forward past a certain instant — a periodic
// maintenance task done by hand (see AGENTS.md working notes). Each row below
// has a variant whose `conditions` contain only `from` (no `until`, no
// `serviceTier`, no `contextBand`): once real time crosses that `from`
// instant, the variant matches forever and the row can never go back to
// `variant: null`. Without this allowlist, the first `now` bump past that
// instant would fail the guard even though nothing is actually wrong — the
// variant is doing exactly what it was authored to do.
//
// Before adding a row here, confirm its active variant is intentional (not an
// authoring mistake, e.g. a `from` date wrongly set in the past) by checking
// the variant's own `sourceNote`.
const ROWS_WITH_PERMANENTLY_ACTIVE_VARIANTS = new Set<string>([
  // DeepSeek's Peak/Off-peak pair partitions all time from 2026-08-16 16:00Z
  // onward with no gap: Off-peak's conditions are `{ from }` only, so once
  // `now` reaches that instant, Peak or Off-peak always matches.
  "deepseek / DeepSeek-V4 Pro (DeepSeek direct API)",
  "deepseek / DeepSeek-V4 Flash (DeepSeek direct API)",
  // Qwen3.7 Max's promo reverts to list price via a "List price (from
  // September)" variant with `{ from: "2026-09-01T00:00:00Z" }` and no
  // `until` — permanently active from that instant on.
  "qwen / Qwen3.7 Max (Promo) (Model Studio (Intl))",
  // Gemini 3.6/3.7 Flash's "Standard (from 2027)" variant reverts the promo
  // rate via `{ from: "2027-01-01T00:00:00Z" }` with no `until` or
  // `serviceTier` — permanently active from that instant on. (Their other
  // Batch/Flex/Priority variants are `serviceTier`-scoped and never match
  // this guard's plain `{ now }` context, so they need no allowlist entry.)
  "gemini / Gemini 3.6 Flash",
  "gemini / Gemini 3.7 Flash",
]);

test("guard: every catalog row resolves to its own base rate as of today", () => {
  const now = new Date("2026-08-24T12:00:00Z");

  for (const provider of providers) {
    for (const row of provider.entries) {
      const resolved = resolveRate(row, { now });
      const label = `${provider.slug} / ${row.model}${row.host ? ` (${row.host})` : ""}`;

      if (resolved.variant === null) {
        assert.equal(resolved.variant, null, `${label} should have no matching variant today`);
        assert.equal(resolved.inputUsd, row.inputUsd, `${label} inputUsd`);
        assert.equal(resolved.cachedUsd, row.cachedUsd, `${label} cachedUsd`);
        assert.equal(resolved.outputUsd, row.outputUsd, `${label} outputUsd`);
        continue;
      }

      assert.ok(
        ROWS_WITH_PERMANENTLY_ACTIVE_VARIANTS.has(label),
        `${label} resolved to a non-null variant ("${resolved.label}") today, but is not on the ` +
          `allowlist of rows with a known permanently-active variant. This usually means a variant's ` +
          `\`from\`/\`until\` was authored incorrectly (e.g. a date wrongly set in the past) — check its ` +
          `\`sourceNote\` before adding it to the allowlist.`,
      );
    }
  }
});
