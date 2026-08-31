import { DEFAULT_WORKLOAD, type Workload } from "@/lib/calc";
import { DEFAULT_COMPARE_FILTERS, type CompareFilters } from "@/lib/compare-insights";
import { type SortDir, type SortKey } from "@/lib/compare-sort";
import {
  DEFAULT_CUSTOM_HOUR_UTC,
  DEFAULT_SCENARIO,
  SERVICE_TIER_OPTIONS,
  type Scenario,
  type TimeMode,
} from "@/lib/scenario";

export interface CompareDecisionState {
  workload: Workload;
  scenario: Scenario;
  filters: CompareFilters;
  sort: { key: SortKey; dir: SortDir };
  selectedLaneIds: string[];
}

const TIME_MODES: readonly TimeMode[] = ["now", "peak", "off-peak", "custom"];
const SORT_KEYS: readonly SortKey[] = ["provider", "model", "tier", "inputUsd", "cachedUsd", "outputUsd", "blended", "total"];
const SORT_DIRS: readonly SortDir[] = ["asc", "desc"];
const DEPLOYMENTS: readonly CompareFilters["deployment"][] = ["all", "foundry", "direct"];
const SERVICE_TIERS = SERVICE_TIER_OPTIONS.map(({ value }) => value);

function defaultState(): CompareDecisionState {
  return {
    workload: { ...DEFAULT_WORKLOAD },
    scenario: { time: { ...DEFAULT_SCENARIO.time }, serviceTier: DEFAULT_SCENARIO.serviceTier },
    filters: { ...DEFAULT_COMPARE_FILTERS },
    sort: { key: "total", dir: "asc" },
    selectedLaneIds: [],
  };
}

export function decodeCompareState(search: string, validLaneIds: ReadonlySet<string>): CompareDecisionState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const version = params.get("v");
  if (version !== null && version !== "1") return defaultState();

  const defaults = defaultState();
  const inputTokens = parseSafeInteger(params.get("input")) ?? defaults.workload.inputTokens;
  const outputTokens = parseSafeInteger(params.get("output")) ?? defaults.workload.outputTokens;
  const cacheHitRate = parseCacheRate(params.get("cache")) ?? defaults.workload.cacheHitRate;
  const mode = parseEnum(params.get("time"), TIME_MODES) ?? defaults.scenario.time.mode;
  const customHourUtc = mode === "custom" ? parseHour(params.get("hour")) ?? DEFAULT_CUSTOM_HOUR_UTC : undefined;
  const serviceTier = parseEnum(params.get("tier"), SERVICE_TIERS) ?? defaults.scenario.serviceTier;
  const query = params.get("q") ?? defaults.filters.query;
  const provider = params.get("provider") || defaults.filters.provider;
  const deployment = parseEnum(params.get("deployment"), DEPLOYMENTS) ?? defaults.filters.deployment;
  const sortKey = parseEnum(params.get("sort"), SORT_KEYS) ?? defaults.sort.key;
  const sortDir = parseEnum(params.get("dir"), SORT_DIRS) ?? defaults.sort.dir;

  return {
    workload: { inputTokens, outputTokens, cacheHitRate },
    scenario: {
      time: mode === "custom" ? { mode, customHourUtc } : { mode },
      serviceTier,
    },
    filters: {
      query,
      provider,
      deployment,
      cacheOnly: params.get("cacheOnly") === "1",
      officialOnly: params.get("officialOnly") === "1",
    },
    sort: { key: sortKey, dir: sortDir },
    selectedLaneIds: unique(params.get("lanes")?.split(",").filter((id) => validLaneIds.has(id)) ?? []),
  };
}

export function encodeCompareState(state: CompareDecisionState): string {
  const defaults = defaultState();
  const params = new URLSearchParams();
  const hasChanges =
    state.workload.inputTokens !== defaults.workload.inputTokens ||
    state.workload.outputTokens !== defaults.workload.outputTokens ||
    state.workload.cacheHitRate !== defaults.workload.cacheHitRate ||
    state.scenario.time.mode !== defaults.scenario.time.mode ||
    state.scenario.serviceTier !== defaults.scenario.serviceTier ||
    state.filters.query !== defaults.filters.query ||
    state.filters.provider !== defaults.filters.provider ||
    state.filters.deployment !== defaults.filters.deployment ||
    state.filters.cacheOnly ||
    state.filters.officialOnly ||
    state.sort.key !== defaults.sort.key ||
    state.sort.dir !== defaults.sort.dir ||
    state.selectedLaneIds.length > 0;
  if (!hasChanges) return "";

  params.set("v", "1");
  if (state.workload.inputTokens !== defaults.workload.inputTokens) params.set("input", String(state.workload.inputTokens));
  if (state.workload.outputTokens !== defaults.workload.outputTokens) params.set("output", String(state.workload.outputTokens));
  if (state.workload.cacheHitRate !== defaults.workload.cacheHitRate) params.set("cache", String(state.workload.cacheHitRate));
  if (state.scenario.time.mode !== defaults.scenario.time.mode) params.set("time", state.scenario.time.mode);
  if (state.scenario.time.mode === "custom" && state.scenario.time.customHourUtc !== DEFAULT_CUSTOM_HOUR_UTC) {
    params.set("hour", String(state.scenario.time.customHourUtc));
  }
  if (state.scenario.serviceTier !== defaults.scenario.serviceTier) params.set("tier", state.scenario.serviceTier);
  if (state.filters.query !== defaults.filters.query) params.set("q", state.filters.query);
  if (state.filters.provider !== defaults.filters.provider) params.set("provider", state.filters.provider);
  if (state.filters.deployment !== defaults.filters.deployment) params.set("deployment", state.filters.deployment);
  if (state.filters.cacheOnly) params.set("cacheOnly", "1");
  if (state.filters.officialOnly) params.set("officialOnly", "1");
  if (state.sort.key !== defaults.sort.key) params.set("sort", state.sort.key);
  if (state.sort.dir !== defaults.sort.dir) params.set("dir", state.sort.dir);
  const lanes = unique(state.selectedLaneIds).sort();
  if (lanes.length > 0) params.set("lanes", lanes.join(","));
  return params.toString();
}

export function scenarioLabel(state: CompareDecisionState): string {
  const time = state.scenario.time;
  const timeLabel =
    time.mode === "now"
      ? "Now"
      : time.mode === "peak"
        ? "Peak"
        : time.mode === "off-peak"
          ? "Off-peak"
          : `Custom ${String(time.customHourUtc ?? DEFAULT_CUSTOM_HOUR_UTC).padStart(2, "0")}:00 UTC`;
  const tier = state.scenario.serviceTier.charAt(0).toUpperCase() + state.scenario.serviceTier.slice(1);
  return `${timeLabel} · ${tier}`;
}

function parseSafeInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseCacheRate(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : null;
}

function parseHour(value: string | null): number | null {
  const parsed = parseSafeInteger(value);
  return parsed !== null && parsed <= 23 ? parsed : null;
}

function parseEnum<T extends string>(value: string | null, values: readonly T[]): T | null {
  return value !== null && values.includes(value as T) ? (value as T) : null;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
