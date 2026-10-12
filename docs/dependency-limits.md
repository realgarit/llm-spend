# Accepted development-tool limitation

Operator decision: 2026-10-12. Tracking record:
https://github.com/realgarit/llm-spend/issues/148

## braces: GHSA-vfj7-8cjw-p6xm

Status: accepted upstream limitation, not fixed. The registry's latest braces
release is 3.0.3 and the reviewed advisory lists no patched release:
https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

The checked-in lockfile resolves braces 3.0.3 through the development-only path
eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces.
The five audit records refer to this one underlying advisory. Deeply nested
patterns can exhaust the Node.js stack and terminate the tooling process.

Retain the current Next.js 16 / ESLint dependency family and reproducible npm ci
installation. Run this tooling only on trusted repository sources; do not add a
runtime endpoint that processes user-supplied glob patterns with this chain.
An ESLint 14 downgrade is not the chosen resolution.

No vulnerable-version override, audit allowlist or Dependabot exclusion is added:
the existing lockfile records the accepted version, while alerts and future fix
updates remain enabled. Closing #148 records the operator's acceptance of this
known development-tool limitation and does not claim a clean security audit.

Reopen immediately if a patched braces release or compatible parent update is
available, if the dependency enters the production graph, or if tooling begins
processing untrusted patterns. Upgrade the owning package and verify a clean
install, lint, build, tests and a fresh audit before removing this record.
