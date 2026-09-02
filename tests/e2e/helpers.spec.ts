import { expect, installPageGuards, test } from "./helpers";
import type { Page } from "@playwright/test";

/**
 * Self-tests for the page guards.
 *
 * A guard that never fires is indistinguishable from a guard that has silently
 * stopped guarding, and every other spec file in this directory leans on these
 * six checks for most of its real coverage. So each one is provoked here
 * against a deliberately broken page and required to fail.
 *
 * These run on a **second page** in the same context, so the guards installed
 * automatically on the fixture's `page` never see the damage and the test can
 * assert on a handle it owns.
 */
async function brokenPage(page: Page): Promise<Page> {
  const probe = await page.context().newPage();
  await probe.goto("/compare", { waitUntil: "domcontentloaded" });
  return probe;
}

test("the guard catches a console error", async ({ page }) => {
  const probe = await brokenPage(page);
  const guards = installPageGuards(probe);

  await probe.evaluate(() => console.error("synthetic failure"));
  await expect.poll(() => guards.violations.length).toBeGreaterThan(0);

  expect(() => guards.assertClean()).toThrow(/console.*synthetic failure/s);
  await probe.close();
});

test("the guard classifies a hydration diagnostic separately", async ({ page }) => {
  const probe = await brokenPage(page);
  const guards = installPageGuards(probe);

  await probe.evaluate(() => console.error("Hydration failed because the server rendered HTML didn't match"));
  await expect.poll(() => guards.violations.length).toBeGreaterThan(0);

  expect(guards.violations[0].kind).toBe("hydration");
  await probe.close();
});

test("the guard catches an uncaught page exception", async ({ page }) => {
  const probe = await brokenPage(page);
  const guards = installPageGuards(probe);

  await probe.evaluate(() => setTimeout(() => { throw new Error("synthetic explosion"); }, 0));
  await expect.poll(() => guards.violations.length).toBeGreaterThan(0);

  expect(() => guards.assertClean()).toThrow(/pageerror.*synthetic explosion/s);
  await probe.close();
});

test("the guard catches a failed same-origin request, and allow() suppresses exactly that one", async ({ page }) => {
  const probe = await brokenPage(page);
  const guards = installPageGuards(probe);

  await probe.evaluate(() => fetch("/no-such-asset-for-the-guard-test.json").catch(() => undefined));
  await expect.poll(() => guards.violations.some((violation) => violation.kind === "request")).toBe(true);
  expect(() => guards.assertClean()).toThrow(/no-such-asset-for-the-guard-test/);

  guards.allow(/no-such-asset-for-the-guard-test/);
  expect(() => guards.assertClean()).not.toThrow();
  await probe.close();
});

test("the guard catches document-level horizontal overflow", async ({ page }) => {
  const probe = await brokenPage(page);
  const guards = installPageGuards(probe);

  await guards.inspect();
  expect(() => guards.assertClean(), "the real page must start clean").not.toThrow();

  await probe.evaluate(() => {
    const wide = document.createElement("div");
    wide.style.width = "3000px";
    wide.style.height = "10px";
    document.body.appendChild(wide);
  });
  await guards.inspect();

  expect(() => guards.assertClean()).toThrow(/overflow.*scrollWidth/s);
  await probe.close();
});

test("the guard catches rendered NaN / Infinity / undefined text", async ({ page }) => {
  const probe = await brokenPage(page);
  const guards = installPageGuards(probe);

  await guards.inspect();
  expect(() => guards.assertClean(), "the real page must start clean").not.toThrow();

  await probe.evaluate(() => {
    const leak = document.createElement("p");
    leak.textContent = "Blended input: $NaN / month, cache savings undefined";
    document.body.appendChild(leak);
  });
  await guards.inspect();

  expect(() => guards.assertClean()).toThrow(/non-finite.*NaN.*undefined/s);
  await probe.close();
});
