# Repository instructions

> Canonical instructions for all coding agents (Claude Code, Codex, GitHub Copilot). Claude loads this via the CLAUDE.md stub.

## Changelog requirement

For every customer-visible change to model availability, provider coverage, pricing, cache rates, calculations, or comparisons, update `src/data/changelog.ts` in the same pull request.

Before completing the work, confirm that the changelog entry states the customer-visible effect and uses the current date. Do not add an entry for internal-only refactors, test-only changes, or tooling changes that do not alter the site’s displayed behavior or data.

## Git Workflow: Always PR

Always ship changes via branch → commit → push → PR → CI → merge → delete branches; never commit directly to main.

**Why:** No direct commits to main; CI must validate before merge, and stale branches must not accumulate.

**How to apply:** For any completed change: create a feature branch, commit, push, open a GitHub PR, wait for CI to pass, merge the PR, then delete both the local and remote feature branches and update local main. Do this without asking each time.

## Cross-agent conventions

- This file (`AGENTS.md`) is the single source of truth for agent instructions in this repo. `CLAUDE.md` and `.github/copilot-instructions.md` are pointers to it — never edit them, never duplicate content into them.
- Reusable skills live in `.claude/skills/` (one folder per skill with a `SKILL.md`). GitHub Copilot reads that directory natively; Codex sees it via the `.agents/skills` symlink. New skills always go in `.claude/skills/`.
- Claude-specific subagent definitions live in `.claude/agents/`. If you are not Claude Code, you may read them as role/process guidance.
- Session continuity across tools: before ending substantial work in ANY tool (Claude Code, Codex, Copilot), record durable context — decisions made, gotchas discovered, in-progress state worth resuming — in the "Working notes" section below, or fold it into the relevant section above. This is the shared memory between agents.

## Working notes

<!-- Any agent: append short dated notes here (YYYY-MM-DD — note). Prune notes when stale or once folded into the sections above. -->

- 2026-07-20 — Gotcha: Alibaba's Model Studio pricing page lists model families beyond the obvious names — the 2026-07-19 Qwen capture missed the qwen3.7 flagships (snapshots dated May 2026) by only sweeping "3.6" rows. When capturing that page, grep table rows for ALL `qwen` matches, not the family you expect. Its price columns are Input | Output (non-thinking) | Output (thinking), and "List price $X Limited-time N% off" means the shown figure is BEFORE discount.
- 2026-07-20 — Watch: Qwen3.7 Max (50% off) and Plus (20% off) are promo rates with no published end date; if the promo lapses, catalog reverts to list ($2.50/$7.50 and $0.40/$1.60 ≤256K). Still pending elsewhere: Grok 4.5 on Foundry, non-Global Foundry increase 2026-09-01, Sonnet 5 intro ends 2026-08-31. (GPT-5.6 on Azure: resolved 2026-07-21, see below.)
- 2026-07-21 — Gotcha/tool: Azure's Foundry pricing page (`/pricing/details/ai-foundry-models/...`) would not render its serverless tables in the in-app browser (only 4 Managed Compute GPU rows appear; screenshots time out). Reliable official alternative: the Azure Retail Prices API — `https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Foundry Models' and contains(tolower(meterName),'<term>')` (URL-encode `$filter`; plain curl works). Meter-name decoder: ShortCo/LongCo = short/long context, Inp/Opt = input/output, Cd Inp/Cd Wr = cached input/cache write, Std/PP = standard/priority processing (PP ≈ 2x), Gl/DZ = Global/DataZone (DZ = 1.1x). Prices are per the `unitOfMeasure` field (GPT-5.6 meters are per 1M; older Grok meters are per 1K).
- 2026-07-21 — Resolved: GPT-5.6 Sol/Terra/Luna now have official Foundry meters (effective 2026-07-01) at exactly the OpenAI direct rates; catalog upgraded to official via PR #16. Confirmed via the same API sweep: no Grok 4.5 meter, no Qwen serverless meter (only Qwen3 32B FT hosting). Oddity noted, not catalog-affecting: the retail API's Grok meter names lag Foundry marketing names (a "Grok 4.2" meter carries the $1.25/$2.50 price the pricing page shows for Grok-4.3).
- 2026-07-21 — Changelog provenance convention: every `ChangelogEntry` has a non-empty `sources` array of `{ label, href }`; the page renders these as the final footer beneath each entry. Prefer official launch posts, pricing docs, and Azure Retail Prices API queries. `src/data/changelog.test.ts` enforces coverage and URL shape for the full history.
- 2026-07-21 — Grok 4.5's official model page now publishes cached input at $0.30/M; the earlier $0.50/M third-party estimate was corrected and upgraded to official provenance.
- 2026-07-22 — Resolved/observed: Azure published dedicated "FW GLM 5.2" meters effective 2026-07-01 — input/output equal to GLM 5.1 DZ but cached input cut to $0.00015/1K ($0.15/M, ~48% below 5.1); catalog upgraded to official. Also new "FW Kimi K2.7 Code" DZ meters (2026-07-01) at exactly 1.1x the catalog's Global rates — consistent, no catalog change.
- 2026-07-22 — Gotcha: GPT-5.6 retail meters are named "5.6 sol/terra/luna ..." — a meterName search for "gpt" misses them entirely; search "5.6", "sol", "terra", or "luna" instead.
- 2026-07-22 — Scope note: Google's pricing page also lists Gemini 3.5 Flash-Lite ($0.30/$2.50, cached $0.03) and Gemini 3.5 Flash Cyber alongside 3.6 Flash. Flash-Lite is deliberately left out of the catalog to keep a single focused Gemini lane; Flash Cyber has no published pricing at all, so it can't be added yet. Gemini cache storage ($1.00 per 1M tokens per hour) is a billing dimension this site's schema doesn't model — recorded in each entry's `sourceNote` only.
- 2026-07-23 — Resolved: Foundry cached-input meters published for K2.5 ($0.10/M, 'K2.5 cached glbl' $0.0001/1K) and K2.6 ($0.16/M, 'K2.6 cached glbl' $0.00016/1K — replaces the old $0.19 hidden-meter derivation), both eff. 2026-07-01; and Grok 4.3 ($0.20/M, meter named bare "4.3" — a 'grok' meterName search MISSES it — 'Cached Inp Glbl' $0.0002/1K, eff. 2026-05-01, long-context "L" variant 2x at $0.40/M). Watch: the US-Gov regions carry slightly higher cached prices (K2.6 $0.20, K2.5 $0.000125/1K) — use the commercial `isPrimaryMeterRegion` majority price, not the gov outlier. Also new non-FW "K2.7 Code" Global meters ($0.95/$4.00 with cached glbl $0.19) match catalog — no change; oddity: its non-FW DZ output meter is $5.00/M, disagreeing with "FW Kimi K2.7 Code Opt DZ" at $4.40/M.
- 2026-07-23 — Gotcha: Mistral meters are named "MM3.5" / "OCR 4" — a 'mistral' meterName search finds NOTHING. Mistral Medium 3.5 landed on Foundry (Global $1.50/$7.50 = direct-API parity; DataZone $1.65/$8.25 = 1.1x; NO cached meter on any tier), eff. 2026-06-01 (DZ) / 2026-07-01 (Global). NOTE: the DataZone meters DO exist — an earlier handoff wrongly assumed "no DZ meter"; only the cached meter is genuinely absent. OCR 4 is per-page ($4/1K pages), out of schema scope.
- 2026-07-23 — Gotcha/watch: GPT-5.6 Terra ShortCo Std DZ input/output meters are SWAPPED in the retail API ("5.6 terra ShortCo Inp Std DZ" $16.50/M, "Opt Std DZ" $2.75/M; Global is $2.50 in / $15.00 out, so DZ should be $2.75 in / $16.50 out). Obvious data-entry error — do NOT copy into catalog; watch for a fix.
- 2026-07-23 — Scope: Cohere "Command A Plus" (Global $0.80/$3.20 per M) and gpt-realtime-2.1(-mini) landed on Foundry eff. 2026-07-01 — deliberately excluded (Command A Plus is outside the tracked lanes; realtime/audio and per-page OCR are not modeled by the schema).
- 2026-07-23 — Watch: Qwen3.7 Max (50% off) and Plus (20% off) promos re-verified LIVE on Model Studio's pricing page 2026-07-23 — still discounted, no end date; third-party "promo ended" claims are false. Could NOT confirm any qwen3.8-max / qwen3.8-max-preview listing on either the pricing or models page (searched 2026-07-23) — not added; revisit if it appears with a per-token price. Grok 4.5 still has no Foundry meter (re-verified 2026-07-23; retail catalog tops out at the "Grok 4.2/4.3" meters). DeepSeek deprecates the `deepseek-chat`/`deepseek-reasoner` model NAMES on 2026-07-24 (pricing unchanged); neither name is referenced anywhere in `src/`, so the catalog is unaffected.
