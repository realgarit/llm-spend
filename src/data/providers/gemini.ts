import type { Provider } from "../types";

export const gemini: Provider = {
  slug: "gemini",
  name: "Gemini",
  org: "Google",
  tagline: "Gemini 3.8 Flash is the new flagship at $0.75/$0.075/$3.75 per M through year-end, with the same introductory pricing schedule as 3.7 and 3.6 Flash.",
  intro: [
    "Gemini 3.8 Flash is now the catalog's flagship Gemini model for long-horizon software engineering, agentic and multimodal work. Google publishes $0.75/M input, $0.075/M cached, $3.75/M output through 2026-12-31, reverting to $1.50/$0.15/$7.50 on 2027-01-01. Batch, Flex and Priority service tiers are modeled at their published prices, and the model has a 1M-token context window with 65,536 maximum output tokens. Gemini 3.7 and 3.6 Flash remain listed at the same introductory schedule; Gemini 3.5 Flash remains unchanged at $1.50/$0.15/$9.00.",
  ],
  entries: [
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
      model: "Gemini 3.7 Flash",
      tier: "Global",
      inputUsd: 0.75,
      cachedUsd: 0.075,
      outputUsd: 3.75,
      confidence: "official",
      notes:
        "New flagship Flash model; same promotional structure as 3.6 Flash — $0.75/$0.075/$3.75 through 2026-12-31, reverting to $1.50/$0.15/$7.50 on 2027-01-01. Priced identically to 3.6 Flash on every dimension.",
      sourceNote:
        "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14; page stamped \"Last updated 2026-08-13 UTC\", same page as the 3.6 Flash row below. Google describes it as \"Our most capable Flash model for agentic workflows and multimodal reasoning.\" The reversion date is published inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\" Batch/Flex bill at exactly 50% of Standard and Priority at exactly 1.8x, in both the current and post-reversion periods — now modeled as service-tier variants below.",
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
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read (querySelectorAll('table') + textContent — this page's pricing tables live inside collapsed accordion/tab panels that document.body.innerText silently omits, a known trap on this exact page). The Gemini 3.7 Flash \"Batch\" tab publishes $0.375/M input, $0.0375/M cached, $1.875/M output through December 31, 2026 — exactly 50% of Standard.",
        },
        {
          label: "Batch (from 2027)",
          conditions: { serviceTier: "batch", from: "2027-01-01T00:00:00Z" },
          inputUsd: 0.75,
          cachedUsd: 0.075,
          outputUsd: 3.75,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.7 Flash \"Batch\" tab publishes $0.75/M input, $0.075/M cached, $3.75/M output starting January 1, 2027 — exactly 50% of Standard's post-reversion rate.",
        },
        {
          label: "Flex",
          conditions: { serviceTier: "flex", until: "2027-01-01T00:00:00Z" },
          inputUsd: 0.375,
          cachedUsd: 0.0375,
          outputUsd: 1.875,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.7 Flash \"Flex\" tab publishes the same $0.375/M input, $0.0375/M cached, $1.875/M output as Batch through December 31, 2026 — Google prices Flex and Batch identically but bills them as separate service tiers.",
        },
        {
          label: "Flex (from 2027)",
          conditions: { serviceTier: "flex", from: "2027-01-01T00:00:00Z" },
          inputUsd: 0.75,
          cachedUsd: 0.075,
          outputUsd: 3.75,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.7 Flash \"Flex\" tab publishes $0.75/M input, $0.075/M cached, $3.75/M output starting January 1, 2027, matching Batch.",
        },
        {
          label: "Priority",
          conditions: { serviceTier: "priority", until: "2027-01-01T00:00:00Z" },
          inputUsd: 1.35,
          cachedUsd: 0.135,
          outputUsd: 6.75,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15 via direct table DOM read. The Gemini 3.7 Flash \"Priority\" tab publishes $1.35/M input, $0.135/M cached, $6.75/M output through December 31, 2026 — exactly 1.8x Standard.",
        },
        {
          label: "Priority (from 2027)",
          conditions: { serviceTier: "priority", from: "2027-01-01T00:00:00Z" },
          inputUsd: 2.7,
          cachedUsd: 0.27,
          outputUsd: 13.5,
          confidence: "official",
          sourceNote:
            "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-15. The Gemini 3.7 Flash \"Priority\" tab publishes $2.70/M input, $0.27/M cached, $13.50/M output starting January 1, 2027 — exactly 1.8x Standard's post-reversion rate.",
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
    {
      model: "Gemini 3.5 Flash",
      tier: "Global",
      inputUsd: 1.5,
      cachedUsd: 0.15,
      outputUsd: 9.0,
      confidence: "official",
      notes: "~25% cheaper than 3.1 Pro; beats it on coding/agentic benchmarks.",
      sourceNote:
        "Google pricing page. Cached-input rate now published on the same page (captured 2026-07-22).",
      effectiveDate: "2026-07-21",
    },
  ],
};
