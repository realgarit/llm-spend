// Extension: foundry-pricing-watcher
// Daily pricing monitor for Microsoft Foundry (Anthropic Claude models).
// Checks Anthropic's published pricing page and the site's providers.ts,
// reports any discrepancies as GitHub issues.
//
// Designed to run as a saved daily workflow via the app's save_workflow API.

import { joinSession } from "@github/copilot-sdk/extension";

const session = await joinSession({
  tools: [
    {
      name: "fcp_check_pricing",
      description:
        "Fetches the latest Anthropic Claude model pricing from docs and compares against the local providers.ts data file. Returns a structured diff of any price changes, additions, or removals. No GitHub issue is created - this is read-only. Call this first to see current state.",
      parameters: {
        type: "object",
        properties: {
          dryRun: {
            type: "boolean",
            description:
              "When true (default), only reports differences without taking action. When false, also creates a GitHub issue with the diff.",
          },
        },
      },
      // skipPermission: true,
      handler: async (args, invocation) => {
        const dryRun = args.dryRun !== false;

        // ── Step 1: determine project root ──────────────────────────────
        const fs = await import("fs/promises");
        const path = await import("path");
        const { execSync } = await import("child_process");

        let repoRoot;
        try {
          repoRoot = execSync("git rev-parse --show-toplevel", {
            encoding: "utf-8",
          }).trim();
        } catch {
          return {
            textResultForLlm:
              "Error: not inside a git repository. Cannot locate providers.ts.",
            resultType: "failure",
          };
        }

        // ── Step 2: fetch Anthropic pricing page ────────────────────────
        const pageUrl =
          "https://platform.claude.com/docs/en/about-claude/pricing";
        let pageContent;
        try {
          const response = await fetch(pageUrl);
          if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
          pageContent = await response.text();
        } catch (err) {
          return {
            textResultForLlm: `Error fetching Anthropic pricing page: ${err.message}`,
            resultType: "failure",
          };
        }

        // ── Step 3: parse the pricing table ─────────────────────────────
        // The page contains a markdown table we can regex-extract:
        // | Model | Base Input | 5m Cache Writes | 1h Cache Writes | Cache Hits & Refreshes | Output |
        const tableRegex =
          /\|\s*Claude\s+([\w.\s/()]+?)\s*\|\s*\$?([\d.]+)\s*\/\s*MTok\s*\|\s*\$?([\d.]+)\s*\/\s*MTok\s*\|\s*\$?([\d.]+)\s*\/\s*MTok\s*\|\s*\$?([\d.]+)\s*\/\s*MTok\s*\|\s*\$?([\d.]+)\s*\/\s*MTok\s*\|/g;

        const livePrices = [];
        let match;
        while ((match = tableRegex.exec(pageContent)) !== null) {
          const name = match[1].trim();
          const input = parseFloat(match[2]);
          const cacheWrite5m = parseFloat(match[3]);
          const cacheWrite1h = parseFloat(match[4]);
          const cacheHit = parseFloat(match[5]);
          const output = parseFloat(match[6]);
          livePrices.push({
            name,
            inputUsd: input,
            cachedUsd: cacheHit,
            cacheWrite5mUsd: cacheWrite5m,
            cacheWrite1hUsd: cacheWrite1h,
            outputUsd: output,
          });
        }

        if (livePrices.length === 0) {
          return {
            textResultForLlm:
              "Warning: could not parse any pricing rows from the Anthropic page. The page format may have changed.",
            resultType: "failure",
          };
        }

        // ── Step 4: read local providers.ts ─────────────────────────────
        const providersPath = path.join(
          repoRoot,
          "src",
          "data",
          "providers.ts"
        );
        let providersContent;
        try {
          providersContent = await fs.readFile(providersPath, "utf-8");
        } catch (err) {
          return {
            textResultForLlm: `Error reading providers.ts: ${err.message}`,
            resultType: "failure",
          };
        }

        // ── Step 5: extract local Claude pricing entries ────────────────
        // We look for entries in the "claude" provider section
        const localEntries = [];
        const entryRegex =
          /\{\s*model:\s*"Claude\s+([^"]+)"[^}]*?inputUsd:\s*([\d.]+)[^}]*?cachedUsd:\s*([\d.]+|null)[^}]*?outputUsd:\s*([\d.]+)[^}]*?tier:\s*"([^"]+)"[^}]*?confidence:\s*"([^"]+)"/gs;

        let em;
        while ((em = entryRegex.exec(providersContent)) !== null) {
          localEntries.push({
            model: em[1].trim(),
            inputUsd: parseFloat(em[2]),
            cachedUsd: em[3] === "null" ? null : parseFloat(em[3]),
            outputUsd: parseFloat(em[4]),
            tier: em[5],
            confidence: em[6],
          });
        }

        // ── Step 6: compare ──────────────────────────────────────────────
        // Build a lookup from live prices by model name prefix matching
        const diffs = { changed: [], missing: [], new: [] };

        // Helper to find a match in livePrices by fuzzy name
        function findLive(modelName) {
          const normalized = modelName.toLowerCase();
          // Try to pick the right live entry:
          // "Opus 4.8 (Standard)" should match "Claude Opus 4.8"
          // "Sonnet 5 (Intro)" should match "Claude Sonnet 5 [intro pricing row]"
          return livePrices.find((lp) => {
            const lpNorm = lp.name.toLowerCase();
            if (lpNorm.includes("fable") && normalized.includes("fable"))
              return true;
            if (lpNorm.includes("mythos") && normalized.includes("mythos"))
              return true;
            if (lpNorm.includes("opus 4.8") && normalized.includes("opus 4.8"))
              return true;
            if (
              lpNorm.includes("opus 4.7") &&
              normalized.includes("opus 4.7")
            )
              return true;
            if (
              lpNorm.includes("opus 4.6") &&
              normalized.includes("opus 4.6")
            )
              return true;
            if (
              lpNorm.includes("opus 4.5") &&
              normalized.includes("opus 4.5")
            )
              return true;
            if (lpNorm.includes("sonnet 5") && normalized.includes("sonnet 5"))
              return true;
            if (
              lpNorm.includes("sonnet 4.6") &&
              normalized.includes("sonnet 4.6")
            )
              return true;
            if (
              lpNorm.includes("sonnet 4.5") &&
              normalized.includes("sonnet 4.5")
            )
              return true;
            if (
              lpNorm.includes("haiku 4.5") &&
              normalized.includes("haiku 4.5")
            )
              return true;
            return false;
          });
        }

        for (const local of localEntries) {
          const live = findLive(local.model);
          if (!live) {
            diffs.missing.push(local);
            continue;
          }

          const tolerance = 0.01; // $0.01/MTok tolerance for floating-point
          const changes = [];

          if (Math.abs(local.inputUsd - live.inputUsd) > tolerance) {
            changes.push(
              `input: $${local.inputUsd}/M → $${live.inputUsd}/M`
            );
          }

          // cachedUsd: compare local vs live cache hit rate
          const localCache = local.cachedUsd ?? 0;
          if (Math.abs(localCache - live.cachedUsd) > tolerance) {
            changes.push(
              `cache hit: $${localCache.toFixed(2)}/M → $${live.cachedUsd.toFixed(2)}/M`
            );
          }

          if (Math.abs(local.outputUsd - live.outputUsd) > tolerance) {
            changes.push(
              `output: $${local.outputUsd}/M → $${live.outputUsd}/M`
            );
          }

          if (changes.length > 0) {
            diffs.changed.push({
              model: local.model,
              tier: local.tier,
              changes,
            });
          }
        }

        // Check for entirely new models in live that don't exist locally
        const localModelNames = localEntries.map((l) => l.model);
        for (const live of livePrices) {
          const found = localEntries.some((l) => {
            const lc = l.model.toLowerCase();
            const lcLive = live.name.toLowerCase();
            return (
              lc.includes(lcLive.replace("claude ", "")) ||
              lcLive.includes(lc.replace("claude ", ""))
            );
          });
          if (!found) {
            diffs.new.push(live);
          }
        }

        // ── Step 7: format report ────────────────────────────────────────
        const lines = [];
        lines.push(`## Foundry Pricing Check — ${new Date().toISOString().slice(0, 10)}`);
        lines.push("");
        lines.push(
          `Source: [Anthropic Pricing](${pageUrl}) — ${livePrices.length} models parsed.`
        );
        lines.push(`Local: ${localEntries.length} Claude entries in providers.ts`);
        lines.push("");

        const hasChanges =
          diffs.changed.length > 0 ||
          diffs.missing.length > 0 ||
          diffs.new.length > 0;

        if (!hasChanges) {
          lines.push("✅ **No price changes detected.** All local prices match live data.");
        } else {
          if (diffs.changed.length > 0) {
            lines.push("### 🔴 Price Changes");
            lines.push("| Model | Changes |");
            lines.push("|-------|---------|");
            for (const c of diffs.changed) {
              lines.push(`| ${c.model} | ${c.changes.join("; ")} |`);
            }
            lines.push("");
          }

          if (diffs.new.length > 0) {
            lines.push("### 🆕 New Models");
            lines.push("| Model | Input | Cache Hit | Output |");
            lines.push("|-------|-------|-----------|--------|");
            for (const n of diffs.new) {
              lines.push(
                `| ${n.name} | $${n.inputUsd}/M | $${n.cachedUsd}/M | $${n.outputUsd}/M |`
              );
            }
            lines.push("");
          }

          if (diffs.missing.length > 0) {
            lines.push("### ⚠️ Models in providers.ts Not Found in Live Data");
            for (const m of diffs.missing) {
              lines.push(`- ${m.model} (tier: ${m.tier})`);
            }
            lines.push("");
          }

          if (!dryRun && hasChanges) {
            // Create a GitHub issue with the diff
            const issueBody = lines.join("\n");
            try {
              execSync(
                `gh issue create --title "Foundry pricing change detected ${new Date().toISOString().slice(0, 10)}" --body ${JSON.stringify(
                  issueBody +
                    "\n\n---\n_This issue was auto-generated by the foundry-pricing-watcher extension._"
                )}`,
                { cwd: repoRoot, encoding: "utf-8" }
              );
              lines.push("📋 **GitHub issue created** with the above report.");
            } catch (err) {
              lines.push(`⚠️ Failed to create GitHub issue: ${err.message}`);
            }
          } else if (hasChanges) {
            lines.push(
              "ℹ️ Run with `dryRun: false` to create a GitHub issue for these changes."
            );
          }
        }

        return { textResultForLlm: lines.join("\n") };
      },
    },
  ],
});
