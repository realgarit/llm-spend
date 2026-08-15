import type { Provider } from "../types";

export const gemini: Provider = {
  slug: "gemini",
  name: "Gemini",
  org: "Google",
  tagline: "Gemini 3.7 Flash is the new flagship, and Gemini 3.6 Flash's price is halved to match it — both $0.75/$0.075/$3.75 per M through year-end.",
  intro: [
    "Gemini 3.7 Flash is now the catalog's flagship Gemini model for agentic and multimodal work. The same pricing update halved Gemini 3.6 Flash to match it exactly: both now $0.75/M input, $0.075/M cached, $3.75/M output, a promotional rate published through 2026-12-31 that reverts to $1.50/$0.15/$7.50 on 2027-01-01. Gemini 3.5 Flash remains listed for comparison, unchanged at $1.50/$0.15/$9.00.",
  ],
  entries: [
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
        "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14; page stamped \"Last updated 2026-08-13 UTC\", same page as the 3.6 Flash row below. Google describes it as \"Our most capable Flash model for agentic workflows and multimodal reasoning.\" The reversion date is published inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\" Batch/Flex bill at 50% of standard, Priority at 1.8x — tiers this schema does not model.",
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
        "Gemini API pricing page (ai.google.dev/gemini-api/docs/pricing), captured 2026-08-14; page stamped \"Last updated 2026-08-13 UTC\" and publishes the reversion date inline per price cell, verbatim: \"$0.75 through December 31, 2026.$1.50 starting January 1, 2027.\" Also bills a separate cache-storage dimension at $1.00 per 1M tokens per hour, not modeled by this schema.",
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
