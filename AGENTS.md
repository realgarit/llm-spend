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
