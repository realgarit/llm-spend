import assert from "node:assert/strict";
import test from "node:test";
import { changelog } from "./changelog";

test("every changelog entry has labeled sources", () => {
  assert.ok(changelog.length > 0);

  for (const entry of changelog) {
    assert.ok(entry.sources.length > 0, `${entry.date} ${entry.title} has no sources`);
    assert.match(entry.sourcesVerifiedOn, /^\d{4}-\d{2}-\d{2}$/, `${entry.date} has no source verification date`);
    assert.ok(
      entry.sourcesVerifiedOn >= entry.date,
      `${entry.date} sources were verified before the entry was published`,
    );

    const hrefs = new Set<string>();
    for (const source of entry.sources) {
      assert.ok(source.label.trim().length > 0, `${entry.date} has an unlabeled source`);
      assert.match(source.href, /^(https:\/\/|\/)/, `${entry.date} has an invalid source URL: ${source.href}`);
      assert.ok(!hrefs.has(source.href), `${entry.date} repeats source URL: ${source.href}`);
      hrefs.add(source.href);
    }
  }
});

test("the newest entry is first, so the rendered changelog reads newest-first", () => {
  for (let i = 1; i < changelog.length; i += 1) {
    assert.ok(
      changelog[i - 1].date >= changelog[i].date,
      `${changelog[i - 1].date} is listed before the newer ${changelog[i].date}`,
    );
  }
});

test("the decision workspace release states its customer-visible effect on the current date", () => {
  const entry = changelog.find((candidate) => candidate.date === "2026-09-02");
  assert.ok(entry, "expected a 2026-09-02 changelog entry for the connected decision workspace");

  const body = entry.body.join(" ");
  // Every surface this release actually connects has to be described, not just named in a commit.
  for (const surface of [/shareable|share|link/i, /CSV/, /shortlist/i, /budget/i, /freshness/i]) {
    assert.match(body, surface, `2026-09-01 entry does not describe ${surface}`);
  }
  // Cost-only language boundary: the site never ranks lanes by quality.
  assert.doesNotMatch(body, /\bbest\b/i);
  assert.doesNotMatch(body, /\brecommend/i);
  // No pricing moved in this release; say so rather than leaving it ambiguous.
  assert.match(body, /no (catalog )?(price|rate)/i);
});
