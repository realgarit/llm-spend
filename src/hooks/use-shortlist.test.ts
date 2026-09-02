import assert from "node:assert/strict";
import test from "node:test";
import { readStoredShortlist, writeStoredShortlist, type ShortlistStorage } from "@/hooks/use-shortlist";

/**
 * Scope note: only `readStoredShortlist`/`writeStoredShortlist` — the two
 * functions that actually touch storage — are covered here, via an injected
 * `ShortlistStorage` stub. `useShortlist` the React hook itself (mount
 * effects, `toggle`/`reset` callbacks, URL/storage precedence) is NOT
 * exercised: this repo's test runner (`tsx --test`, no JSDOM/RTL) has no way
 * to mount a hook, and that gap is accepted, not fixed here.
 */

/** A `ShortlistStorage` whose every method throws, standing in for a disabled/unavailable localStorage (quota exceeded, private browsing, storage blocked by policy, ...). */
function throwingStorage(): ShortlistStorage {
  const fail = (): never => {
    throw new Error("storage disabled");
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

/** A plain in-memory `ShortlistStorage`, backed by a `Map` the test can inspect directly — no DOM required. */
function memoryStorage(): { storage: ShortlistStorage; backing: Map<string, string> } {
  const backing = new Map<string, string>();
  const storage: ShortlistStorage = {
    getItem: (key) => backing.get(key) ?? null,
    setItem: (key, value) => {
      backing.set(key, value);
    },
    removeItem: (key) => {
      backing.delete(key);
    },
  };
  return { storage, backing };
}

// --- failure handling: the safety-critical property named in the Global
// --- Constraints ("must never crash the page") ---

test("readStoredShortlist catches a throwing storage.getItem and falls back to an empty list", () => {
  assert.deepEqual(readStoredShortlist(throwingStorage()), []);
});

test("writeStoredShortlist catches a throwing storage.setItem (non-empty write path) without propagating", () => {
  assert.doesNotThrow(() => writeStoredShortlist(["a", "b"], throwingStorage()));
});

test("writeStoredShortlist catches a throwing storage.removeItem (empty-list write path) without propagating", () => {
  assert.doesNotThrow(() => writeStoredShortlist([], throwingStorage()));
});

// --- normal round trip: verifies the injected-adapter refactor itself,
// --- not just its failure path ---

test("writeStoredShortlist then readStoredShortlist round-trips a shortlist through an injected storage", () => {
  const { storage } = memoryStorage();
  writeStoredShortlist(["a", "b", "c"], storage);
  assert.deepEqual(readStoredShortlist(storage), ["a", "b", "c"]);
});

test("readStoredShortlist returns an empty list when the injected storage has nothing written yet", () => {
  const { storage } = memoryStorage();
  assert.deepEqual(readStoredShortlist(storage), []);
});

test("writeStoredShortlist([]) clears the underlying key entirely rather than persisting an empty payload", () => {
  const { storage, backing } = memoryStorage();
  writeStoredShortlist(["a", "b"], storage);
  assert.equal(backing.size, 1);

  writeStoredShortlist([], storage);
  assert.equal(backing.size, 0);
  assert.deepEqual(readStoredShortlist(storage), []);
});
