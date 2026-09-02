import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComparedRow } from "@/lib/scenario";
import { buildCostLeaders, DEFAULT_COMPARE_FILTERS, WORKLOAD_PRESETS } from "@/lib/compare-insights";
import { CompareFilterBar } from "@/components/compare-filters";
import { CostSignalRail } from "@/components/cost-signal-rail";
import { WorkloadPresets } from "@/components/workload-presets";

function row(id: string, tier: "Direct" | "Global", totalUsd: number): ComparedRow {
  return {
    row: {
      id,
      provider: tier === "Direct" ? "Qwen" : "OpenAI / Azure OpenAI",
      providerSlug: tier === "Direct" ? "qwen" : "openai-azure",
      model: tier === "Direct" ? "Qwen3.8 Max" : "GPT-5.6 Luna",
      tier,
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

test("workload presets expose labels, descriptions, and one pressed state", () => {
  const html = renderToStaticMarkup(
    createElement(WorkloadPresets, {
      workload: WORKLOAD_PRESETS[1].workload,
      onChange: () => undefined,
    }),
  );

  assert.match(html, /Illustrative workloads/);
  assert.match(html, /RAG-heavy/);
  assert.match(html, /10M in · 100K out · 80% cached/);
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 3);
});

test("cost signal rail names cost-only lanes and explains median context", () => {
  const leaders = buildCostLeaders([row("direct", "Direct", 2), row("foundry", "Global", 6), row("high", "Global", 10)]);
  const html = renderToStaticMarkup(createElement(CostSignalRail, { leaders }));

  assert.match(html, /Cost signal/);
  assert.match(html, /Overall lowest/);
  assert.match(html, /Foundry lowest/);
  assert.match(html, /Direct lowest/);
  assert.match(html, /Qwen3\.8 Max/);
  assert.match(html, /below filtered median/);
  assert.doesNotMatch(html, /best model/i);
});

test("cost signal rail keeps unavailable lanes explicit", () => {
  const leaders = buildCostLeaders([row("direct", "Direct", 0)]);
  const html = renderToStaticMarkup(createElement(CostSignalRail, { leaders }));
  assert.match(html, /No matching Foundry lane/);
  assert.match(html, /Median unavailable/);
});

test("filter bar renders an associated search label, structured filters, summary, and clear action", () => {
  const html = renderToStaticMarkup(
    createElement(CompareFilterBar, {
      filters: DEFAULT_COMPARE_FILTERS,
      onChange: () => undefined,
      providers: ["Qwen", "DeepSeek"],
      resultCount: 12,
      totalCount: 66,
      workloadSummary: "60M in / 210K out @ 90% cache",
      sortKey: "total",
      sortDir: "asc",
      onSortChange: () => undefined,
      onClear: () => undefined,
    }),
  );

  assert.match(html, /for="model-search"/);
  assert.match(html, /id="model-search"/);
  assert.match(html, /Deployment/);
  assert.match(html, /Has cache meter/);
  assert.match(html, /Official only/);
  assert.match(html, /Sort results/);
  assert.match(html, /12 of 66 lanes/);
  assert.match(html, /Clear filters/);
});

test("filter bar represents a descending header sort without falling back to workload cost", () => {
  const html = renderToStaticMarkup(
    createElement(CompareFilterBar, {
      filters: DEFAULT_COMPARE_FILTERS,
      onChange: () => undefined,
      providers: ["Qwen"],
      resultCount: 12,
      totalCount: 66,
      workloadSummary: "example",
      sortKey: "provider",
      sortDir: "desc",
      onSortChange: () => undefined,
      onClear: () => undefined,
    }),
  );
  assert.match(html, /<option value="provider-desc" selected="">Provider Z–A<\/option>/);
  assert.doesNotMatch(html, /<option value="total-asc" selected="">/);
});
