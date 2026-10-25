# Je — Data & AI

A story-driven portfolio for Je Sai Kailash Pulipati, connecting business
analytics, manufacturing data engineering, and applied AI.

## Run locally

Requires Node.js 22.12+ and pnpm 10.

```sh
pnpm install
pnpm dev
```

## Check and build

```sh
pnpm typecheck
pnpm exec playwright install chromium firefox webkit
pnpm check
pnpm test:publishing
pnpm build
pnpm preview
```

The production site is generated in `dist/`. Serve it with an SPA fallback
to `index.html` so direct links to project pages work.
For a subdirectory deployment, set `BASE_PATH` when building.
No backend, API keys, database, or authentication service is required.

The regression suite checks preferences, keyboard controls, motion, and hash
navigation against a production build. Chromium runs the full theme/width matrix;
Firefox and Playwright WebKit run focused desktop/dark and mobile-width/light
compatibility checks. WebKit is engine coverage, not certification on physical
Safari devices. GitHub pull requests and pushes run all three engines. See
`TESTING.md` for focused commands, coverage, failure reports, and delivery budgets.
The included `.replit` selects static hosting with real response headers and
explicit project-page rewrites. It does not run the Vite development server.
See `PUBLISHING.md` before a release: `publishing.json` must use a verified
production URL, never a guessed domain or the development preview.
Until that URL is known, absolute social and canonical URLs are intentionally
omitted rather than pointing visitors to the wrong site.

## Edit the site

- `src/`: React components, portfolio content, styles, and routing.
- `public/images/`: original project imagery and portrait.
- `public/documents/`: public résumé.
- `index.html`: default metadata.
- `build/security.ts`: production content policy and header template.
- `build/publishing.ts`: crawler-visible route metadata and Replit hosting rules.
- `publishing.json`: the verified production origin, initially unset.
- `PUBLISHING.md`: release steps, boundaries, and live verification.
- `SECURITY.md`: security scope, hosting configuration, and verification.
- `UX-NOTES.md`: design references, rationale, and measured performance changes.
- `tests/`, `playwright.config.ts`, `TESTING.md`: development-only regression checks.
- `.github/workflows/portfolio-checks.yml`: read-only checks for the review branch.

Contact actions open email or the linked public profiles. There is no
background message-delivery service.
The agent workshop is an interactive illustration, not a live AI service.
Theme and motion preferences are stored locally in the visitor's browser.
Fonts are self-hosted; there are no analytics or third-party font requests.

The repository's original starter folders may also be present. They are
preserved rather than deleted; the standalone portfolio commands above run
the application in the root `src/` directory.

## Content boundaries

The stealth-startup case is anonymous. Its months-to-days improvement refers
to data processing and cleaning, not answer latency. Exact model versions,
deployment scale, and confidential client details are intentionally omitted.
Medical projects are experimental; they are not presented as clinically
validated products. Event details and disputed metrics should only be added
after confirmation.

Original portfolio content and images are retained for this portfolio.
Third-party dependencies retain their own licenses.
