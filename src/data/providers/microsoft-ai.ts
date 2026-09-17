import type { Provider } from "../types";

export const microsoftAi: Provider = {
  slug: "microsoft-ai",
  name: "Microsoft AI",
  tagline: "MAI-Thinking-1 and MAI-Code-1.1-Flash bring Microsoft's own reasoning and coding models to Microsoft Foundry.",
  intro: [
    "MAI-Thinking-1 is Microsoft's first-party reasoning model for math, coding, and enterprise workloads. It is in public preview on Microsoft Foundry with a 256K-token context window and a 64K maximum output, using Global Standard deployment only; PTU is not currently supported.",
    "Azure's retail feed now exposes the model's named input, cached-input, and output meters. The commercial Global majority is $2.00/$0.20/$8.00 per 1M tokens; separate US Government rows are higher and are excluded from this commercial comparison lane.",
    "MAI-Code-1.1-Flash is Microsoft's lightweight coding model, now exposed as a separately named Microsoft Foundry Global Standard lane at $0.20/$0.02/$1.20 per 1M input, cached-input, and output tokens. The feed has a higher-priced US Government minority, which is excluded from the commercial-majority comparison lane.",
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
    {
      model: "MAI-Code-1.1-Flash",
      tier: "Global",
      inputUsd: 0.2,
      cachedUsd: 0.02,
      outputUsd: 1.2,
      confidence: "official",
      notes:
        "Microsoft Foundry Global Standard lane. The commercial majority excludes two higher-priced US Government regions; the model is a lightweight coding model rather than a general-purpose reasoning lane.",
      sourceNote:
        "Azure Retail Prices API, serviceName 'Foundry Models', productName 'MAI Models', captured 2026-09-17: effective 2026-09-01 meters 'Code 1.1 Flash Input glbl 1M Tokens' at $0.20/M, 'Code 1.1 Flash Cd Input glbl 1M Tokens' at $0.02/M, and 'Code 1.1 Flash Output Glbl 1M Tokens' at $1.20/M across 35 commercial regions. The same meters carry two US Government rows at $0.25/$0.025/$1.50, excluded from the commercial-majority lane. Microsoft AI's official August 11 announcement identifies MAI-Code-1.1-Flash as Microsoft's coding model and says it is in production in GitHub Copilot.",
      effectiveDate: "2026-09-01",
    },
  ],
};
