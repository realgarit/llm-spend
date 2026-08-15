export interface ChangelogEntry {
  /** ISO date YYYY-MM-DD. */
  date: string;
  title: string;
  /** Paragraphs / bullet lines of body text. */
  body: string[];
  tag?: "launch" | "pricing" | "model" | "methodology";
  /** Supporting articles and pricing documentation, rendered after the body. */
  sources: ChangelogSource[];
  /** Date every source URL and its relevance were last checked. */
  sourcesVerifiedOn: string;
}

export interface ChangelogSource {
  label: string;
  href: string;
}

/**
 * Dated changelog. Newest first. Add an entry whenever a rate changes, a model
 * launches, or the methodology is revised. This is what keeps the site
 * trustworthy over time.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-08-14",
    title: "Rate-variant rows now render the price actually in effect, not just the base rate",
    tag: "methodology",
    body: [
      "The five rows carrying a scheduled rate variant — DeepSeek-V4 Pro (Direct), DeepSeek-V4 Flash (Direct), Gemini 3.6 Flash, Gemini 3.7 Flash, and Qwen3.7 Max (Promo) — now display whichever rate is actually in force right now, resolved with the same logic added in the previous methodology update, instead of always showing the row's flat base fields. Each also gets a small badge naming the active variant when one applies, a note on when the price next changes (a plain countdown once a variant regime is under way, or a '<label> begins <date>, UTC' announcement while it is still pending — none of today's five regimes has started yet), and every published variant's own numbers laid out underneath the row, so the full rate card is visible without clicking anything.",
      "No rate changed today. DeepSeek's peak/off-peak split still takes effect 2026-08-16T16:00:00Z, Qwen3.7 Max's promo still reverts 2026-09-01T00:00:00Z, and Gemini 3.6/3.7 Flash still revert 2027-01-01T00:00:00Z — this entry is the page catching up to data the catalog already had. The practical effect is that the DeepSeek rows stop showing a stale flat rate the moment the peak/off-peak switch lands: the displayed price now self-corrects in the visitor's browser, without waiting on a rebuild.",
      "All variant numbers are present in the server-rendered page, since they are static published facts; only which variant is marked 'active' and the countdown text depend on the reader's clock, and both refresh automatically every 30 seconds so a boundary crossed while the page is left open updates on its own.",
    ],
    sources: [
      { label: "DeepSeek pricing", href: "https://api-docs.deepseek.com/quick_start/pricing" },
      { label: "Gemini API pricing", href: "https://ai.google.dev/gemini-api/docs/pricing" },
    ],
    sourcesVerifiedOn: "2026-08-14",
  },
  {
    date: "2026-08-14",
    title: "DeepSeek, Gemini and Qwen's scheduled rate changes are now modeled as data",
    tag: "methodology",
    body: [
      "No displayed rate changes today. This is a methodology update: the catalog can now record a rate that changes at a known future instant as structured data (an exact effective timestamp plus its own published numbers), instead of only describing the upcoming change in a row's notes text. Three rows that already carried this kind of prose description are the first to move onto the new structure.",
      "DeepSeek-V4 Pro (Direct) and DeepSeek-V4 Flash (Direct) each gain two scheduled variants, both effective 2026-08-16T16:00:00Z: a Peak rate for 01:00-04:00 and 06:00-10:00 UTC, and an Off-peak rate — exactly half of Peak on every dimension — for every other hour. Per 1M tokens (cache miss / cache hit / output): V4 Pro peak $1.32 / $0.044 / $3.96, off-peak $0.66 / $0.022 / $1.98; V4 Flash peak $0.44 / $0.014 / $1.32, off-peak $0.22 / $0.007 / $0.66. Today's flat rates ($0.435/$0.003625/$0.87 and $0.14/$0.0028/$0.28) are unaffected until that instant.",
      "Gemini 3.6 Flash and Gemini 3.7 Flash each gain one scheduled variant reverting to list price — $1.50/M input, $0.15/M cached, $7.50/M output — effective 2027-01-01T00:00:00Z, matching the reversion Google already publishes inline on its pricing page. Both rows keep showing today's promotional rate ($0.75/$0.075/$3.75) until then.",
      "Qwen3.7 Max (Promo) gains one scheduled variant reverting to list price — $2.50/M input, $0.25/M cached, $7.50/M output — effective 2026-09-01T00:00:00Z, the date Alibaba Cloud's campaign page states the discount 'runs until.' The row keeps showing today's discounted rate ($1.25/$0.125/$3.75) until then.",
      "The site still renders each row's flat rate directly, so none of this is visible on the pages yet — it is data plumbing for a later phase that will make the displayed price switch automatically at these instants.",
    ],
    sources: [
      { label: "DeepSeek pricing", href: "https://api-docs.deepseek.com/quick_start/pricing" },
      { label: "Gemini API pricing", href: "https://ai.google.dev/gemini-api/docs/pricing" },
      {
        label: "Alibaba Cloud — Qwen discount campaign page",
        href: "https://www.alibabacloud.com/en/campaign/qwen-discount",
      },
    ],
    sourcesVerifiedOn: "2026-08-14",
  },
  {
    date: "2026-08-14",
    title: "Gemini 3.7 Flash added; Gemini 3.6 Flash's price halved through year-end",
    tag: "model",
    body: [
      "Google's Gemini API pricing page now shows Gemini 3.6 Flash at $0.75/M input, $0.075/M cached input, and $3.75/M output — half its previous $1.50/$0.15/$7.50 rate. The page publishes this as a promotional rate running through December 31, 2026, reverting to $1.50/$0.15/$7.50 on January 1, 2027; each price cell states this inline (\"$0.75 through December 31, 2026. $1.50 starting January 1, 2027.\").",
      "A new Gemini 3.7 Flash — Google's own description: \"our most capable Flash model for agentic workflows and multimodal reasoning\" — is added to the catalog as the new flagship, tracked at the identical promotional rate: $0.75/M input, $0.075/M cached, $3.75/M output, with the same reversion terms on 2027-01-01.",
      "Gemini 3.5 Flash is unaffected and stays listed for comparison at $1.50/M input, $0.15/M cached, $9.00/M output. Google also publishes Batch and Flex pricing at 50% of the standard rate and a Priority tier at 1.8x, but this site's schema does not model those tiers.",
    ],
    sources: [{ label: "Gemini API pricing", href: "https://ai.google.dev/gemini-api/docs/pricing" }],
    sourcesVerifiedOn: "2026-08-14",
  },
  {
    date: "2026-08-14",
    title: "DeepSeek's price increase gets a date: peak/off-peak billing from August 16",
    tag: "pricing",
    body: [
      "DeepSeek's pricing page footnote — previously undated — now gives an exact effective time for the API's long-signalled price increase: peak / off-peak billing begins at 16:00 UTC on August 16, 2026. Off-peak rates are set at exactly half of peak. Peak hours are 01:00–04:00 and 06:00–10:00 UTC; every other hour is off-peak.",
      "Current flat rates ($0.435/M input, $0.003625/M cached, $0.87/M output for V4 Pro; $0.14/M input, $0.0028/M cached, $0.28/M output for V4 Flash) remain in force until that moment, and the catalog's two DeepSeek Direct rows are unchanged for now.",
      "From 2026-08-16 16:00 UTC, the new rates (per 1M tokens, cache hit / cache miss / output) are: DeepSeek-V4 Flash off-peak $0.007 / $0.22 / $0.66, peak $0.014 / $0.44 / $1.32. DeepSeek-V4 Pro off-peak $0.022 / $0.66 / $1.98, peak $0.044 / $1.32 / $3.96.",
      "Even the off-peak rate is an increase on every dimension versus today's flat rate — e.g. V4 Pro output rises 2.28x ($0.87 to $1.98), V4 Flash output rises 2.36x ($0.28 to $0.66), and V4 Pro's cache-hit rate rises from $0.003625/M to $0.022/M. Peak-hour rates run roughly double the off-peak figures again.",
      "This affects only DeepSeek's first-party direct API. The Microsoft Foundry (Global/DataZone) and Fireworks-hosted DeepSeek rows are Azure/Fireworks meters and are unaffected. This site's schema does not model time-of-day pricing, so the change taking effect will require a scope decision on how to represent it.",
    ],
    sources: [
      { label: "DeepSeek pricing", href: "https://api-docs.deepseek.com/quick_start/pricing" },
      { label: "DeepSeek API updates", href: "https://api-docs.deepseek.com/updates" },
    ],
    sourcesVerifiedOn: "2026-08-14",
  },
  {
    date: "2026-08-14",
    title: "Mistral Medium 3.5's cached input rate is now officially published",
    tag: "methodology",
    body: [
      "Mistral now publishes Mistral Medium 3.5's cached-input rate as an explicit dollar figure — $0.15/M — on its new consolidated inference pricing page, alongside Input ($1.50/M) and Output ($7.50/M). No rate changed: this is the same $0.15/M figure the catalog already carried, previously back-derived from Mistral's published -90%-off cache discount rule rather than read directly off a price list. The Direct row's cached-input confidence is upgraded from derived to official to reflect the new first-party source, which supersedes the previously-cited mistral.ai/pricing/api page.",
      "The two Mistral Foundry rows (Global and DataZone) are unchanged and still correctly show no cached rate — no Azure cache meter exists for Mistral Medium 3.5 on either tier, re-confirmed in today's full Foundry sweep.",
    ],
    sources: [
      { label: "Mistral inference pricing", href: "https://docs.mistral.ai/inference/pricing" },
      { label: "Mistral Medium 3.5 model card", href: "https://docs.mistral.ai/models/mistral-medium-3-5-26-04" },
    ],
    sourcesVerifiedOn: "2026-08-14",
  },
  {
    date: "2026-08-12",
    title: "Grok 4.6 added — xAI's new flagship, direct API only",
    tag: "model",
    body: [
      "xAI released Grok 4.6 today, its new flagship model, labeled \"Latest\" in xAI's docs and superseding Grok 4.5 as the headline model. On xAI's direct API it prices at $2.00/M input, $0.50/M cached input, and $6.00/M output for prompts under 200K tokens, doubling to $4.00/M, $1.00/M, and $12.00/M above that threshold — the same long-context doubling pattern as Grok 4.5. Input and output prices are identical to Grok 4.5's, but cached input is higher ($0.50/M vs. $0.30/M).",
      "Grok 4.6 has a 500K-token context window and accepts text and image input with text output. It is direct-API only: a full Azure Retail Prices API sweep on 2026-08-12 found zero meters referencing \"4.6\", so it is not yet available on Microsoft Foundry. The existing Grok 4.5 row is unchanged and stays listed for comparison ($2.00/$0.30/$6.00, re-verified today).",
      "Separately, Anthropic's pricing docs page has caught up to the permanent-pricing announcement covered in the 2026-08-11 entry below: it now shows a single Claude Sonnet 5 row and states verbatim that the $2/$10 per-million rate \"is now the standard price\" and the planned September 1 increase \"will not occur.\" This closes the docs-page-lag caveat that had been carried in both Sonnet 5 sourceNotes.",
    ],
    sources: [
      {
        label: "xAI — Grok API pricing (Grok 4.6: $2.00/$0.50/$6.00 per M, doubling above 200K prompt tokens)",
        href: "https://docs.x.ai/developers/pricing",
      },
      {
        label: "xAI — API release notes (Grok 4.6 entry dated August 12, 2026)",
        href: "https://docs.x.ai/developers/release-notes",
      },
      {
        label: "xAI — models overview (Grok 4.6 listed as \"Latest\")",
        href: "https://docs.x.ai/developers/models",
      },
      {
        label: "Anthropic — Claude API pricing (Sonnet 5's $2/$10 rate now shown as standard, not introductory)",
        href: "https://platform.claude.com/docs/en/about-claude/pricing",
      },
    ],
    sourcesVerifiedOn: "2026-08-12",
  },
  {
    date: "2026-08-11",
    title: "Claude Sonnet 5's introductory pricing made permanent — planned Sept 1 increase cancelled",
    tag: "pricing",
    body: [
      "Anthropic's official @claudeai account announced on X at 9:03pm on 2026-08-10 that Claude Sonnet 5's introductory pricing — $2/M input, $0.20/M cached input, $10/M output — is now permanent: \"We launched Sonnet 5 in June at $2 per million input tokens and $10 per million output tokens through August 31, and that price will remain unchanged.\" This reverses the previously-published plan for the rate to rise to $3/M input, $0.30/M cached, $15/M output on 2026-09-01.",
      "The catalog's separate \"Standard\" rows (Direct and the Foundry CCU estimate) have been removed, since that $3/$0.30/$15 rate will now never take effect. The two \"Intro\" rows are renamed to plain \"Claude Sonnet 5\" — the rate was never actually time-limited after all, it just stopped rising — and their notes/sourceNote now record the cancellation. Rates are unchanged: $2/M input, $0.20/M cached, $10/M output on both the Direct row and the Foundry (Global, estimate) row.",
      "Anthropic's own pricing page had not been updated as of 2026-08-11 and still shows the old two-tier structure — \"$2/$10 through August 31, 2026\" and \"$3/$15 starting September 1, 2026\" as separate rows. Treat that as the page not having caught up to the X announcement yet, not as a contradiction; the X post is the authoritative current source until the docs page is revised.",
    ],
    sources: [
      {
        label: "Anthropic (@claudeai) on X — Claude Sonnet 5 introductory pricing made permanent",
        href: "https://x.com/claudeai/status/2086891169217122586",
      },
      {
        label: "Anthropic — Claude API pricing (not yet updated to reflect the announcement as of 2026-08-11)",
        href: "https://platform.claude.com/docs/en/about-claude/pricing",
      },
    ],
    sourcesVerifiedOn: "2026-08-11",
  },
  {
    date: "2026-08-10",
    title: "Qwen3.7 Max's 50% discount now has an official end date: August 31, 2026",
    tag: "pricing",
    body: [
      "Alibaba Cloud's campaign page for Qwen3.8-Max (\"Qwen3.8-Max is Here\") states, in two places, that the Qwen3.7-Max limited-time 50% discount \"runs until August 31, 2026,\" and that it \"applies to all 4 billing items: Input, Output, Explicit Cache Creation, and Explicit Cache Hit.\" This is the first official end date published for a promo that has been open-ended since it launched — Model Studio's own pricing page still shows only the undated \"Limited-time 50% off\" label.",
      "No rate change today: the tracked promo rate ($1.25/M input, $0.125/M cached, $3.75/M output) stays in effect through 2026-08-31. From 2026-09-01 it reverts to list price ($2.50/M input, $0.25/M cached, $7.50/M output) — the same day Claude Sonnet 5's introductory pricing ends.",
      "Qwen3.7 Plus's separate 20%-off discount is unaffected by this and still carries no published end date anywhere.",
    ],
    sources: [
      {
        label: "Alibaba Cloud campaign: Qwen3.8-Max is Here (Qwen3.7-Max 50% off until Aug 31, 2026)",
        href: "https://www.alibabacloud.com/en/campaign/qwen-discount",
      },
      { label: "Alibaba Model Studio — model pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
    ],
    sourcesVerifiedOn: "2026-08-10",
  },
  {
    date: "2026-08-07",
    title: "Provenance fix: OpenAI embedding rows now cite their Foundry meter, not OpenAI's pricing page",
    tag: "methodology",
    body: [
      "The three OpenAI embedding rows (text-embedding-3-large, text-embedding-3-small, text-embedding-ada-002) are Foundry Global-tier entries, but each carried a sourceNote reading only \"OpenAI pricing page.\" That citation was wrong on two counts: a Foundry Global row should cite the Azure meter that actually publishes the rate, and OpenAI's own pricing page no longer lists per-token embeddings pricing at all — confirmed by a raw DOM dump (15 pricing tables, none with an embeddings row; \"ada-002\" appears 0 times) and by Internet Archive snapshots from 2026-06-05 through 2026-08-04, none of which show an embeddings row either.",
      "Each sourceNote now cites the live Azure Retail Prices API meter instead: 'text-embedding-3-large-glbl Tokens' at $0.00013/1K ($0.13/M) across 17 commercial regions, 'text-embedding-3-small-glbl Tokens' at $0.00002/1K ($0.02/M) across 17 regions, and 'embedding-ada-glbl Tokens' at $0.0001/1K ($0.10/M) across 15 regions — all effective 2024-06-01, captured 2026-08-07. The figures are independently corroborated by OpenAI's embeddings guide, which publishes pages-per-dollar at roughly 800 tokens/page (62,500 for -3-small, 9,615 for -3-large, 12,500 for ada-002) that invert to exactly these three rates.",
      "Rates are unchanged — still $0.13 / $0.02 / $0.10 per M input, no output or cached price — and confidence stays official on all three rows, the same treatment already given the Cohere Embed v4 Foundry rows: the Azure meter is itself an official published per-token rate. Only the provenance shown on the site changed.",
    ],
    sources: [
      {
        label: "Azure Retail Prices API — Foundry Models embedding meters",
        href: "https://prices.azure.com/api/retail/prices?%24filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(meterName%2C%27embedding%27)",
      },
      { label: "OpenAI — API pricing (no embeddings row)", href: "https://developers.openai.com/api/docs/pricing" },
      { label: "OpenAI — embeddings guide (pages-per-dollar figures)", href: "https://developers.openai.com/api/docs/guides/embeddings" },
    ],
    sourcesVerifiedOn: "2026-08-07",
  },
  {
    date: "2026-08-04",
    title: "Qwen3.8 Max added — Alibaba's new flagship gets a per-token price",
    tag: "model",
    body: [
      "Alibaba's new flagship qwen3.8-max now has published per-token pricing on Model Studio's International endpoint: $2.00/M input and $6.00/M output, a single price tier across the full 0–1M token window with Non-Thinking and Thinking modes priced identically. It is GA, not a preview label. This closes a watch item open since 2026-07-23 — until today the model was reachable only via Token Plan credits, with no published per-token rate.",
      "Cached input is derived at 10% of input ($0.20/M) per Model Studio's published context-cache rule, the same convention used across the rest of the Qwen family. The model also carries a 1M-token free quota valid for 90 days. A separate Global deployment scope prices the model lower, at $1.65/M input and $4.951/M output; the tracked lane stays International, matching every other Qwen row in this catalog.",
      "Qwen3.7 Max and Plus's limited-time promotional discounts remain live, and qwen3.6-max-preview's 2026-10-10 deprecation (with qwen3.7-max as the named replacement) is unaffected by this addition.",
    ],
    sources: [
      { label: "Alibaba Model Studio — model pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
      { label: "Alibaba Model Studio — supported models", href: "https://www.alibabacloud.com/help/en/model-studio/models" },
    ],
    sourcesVerifiedOn: "2026-08-04",
  },
  {
    date: "2026-08-04",
    title: "OpenAI cuts GPT-5.6 Terra and Luna direct-API prices; Microsoft Foundry has not followed",
    tag: "pricing",
    body: [
      "OpenAI's official changelog confirms a direct-API price cut effective 2026-07-30: GPT-5.6 Terra costs 20% less (now $2.00/M input, $0.20/M cached, $12.00/M output; long context $4.00/$0.40/$18.00), and GPT-5.6 Luna costs 80% less (now $0.20/M input, $0.02/M cached, $1.20/M output; long context $0.40/$0.04/$1.80). Sol is unchanged at $5.00/$0.50/$30.00.",
      "A full Azure Retail Prices API sweep run today found the Foundry serverless meters for both models unchanged: Terra Global is still $2.50/$0.25/$15.00 (long context $5.00/$0.50/$22.50) and Luna Global is still $1.00/$0.10/$6.00 (long context $2.00/$0.20/$9.00), both still effective 2026-07-01. That breaks the Foundry-matches-direct 1:1 parity that had held since 2026-07-21: Azure now runs about 1.25x direct on Terra and about 5x direct on Luna. Sol's parity is unaffected since its direct price didn't move.",
      "No catalog rate numbers changed as part of this entry — the Foundry rows still reflect the live Foundry meters. The four affected rows' notes and sourceNotes were updated to record the direct-API cut and flag the gap; watch for the Foundry meters to follow.",
    ],
    sources: [
      { label: "OpenAI — API pricing", href: "https://developers.openai.com/api/docs/pricing" },
      { label: "OpenAI — API changelog", href: "https://developers.openai.com/api/docs/changelog" },
      { label: "Azure Retail Prices API — GPT-5.6 Terra meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(meterName,%20%275.6%20terra%27)" },
    ],
    sourcesVerifiedOn: "2026-08-04",
  },
  {
    date: "2026-08-01",
    title: "Qwen3.6 Max Preview receives an official deprecation date",
    tag: "model",
    body: [
      "Alibaba Model Studio now schedules the tracked qwen3.6-max-preview model for deprecation on October 10, 2026, with qwen3.7-max as the documented replacement. The catalog keeps the existing preview row for the time being and flags the deadline rather than removing a still-available model early.",
      "The current International pricing is unchanged: $1.30/M input and $7.80/M output for the ≤128K band tracked here (128K–256K remains $2/$12). No new Microsoft Foundry serverless token meter was found for Qwen in the 2026-08-01 sweep.",
    ],
    sources: [
      { label: "Alibaba Model Studio model lifecycle", href: "https://www.alibabacloud.com/help/en/model-studio/model-depreciation" },
      { label: "Alibaba Model Studio model pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
    ],
    sourcesVerifiedOn: "2026-08-01",
  },
  {
    date: "2026-07-29",
    title: "Cohere Embed v4 gains officially metered Foundry lanes; GLM-5-Turbo and MiniMax's current lineup added",
    tag: "pricing",
    body: [
      "Cohere Embed v4 is now shown on Microsoft Foundry Global ($0.12/M) and Data Zone ($0.132/M), both officially metered. Cohere itself no longer publishes a per-token Embed rate — its own pricing page now shows only dedicated Model Vault instances — so the direct-lane figure is marked derived rather than official; Azure's meter is currently the only published source for the $0.12/M rate.",
      "Added GLM-5-Turbo at $1.20/M input, $0.24/M cached input, $4.00/M output — priced between GLM-5 and GLM-5.1/5.2, with a 200K context window. It is Z.ai direct only; no Foundry meter exists for it.",
      "Added MiniMax M3 and MiniMax M2.7 as new direct-API lanes, both at $0.30/M input, $0.06/M cached input, $1.20/M output. MiniMax M2.5, already tracked on Foundry, is now listed as a legacy model on MiniMax's own pricing page. M3's rate carries a 'Permanent 50% off' label with the list price struck through at exactly 2x and no stated end date.",
      "A full Foundry sweep on 2026-07-29 found no price change to any of the roughly 43 already-tracked rows, and no meter with an effective date on or after 2026-08-01.",
    ],
    sources: [
      { label: "Azure Retail Prices API — Foundry Models meters", href: "https://prices.azure.com/api/retail/prices" },
      { label: "Z.ai pricing", href: "https://docs.z.ai/guides/overview/pricing" },
      { label: "Z.ai GLM-5-Turbo model docs", href: "https://docs.z.ai/guides/llm/glm-5-turbo" },
      { label: "MiniMax pay-as-you-go pricing", href: "https://platform.minimax.io/docs/guides/pricing-paygo" },
      { label: "Cohere pricing", href: "https://cohere.com/pricing" },
      { label: "Cohere pricing FAQ", href: "https://docs.cohere.com/docs/how-does-cohere-pricing-work" },
      { label: "Internet Archive — Cohere pricing, 2025-07-16", href: "https://web.archive.org/web/20250716175654/https://cohere.com/pricing" },
    ],
    sourcesVerifiedOn: "2026-07-29",
  },
  {
    date: "2026-07-28",
    title: "Provenance fixes: Mistral Medium 3.5 Global effective date, Grok-4.3 Data Zone long-context rates documented",
    tag: "methodology",
    body: [
      "Corrected the Mistral Medium 3.5 Foundry Global row's sourceNote: the 'MM3.5 Inp/Outp glbl' meters are effective 2026-06-01 across 44 regions (including all 9 APAC regions), not 2026-07-01 as previously stated — the only 2026-07-01 Global row is the malaysiawest region onboarding at the same price. No prices changed; this is a documentation-only correction.",
      "Documented the Grok-4.3 Data Zone long-context rates, which exist alongside the already-tracked Global long-context note but had no Data Zone equivalent: $2.75/M input, $0.44/M cached input, $5.50/M output — a clean 1.1x the Global long-context rate ($2.50/$0.40/$5.00), consistent with the headline Data Zone premium. Headline Grok-4.3 Data Zone prices ($1.375/$0.22/$2.75) are unchanged.",
      "A full sweep of the Azure Retail Prices API found no new models and no price changes: Grok 4.5, any Qwen serverless per-token meter, and any Claude/Anthropic meter are all still absent from Foundry, and no meter carries an effectiveStartDate on or after 2026-08-01 — the anticipated non-Global price increase has not yet appeared.",
    ],
    sources: [
      { label: "Azure Retail Prices API — Foundry Models sweep (2026-07-28)", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27" },
      { label: "xAI pricing (Grok lineup: 4.3 → 4.5, no 4.4)", href: "https://docs.x.ai/developers/pricing" },
      { label: "Mistral pricing", href: "https://mistral.ai/pricing" },
    ],
    sourcesVerifiedOn: "2026-07-28",
  },
  {
    date: "2026-07-27",
    title: "APAC Data Zone carries a 1.20x premium, not 1.10x, on first-party OpenAI lines",
    tag: "pricing",
    body: [
      "A full sweep of the Azure Retail Prices API turned up a region split the catalog's single Data Zone row per model had been hiding: for Microsoft's first-party OpenAI lines, Data Zone is two prices, not one. US/EU data-zone regions bill the already-tracked 1.10x Global premium, but APAC data-zone regions (australiaeast, centralindia, eastasia, japaneast, japanwest, jioindiawest, koreacentral, southeastasia, southindia) bill a separate 1.20x Global premium, effective 2026-06-01. Concretely: GPT-5.2 Data Zone runs $1.925/$0.1925/$15.40 per M in US/EU but $2.10/$0.21/$16.80 in APAC; GPT-5.5 runs $5.50/$0.55/$33.00 in US/EU but $6.00/$0.60/$36.00 in APAC (long-context and the text-embedding-3-large/small rows scale the same way). GPT-5.3 chat and the whole GPT-5.6 family (Sol/Terra/Luna) have no APAC data-zone rows yet, and no third-party family (Grok, Kimi, GLM, MiniMax, Mistral, DeepSeek) shows this split at all — it's exclusive to Microsoft's first-party OpenAI-hosted lines. A customer deploying in an APAC region should budget for a real 20% Foundry premium, not the 10% a single Data Zone number implies.",
      "Added a new native DeepSeek-V4 Pro Data Zone lane at $1.91/M input, $0.16/M cached, $3.83/M output — a first-party Foundry deployment distinct from the Fireworks-hosted Data Zone lane already listed, and slightly cheaper than it ($1.925/$0.165/$3.828).",
      "Everything else re-verified unchanged: a full sweep of the Foundry price feed plus the direct-API pricing pages for every tracked provider found no rate changes. Grok 4.5, any Qwen serverless per-token meter, and any Claude/Anthropic meter still have no Foundry listing at all, and no meter in the feed carries an effective date on or after 2026-08-01 — the anticipated non-Global price increase has not yet appeared. Qwen3.7 Max and Plus's promotional discounts are still live, and Claude Sonnet 5's introductory pricing still runs through 2026-08-31.",
    ],
    sources: [
      { label: "Azure Retail Prices API — Foundry Models", href: "https://prices.azure.com/api/retail/prices?%24filter=serviceName%20eq%20%27Foundry%20Models%27" },
      { label: "Anthropic — model pricing", href: "https://platform.claude.com/docs/en/about-claude/pricing" },
      { label: "DeepSeek — API pricing", href: "https://api-docs.deepseek.com/quick_start/pricing/" },
      { label: "Z.ai — pricing", href: "https://docs.z.ai/guides/overview/pricing" },
      { label: "Alibaba Model Studio — model pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
      { label: "xAI — models and pricing", href: "https://docs.x.ai/docs/models" },
      { label: "Google — Gemini API pricing", href: "https://ai.google.dev/gemini-api/docs/pricing" },
    ],
    sourcesVerifiedOn: "2026-07-27",
  },
  {
    date: "2026-07-26",
    title: "MiniMax added, new Qwen and Grok/GPT-5.6 Foundry lanes, GLM and Mistral cache rates, corrected GPT-5.2/5.3 cache figures",
    tag: "pricing",
    body: [
      "Added a new MiniMax provider lane: MiniMax M2.5 and MiniMax 3 are resold on Microsoft Foundry as Data Zone-only serverless listings ($0.33/M input, $1.32/M output on both; cached input $0.033/M for M2.5 and $0.066/M for MiniMax 3), the same Data Zone-only situation as the GLM family — no Global-tier meter is published for either model.",
      "Added Qwen3.7 Flash, a new cheapest Qwen lane, at $0.10/M input and $0.40/M output (the 32K–256K context band, chosen to match the band already tracked for the existing Qwen3.6 Flash row so the two are directly comparable; the full published ladder runs $0.03/$0.13 at ≤32K up to $0.20/$0.80 at 256K–1M). Cached input is derived at 10% of input ($0.01/M), the same convention used across the rest of the Qwen family.",
      "Added two new official Foundry lanes for already-tracked models: Grok-4.3 Data Zone ($1.375/M input, $0.22/M cached, $2.75/M output — a clean 1.1x the tracked Global rate), and GPT-5.6 Terra Long Context ($5.00/$0.50/$22.50) and GPT-5.6 Luna Long Context ($2.00/$0.20/$9.00) on the Global tier, both previously only mentioned in a sibling row's notes.",
      "GLM-5.1 and GLM-5.2's Direct-lane rows now carry Z.ai's officially published cached-input rate ($0.26/M) and are relabeled 'Z.ai direct API' (from 'Fireworks direct API'), making the family's Direct lane internally consistent — Z.ai is the developer's own first-party API and its input/output rates already matched exactly. Mistral Medium 3.5's direct-API row now carries a derived cached-input rate ($0.15/M) based on Mistral's published -90%-off-input cache rule; both Foundry tiers remain uncached, confirmed against the Azure Retail Prices API.",
      "Corrected three rounded cached/input figures to their exact Azure meter values: GPT-5.3 Codex/Chat and GPT-5.2/Codex (Global) cached input from $0.18/M to $0.175/M, and GPT-5.2/Codex (Data Zone) input from $1.93/M to $1.925/M and cached input from $0.20/M to $0.1925/M.",
    ],
    sources: [
      { label: "Azure Retail Prices API — Foundry Models query", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Foundry Models'" },
      { label: "Alibaba Cloud Model Studio pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
      { label: "Z.ai official pricing", href: "https://docs.z.ai/guides/overview/pricing" },
      { label: "Mistral API pricing", href: "https://mistral.ai/pricing/api" },
    ],
    sourcesVerifiedOn: "2026-07-26",
  },
  {
    date: "2026-07-25",
    title: "Claude Opus 5 added — new Anthropic flagship, same pricing as Opus 4.8",
    tag: "model",
    body: [
      "Added Claude Opus 5, now GA per Anthropic's official Claude API pricing page. It prices identically to Opus 4.8 at $5/M base input, $0.50/M cache-hit input, and $25/M output, with the same 1M-token context window — no launch premium.",
      "Opus 5 uses the same newer tokenizer introduced with Claude 4.7-and-later models (and Claude Mythos Preview), which can use roughly 30% more tokens for the same text versus pre-4.7 models. As with Opus 4.8, there is no separate Foundry/Global listing for Opus 5 in this catalog yet — only the direct-API rate is tracked.",
    ],
    sources: [
      { label: "Anthropic — Claude API pricing", href: "https://platform.claude.com/docs/en/about-claude/pricing" },
    ],
    sourcesVerifiedOn: "2026-07-25",
  },
  {
    date: "2026-07-25",
    title: "GLM-5 added — the cheapest lane in the GLM family",
    tag: "model",
    body: [
      "Added the original GLM-5, which had been missing from the catalog even though it is still generally available and undercuts both GLM-5.1 and GLM-5.2. On Microsoft Foundry's Data Zone tier it bills $1.10/M input, $0.22/M cached input, and $3.52/M output — about 29% below 5.1/5.2 on input and 27% below on output, with the same 200K context window as 5.1 and 128K max output.",
      "Z.ai's own API lists it at $1.00/M input, $0.20/M cached input, and $3.20/M output. Every Foundry Data Zone meter is exactly 1.1x the corresponding direct rate, the standard Data Zone premium, so both sets of numbers corroborate each other on all three dimensions. As with GLM-5.1 and 5.2, no Global-tier meter is published — Data Zone is the only Foundry tier for this family.",
      "If you do not need GLM-5.2's 1M-token window, GLM-5 is the value pick in this family rather than a superseded model. Note that Z.ai's 'Limited-time Free' marker applies to cached-input storage, a per-hour billing dimension this catalog does not model, and not to the per-token rates above.",
    ],
    sources: [
      { label: "Azure Retail Prices API — FW GLM meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27glm%27)" },
      { label: "Z.ai official pricing", href: "https://docs.z.ai/guides/overview/pricing" },
      { label: "Z.ai GLM-5 model documentation", href: "https://docs.z.ai/guides/llm/glm-5" },
    ],
    sourcesVerifiedOn: "2026-07-25",
  },
  {
    date: "2026-07-23",
    title: "Mistral Medium 3.5 added — new Mistral lane on Foundry",
    tag: "model",
    body: [
      "Added a Mistral provider lane with Mistral Medium 3.5. Under the Microsoft–Mistral partnership announced 2026-07-21, the model is now resold on Microsoft Foundry as a serverless listing. Azure's Retail Prices API publishes 'MM3.5' meters at $1.50/M input and $7.50/M output on the Global tier (effective 2026-07-01) — identical to Mistral's own direct API rate for mistral-medium-latest.",
      "Foundry also publishes a Data Zone tier at $1.65/$8.25 per M (a clean 1.1x premium, effective 2026-06-01). No cached-input meter exists on any tier yet, so repeated-prompt workloads get no cache discount on this model. Mistral OCR 4, announced alongside it, bills per page rather than per token and is out of this catalog's scope.",
    ],
    sources: [
      { label: "Microsoft–Mistral partnership announcement", href: "https://news.microsoft.com/source/2026/07/21/microsoft-and-mistral-expand-strategic-partnership-to-give-enterprises-and-regulated-industries-frontier-ai-they-can-control/" },
      { label: "Mistral API pricing", href: "https://mistral.ai/pricing/api" },
      { label: "Azure Retail Prices API — MM3.5 meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27mm3.5%27)" },
    ],
    sourcesVerifiedOn: "2026-07-23",
  },
  {
    date: "2026-07-23",
    title: "Foundry cached-input meters now official for Kimi K2.5, K2.6, and Grok-4.3",
    tag: "pricing",
    body: [
      "Azure's Retail Prices API now publishes dedicated cached-input meters (effective 2026-07-01 for Kimi, 2026-05-01 for Grok) that upgrade three catalog rows to official:",
      "Kimi K2.5 Thinking (Global): cached input added at $0.10/M — previously untracked.",
      "Kimi K2.6 (Global): cached input corrected to $0.16/M official, replacing the ~$0.19/M estimate that had been back-solved from a billing export.",
      "Grok-4.3 (Global): cached input added at $0.20/M — previously listed as having no cache meter. The meter is named bare '4.3' in the retail API (a 'grok' search misses it) and matches xAI's direct Grok 4.3 cache rate; long-context (≥200K) requests bill cached input at 2x ($0.40/M).",
    ],
    sources: [
      { label: "Azure Retail Prices API — K2.6 meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27k2.6%27)" },
      { label: "Azure Retail Prices API — K2.5 meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27k2.5%27)" },
      { label: "Azure Retail Prices API — Grok 4.3 meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%274.3%27)" },
      { label: "xAI models & pricing docs", href: "https://docs.x.ai/docs/models" },
    ],
    sourcesVerifiedOn: "2026-07-23",
  },
  {
    date: "2026-07-22",
    title: "Gemini 3.6 Flash added; cached input now published for Flash line",
    tag: "model",
    body: [
      "Added Gemini 3.6 Flash at $1.50/M input, $7.50/M output — the same input price as 3.5 Flash with ~17% cheaper output (50% batch discount: $0.75/$3.75). It's now the catalog's headline Gemini pick for coding and agentic workloads.",
      "Google's pricing page now also publishes a cached-input rate of $0.15/M for both 3.6 and 3.5 Flash, previously untracked for 3.5. Cache storage bills separately at $1.00 per 1M tokens per hour, a dimension noted in the source but not modeled by this site's schema.",
    ],
    sources: [
      { label: "Google — Gemini API pricing", href: "https://ai.google.dev/gemini-api/docs/pricing" },
      { label: "Google — Gemini 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash Cyber", href: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/" },
    ],
    sourcesVerifiedOn: "2026-07-22",
  },
  {
    date: "2026-07-22",
    title: "GLM 5.2 Data Zone cached input corrected to official $0.15/M",
    tag: "pricing",
    body: [
      "Azure now publishes dedicated 'FW GLM 5.2' Foundry meters (effective 2026-07-01), separate from GLM 5.1. Input and output are confirmed unchanged at $1.54/M and $4.84/M, but cached input is officially $0.15/M — well below the $0.286/M estimate the catalog had been carrying (inherited from GLM 5.1, since Fireworks previously charged both versions identically).",
      "GLM 5.2 Data Zone upgraded from estimate to official across the board.",
    ],
    sources: [
      { label: "Azure Retail Prices API — GLM meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27glm%27)" },
    ],
    sourcesVerifiedOn: "2026-07-22",
  },
  {
    date: "2026-07-21",
    title: "GPT-5.6 Azure rates confirmed official; Sol Data Zone and Long Context added",
    tag: "pricing",
    body: [
      "Azure's Retail Prices API now publishes Foundry meters for the whole GPT-5.6 family (effective 2026-07-01), confirming the 1:1 pattern: Sol $5/$30, Terra $2.50/$15, Luna $1/$6 per M tokens on Global, cached input at 10% of input, cache writes at 1.25x. All three entries upgraded from estimate to official.",
      "Added two Sol rows now that the meters are public: Data Zone at $5.50/$0.55/$33 (~10% premium over Global) and Long Context Global at $10/$1/$45. Terra and Luna have matching Data Zone and long-context meters, noted on their entries.",
      "Checked with no change needed: Grok 4.5 still has no Foundry meter (the retail catalog tops out at the Grok-4.x meters already tracked), and Qwen still has no serverless per-token Foundry meter (only Qwen3 32B fine-tuning hosting meters exist).",
      "Corrected Grok 4.5 cached input from the earlier ~$0.50/M third-party estimate to xAI's now-published official rate of $0.30/M.",
    ],
    sources: [
      { label: "Azure Retail Prices API — GPT-5.6 meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27gpt-5.6%27)" },
      { label: "OpenAI — GPT-5.6 launch and pricing", href: "https://openai.com/index/gpt-5-6/" },
      { label: "SpaceXAI — Grok 4.5 model pricing", href: "https://docs.x.ai/developers/models/grok-4.5" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-20",
    title: "Qwen3.7 flagships added; Alibaba cache rule confirmed official",
    tag: "model",
    body: [
      "Added Alibaba's current flagship family, missed in yesterday's Qwen capture: Qwen3.7 Max at $1.25/M input, $3.75/M output effective (list $2.50/$7.50 under a limited-time 50% discount with no published end date; single price tier across a 1M-token window) and Qwen3.7 Plus at $0.32/$1.28 effective ≤256K, $0.96/$3.84 beyond (list rates under a 20% limited-time discount). Both priced on Model Studio's International (Singapore) endpoint.",
      "Alibaba's Context Cache doc now officially states the billing rule — explicit cache hits at 10% of input, cache creation at 125%, implicit hits at 20% — and lists every catalog Qwen model as supported. All Qwen cached-input rates upgraded from estimate to derived (10% of the billed input rate).",
      "Checked with no change needed: Grok 4.5 is still absent from Microsoft Foundry (the Grok tab still tops out at Grok-4.3 Global, $1.25/$2.50, no cache meters), Qwen still has no serverless per-token Foundry listing, and GPT-5.6 is still not on Azure's public OpenAI pricing page.",
    ],
    sources: [
      { label: "Alibaba Cloud — Model Studio pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
      { label: "Alibaba Cloud — Qwen Context Cache", href: "https://www.alibabacloud.com/help/en/model-studio/context-cache" },
      { label: "Microsoft Azure — Foundry Grok pricing", href: "https://azure.microsoft.com/en-us/pricing/details/ai-foundry-models/grok/" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-19",
    title: "Grok (xAI) and Qwen (Alibaba) added to the catalog",
    tag: "model",
    body: [
      "Added Grok: the new flagship Grok 4.5 at xAI's direct rates ($2/M input, $6/M output, 500K context; all meters double at ≥200K prompt tokens). Cached input was initially catalogued at ~$0.50/M from third-party listings and flagged estimate; xAI later published a $0.30/M official rate, recorded in the 2026-07-21 entry above. Grok 4.5 is not on Microsoft Foundry yet — the Foundry lineup tops out at Grok-4.3 Global ($1.25/$2.50) and Grok 4.1 Fast ($0.20/$0.50), and no Foundry Grok listing publishes a cached-input meter.",
      "Added Qwen: Alibaba Model Studio International rates for Qwen3.6 Plus ($0.50/$3.00 up to 256K, $2/$6 beyond), Qwen3.6 Flash ($0.25/$1.50), and Qwen3.6 Max Preview ($1.30/$7.80). Cache hits bill at ~10% of input per the published context-cache rule (marked estimate pending per-model confirmation). On Foundry, Qwen is Managed Compute only (GPU-hour, $4-8/hr) — there is no serverless per-token Qwen meter to compare.",
    ],
    sources: [
      { label: "SpaceXAI — Introducing Grok 4.5", href: "https://x.ai/news/grok-4-5" },
      { label: "SpaceXAI — Grok 4.5 model pricing", href: "https://docs.x.ai/developers/models/grok-4.5" },
      { label: "Alibaba Cloud — Model Studio pricing", href: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
      { label: "Microsoft Azure — Foundry Grok pricing", href: "https://azure.microsoft.com/en-us/pricing/details/ai-foundry-models/grok/" },
      { label: "Microsoft Azure — Foundry Qwen fine-tuning pricing", href: "https://azure.microsoft.com/en-us/pricing/details/ai-foundry-models/fine-tuning-models/" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-17",
    title: "Kimi K3 added; outdated catalog entries pruned",
    tag: "model",
    body: [
      "Added Kimi K3's direct API pricing: $3/M cache-miss input, $0.30/M cache-hit input, and $15/M output. K3 is available now with a 1M-token context window.",
      "Removed older GPT-5, DeepSeek, Kimi Thinking, Gemini 3 Pro, and Claude Opus 4.8 Fast Mode entries to keep the comparison catalog focused on relevant current options.",
    ],
    sources: [
      { label: "Kimi — Introducing K3 and API pricing", href: "https://www.kimi.com/blog/kimi-k3" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-17",
    title: "DeepSeek direct cache rates and Azure meter provenance corrected",
    tag: "pricing",
    body: [
      "Added DeepSeek's first-party V4 Pro ($0.003625/M) and V4 Flash ($0.0028/M) cache-hit rates, so the calculator now applies the selected cache-hit rate to direct API estimates.",
      "Upgraded Azure Global V4 Pro ($0.145/M) and V4 Flash ($0.028/M) cached-input rates from derived to official after confirming the exact meters in Azure's public retail catalog. Billing exports reconcile to those published rates.",
    ],
    sources: [
      { label: "DeepSeek — Models and pricing", href: "https://api-docs.deepseek.com/quick_start/pricing" },
      { label: "Azure Retail Prices API — DeepSeek V4 meters", href: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Foundry%20Models%27%20and%20contains(tolower(meterName),%27deepseek-v4%27)" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-14",
    title: "Claude cache pricing: multiplier → explicit published rates",
    tag: "pricing",
    body: [
      "Anthropic's pricing page now publishes per-model cache hit rates (e.g., Opus 4.8 cache read = $0.50/MTok, Sonnet 5 = $0.20/MTok intro / $0.30 standard, Fable 5 / Mythos 5 = $1.00/MTok), replacing the earlier multiplier approximation. All Claude entries updated with exact `cachedUsd` values.",
    ],
    sources: [
      { label: "Anthropic — Claude API pricing", href: "https://platform.claude.com/docs/en/about-claude/pricing" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-14",
    title: "Claude Fable 5 and Mythos 5 added",
    tag: "model",
    body: [
      "Added Claude Fable 5 ($10 / $50 per MTok input/output) and Claude Mythos 5 ($10 / $50, limited availability) — Anthropic's next-gen frontier models — matching their published direct pricing. Same cache model as other Claude models: reads ~10% of input, writes ~1.25x input.",
    ],
    sources: [
      { label: "Anthropic — Claude Fable 5 and Mythos 5", href: "https://www.anthropic.com/news/claude-fable-5-mythos-5" },
      { label: "Anthropic — Claude Mythos availability and pricing", href: "https://www.anthropic.com/claude/mythos" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-12",
    title: "Heads-up: non-Global Foundry prices rising 2026-09-01",
    tag: "pricing",
    body: [
      "Per the Azure Foundry Models pricing page, EU Data Zone and other non-US Regional deployment prices are set to increase on 2026-09-01. Global deployments are unchanged. No specific increase amount is published yet, so budget for a change and re-check closer to the date.",
    ],
    sources: [
      { label: "Microsoft Azure — Foundry Models pricing", href: "https://azure.microsoft.com/en-us/pricing/details/ai-foundry-models/deepseek/" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-12",
    title: "Microsoft Foundry rebrand; Claude now GA and Azure-hosted",
    tag: "model",
    body: [
      "Microsoft renamed Azure AI Foundry to Microsoft Foundry. The site now uses the new name throughout; older entries below keep their original wording as a historical record.",
      "Claude Opus 4.8, Sonnet 5, and Haiku 4.5 are now GA and natively hosted on Microsoft Foundry (Azure-hosted, not just resold), billed through Azure via Claude Consumption Units (CCU) instead of the old per-model Azure meters. Added Sonnet 5 Foundry pricing, mirroring the direct rates: $2 / $10 per M input/output through 2026-08-31, then $3 / $15 per M from 2026-09-01. Microsoft doesn't publish a separate CCU-to-dollar ratio or an independent Foundry-native price, so the effective $/M is inherited from Anthropic's direct rate.",
    ],
    sources: [
      { label: "Microsoft Learn — Microsoft Foundry product naming", href: "https://learn.microsoft.com/en-us/azure/foundry/how-to/navigate-from-classic" },
      { label: "Microsoft Foundry Blog — Claude reaches GA", href: "https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-june-2026/" },
      { label: "Microsoft Learn — Claude models in Foundry", href: "https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/claude-models" },
      { label: "Anthropic — Introducing Claude Sonnet 5", href: "https://www.anthropic.com/news/claude-sonnet-5" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-11",
    title: "Site launch",
    tag: "launch",
    body: [
      "llm-spend goes live: Kimi, DeepSeek, GLM, OpenAI / Azure OpenAI, Claude, Gemini, and embeddings, all in USD and CHF (reference 1 USD ≈ 0.805 CHF). Prices measured mostly on Azure AI Foundry, plus direct APIs.",
      "Includes the sticker-price methodology, the cache-economics case study, a workload cost calculator, and the RPM-vs-TPM explainer.",
    ],
    sources: [
      { label: "GitHub — Initial launch commit", href: "https://github.com/realgarit/llm-spend/commit/a87f1132216ba3ca1aff6964d76f61ef0741b4d3" },
      { label: "GitHub — Initial provider catalog", href: "https://github.com/realgarit/llm-spend/commit/772c0f13700c7a5bf9cbe294d7ca3ebc0dd14ed4" },
      { label: "llm-spend — Pricing catalog", href: "/" },
      { label: "llm-spend — Cache economics", href: "/cache-economics" },
      { label: "llm-spend — Rate limits explained", href: "/rate-limits" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-09",
    title: "GPT-5.6 (Sol / Terra / Luna) reaches GA",
    tag: "model",
    body: [
      "OpenAI's GPT-5.6 family hit GA: Sol (flagship), Terra (balanced), Luna (fast / cheap). Not on Azure's public page yet, so listed at OpenAI's direct rates as a high-confidence estimate for Azure via the 1:1 pattern.",
      "GPT-5.6 also bills cache writes at 1.25x the uncached input rate (was the standard input rate); reads stay ~90% off.",
    ],
    sources: [
      { label: "OpenAI — GPT-5.6 launch and pricing", href: "https://openai.com/index/gpt-5-6/" },
      { label: "OpenAI — GPT-5.6 model documentation", href: "https://developers.openai.com/api/docs/models" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-07-01",
    title: "DeepSeek cuts direct API pricing 75%",
    tag: "pricing",
    body: [
      "DeepSeek's direct API dropped V4 Pro to $0.435 / CHF 0.35 input, $0.87 / CHF 0.70 output, and V4 Flash to $0.14 / CHF 0.11 input, $0.28 / CHF 0.23 output. That widened the gap to cloud \"Global\" tiers, one reported at ~4.5x the direct price.",
    ],
    sources: [
      { label: "DeepSeek — Models and pricing", href: "https://api-docs.deepseek.com/quick_start/pricing" },
      { label: "Microsoft Azure — Foundry DeepSeek pricing", href: "https://azure.microsoft.com/en-us/pricing/details/ai-foundry-models/deepseek/" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
  {
    date: "2026-06-15",
    title: "Hidden cache meters reconciled from billing exports",
    tag: "methodology",
    body: [
      "Internal Azure Cost Management exports grouped by meter revealed undocumented cached-input meters on DeepSeek V4 Pro / V4 Flash \"Global\" and Kimi K2.7 in Azure AI Foundry. Back-solving against known input/output rates gave derived cache rates (~$0.145/M for V4 Pro, ~$0.028/M for V4 Flash, ~$0.19/M for Kimi). The links below document the public export and pricing methodology; the customer billing export itself is private. Rates were flagged derived pending official publication.",
    ],
    sources: [
      { label: "Method reference — Export Cost Management data", href: "https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-export-acm-data" },
      { label: "Microsoft Azure — Foundry DeepSeek pricing", href: "https://azure.microsoft.com/en-us/pricing/details/ai-foundry-models/deepseek/" },
      { label: "Azure Retail Prices API", href: "https://prices.azure.com/api/retail/prices" },
    ],
    sourcesVerifiedOn: "2026-07-21",
  },
];
