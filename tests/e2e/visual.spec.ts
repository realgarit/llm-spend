import { existsSync } from "node:fs";
import { expect, gotoGuarded, test } from "./helpers";
import type { Page, TestInfo } from "@playwright/test";

/**
 * Pixel baselines for `/compare` — the site's densest layout — at both
 * breakpoints in both themes.
 *
 * ## Two things make these reproducible
 *
 * **The clock is pinned.** Several rows resolve their rate against the
 * visitor's real clock (`useNow`), so DeepSeek reads "Peak" or "Off-peak"
 * depending on the hour and the day of the week, and scheduled-rate labels
 * carry countdowns. `page.clock.setFixedTime` freezes `Date.now()`/`new Date()`
 * without stubbing timers (unlike `clock.install`, which would also pause the
 * schedulers React relies on), so every run resolves the same variant.
 * `PINNED_INSTANT` is a Wednesday at 12:00 UTC — a weekday off-peak hour, and
 * after the 2026-09-01 Qwen reversion, so both of those states are captured.
 *
 * **Nothing is masked**, deliberately. Masking the price cells was tried and
 * rejected: Playwright merges adjacent masks, so the five numeric columns
 * became one opaque block covering ~40% of the table, and the baseline stopped
 * being something a human could review — while still churning on the things
 * masking cannot hide (row order, the cost-signal rail's leader model and
 * median). The images are therefore literal renders of the page, and they do
 * need re-recording when tracked rates change. That is a real cost, accepted
 * because these images are only useful if a reviewer can actually read them.
 * Re-record with `npm run test:e2e:update` and *look at the four PNGs* before
 * committing; see `tests/e2e/README.md`.
 *
 * ## Baselines are platform-specific, and that matters for CI
 *
 * Text antialiasing differs enough between Windows and Linux that one shared
 * baseline would diff on every run, so Playwright's default per-platform
 * snapshot suffix is kept. The committed baselines were recorded on the
 * platform their filenames name; on any other platform these tests skip with a
 * reason rather than fail on a missing file. See `tests/e2e/README.md`.
 */
const PINNED_INSTANT = new Date("2026-09-02T12:00:00Z");

const VIEWPORTS = [
  { name: "1280", width: 1280, height: 900 },
  { name: "375", width: 375, height: 812 },
] as const;

/**
 * Whether a baseline for `name` exists for the platform this run is on.
 *
 * Asks Playwright itself where the file would live (`testInfo.snapshotPath`
 * applies the configured `snapshotPathTemplate`, platform suffix and all)
 * rather than reconstructing the path here — hand-building it is how this
 * check silently skipped every test while four perfectly good baselines sat on
 * disk under slightly different names.
 */
function hasBaseline(testInfo: TestInfo, name: string): boolean {
  return existsSync(testInfo.snapshotPath(name));
}

async function prepare(page: Page, width: number, height: number): Promise<void> {
  await page.clock.setFixedTime(PINNED_INSTANT);
  await page.setViewportSize({ width, height });
  await gotoGuarded(page, "/compare");
  // The table is the last thing to settle; waiting on a row keeps the capture
  // from racing hydration on a cold run.
  await expect(page.locator("table.decision-table tbody tr").first()).toBeVisible();
  // Fonts are self-hosted, so this resolves immediately in practice — but a
  // capture that beat the face swap would bake a fallback-font baseline in.
  // `.then(() => undefined)` because the FontFaceSet itself is not serializable.
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    for (const viewport of VIEWPORTS) {
      const name = `compare-${viewport.name}-${scheme}.png`;

      test(`compare at ${viewport.width}px looks right`, async ({ page }, testInfo) => {
        // Playwright's default `updateSnapshots: "missing"` would silently
        // write a baseline on a platform that has none and then fail the run —
        // which in CI reads as a real regression. Skip instead, unless someone
        // deliberately asked for an update (`--update-snapshots` reports
        // "changed" or "all").
        const recording = testInfo.config.updateSnapshots === "changed" || testInfo.config.updateSnapshots === "all";
        test.skip(
          !recording && !hasBaseline(testInfo, name),
          `No ${process.platform} baseline for ${name}. Record one on this platform with ` +
            "`npm run test:e2e:update` (never in CI) and commit it — see tests/e2e/README.md.",
        );

        await prepare(page, viewport.width, viewport.height);

        await expect(page).toHaveScreenshot(name, { fullPage: true });
      });
    }
  });
}
