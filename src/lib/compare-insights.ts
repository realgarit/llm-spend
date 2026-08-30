import { DEFAULT_WORKLOAD, type Workload } from "@/lib/calc";
import type { ComparedRow } from "@/lib/scenario";

export interface WorkloadPreset {
  id: "agentic" | "rag" | "support" | "batch";
  label: string;
  description: string;
  workload: Workload;
}

export const WORKLOAD_PRESETS: readonly WorkloadPreset[] = [
  {
    id: "agentic",
    label: "Agentic session",
    description: "60M in · 210K out · 90% cached",
    workload: DEFAULT_WORKLOAD,
  },
  {
    id: "rag",
    label: "RAG-heavy",
    description: "10M in · 100K out · 80% cached",
    workload: { inputTokens: 10_000_000, outputTokens: 100_000, cacheHitRate: 0.8 },
  },
  {
    id: "support",
    label: "Customer support",
    description: "5M in · 1M out · 40% cached",
    workload: { inputTokens: 5_000_000, outputTokens: 1_000_000, cacheHitRate: 0.4 },
  },
  {
    id: "batch",
    label: "Batch extraction",
    description: "20M in · 2M out · no cache",
    workload: { inputTokens: 20_000_000, outputTokens: 2_000_000, cacheHitRate: 0 },
  },
];

export function workloadMatchesPreset(workload: Workload, preset: WorkloadPreset): boolean {
  return (
    workload.inputTokens === preset.workload.inputTokens &&
    workload.outputTokens === preset.workload.outputTokens &&
    workload.cacheHitRate === preset.workload.cacheHitRate
  );
}

export type DeploymentFilter = "all" | "foundry" | "direct";

export interface CompareFilters {
  query: string;
  provider: string;
  deployment: DeploymentFilter;
  cacheOnly: boolean;
  officialOnly: boolean;
}

export const DEFAULT_COMPARE_FILTERS: CompareFilters = {
  query: "",
  provider: "all",
  deployment: "all",
  cacheOnly: false,
  officialOnly: false,
};

export const RESULTS_PREVIEW_LIMIT = 12;

export function limitComparedRows(
  rows: ComparedRow[],
  showAll: boolean,
  limit = RESULTS_PREVIEW_LIMIT,
): ComparedRow[] {
  return showAll || rows.length <= limit ? rows : rows.slice(0, limit);
}

export function filterComparedRows(rows: ComparedRow[], filters: CompareFilters): ComparedRow[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return rows.filter((compared) => {
    const { row, resolved } = compared;
    const isDirect = row.tier === "Direct";
    const searchText = [row.provider, row.model, row.host, row.tier, isDirect ? "direct api" : "microsoft foundry"]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    if (query && !searchText.includes(query)) return false;
    if (filters.provider !== "all" && row.provider !== filters.provider) return false;
    if (filters.deployment === "direct" && !isDirect) return false;
    if (filters.deployment === "foundry" && isDirect) return false;
    if (filters.cacheOnly && resolved.cachedUsd === null) return false;

    if (filters.officialOnly) {
      if (resolved.confidence !== "official") return false;
      const cachedConfidence = resolved.cachedConfidence ?? resolved.confidence;
      if (resolved.cachedUsd !== null && cachedConfidence !== "official") return false;
    }

    return true;
  });
}

export interface CostLeader {
  compared: ComparedRow;
  /** Positive is below the result-set median; negative is above it. */
  belowMedianPercent: number | null;
}

export interface CostLeaders {
  medianTotalUsd: number | null;
  overall: CostLeader | null;
  foundry: CostLeader | null;
  direct: CostLeader | null;
}

export function buildCostLeaders(rows: ComparedRow[]): CostLeaders {
  if (rows.length === 0) {
    return { medianTotalUsd: null, overall: null, foundry: null, direct: null };
  }

  const sorted = [...rows].sort((a, b) => a.cost.totalUsd - b.cost.totalUsd);
  const middle = Math.floor(sorted.length / 2);
  const medianTotalUsd =
    sorted.length % 2 === 0
      ? (sorted[middle - 1].cost.totalUsd + sorted[middle].cost.totalUsd) / 2
      : sorted[middle].cost.totalUsd;

  const makeLeader = (compared: ComparedRow | undefined): CostLeader | null => {
    if (!compared) return null;
    return {
      compared,
      belowMedianPercent:
        medianTotalUsd === 0
          ? null
          : Math.round(((medianTotalUsd - compared.cost.totalUsd) / medianTotalUsd) * 100),
    };
  };

  return {
    medianTotalUsd,
    overall: makeLeader(sorted[0]),
    foundry: makeLeader(sorted.find((item) => item.row.tier !== "Direct")),
    direct: makeLeader(sorted.find((item) => item.row.tier === "Direct")),
  };
}
