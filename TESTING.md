# Portfolio regression checks

Tests are development-only. No test library, browser binary, fixture, or report
is imported by the application or copied into a production build.

## Run in the Replit workspace

```sh
pnpm --filter @workspace/je-portfolio run test:unit
pnpm --filter @workspace/je-portfolio run check
```

The first command runs only the fast, dependency-free bootstrap tests. `check`
typechecks the application **and tests**, then runs the bootstrap and browser
suites. The supplied Replit Chromium is detected automatically. Elsewhere,
install Chromium once with `pnpm exec playwright install chromium` from the app
directory (on Linux CI, use `--with-deps`).

The browser suite creates a fresh production build, checks its CSP and size
budgets, starts a temporary loopback-only server on port 4175, and stops it when
finished. It does not use, replace, or weaken the managed development preview.
The server refuses to reuse an occupied port, so stale code cannot pass a check.

## Run the standalone GitHub export

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
```

Use `pnpm test:unit` for bootstrap only, or `pnpm test:browser` for the production
browser suite. To run one changed flow:

```sh
pnpm test:browser tests/browser/motion.spec.ts --project=mobile-dark
```

To check a subdirectory build:

```sh
PORTFOLIO_TEST_BASE_PATH=/portfolio/ pnpm test:browser tests/browser/navigation.spec.ts
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an already-installed Chromium.
By default, outside Replit, Playwright uses its version-matched browser.
The tests do not need secrets, an API server, real user data, or external sites.

## Coverage

| Code / behavior | Persistent checks |
| --- | --- |
| `public/preferences.js` | Executes the real file in Node's VM before React: light/dark OS defaults; saved theme before preview before OS; invalid/empty values; absent `matchMedia`; blocked storage access and reads; saved pause and OS reduced-motion precedence. |
| `src/components/prefs.tsx` | Live OS theme changes before/after explicit saved or in-visit choices; preview choice is not saved; reload persistence; blocked storage reads, writes, and property access; all motion switches stay synchronized; reduced motion never overwrites user intent. |
| `src/components/site.tsx` | Theme button keyboard operation and accessible state; disabled motion switch under OS reduction; skip link; mobile-menu Escape and focus restoration; same-hash repeat clicks; native anchors; cross-route navigation; initial/encoded/bad hashes; Back/Forward; actual scroll destination below the sticky header; smooth versus instant scrolling. |
| `src/components/workshop.tsx` | Tab into/out of the native radio group, all arrow directions and wraparound, exactly one checked radio, visible focus on the label, 44px labels, live explanatory text and SVG state; review switch with Space/Enter; interactions still work while paused. |
| Motion and mobile delivery | Actual CSS animation pause/resume, offscreen observer behavior, hidden-tab event handling, immediate reveal visibility under reduced motion, and no horizontal overflow at the workshop. |

Every browser scenario runs in **light and dark** at **1280×900, 390×844, and
320×740**. Only the menu-specific scenario is skipped on desktop, where that
menu intentionally does not exist. Each test has an isolated browser context.
The suite fails on uncaught errors, console errors, CSP violations, unexpected
third-party requests, or failed assertions. There are no automatic retries.

The visibility test supplies the browser's `visibilitychange` event and hidden
property deterministically; it verifies the real provider/CSS response, not
whether a particular headless window manager backgrounds a tab. This is not a
physical-device FPS, RAM, or full assistive-technology certification.

## Security and performance gates

The browser tests exercise the production CSP without `bypassCSP`, inline-script
exceptions, eval, external fonts, or development plugins. Before serving, the
suite checks that the policy precedes scripts, preferences precede the React
entry, the generated header template remains intact, and tests/source maps
have not leaked into the site.

Budgets sum **all** emitted JS/CSS, including `preferences.js` and font CSS:

| Asset type | Raw cap | Gzip cap |
| --- | ---: | ---: |
| JavaScript | 285,000 bytes | 90,000 bytes |
| CSS | 51,000 bytes | 11,000 bytes |

These leave small bundler headroom around the existing approximately 87.2 kB
JavaScript / 9.8 kB CSS compressed entry bundles. Do not raise them just to make
a failing check pass. HTTP headers on the published site remain a separate
hosting verification; this suite does not claim to inspect production hosting.

## Export and GitHub review

From the original workspace, `node scripts/export-portfolio.mjs` copies the test source, configuration, this
guide, and the pinned, read-only GitHub workflow through an explicit allowlist.
`node --test scripts/export-portfolio.test.mjs` verifies the export contract and
test parity. After changing dependencies, regenerate the standalone lockfile
with `pnpm install --lockfile-only` inside the generated export, then verify
`pnpm install --frozen-lockfile` before updating the review branch.

The exported `.github/workflows/portfolio-checks.yml` runs on pull requests,
pushes, and manual requests. It runs the full suite, any included publishing-policy
tests, and a focused subdirectory navigation pass. It does not deploy or merge anything, does not retain checkout
credentials, and only uploads failure diagnostics for seven days. All action
revisions are pinned.

Builds, traces, screenshots, and HTML reports live under
`generated-artifacts/tests/`, ignored by Git and deployment. Open a failed run's
report with `pnpm exec playwright show-report generated-artifacts/tests/report`.
Never add reports, installed browsers, dependencies, or private workspace files
to a source-only GitHub commit.
