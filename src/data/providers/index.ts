/**
 * All pricing data for the site.
 *
 * Rules for editing this file:
 * - Store USD per 1M tokens only. Never store CHF (it is derived at render time).
 * - Do not invent numbers. Every rate traces to the handoff / an official page /
 *   a billing reconciliation. Put provenance in `sourceNote`.
 * - Mark anything not on an official pricing page as `derived` or `estimate`.
 *   Use `cachedConfidence` when only the cache rate is uncertain.
 * - `effectiveDate` is ISO (YYYY-MM-DD): the date the rate was captured or takes
 *   effect. See README > "Adding a model entry".
 *
 * This file assembles the `providers` array from the per-provider modules in
 * this directory (one file per provider) and re-exports the same public API
 * the old single-file src/data/providers.ts used to expose.
 */

import type { Provider } from "../types";
import { kimi } from "./kimi";
import { deepseek } from "./deepseek";
import { glm } from "./glm";
import { openaiAzure } from "./openai-azure";
import { claude } from "./claude";
import { gemini } from "./gemini";
import { xai } from "./xai";
import { qwen } from "./qwen";
import { mistral } from "./mistral";
import { minimax } from "./minimax";
import { embeddings } from "./embeddings";

export const providers: Provider[] = [
  kimi,
  deepseek,
  glm,
  openaiAzure,
  claude,
  gemini,
  xai,
  qwen,
  mistral,
  minimax,
  embeddings,
];

export const providerSlugs = providers.map((p) => p.slug);

export function getProvider(slug: string): Provider | undefined {
  return providers.find((p) => p.slug === slug);
}

/** Chat/generation models only (excludes embeddings); used by compare + calculator. */
export function chatEntries(): { provider: Provider; entry: Provider["entries"][number] }[] {
  return providers
    .filter((p) => p.slug !== "embeddings")
    .flatMap((p) => p.entries.map((entry) => ({ provider: p, entry })));
}
