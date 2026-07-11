import type { PricingEntry } from "@/data/types";

export interface Workload {
  /** Total input tokens (fresh + cached, before applying the hit rate split). */
  inputTokens: number;
  /** Total output tokens. */
  outputTokens: number;
  /** Fraction of input tokens served from cache, 0..1. */
  cacheHitRate: number;
}

/** The default example workload used across the site. */
export const DEFAULT_WORKLOAD: Workload = {
  inputTokens: 60_000_000,
  outputTokens: 210_000,
  cacheHitRate: 0.9,
};

const PER_MILLION = 1_000_000;

export interface CostBreakdown {
  freshInputUsd: number;
  cachedInputUsd: number;
  outputUsd: number;
  totalUsd: number;
  /** True when the model has no cache meter, so the hit rate is inapplicable. */
  cacheApplied: boolean;
  /** Effective blended $/1M input actually paid (fresh+cached blended). */
  blendedInputPerMUsd: number;
}

/**
 * Compute the real blended cost of a workload against a single pricing entry.
 *
 * Input tokens are split by the cache hit rate: the cached fraction is billed at
 * `cachedUsd` (when a cache meter exists), the rest at `inputUsd`. If the model
 * has no cache meter, all input is billed at `inputUsd` regardless of hit rate.
 */
export function computeCost(entry: PricingEntry, workload: Workload): CostBreakdown {
  const hit = clamp01(workload.cacheHitRate);
  const hasCache = entry.cachedUsd !== null && entry.cachedUsd !== undefined;

  const cachedTokens = hasCache ? workload.inputTokens * hit : 0;
  const freshTokens = workload.inputTokens - cachedTokens;

  const freshInputUsd = (freshTokens / PER_MILLION) * entry.inputUsd;
  const cachedInputUsd = hasCache
    ? (cachedTokens / PER_MILLION) * (entry.cachedUsd as number)
    : 0;
  const outputUsd = (workload.outputTokens / PER_MILLION) * entry.outputUsd;
  const totalUsd = freshInputUsd + cachedInputUsd + outputUsd;

  const blendedInputPerMUsd =
    workload.inputTokens > 0
      ? ((freshInputUsd + cachedInputUsd) / workload.inputTokens) * PER_MILLION
      : entry.inputUsd;

  return {
    freshInputUsd,
    cachedInputUsd,
    outputUsd,
    totalUsd,
    cacheApplied: hasCache,
    blendedInputPerMUsd,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Compact token formatting: 60_000_000 -> "60M", 210_000 -> "210K". */
export function formatTokens(n: number): string {
  if (n >= PER_MILLION) {
    const m = n / PER_MILLION;
    return `${trimNum(m)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${trimNum(k)}K`;
  }
  return `${n}`;
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}
