# Browser quality gate

Playwright + axe-core checks that run the site the way a visitor gets it: a real
production build, served by the Next.js standalone server, driven in Chromium.

The unit suite (`npm test`) covers pure logic — pricing resolution, the URL
codec, CSV bytes, shortlist rules. This suite covers what only a browser can
tell you: that the page hydrates without errors, that the controls actually
work, that nothing overflows or shifts, that it is operable by keyboard, and
that it did not quietly gain 300KB of JavaScript.

## Running it

```bash
npm run test:e2e            # build, serve, run everything
npm run test:all            # unit tests, then the browser suite
npx playwright test compare.spec.ts          # one file
npx playwright test -g "keyboard"            # one test by name
npx playwright show-report                   # last HTML report
```

The first run builds the app, which takes a few minutes. While iterating on the
specs themselves you can reuse the build you already have:

```bash
E2E_SKIP_BUILD=1 npm run test:e2e
```

`tests/e2e/serve.mjs` is the server harness. It runs `npm run build`, finds the
standalone `server.js` (Next nests it under the output-file-tracing root, which
is *not* `.next/standalone/server.js` when the repo is checked out as a git
worktree inside another checkout), copies `.next/static` and `public` next to
it, and starts it on `127.0.0.1:3210`. `next dev` is deliberately not used —
dev mode ships unminified bundles, an error overlay and development-only React
warnings, which would make both the performance budgets and the console-error
guard meaningless.

## The files

| File | What it covers |
| --- | --- |
| `helpers.ts` | `installPageGuards(page)` and the `test` export that installs it automatically |
| `helpers.spec.ts` | Self-tests: each guard is provoked and required to fail |
| `routes.spec.ts` | Every published route loads clean; 404 behavior; nav wiring |
| `compare.spec.ts` | The decision workspace end to end (see below) |
| `accessibility.spec.ts` | axe scans, both themes, static and driven states |
| `visual.spec.ts` | Four `/compare` pixel baselines |
| `performance.spec.ts` | LCP, CLS and transfer budgets |

## Page guards

Every test in this directory automatically fails on:

1. a console error,
2. an uncaught page exception,
3. a failed same-origin request (transport failure, or any status >= 400),
4. document-level horizontal overflow at the active viewport
   (`documentElement.scrollWidth > documentElement.clientWidth`),
5. a React/Next hydration-mismatch diagnostic,
6. visible `NaN`, `Infinity` or `undefined` text.

1-3 and 5 record continuously; 4 and 6 read the DOM, so they run at the end of
each test and wherever a spec calls `pageGuards.inspect()` mid-flow.

When a failure *is* the expectation — a test that deliberately requests a
missing route — narrow it with `pageGuards.allow(/pattern/)`. Keep the pattern
tight; a broad one disarms the guard for the whole test.

## Accessibility threshold

**Zero `serious` and zero `critical` axe violations**, scanned against
`wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` in both light and dark themes, on
the initial render *and* after the compare workspace has been driven (pinned
rows, expanded tray) and in its empty state at 375px. `moderate` and `minor`
findings are attached to the report but do not fail the build.

There is one documented exception. The palette has pre-existing WCAG AA
contrast debt — `--text-faint`, `--brand`, and the three provenance colors on
their soft backgrounds, worst at 2.89:1 against the required 4.5:1 — which
fails on essentially every page in both themes. `KNOWN_CONTRAST_DEBT` in
`accessibility.spec.ts` lists the exact `foreground|background` pairs, so a
*new* low-contrast combination still fails the build. Delete that list once the
palette is fixed.

## Visual baselines

Four full-page captures of `/compare`: 1280px and 375px, light and dark.

Two things make them reproducible: the clock is pinned with
`page.clock.setFixedTime` (several rows resolve their rate against the real
clock, so DeepSeek would otherwise read "Peak" or "Off-peak" depending on when
you ran the suite), and fonts are self-hosted so no network font can swap in
late.

**They are recorded manually and never by CI.**

```bash
npm run test:e2e:update     # re-record; CI must never run this
```

After re-recording, open the four PNGs and look at them before committing. A
broken or half-rendered image committed as the golden reference is worse than
no baseline at all — every later run then diffs against damage.

Two things to know before you trust or change them:

- **They churn on catalog data.** This repo re-verifies provider pricing daily,
  and the images are literal renders including prices and row order, so a rate
  change means a re-record. Masking the price cells was tried and rejected:
  Playwright merges adjacent masks, so the five numeric columns became one
  opaque block over ~40% of the table and the baseline stopped being something
  a human could review — while still churning on row order and the cost-signal
  rail. Legibility won.
- **They are platform-specific.** Text antialiasing differs enough between
  Windows and Linux that a shared baseline would diff on every run, so the
  committed files carry Playwright's default platform suffix
  (`…-chromium-win32.png`). On a platform with no baseline these tests **skip
  with a reason** rather than fail on a missing file — which today means they
  do not run on the Linux CI runner. To close that gap, record a Linux set
  inside the matching Playwright container and commit it alongside:

  ```bash
  docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.62.1-noble \
    sh -c "npm ci && npm run test:e2e:update"
  ```

## Performance budgets

| Metric | Budget |
| --- | --- |
| LCP | ≤ 4000 ms |
| CLS | ≤ 0.1 |
| Compressed JS per route | ≤ 500 KB |
| Total route payload | ≤ 1.5 MB |

**How they are measured.** LCP and CLS come from the browser's own
`PerformanceObserver` with `buffered: true` — the last
`largest-contentful-paint` entry, and the sum of `layout-shift` values with
`hadRecentInput === false`. Transfer sizes come from the Resource Timing API:
`encodedBodySize`, which is bytes on the wire after content-encoding, i.e.
exactly what a "compressed JS" budget means. `transferSize` (body + headers) is
reported alongside but not asserted on, so a header change cannot move the gate.

Sizes are sampled at the `load` event, so Next's App Router prefetching of
*other* routes is not charged to the route under test; the settled totals are
attached to the report, and settled JS is additionally asserted so deferring the
bundle past `load` cannot slip past the budget. `compare.spec.ts`'s sibling test
also measures CLS *during* interaction, since filtering and pinning rewrite the
table long after load.

These run on localhost against a warm server. They are a regression signal —
"this route did not suddenly gain 300KB" — not a field measurement. As of the
last run every route sits at roughly 110-145KB of JS and 235-345KB total, with
LCP under 300ms and CLS under 0.001.

## CI

`.github/workflows/ci.yml` installs Chromium with `--with-deps`, then runs
`npm run test:e2e` after the build step. On failure it uploads
`playwright-report/` and `test-results/` (traces, videos, failure screenshots)
as artifacts. It never runs `test:e2e:update`.

## Conventions worth keeping

- **Locate by role and accessible name**, not by CSS, except where the name
  itself changes with state — the pin control flips between "Pin X to
  shortlist" and "Unpin X from shortlist", so it is located as
  `button.pin-button`.
- **`exact: true` on short names.** Accessible-name matching is substring by
  default, so `name: "Now"` also matches "Reset to now" and `name: "Peak"` also
  matches "Off-peak".
- **Assert structurally, not numerically.** "Every visible row names the
  provider I filtered to" survives a daily price update; "the table shows 9
  rows" does not.
- **Derive fixtures from the live page** where a value must exist — read the
  provider name off a row that already satisfies the other filters rather than
  hard-coding one that may stop satisfying them.
