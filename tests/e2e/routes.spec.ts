import { escapeRegExp, expect, gotoGuarded, SAMPLE, test } from "./helpers";

/**
 * Every route the site publishes, loaded end to end against the production
 * build. The assertions here are deliberately thin — a heading and a title —
 * because the real coverage comes from the page guards this file's `test`
 * installs automatically: a console error, a broken same-origin request, a
 * hydration mismatch, horizontal overflow, or a rendered `NaN`/`Infinity`/
 * `undefined` fails the route regardless of what the visible copy says.
 *
 * The dynamic routes use one real id each rather than all 66 lanes and 10
 * providers: the page component is identical across them, so sweeping every
 * parameter would multiply runtime without testing new code. `sitemap.ts`
 * already enumerates them, and `generateStaticParams` means a broken parameter
 * fails the build long before it could reach here.
 */
const ROUTES: { path: string; heading: RegExp }[] = [
  { path: "/", heading: /what llm apis\s+actually cost/i },
  { path: "/compare", heading: /^compare cost, not sticker price$/i },
  { path: `/providers/${SAMPLE.providerSlug}`, heading: new RegExp(`^${escapeRegExp(SAMPLE.providerName)}$`, "i") },
  { path: "/cache-economics", heading: /the bill that fell/i },
  { path: "/rate-limits", heading: /^rpm vs tpm$/i },
  { path: "/changelog", heading: /^changelog$/i },
  { path: `/models/${SAMPLE.laneId}`, heading: new RegExp(`^${escapeRegExp(SAMPLE.model)}$`, "i") },
  { path: "/budget", heading: /^monthly budget and break-even planner$/i },
  { path: "/freshness", heading: /^freshness and provenance command center$/i },
];

for (const route of ROUTES) {
  test(`${route.path} loads clean`, async ({ page, pageGuards }) => {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route.path} should return 200`).toBe(200);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(route.heading);
    await expect(page).toHaveTitle(/.+/);

    // The header nav is rendered by a client component, so its presence after
    // hydration is a cheap end-to-end proof that the client bundle actually ran
    // on this route rather than silently failing.
    await expect(page.getByRole("banner")).toBeVisible();

    await pageGuards.inspect();
    pageGuards.assertClean();
  });
}

test("an unknown route renders the 404 page rather than crashing", async ({ page, pageGuards }) => {
  // The 404 status *is* the expectation here, so the request guard is told to
  // expect it for this one URL — narrowly, so a 404 on any other resource
  // (a missing chunk, a dropped font) would still fail the test.
  pageGuards.allow(/definitely-not-a-real-route/);

  const response = await page.goto("/definitely-not-a-real-route", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).toContainText(/not found|404|no line item/i);
});

test("every primary nav destination is reachable from the header", async ({ page }) => {
  await gotoGuarded(page, "/");
  const links = page.getByRole("navigation", { name: "Primary" }).getByRole("link");
  const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  expect(hrefs).toEqual(["/", "/compare", "/budget", "/freshness", "/cache-economics", "/rate-limits", "/changelog"]);
});
