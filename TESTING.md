# Portfolio regression checks

Tests are development-only. No test library, browser binary, fixture, or report
is imported by the application or copied into a production build.

## Run in the Replit workspace

```sh
pnpm --filter @workspace/je-portfolio run test:unit
pnpm --filter @workspace/je-portfolio exec playwright install firefox webkit
pnpm --filter @workspace/je-portfolio run check
```

The first command runs only the fast, dependency-free bootstrap tests. `check`
typechecks the application **and tests**, then runs the bootstrap and browser
suites. The supplied Replit Chromium is detected automatically, **only for
Chromium projects**. Firefox and WebKit always use Playwright's version-matched
builds; install them once as shown above. On a supported Linux host, install the
required system libraries with `pnpm exec playwright install --with-deps
chromium firefox webkit` from the app directory. A missing browser or library is
a setup failure, not a skipped compatibility check.

Some Replit workspaces have only the supplied Chromium and do not permit
Playwright's Ubuntu system-package installer. In that case, run the Chromium
slice locally and use the exported GitHub workflow for the full three-engine
result; do not weaken the matrix, substitute Chromium for another engine, or
change publishing dependencies just to make the browser installer work:

```sh
pnpm --filter @workspace/je-portfolio exec playwright test --project='desktop-*' --project='mobile-*' --project='narrow-mobile-*'
```

The browser suite creates a fresh production build, checks its CSP and size
budgets, starts a temporary **HTTPS** loopback-only server on port 4175, and stops
it when finished. It does not use, replace, or weaken the managed development
preview. The server refuses to reuse an occupied port, so stale code cannot pass
a check.

Browser checks also require **OpenSSL** (included on the GitHub Ubuntu runner).
The server generates a fresh one-day loopback certificate in an ignored temporary
directory outside the served build, reads it into memory, and removes the files
before listening. Only the test browser contexts and readiness probe accept this
self-signed certificate.
WebKit upgrades loopback asset URLs under the existing
`upgrade-insecure-requests` CSP directive, so HTTP alone is not an equivalent
cross-engine test. No CSP directive is removed, no browser CSP bypass is enabled,
and no certificate, key, or TLS setting is added to the published site.

## Run the standalone GitHub export

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm check
```

Use `pnpm test:unit` for bootstrap only, or `pnpm test:browser` for the production
browser suite in all configured engines. For just the focused Firefox/WebKit
matrix, run `pnpm test:browser:compat` (in the workspace, prefix with
`pnpm --filter @workspace/je-portfolio run`). To run one changed flow:

```sh
pnpm test:browser tests/browser/motion.spec.ts --project=mobile-dark
pnpm test:browser tests/browser/workshop.spec.ts --project=webkit-mobile-light
pnpm test:browser tests/browser/navigation.spec.ts --project=firefox-desktop-dark
```

To check a subdirectory build:

```sh
PORTFOLIO_TEST_BASE_PATH=/portfolio/ pnpm test:browser tests/browser/navigation.spec.ts --project=desktop-dark --project=mobile-light --project=firefox-mobile-light --project=webkit-mobile-light
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an already-installed Chromium.
It is never passed to Firefox or WebKit. By default, outside Replit, Playwright
also uses its version-matched Chromium. Do not substitute a stock Firefox or
Safari binary: those do not expose Playwright's required automation protocol.
The tests do not need secrets, an API server, real user data, or external sites.

## Coverage

| Code / behavior | Persistent checks |
| --- | --- |
| `public/preferences.js` | Executes the real file in Node's VM before React: light/dark OS defaults; saved theme before preview before OS; invalid/empty values; absent `matchMedia`; blocked storage access and reads; saved pause and OS reduced-motion precedence. |
| `src/components/prefs.tsx` | Live OS theme changes before/after explicit saved or in-visit choices; preview choice is not saved; reload persistence; blocked storage reads, writes, and property access; all motion switches stay synchronized; reduced motion never overwrites user intent. |
| `src/components/site.tsx` | Theme button keyboard operation and accessible state; disabled motion switch under OS reduction; skip link; mobile-menu Escape and focus restoration; same-hash repeat clicks; native anchors; cross-route navigation; initial/encoded/bad hashes; Back/Forward; actual scroll destination below the sticky header; smooth versus instant scrolling. |
| `src/components/workshop.tsx` | Tab into/out of a shared-name native radio group, all arrow directions and wraparound, Space selection, exactly one checked radio, visible focus on the label, 44px labels, live explanatory text and SVG state; review switch with Space/Enter; interactions still work while paused. |
| Motion and mobile delivery | Actual CSS animation pause/resume, offscreen observer behavior, hidden-tab event handling, immediate reveal visibility under reduced motion, and no horizontal overflow at the workshop. |

### Engine matrix

| Engine | Projects / viewports | Scenarios |
| --- | --- | --- |
| Chromium | `desktop-light`, `desktop-dark` (1280×900); `mobile-light`, `mobile-dark` (390×844); `narrow-mobile-light`, `narrow-mobile-dark` (320×740) | Full suite, unchanged matrix. |
| Firefox | `firefox-desktop-dark` (1280×900); `firefox-mobile-light` (390×844) | Only the shared scenarios tagged `@compatibility`. |
| Playwright WebKit | `webkit-desktop-dark` (1280×900); `webkit-mobile-light` (390×844) | The same `@compatibility` scenarios as Firefox. |

The focused tag covers live OS theme changes, saved light/dark precedence and
reloads, keyboard theme selection/focus, shared saved motion switches, OS reduced
motion with/without saved intent, native workshop radio navigation, review-switch
Space/Enter activation, focus-visible rings, skip links, menu Escape, and the
entire anchor/hash navigation suite (including Back/Forward and smooth/instant
scrolling). These are the **same assertions** used in Chromium, not duplicated
smoke tests. Broader invalid/blocked-storage, preview-only theme, and synthetic
hidden/offscreen cases remain Chromium-only to limit CI cost.

Radio labels show their ring whenever the hidden native input is focused:
WebKit can clear `:focus-visible` during native arrow-key selection. The shared
assertions require actual focus plus a visible, solid, nontransparent ring at
least two pixels wide, rather than requiring one engine's focus heuristic.
Native Tab/arrow/Space behavior is unchanged; there are no custom key handlers.

Only the menu-specific scenario is skipped on desktop, where that menu
intentionally does not exist; there are no Firefox/WebKit-specific skips or
relaxed assertions. Each test has an isolated browser context. The suite fails
on uncaught errors, console errors, CSP violations, unexpected third-party
requests, or failed assertions. There are no automatic retries. All projects
share two workers and an **eight-minute global test limit**, with 30 seconds per
test, seven seconds per assertion, and two minutes for production-server startup.

**WebKit coverage is not Safari-device certification.** CI runs Playwright's
patched Linux WebKit, not the Safari app on macOS or iOS. Mobile projects change
viewport width and theme; they are not iPhone/iPad hardware, touch, browser-chrome,
OS keyboard-navigation settings, or VoiceOver tests. Firefox coverage likewise
uses Playwright's patched desktop Firefox, not Firefox for Android.

The visibility test supplies the browser's `visibilitychange` event and hidden
property deterministically; it verifies the real provider/CSS response, not
whether a particular headless window manager backgrounds a tab. This is not a
physical-device FPS, RAM, or full assistive-technology certification.

## Security and performance gates

The browser tests exercise the production CSP without `bypassCSP`, inline-script
exceptions, eval, external fonts, or development plugins. Before serving, the
suite checks that the policy precedes scripts, preferences precede the React
entry, the generated header template and HTTPS upgrade directive remain intact,
and tests/source maps/test certificates have not leaked into the site.

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
pushes, and manual requests. It installs all three engines and their Linux
dependencies, runs the full Chromium plus focused Firefox/WebKit suite and any
included publishing-policy tests, then a subdirectory navigation pass in
Chromium desktop/dark and mobile/light plus Firefox/WebKit mobile/light. All
engines reuse the same production server, CSP, and unchanged delivery budgets.
The job has a **15-minute limit** and cancels superseded runs on the same ref.
It does not deploy or merge anything, does not retain checkout credentials, and
only uploads failure diagnostics for seven days. All action revisions are pinned.

Builds, traces, screenshots, and HTML reports live under
`generated-artifacts/tests/`, ignored by Git and deployment. Open a failed run's
report with `pnpm exec playwright show-report generated-artifacts/tests/report`.
Never add reports, installed browsers, dependencies, or private workspace files
to a source-only GitHub commit.
