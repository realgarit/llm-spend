import { defineConfig, devices } from "@playwright/test";

/**
 * Browser quality gate.
 *
 * Everything here runs against a real production build served by the Next.js
 * standalone server (`tests/e2e/serve.mjs`), never `next dev` — dev mode's
 * unminified bundles, error overlay and development-only React warnings would
 * invalidate both the performance budgets and the console-error guard.
 *
 * Deliberate choices worth knowing before you change them:
 *
 * - **One worker, no retries.** Performance assertions and pixel baselines are
 *   both sensitive to machine load, and retries hide exactly the state/timing
 *   flakiness this suite exists to expose. Artifacts are kept on failure
 *   instead (`trace`/`video`/`screenshot` below), so a red run is still
 *   diagnosable without a second attempt.
 * - **Chromium only.** The gate checks this app's behavior, not cross-engine
 *   rendering; a second engine would double the runtime and force a second set
 *   of pixel baselines for no extra signal about regressions in this codebase.
 * - **Snapshots keep their platform suffix** (Playwright's default). Text
 *   antialiasing differs enough between Windows and Linux that a shared
 *   baseline would diff on every run. See `tests/e2e/README.md` for how that
 *   interacts with CI.
 */
const PORT = Number(process.env.E2E_PORT ?? 3210);
const HOST = "127.0.0.1";

export const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts$/,
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // Small tolerance for font hinting and sub-pixel layout jitter between
      // runs on the same machine; large enough to absorb a rounded edge,
      // far too small to absorb a moved or restyled component.
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: "node tests/e2e/serve.mjs",
    url: BASE_URL,
    // A cold `next build` dominates this; 5 minutes leaves headroom on a
    // loaded CI runner without hanging a broken build forever.
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: { PORT: String(PORT), HOSTNAME: HOST },
  },
});
