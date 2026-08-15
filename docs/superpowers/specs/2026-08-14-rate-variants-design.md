# Rate variants: modelling prices that are not one number forever

Status: approved, phase 1 shipped (types + resolver + tests).
Date: 2026-08-14.

## Problem

`PricingEntry` assumes one flat rate per row, permanently. That assumption is now
false in five distinct ways, all live in the catalog today:

1. **Time of day.** DeepSeek moves to peak/off-peak billing at
   `2026-08-16T16:00:00Z`. Peak is 01:00-04:00 and 06:00-10:00 UTC; off-peak is
   every other hour at exactly half. One model, two prices, alternating hourly.
2. **Promo windows with an end date.** Gemini 3.6/3.7 Flash are halved through
   2026-12-31 and revert 2027-01-01.
3. **Promo windows that end sooner.** Qwen3.7 Max's 50% discount ends
   2026-08-31; the row reverts to list on 2026-09-01.
4. **Context bands.** Qwen publishes a 0-32K / 32K-256K / 256K-1M ladder;
   OpenAI publishes "Long Context" rates at roughly 2x.
5. **Service tiers.** Batch and Flex at ~50%, Priority at 1.8x, Moonshot's
   "highspeed" at 2x.

Today every one of these is encoded either as a **separate row with the
condition baked into the model name** ("GPT-5.6 Sol Long Context", "Qwen3.7 Max
(Promo)") or as **prose in `notes`**. Both are stringly typed. Nothing can
compute with them: the compare table cannot tell that two rows are the same
purchasable model, the cost calculator cannot pick the right band, and a rate
that expires on a known date silently goes stale until a human notices.

## Chosen model

One unifying concept: a **rate variant** — a set of conditions plus its own
explicitly published numbers.

A catalog row stays **one row** (one model, one purchasable lane). Variation is
structured sub-data on that row:

```ts
interface RateVariant {
  label: string;                 // "Off-peak", "Peak", "Batch", "256K-1M"
  conditions: RateConditions;    // from/until, utcHourWindows, contextBand, serviceTier
  inputUsd: number;
  cachedUsd: number | null;
  outputUsd: number;
  confidence?: Confidence;       // falls back to the row's
  cachedConfidence?: Confidence;
  notes?: string;
  sourceNote?: string;
}
```

`PricingEntry` gains an optional `variants?: RateVariant[]`. The existing flat
`inputUsd`/`cachedUsd`/`outputUsd` **remain** and act as the base/default rate.
That is what makes this backward compatible: all 67 existing rows stay valid and
unchanged, and any row without variants behaves exactly as before.

The cardinal rule of `providers.ts` — *"Do not invent numbers. Every rate traces
to an official page."* — is why variants store **explicit published numbers**,
never a multiplier applied at runtime. When a provider states "off-peak is half
of peak", a human does the arithmetic against the source at authoring time and
writes the result down with a `sourceNote`. Provenance is per-variant, so a
variant sourced from a different page than its row can say so.

## Rejected alternatives

**Row duplication per combination.** What we do today, extended. It does not
scale: Qwen alone would need 3 bands x 2 promo states, and adding tiers
multiplies again. It also produces duplicate rows in the compare table for what
is genuinely one purchasable model, which is the exact confusion the compare
page exists to remove.

**Runtime multipliers** (`peakMultiplier: 2`, `batchMultiplier: 0.5`). Compact,
but it computes a price the site then displays as if it were published. That
directly violates the cardinal rule and would be indistinguishable, in the UI,
from an officially sourced number. Rejected on identity grounds, not ergonomics.

**Zod for schema validation.** The catalog is a static TypeScript literal
already fully checked by `tsc` at build time. There is no untrusted input to
parse. Adding a runtime validator would add a dependency to a project whose
whole point is zero runtime dependencies beyond `next`/`react`, in exchange for
checking something the compiler already checks.

**ISR with `revalidate: 3600`.** Tempting for the DeepSeek hourly flip, but
wrong in two ways. The peak boundaries are hour-aligned, so an hourly
revalidation window is stale *precisely at* the moment the rate changes — the
worst possible phase. And behind a CDN the revalidation is best-effort: the
first request after expiry serves the stale page. A price that is wrong for the
first N seconds of every peak transition is not acceptable for a site whose
premise is accuracy.

## Matching semantics

Enforced in `src/lib/rates.ts` and pinned by `src/lib/rates.test.ts`:

- Variants are evaluated in **array order; first match wins**. Authoring order
  is priority order — put the more specific variant first.
- `from` is **inclusive**, `until` is **exclusive**, so back-to-back variants
  can share an instant without overlapping. An unparseable date never matches;
  we drop a variant rather than quote a price off a typo.
- `utcHourWindows` are half-open `[start, end)` on `now.getUTCHours()`, and a
  window may **wrap midnight** (`{ startHourUtc: 22, endHourUtc: 2 }`). A window
  with equal bounds is empty and never matches. Multiple windows are ORed.
- `contextBand.minTokens` is inclusive, `maxTokens` exclusive, absent bound is
  unbounded. If `ctx.contextTokens` is undefined, a variant **with** a band does
  **not** match — we cannot claim a band price without knowing the prompt size.
- `serviceTier`: a variant with no tier matches only `standard` (or an
  unspecified context tier); a variant with a tier matches only that exact tier.
- If nothing matches, the row's base rate is returned with `variant: null`.
- **UTC accessors only.** These windows are absolute instants; reading them in
  the server's or the browser's local zone would quote the wrong price for most
  of the world.

## Resolver API

`src/lib/rates.ts`, no dependencies:

- `matchesConditions(c, ctx): boolean`
- `resolveRate(entry, ctx): ResolvedRate` — the rate in force, plus which
  variant produced it (`variant`, `label`) and its effective confidence.
- `applicableVariants(entry, ctx): RateVariant[]` — everything that applies
  **ignoring time of day**, for showing the full picture (both halves of a
  peak/off-peak pair, not just this hour's).
- `rateRange(entry, ctx)` — `{ min/max input, min/max output, varies }` across
  those, for rendering "$0.66-$1.32".
- `nextRateChange(entry, ctx)` — `{ at, label }` for the next boundary at which
  the resolved variant changes, for the countdown UI. `label` is the *incoming*
  rate's label, or `BASE_RATE_LABEL` when the base rate takes over.

`RateContext` is `{ now: Date; contextTokens?: number; serviceTier?: ServiceTier }`.

## Rendering strategy

The site is statically rendered, so "what time is it" cannot be a build-time
fact for an hourly-varying rate. The approach avoids both stale HTML and a
content swap:

1. **Server** resolves at build time and renders that rate, *plus the full
   variant list* — every number is in the HTML, so nothing has to be fetched or
   computed to see the whole picture.
2. **Client** re-resolves at mount with the real `now` and marks which variant
   is currently active, plus a countdown to `nextRateChange`.

Because the numbers are all present server-side, the client only moves an
"active" marker and fills in a countdown. There is no price flicker, the page is
correct without JS (it shows every published rate and the conditions for each),
and search engines and no-JS readers get real data rather than a placeholder.

## Phased rollout

1. **This phase** — `types.ts` additions (`ServiceTier`, `UtcHourWindow`,
   `RateConditions`, `RateVariant`, `PricingEntry.variants`), `lib/rates.ts`
   resolver, `lib/rates.test.ts`. No data or component changes; all 67 rows
   untouched.
2. **Data migration** — collapse the name-encoded rows (Long Context, promo
   variants, Qwen bands) into variants on their parent rows; add DeepSeek
   peak/off-peak; add Gemini and Qwen promo expiries.
3. **Rendering** — provider tables and rate cards consume `resolveRate` /
   `applicableVariants` / `rateRange`; add the client active-marker and
   countdown.
4. **Compare page** — scenario controls (time of day, prompt size, service
   tier) that feed a `RateContext` into the comparison, so the table can answer
   "cheapest at 200K tokens on batch, right now".
