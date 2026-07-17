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
