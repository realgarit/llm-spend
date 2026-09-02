import { expect, expectNoHorizontalOverflow, gotoGuarded, test } from "./helpers";
import type { Locator, Page } from "@playwright/test";

/**
 * `/compare` is the decision workspace: presets, filters, sort, scenario,
 * shortlist, share and export all sit on one page and share one state object,
 * so this is where a regression is most likely and hardest to spot by eye.
 *
 * Assertions here are structural wherever possible — "every visible row now
 * names the provider I filtered to", not "the table shows 9 rows" — because the
 * catalog changes almost daily and a count-based test would go red on a price
 * update that broke nothing.
 */

const resultsTable = (page: Page) => page.locator("table.decision-table");
const resultRows = (page: Page) => resultsTable(page).locator("tbody tr");
const summary = (page: Page) => page.locator(".filter-summary");

/** The "N of M lanes" counter, parsed. */
async function laneCounts(page: Page): Promise<{ shown: number; total: number }> {
  const text = (await summary(page).locator("strong").innerText()).trim();
  const match = /^(\d+) of (\d+) lanes$/.exec(text);
  expect(match, `unexpected lane summary: ${text}`).not.toBeNull();
  return { shown: Number(match![1]), total: Number(match![2]) };
}

async function cellTexts(rows: Locator, label: string): Promise<string[]> {
  return rows.locator(`td[data-label="${label}"]`).allInnerTexts();
}

test.beforeEach(async ({ page }) => {
  await gotoGuarded(page, "/compare");
});

test("workload presets re-shape the priced workload", async ({ page }) => {
  const agentic = page.getByRole("button", { name: /Agentic session/ });
  const rag = page.getByRole("button", { name: /RAG-heavy/ });

  // The default state matches the first preset, so it starts pressed.
  await expect(agentic).toHaveAttribute("aria-pressed", "true");
  await expect(summary(page)).toContainText("60M in / 210K out @ 90% cache");

  const beforeTotals = await cellTexts(resultRows(page), "Workload cost");

  await rag.click();
  await expect(rag).toHaveAttribute("aria-pressed", "true");
  await expect(agentic).toHaveAttribute("aria-pressed", "false");
  await expect(summary(page)).toContainText("10M in / 100K out @ 80% cache");

  // A different token shape must produce different money, not just a different
  // label — this is the assertion that would catch the calculator being wired
  // to a stale workload.
  const afterTotals = await cellTexts(resultRows(page), "Workload cost");
  expect(afterTotals).not.toEqual(beforeTotals);

  // Presets are the entry point to a shareable state, so they must reach the URL.
  await expect.poll(() => new URL(page.url()).searchParams.get("input")).toBe("10000000");
});

test("search, provider, deployment, cache and official filters compose", async ({ page, pageGuards }) => {
  const unfiltered = await laneCounts(page);
  expect(unfiltered.total).toBeGreaterThan(20);

  // Narrow structurally first, then read the provider off a row that already
  // survives those constraints. Picking the provider up front (from the
  // cheapest row, say) can compose into a contradiction the moment the catalog
  // changes — that provider may have no official, cache-metered Foundry lane —
  // and the test would then be asserting against an accidental empty state.
  await page.getByRole("button", { name: "Foundry", exact: true }).click();
  await page.getByLabel("Has cache meter").check();
  await page.getByLabel("Official only").check();
  await expect(resultRows(page).first()).toBeVisible();

  const provider = (await resultRows(page).first().locator('td[data-label="Provider"]').innerText()).trim();
  await page.getByLabel("Provider", { exact: true }).selectOption(provider);
  await page.getByLabel("Search provider, model, or host").fill(provider);

  const filtered = await laneCounts(page);
  expect(filtered.total).toBe(unfiltered.total);
  expect(filtered.shown).toBeLessThan(unfiltered.total);
  expect(filtered.shown).toBeGreaterThan(0);

  const rows = resultRows(page);
  for (const value of await cellTexts(rows, "Provider")) {
    expect(value.trim()).toBe(provider);
  }
  for (const value of await cellTexts(rows, "Deployment")) {
    expect(value).toContain("Foundry");
  }
  for (const value of await cellTexts(rows, "Cached / 1M")) {
    // "Has cache meter" means the cached column is a real rate, never the
    // em-dash placeholder a null cache rate renders.
    expect(value.trim()).not.toBe("—");
  }
  // "Official only" hides every derived (†) and estimated (‡) rate.
  await expect(rows.locator(".mark-derived")).toHaveCount(0);
  await expect(rows.locator(".mark-estimate")).toHaveCount(0);

  // Every filter is in the shareable URL.
  const params = new URL(page.url()).searchParams;
  expect(params.get("provider")).toBe(provider);
  expect(params.get("deployment")).toBe("foundry");
  expect(params.get("cacheOnly")).toBe("1");
  expect(params.get("officialOnly")).toBe("1");

  await pageGuards.inspect();
  pageGuards.assertClean();
});

test("sorting works from the select control and from a column header", async ({ page }) => {
  const totals = () => cellTexts(resultRows(page), "Workload cost");

  // Default sort is cheapest workload cost first.
  const ascending = await totals();
  expect(parseUsd(ascending)).toEqual([...parseUsd(ascending)].sort((a, b) => a - b));

  await page.getByLabel("Sort results").selectOption("total-desc");
  const descending = await totals();
  expect(parseUsd(descending)).toEqual([...parseUsd(descending)].sort((a, b) => b - a));
  expect(new URL(page.url()).searchParams.get("dir")).toBe("desc");

  // The header button is the other way in, and must drive the same state:
  // clicking "Provider" re-keys the sort and resets direction to ascending.
  await page.getByRole("button", { name: /^Provider/ }).click();
  await expect(page.locator("th", { has: page.getByRole("button", { name: /^Provider/ }) })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  const providers = (await cellTexts(resultRows(page), "Provider")).map((value) => value.trim());
  expect(providers).toEqual([...providers].sort((a, b) => a.localeCompare(b)));

  // Clicking the same header again flips direction rather than re-keying.
  await page.getByRole("button", { name: /^Provider/ }).click();
  await expect(page.locator("th", { has: page.getByRole("button", { name: /^Provider/ }) })).toHaveAttribute(
    "aria-sort",
    "descending",
  );

  // The select control reflects the header-driven state, so the two controls
  // can never disagree about what the table is showing.
  await expect(page.getByLabel("Sort results")).toHaveValue("provider-desc");
});

test("scenario controls re-price rows without leaking a rate that is not billing yet", async ({ page }) => {
  // `exact` throughout this test: accessible-name matching is substring by
  // default, so "Now" would also match "Reset to now" and "Peak" would also
  // match "Off-peak".
  const timeMode = (label: string) => page.getByRole("button", { name: label, exact: true });

  // "Now" is the honest default: it may only ever show rates billable at this
  // instant, so no row may carry the scheduled-rate preview marker.
  await expect(timeMode("Now")).toHaveAttribute("aria-pressed", "true");
  await expect(resultsTable(page).locator(".scenario-preview")).toHaveCount(0);

  const before = await cellTexts(resultRows(page), "Workload cost");

  // Batch is published at half the standard rate for the tiers that offer it,
  // so switching service tier has to move money somewhere in the table.
  await page.getByLabel("Service tier").selectOption("batch");
  await expect.poll(() => new URL(page.url()).searchParams.get("tier")).toBe("batch");
  const batched = await cellTexts(resultRows(page), "Workload cost");
  expect(batched).not.toEqual(before);

  await page.getByLabel("Service tier").selectOption("standard");

  // Picking an explicit hour is what unlocks previews of scheduled rates. The
  // point of the assertion is the labelling contract, not the count: whatever
  // preview rows appear must say so in words, never silently.
  await timeMode("Peak").click();
  await expect(timeMode("Peak")).toHaveAttribute("aria-pressed", "true");
  await expect(timeMode("Now")).toHaveAttribute("aria-pressed", "false");
  for (const label of await resultsTable(page).locator(".scenario-preview").allInnerTexts()) {
    expect(label).toContain("preview");
  }

  await page.getByRole("button", { name: "Reset to now" }).click();
  await expect(timeMode("Now")).toHaveAttribute("aria-pressed", "true");
  await expect(resultsTable(page).locator(".scenario-preview")).toHaveCount(0);
});

test("a zero-result filter combination offers a recovery action that works", async ({ page }) => {
  const provider = (await resultRows(page).first().locator('td[data-label="Provider"]').innerText()).trim();
  const otherProvider = await page
    .getByLabel("Provider", { exact: true })
    .locator("option")
    .filter({ hasNotText: "All providers" })
    .filter({ hasNotText: provider })
    .first()
    .innerText();

  // Deliberately contradictory: a text search for one provider while the
  // provider select pins a different one can never match anything.
  await page.getByLabel("Search provider, model, or host").fill(provider);
  await page.getByLabel("Provider", { exact: true }).selectOption(otherProvider.trim());

  const empty = page.locator("section.result-empty");
  await expect(empty).toBeVisible();
  await expect(empty.getByRole("heading", { name: /broaden the cost search/i })).toBeVisible();
  await expect(resultsTable(page)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);

  await empty.getByRole("button", { name: "Clear filters" }).click();
  await expect(resultsTable(page)).toBeVisible();
  await expect(resultRows(page).first()).toBeVisible();
  await expect(page.getByLabel("Search provider, model, or host")).toHaveValue("");
});

test("pinning a lane updates the shortlist tray and the shareable URL", async ({ page }) => {
  const tray = page.getByRole("region", { name: "Pinned shortlist" });
  await expect(tray.locator(".shortlist-strip")).toHaveCount(0);

  const firstRow = resultRows(page).first();
  const model = (await firstRow.locator('td[data-label="Model"] a').innerText()).trim();
  // Located by class, not by accessible name: the name flips from
  // "Pin X to shortlist" to "Unpin X from shortlist" the moment it is pressed,
  // so a name-based locator would stop resolving exactly when it matters.
  const pin = firstRow.locator("button.pin-button");
  await pin.click();

  await expect(pin).toHaveAttribute("aria-pressed", "true");
  await expect(pin).toHaveAttribute("aria-label", `Unpin ${model} from shortlist`);
  await expect(tray.locator(".shortlist-chip-label")).toHaveText([model]);
  await expect(tray).toContainText("Shortlist · 1/4");
  await expect.poll(() => new URL(page.url()).searchParams.get("lanes")).not.toBeNull();

  // A pinned lane must survive a filter that hides it from the results — the
  // tray reads from the whole priced catalog, not the visible slice.
  await page.getByLabel("Search provider, model, or host").fill("zzzz-no-such-lane");
  await expect(page.locator("section.result-empty")).toBeVisible();
  await expect(tray.locator(".shortlist-chip-label")).toHaveText([model]);

  await page.getByRole("button", { name: "Clear filters" }).first().click();

  // Unpinning from the tray chip clears it everywhere.
  await tray.getByRole("button", { name: `Unpin ${model} from shortlist` }).click();
  await expect(tray.locator(".shortlist-strip")).toHaveCount(0);
});

test("the tray expands into a side-by-side comparison once two lanes are pinned", async ({ page, pageGuards }) => {
  const tray = page.getByRole("region", { name: "Pinned shortlist" });
  await pinRows(page, 1);

  const compareButton = tray.getByRole("button", { name: "Compare shortlist" });
  await expect(compareButton).toBeDisabled();

  // Side-by-side needs a second lane to compare against.
  await resultRows(page).nth(1).locator("button.pin-button").click();
  await expect(page.locator(".shortlist-chip-label")).toHaveCount(2);
  await expect(compareButton).toBeEnabled();
  await compareButton.click();

  const grid = tray.locator(".shortlist-grid");
  await expect(grid).toBeVisible();
  await expect(grid.locator("article.shortlist-card")).toHaveCount(2);
  // Exactly one card is the cost baseline; the other states its delta.
  await expect(grid.locator(".shortlist-baseline")).toHaveCount(1);
  await expect(grid.locator(".shortlist-card-delta")).toHaveCount(2);

  await pageGuards.inspect();
  pageGuards.assertClean();

  await tray.getByRole("button", { name: "Collapse comparison" }).click();
  await expect(grid).toHaveCount(0);

  await tray.getByRole("button", { name: "Reset shortlist" }).click();
  await expect(tray.locator(".shortlist-strip")).toHaveCount(0);
});

test("copy scenario link puts the current state on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.getByRole("button", { name: /RAG-heavy/ }).click();
  await pinRows(page, 1);
  await expect.poll(() => new URL(page.url()).searchParams.get("lanes")).not.toBeNull();
  const expected = page.url();

  await page.getByRole("button", { name: "Copy scenario link" }).click();
  await expect(page.locator(".share-status")).toHaveText("Scenario link copied.");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(expected);

  // The link must actually restore the state it claims to share.
  await page.goto(copied);
  await expect(page.getByRole("button", { name: /RAG-heavy/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".shortlist-chip-label")).toHaveCount(1);
});

test("export CSV downloads the visible lanes", async ({ page }) => {
  await page.getByLabel("Sort results").selectOption("inputUsd-asc");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export CSV" }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/^llm-spend-compare-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect(page.locator(".share-status")).toContainText(/^Exported \d+ lanes? to llm-spend-compare-/);

  // Reading the bytes back needs the browser's download manager to persist the
  // file, which some sandboxed environments refuse for *every* download
  // (verified: a plain server-served file is cancelled identically there, so
  // this is not about the app's blob URL). The wiring assertions above are the
  // load-bearing ones and always run; `buildCompareCsv`'s byte-exact output is
  // separately pinned by src/lib/compare-export.test.ts.
  const failure = await download.failure();
  if (failure !== null) {
    test.info().annotations.push({
      type: "environment",
      description: `download not persisted (${failure}); CSV body assertions skipped`,
    });
    return;
  }

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const body = Buffer.concat(chunks).toString("utf8");

  // A UTF-8 BOM so Excel on Windows does not mangle the non-ASCII model names,
  // then a header row and one line per visible lane.
  expect(body.startsWith("﻿")).toBe(true);
  const lines = body.split(/\r?\n/).filter((line) => line.trim() !== "");
  const { shown } = await laneCounts(page);
  expect(lines.length).toBeGreaterThan(shown);
});

test("back navigation restores the shared decision state", async ({ page }) => {
  // Everything the URL codec carries: workload, scenario, filters, sort, shortlist.
  await page.getByRole("button", { name: /Customer support/ }).click();
  await page.getByLabel("Service tier").selectOption("batch");
  await page.getByLabel("Sort results").selectOption("outputUsd-desc");
  await page.getByRole("button", { name: "Direct API", exact: true }).click();
  await pinRows(page, 1);

  await expect.poll(() => new URL(page.url()).searchParams.get("lanes")).not.toBeNull();
  const shared = page.url();
  const pinnedModel = (await page.locator(".shortlist-chip-label").first().innerText()).trim();

  // Leave the page through a real in-app link, then come back.
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Budget" }).click();
  await expect(page).toHaveURL(/\/budget$/);
  await page.goBack();
  await expect(page).toHaveURL(shared);

  // What the decision state guarantees on restore.
  await expect(page.getByRole("button", { name: /Customer support/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Service tier")).toHaveValue("batch");
  await expect(page.getByLabel("Sort results")).toHaveValue("outputUsd-desc");
  await expect(page.getByRole("button", { name: "Direct API", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".shortlist-chip-label")).toHaveText([pinnedModel]);

  // KNOWN AND ACCEPTED: purely local view toggles — "Show all N" and the
  // expanded tray — are not part of the shared state and reset on restore.
  // Asserted rather than ignored so that if a later change starts persisting
  // them, this test says so instead of quietly passing.
  await expect(page.locator(".shortlist-grid")).toHaveCount(0);

  await page.goForward();
  await expect(page).toHaveURL(/\/budget$/);
});

test("progressive disclosure reveals the full result set and collapses again", async ({ page }) => {
  const disclosure = page.locator(".result-disclosure");
  const { total } = await laneCounts(page);

  await expect(resultRows(page)).toHaveCount(12);
  await expect(disclosure).toContainText(`Showing 12 of ${total} lanes`);

  await disclosure.getByRole("button", { name: `Show all ${total}` }).click();
  await expect(resultRows(page)).toHaveCount(total);
  await expectNoHorizontalOverflow(page);

  await disclosure.getByRole("button", { name: "Show top 12" }).click();
  await expect(resultRows(page)).toHaveCount(12);
});

test("the page is usable on a narrow viewport", async ({ page, pageGuards }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoGuarded(page, "/compare");

  // Below 1080px the inline nav is replaced by the hamburger panel.
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  const menu = page.getByRole("button", { name: "Toggle menu" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  const mobileNav = page.getByRole("navigation", { name: "Mobile" });
  await expect(mobileNav.getByRole("link", { name: "Freshness" })).toBeVisible();
  await menu.click();
  await expect(mobileNav).toHaveCount(0);

  // The core flow still works at this width, and nothing overflows sideways
  // while doing it — the table becomes a stack of cards at <= 720px.
  await page.getByRole("button", { name: /RAG-heavy/ }).click();
  await page.getByLabel("Search provider, model, or host").fill("deepseek");
  await expect(resultRows(page).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await pinRows(page, 1);
  await expect(page.locator(".shortlist-chip-label")).toHaveCount(1);
  await expectNoHorizontalOverflow(page);

  await pageGuards.inspect();
  pageGuards.assertClean();
});

test.describe("reduced motion", () => {
  // `reducedMotion` is not a top-level test option in Playwright's typings, so
  // it is set through `contextOptions` — the documented route for browser
  // context options that have no dedicated `use` key.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("no essential behavior depends on an animation finishing", async ({ page, pageGuards }) => {
    await gotoGuarded(page, "/compare");

    // The entrance animation is decorative; the content it animates must be
    // present and readable with animation suppressed.
    await expect(page.locator("h1")).toBeVisible();
    await expect(resultRows(page).first()).toBeVisible();

    // Pin, filter and expand all resolve immediately — no transitionend waits.
    await pinRows(page, 2);
    const tray = page.getByRole("region", { name: "Pinned shortlist" });
    await expect(tray.locator(".shortlist-strip")).toBeVisible();
    await tray.getByRole("button", { name: "Compare shortlist" }).click();
    await expect(tray.locator("article.shortlist-card")).toHaveCount(2);

    await pageGuards.inspect();
    pageGuards.assertClean();
  });
});

test("the core flow is operable with the keyboard alone", async ({ page }) => {
  const search = page.getByLabel("Search provider, model, or host");

  // Reach the search field by tabbing, so the assertion covers focus order and
  // not just programmatic focus.
  await page.locator("body").press("Tab");
  for (let i = 0; i < 60 && !(await search.evaluate((node) => node === document.activeElement)); i += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(search).toBeFocused();

  // Keyboard focus must be visible, not just present.
  const outlineWidth = await search.evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(parseFloat(outlineWidth)).toBeGreaterThan(0);

  await page.keyboard.type("deepseek");
  await expect(resultRows(page).first()).toBeVisible();
  for (const value of await cellTexts(resultRows(page), "Provider")) {
    expect(value.toLowerCase()).toContain("deepseek");
  }

  // Sort by activating a column header button with the keyboard.
  const outputHeader = page.getByRole("button", { name: /^Output/ });
  await outputHeader.focus();
  await expect(outputHeader).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("th", { has: outputHeader })).toHaveAttribute("aria-sort", "ascending");

  // Pin the first result with Space, the other activation key for a button.
  const pin = resultRows(page).first().getByRole("button", { name: /^Pin / });
  await pin.focus();
  await page.keyboard.press(" ");
  await expect(page.locator(".shortlist-chip-label")).toHaveCount(1);
});

/**
 * Pin result rows `0..count-1`, waiting for each chip to land before the next
 * click so the assertions downstream never race the tray.
 */
async function pinRows(page: Page, count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    const pin = resultRows(page).nth(index).locator("button.pin-button");
    await expect(pin).toHaveAttribute("aria-pressed", "false");
    await pin.click();
    await expect(page.locator(".shortlist-chip-label")).toHaveCount(index + 1);
  }
}

/** "$12.34" -> 12.34, for order assertions on the money columns. */
function parseUsd(values: string[]): number[] {
  return values.map((value) => {
    const match = /\$([\d,]+(?:\.\d+)?)/.exec(value);
    expect(match, `no USD figure in ${JSON.stringify(value)}`).not.toBeNull();
    return Number(match![1].replace(/,/g, ""));
  });
}
