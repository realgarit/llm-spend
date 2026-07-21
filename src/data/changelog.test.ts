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
