import assert from "node:assert/strict";
import test from "node:test";
import { parseFiniteUnits } from "@/components/workload-calculator";

/**
 * `parseFiniteUnits` is the guard that stops `workload-calculator.tsx`'s
 * number fields from ever committing a non-finite token count. The
 * component's own `onChange`/`onBlur` handlers aren't reachable through this
 * repo's `renderToStaticMarkup`-based test harness (no DOM events), so this
 * file exercises the extracted pure guard directly instead — same shape as
 * the existing fix in `budget-planner.tsx`'s `PlainNumberField`.
 */

test("parseFiniteUnits parses an ordinary decimal string", () => {
  assert.equal(parseFiniteUnits("12.5"), 12.5);
});

test("parseFiniteUnits parses a plain integer string", () => {
  assert.equal(parseFiniteUnits("42"), 42);
});

test("parseFiniteUnits rejects scientific notation that overflows to Infinity", () => {
  // Number("1e400") is literal Infinity, not NaN — this is the exact input
  // that let a workload token count reach Infinity and render as "$NaN" on
  // /budget's crossover section before this fix.
  assert.equal(parseFiniteUnits("1e400"), null);
  assert.equal(parseFiniteUnits("-1e400"), null);
});

test("parseFiniteUnits rejects the literal strings 'Infinity' and '-Infinity'", () => {
  assert.equal(parseFiniteUnits("Infinity"), null);
  assert.equal(parseFiniteUnits("-Infinity"), null);
});

test("parseFiniteUnits rejects non-numeric text", () => {
  assert.equal(parseFiniteUnits("abc"), null);
  assert.equal(parseFiniteUnits("12abc"), null);
});

// Not a case this helper needs to reject: both call sites in
// workload-calculator.tsx special-case an empty/blank string themselves
// *before* calling parseFiniteUnits, so Number("")'s quirky "" -> 0 behavior
// never actually reaches it. Documented here rather than asserted as a
// "rejects" case, since asserting that would misdescribe what the function
// does.
test("parseFiniteUnits treats an empty string as 0, matching Number('') — callers special-case '' themselves", () => {
  assert.equal(parseFiniteUnits(""), 0);
});

test("parseFiniteUnits accepts zero and negative finite numbers — callers decide how to clamp or reject those", () => {
  assert.equal(parseFiniteUnits("0"), 0);
  assert.equal(parseFiniteUnits("-5"), -5);
});
