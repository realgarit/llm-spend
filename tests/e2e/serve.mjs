#!/usr/bin/env node
/**
 * Build and serve the real production bundle for the Playwright suite.
 *
 * The browser gate must measure what visitors actually get, so this runs the
 * shipped `npm run build` (`next build` plus the static/public copies) and then
 * starts the Next.js **standalone** server — the same `node server.js` entry
 * Azure Static Web Apps runs in production. `next dev` is deliberately not an
 * option: dev mode ships unminified bundles, an error overlay, and React's
 * development-only warnings, which would make both the performance budgets and
 * the console-error guard meaningless.
 *
 * Two things this wrapper adds on top of `npm run build`:
 *
 *  1. **It finds `server.js` instead of assuming its path.** Next places the
 *     standalone app at `.next/standalone/<path from the output-file-tracing
 *     root>/server.js`. In a normal checkout that root is the repo itself and
 *     the file lands at `.next/standalone/server.js`, which is what the
 *     `package.json` build script's `cp` targets assume. Inside a git worktree
 *     nested under the main checkout, Next infers the *parent* directory as the
 *     tracing root (it finds that lockfile too) and nests the app several
 *     levels deep, so those `cp` targets silently miss. Searching for the real
 *     `server.js` makes the harness correct in both layouts.
 *
 *  2. **It re-copies `.next/static` and `public` next to that `server.js`.**
 *     Idempotent, and always run so a rebuild can never be served with stale
 *     assets. In a normal checkout `npm run build` already put them there and
 *     this just overwrites them with identical bytes.
 *
 * Env:
 *   PORT, HOSTNAME   Where to listen (Playwright's webServer sets both).
 *   E2E_SKIP_BUILD=1 Serve whatever is already in `.next` — for fast local
 *                    iteration on the specs. CI never sets it.
 */
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const port = process.env.PORT ?? "3210";
const hostname = process.env.HOSTNAME ?? "127.0.0.1";

if (process.env.E2E_SKIP_BUILD === "1") {
  console.log("[e2e-serve] E2E_SKIP_BUILD=1 — serving the existing .next build");
} else {
  console.log("[e2e-serve] running `npm run build`");
  const build = spawnSync("npm", ["run", "build"], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: true,
  });
  if (build.status !== 0) {
    console.error(`[e2e-serve] build failed with status ${build.status}`);
    process.exit(build.status ?? 1);
  }
}

const standaloneRoot = join(repoRoot, ".next", "standalone");
const serverEntry = findServerEntry(standaloneRoot);
if (serverEntry === null) {
  console.error(
    `[e2e-serve] no standalone server.js under ${standaloneRoot}. ` +
      'Check that next.config.ts still sets output: "standalone".',
  );
  process.exit(1);
}

const appDir = dirname(serverEntry);
copyIfPresent(join(repoRoot, ".next", "static"), join(appDir, ".next", "static"));
copyIfPresent(join(repoRoot, "public"), join(appDir, "public"));

console.log(`[e2e-serve] starting ${serverEntry} on http://${hostname}:${port}`);
const child = spawn(process.execPath, [serverEntry], {
  cwd: appDir,
  stdio: "inherit",
  env: { ...process.env, PORT: port, HOSTNAME: hostname },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});

/** Breadth-first search for the standalone entry point, skipping `node_modules`. */
function findServerEntry(root, depth = 0) {
  if (depth > 6 || !existsSync(root)) return null;
  const direct = join(root, "server.js");
  if (existsSync(direct)) return direct;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "node_modules") continue;
    const found = findServerEntry(join(root, entry.name), depth + 1);
    if (found !== null) return found;
  }
  return null;
}

function copyIfPresent(from, to) {
  if (!existsSync(from)) return;
  cpSync(from, to, { recursive: true, force: true });
}
