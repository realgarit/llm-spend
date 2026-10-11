import type { Provider } from "../types";

export const microsoftDecisions: Provider = {
  slug: "microsoft-decisions",
  name: "Microsoft Decision Models",
  org: "Microsoft",
  tagline: "Microsoft-Decision-1 scores bounded choices at $0.042 per million input tokens.",
  intro: [
    "Microsoft-Decision-1 is a Foundry model for classification, routing, ranking, and evaluation. It returns calibrated scores for fixed answer options rather than generated prose, and supports a 32K-token context.",
    "The Foundry blog lists $0.042/M input for US and EU Data Zone deployments, with output listed as N/A; Microsoft's developer article says output tokens are free. The Azure Retail Prices API lists a $0.042/M Global meter effective October 1. Microsoft Learn documents both Global Standard and Data Zone Standard deployment types. This decision-scoring model is listed separately from generative workload comparisons.",
  ],
  entries: [
    {
      model: "Microsoft-Decision-1",
      host: "Microsoft Foundry",
      tier: "Global",
      inputUsd: 0.042,
      cachedUsd: null,
      outputUsd: 0,
      contextWindow: 32_768,
      confidence: "official",
      notes:
        "Decision-scoring model for predefined choices; it returns structured probability scores instead of generated text. Microsoft lists output tokens as free.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', captured 2026-10-11: the 37-region Global meter 'Microsoft Decision 1 1M Tokens' is $0.042 per 1M tokens, effective 2026-10-01; its SKU metadata is 'Pi 1 glbl'. Microsoft's developer article says output tokens are free. Microsoft Learn documents GlobalStandard and DataZoneStandard deployments. The Microsoft Foundry catalog lists a 32,768-token context and JSON output.",
      effectiveDate: "2026-10-01",
    },
    {
      model: "Microsoft-Decision-1",
      host: "Microsoft Foundry",
      tier: "DataZone",
      inputUsd: 0.042,
      cachedUsd: null,
      outputUsd: 0,
      contextWindow: 32_768,
      confidence: "official",
      notes:
        "Microsoft's launch table lists the same $0.042/M input rate for US and EU Data Zone deployments; the accompanying developer article says output tokens are free.",
      sourceNote:
        "Microsoft Foundry Blog, published 2026-10-09 and checked 2026-10-11, lists Microsoft-Decision-1 at $0.042 per 1M input tokens in both US Data Zone and EU Data Zone, with output listed as N/A. Microsoft's developer article states output tokens are free. Microsoft Learn documents DataZoneStandard as a supported deployment type. The Foundry catalog lists a 32,768-token context and JSON output. The Azure Retail Prices API separately lists only a Global meter for this model as of 2026-10-11, so the Data Zone amount is sourced to Microsoft's launch table rather than inferred from that meter.",
      effectiveDate: "2026-10-11",
    },
  ],
};
