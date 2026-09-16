import type { Provider } from "../types";

export const microsoftAi: Provider = {
  slug: "microsoft-ai",
  name: "Microsoft AI",
  tagline: "MAI-Thinking-1 adds Microsoft's own 256K reasoning model to Microsoft Foundry at $2/$0.20/$8 per M.",
  intro: [
    "MAI-Thinking-1 is Microsoft's first-party reasoning model for math, coding, and enterprise workloads. It is in public preview on Microsoft Foundry with a 256K-token context window and a 64K maximum output, using Global Standard deployment only; PTU is not currently supported.",
    "Azure's retail feed now exposes the model's named input, cached-input, and output meters. The commercial Global majority is $2.00/$0.20/$8.00 per 1M tokens; separate US Government rows are higher and are excluded from this commercial comparison lane.",
  ],
  entries: [
    {
      model: "MAI-Thinking-1",
      tier: "Global",
      inputUsd: 2.0,
      cachedUsd: 0.2,
      outputUsd: 8.0,
      contextWindow: 256_000,
      maxOutput: 64_000,
      confidence: "official",
      notes:
        "Microsoft Foundry public preview, Global Standard only. PTU deployment is not currently supported. The commercial majority excludes the two higher-priced US Government regions.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'MAI Models', captured 2026-09-16: effective 2026-08-01 meters 'MAI-Thinking-1 Inp glbl 1M Tokens' at $2.00/M, 'MAI-Thinking-1 Cd Inp glbl 1M Tokens' at $0.20/M, and 'MAI-Thinking-1 Opt glbl 1M Tokens' at $8.00/M across 32 commercial regions. The same meters carry separate usgovarizona/usgovvirginia rows at $2.50/$0.25/$10.00, excluded from the commercial-majority lane. Microsoft Learn confirms model version 2026-06-01, GlobalStandard deployment, 256K context and 64K output cap; Microsoft AI announced the model as a public-preview Foundry model on 2026-08-12.",
      effectiveDate: "2026-08-01",
    },
  ],
};
