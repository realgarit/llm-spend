import type { Provider } from "../types";

export const gemini: Provider = {
  slug: "gemini",
  name: "Gemini",
  org: "Google",
  tagline: "Gemini 4 Argon is Google's new flagship reasoning model, with introductory API rates through November 30.",
  intro: [
    "Google made Gemini 4 Argon generally available on October 13, 2026. Its Standard API rate is $2/$0.10/$10 per M input/cached-input/output tokens through November 30, then $4/$0.20/$20 from December 1. Batch and Flex are half of Standard; Priority is 1.8x. The 1M-token context supports up to 1M output tokens through background long decode, while synchronous requests default to a 65,536-token output limit. Caching is implicit only, with a 95% cached-input discount.",
    "Gemini 3.8 Flash remains the leading model in Google's Flash family for long-horizon software engineering, agentic and multimodal work. Google publishes $0.75/M input, $0.075/M cached, $3.75/M output through 2026-12-31, reverting to $1.50/$0.15/$7.50 on 2027-01-01. Batch, Flex and Priority service tiers are modeled at their published prices, and the model has a 1M-token context window with 65,536 maximum output tokens. Google now routes Gemini 3.7 Flash requests to 3.8 Flash and Gemini 3.5 Flash requests to 3.6 Flash, so the deprecated aliases are not listed as separate price lanes.",
  ],
  entries: [
    {
      model: "Gemini 4 Argon",
      tier: "Global",
      inputUsd: 2,
      cachedUsd: 0.1,
      outputUsd: 10,
      contextWindow: 1_048_576,
      maxOutput: 1_048_576,
      confidence: "official",
      notes:
        "Google's flagship reasoning model, generally available since October 13, 2026. Standard API rates are $2/$0.10/$10 per M input/cached-input/output tokens through November 30, then $4/$0.20/$20 from December 1. Batch and Flex are half of Standard; Priority is 1.8x. Implicit caching only; explicit caching is unsupported. The default synchronous output limit is 65,536 tokens; background long decode supports up to 1,048,576 output tokens, limited by the shared context window.",
      sourceNote:
        "Google Gemini API release notes, checked 2026-10-14, mark Gemini 4 Argon (`gemini-4-argon`) generally available on October 13. Google's Gemini 4 Argon model page, checked 2026-10-14, gives a 1,048,576-token shared context window, 65,536 default synchronous output limit, and up to 1,048,576 output tokens with background long decode. The Gemini API pricing page, captured 2026-10-14, lists Standard at $2/M input, $0.10/M cached input, and $10/M output through November 30, 2026, then $4/$0.20/$20 from December 1; Batch and Flex are half of Standard, and Priority is 1.8x. Caching is implicit only and Google says explicit caching is unsupported. A full Azure Retail Prices Foundry feed sweep and exact `gemini` meter search on 2026-10-14 returned no Google/Gemini token meter, so this is a Direct API lane with no Foundry rate inferred.",
      effectiveDate: "2026-10-13",
      variants: [
        {
          label: "Standard (from December 1)",
          conditions: { from: "2026-12-01T00:00:00Z" },
          inputUsd: 4,
          cachedUsd: 0.2,
          outputUsd: 20,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Standard changes from $2/M input, $0.10/M cached input, and $10/M output through November 30, 2026 to $4/$0.20/$20 starting December 1, 2026.",
        },
        {
          label: "Batch",
          conditions: { serviceTier: "batch", until: "2026-12-01T00:00:00Z" },
          inputUsd: 1,
          cachedUsd: 0.05,
          outputUsd: 5,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Batch is $1/M input, $0.05/M cached input, and $5/M output through November 30, 2026; implicit caching only.",
        },
        {
          label: "Batch (from December 1)",
          conditions: { serviceTier: "batch", from: "2026-12-01T00:00:00Z" },
          inputUsd: 2,
          cachedUsd: 0.1,
          outputUsd: 10,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Batch is $2/M input, $0.10/M cached input, and $10/M output starting December 1, 2026; implicit caching only.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex", until: "2026-12-01T00:00:00Z" },
          inputUsd: 1,
          cachedUsd: 0.05,
          outputUsd: 5,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Flex is $1/M input, $0.05/M cached input, and $5/M output through November 30, 2026; implicit caching only.",
        },
        {
          label: "Flex (from December 1)",
          conditions: { serviceTier: "flex", from: "2026-12-01T00:00:00Z" },
          inputUsd: 2,
          cachedUsd: 0.1,
          outputUsd: 10,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Flex is $2/M input, $0.10/M cached input, and $10/M output starting December 1, 2026; implicit caching only.",
        },
        {
          label: "Priority",
          conditions: { serviceTier: "priority", until: "2026-12-01T00:00:00Z" },
          inputUsd: 3.6,
          cachedUsd: 0.18,
          outputUsd: 18,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Priority is $3.60/M input, $0.18/M cached input, and $18/M output through November 30, 2026; implicit caching only.",
        },
        {
          label: "Priority (from December 1)",
          conditions: { serviceTier: "priority", from: "2026-12-01T00:00:00Z" },
          inputUsd: 7.2,
          cachedUsd: 0.36,
          outputUsd: 36,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-10-14. Gemini 4 Argon Priority is $7.20/M input, $0.36/M cached input, and $36/M output starting December 1, 2026; implicit caching only.",
        },
      ],
    },
    {
      model: "Gemini 3.8 Flash",
      tier: "Global",
      inputUsd: 0.75,
      cachedUsd: 0.075,
      outputUsd: 3.75,
      contextWindow: 1_048_576,
      maxOutput: 65_536,
      confidence: "official",
      notes:
        "New flagship Flash model for long-horizon coding and autonomous agents. Introductory Standard rate is $0.75/$0.075/$3.75 per M through 2026-12-31, reverting to $1.50/$0.15/$7.50 on 2027-01-01. Google also publishes separate Batch, Flex and Priority rates below; cache storage is a separate hourly charge and is not modeled.",
      sourceNote:
        "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05: Standard publishes $0.75/M input, $0.075/M cached input and $3.75/M output through December 31, 2026, then $1.50/$0.15/$7.50 from January 1, 2027; Batch, Flex and Priority are modeled as service-tier variants below. Google’s Gemini 3.8 Flash model page (https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) publishes an input limit of 1,048,576 tokens and output limit of 65,536 tokens. The separate cache-storage price is not part of this token-rate schema.",
      effectiveDate: "2026-09-02",
      variants: [
        {
          label: "Standard (from 2027)",
          conditions: { from: "2027-01-01T00:00:00Z" },
          inputUsd: 1.5,
          cachedUsd: 0.15,
          outputUsd: 7.5,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Standard reverts to $1.50/M input, $0.15/M cached input and $7.50/M output starting January 1, 2027.",
        },
        {
          label: "Batch",
          conditions: { serviceTier: "batch", until: "2027-01-01T00:00:00Z" },
          inputUsd: 0.375,
          cachedUsd: 0.0375,
          outputUsd: 1.875,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Batch publishes $0.375/M input, $0.0375/M cached input and $1.875/M output through December 31, 2026.",
        },
        {
          label: "Batch (from 2027)",
          conditions: { serviceTier: "batch", from: "2027-01-01T00:00:00Z" },
          inputUsd: 0.75,
          cachedUsd: 0.075,
          outputUsd: 3.75,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Batch publishes $0.75/M input, $0.075/M cached input and $3.75/M output starting January 1, 2027.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex", until: "2027-01-01T00:00:00Z" },
          inputUsd: 0.375,
          cachedUsd: 0.0375,
          outputUsd: 1.875,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Flex publishes $0.375/M input, $0.0375/M cached input and $1.875/M output through December 31, 2026.",
        },
        {
          label: "Flex (from 2027)",
          conditions: { serviceTier: "flex", from: "2027-01-01T00:00:00Z" },
          inputUsd: 0.75,
          cachedUsd: 0.075,
          outputUsd: 3.75,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Flex publishes $0.75/M input, $0.075/M cached input and $3.75/M output starting January 1, 2027.",
        },
        {
          label: "Priority",
          conditions: { serviceTier: "priority", until: "2027-01-01T00:00:00Z" },
          inputUsd: 1.35,
          cachedUsd: 0.135,
          outputUsd: 6.75,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Priority publishes $1.35/M input, $0.135/M cached input and $6.75/M output through December 31, 2026.",
        },
        {
          label: "Priority (from 2027)",
          conditions: { serviceTier: "priority", from: "2027-01-01T00:00:00Z" },
          inputUsd: 2.7,
          cachedUsd: 0.27,
          outputUsd: 13.5,
          confidence: "official",
          sourceNote:
            "Google Gemini API pricing page (https://ai.google.dev/gemini-api/docs/pricing), captured 2026-09-05. Gemini 3.8 Flash Priority publishes $2.70/M input, $0.27/M cached input and $13.50/M output starting January 1, 2027.",
        },
      ],
    },
    {
      model: "Gemini 3.6 Flash",
      tier: "Global",
      inputUsd: 0.75,
      cachedUsd: 0.075,
      outputUsd: 3.75,
      confidence: "official",
      notes:
        "Promotional rate (50% off standard pricing) through 2026-12-31; reverts to $1.50/$0.15/$7.50 per M on 2027-01-01.",
      sourceNote:
        "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14; page stamped \"Last updated 2026-08-13 UTC\" and publishes the reversion date inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\" Also bills a separate cache-storage dimension at $1.00 per 1M tokens per hour, not modeled by this schema. Batch/Flex bill at exactly 50% of Standard and Priority at exactly 1.8x, in both the current and post-reversion periods — now modeled as service-tier variants below.",
      effectiveDate: "2026-08-14",
      variants: [
        {
          label: "Standard (from 2027)",
          conditions: { from: "2027-01-01T00:00:00Z" },
          inputUsd: 1.5,
          cachedUsd: 0.15,
          outputUsd: 7.5,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14. The page publishes this reversion inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\"",
        },
        {
          label: "Batch",
          conditions: { serviceTier: "batch", until: "2027-01-01T00:00:00Z" },
          inputUsd: 0.375,
          cachedUsd: 0.0375,
          outputUsd: 1.875,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read (querySelectorAll('table') + textContent — this page's pricing tables live inside collapsed accordion/tab panels that document.body.innerText silently omits, a known trap on this exact page). The Gemini 3.6 Flash \"Batch\" tab publishes $0.375/M input, $0.0375/M cached, $1.875/M output through December 31, 2026 — exactly 50% of Standard, identical to 3.7 Flash's Batch tier.",
        },
        {
          label: "Batch (from 2027)",
          conditions: { serviceTier: "batch", from: "2027-01-01T00:00:00Z" },
          inputUsd: 0.75,
          cachedUsd: 0.075,
          outputUsd: 3.75,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.6 Flash \"Batch\" tab publishes $0.75/M input, $0.075/M cached, $3.75/M output starting January 1, 2027 — exactly 50% of Standard's post-reversion rate.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex", until: "2027-01-01T00:00:00Z" },
          inputUsd: 0.375,
          cachedUsd: 0.0375,
          outputUsd: 1.875,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.6 Flash \"Flex\" tab publishes the same $0.375/M input, $0.0375/M cached, $1.875/M output as Batch through December 31, 2026 — Google prices Flex and Batch identically but bills them as separate service tiers.",
        },
        {
          label: "Flex (from 2027)",
          conditions: { serviceTier: "flex", from: "2027-01-01T00:00:00Z" },
          inputUsd: 0.75,
          cachedUsd: 0.075,
          outputUsd: 3.75,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.6 Flash \"Flex\" tab publishes $0.75/M input, $0.075/M cached, $3.75/M output starting January 1, 2027, matching Batch.",
        },
        {
          label: "Priority",
          conditions: { serviceTier: "priority", until: "2027-01-01T00:00:00Z" },
          inputUsd: 1.35,
          cachedUsd: 0.135,
          outputUsd: 6.75,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.6 Flash \"Priority\" tab publishes $1.35/M input, $0.135/M cached, $6.75/M output through December 31, 2026 — exactly 1.8x Standard.",
        },
        {
          label: "Priority (from 2027)",
          conditions: { serviceTier: "priority", from: "2027-01-01T00:00:00Z" },
          inputUsd: 2.7,
          cachedUsd: 0.27,
          outputUsd: 13.5,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15. The Gemini 3.6 Flash \"Priority\" tab publishes $2.70/M input, $0.27/M cached, $13.50/M output starting January 1, 2027 — exactly 1.8x Standard's post-reversion rate.",
        },
      ],
    },
  ],
};
