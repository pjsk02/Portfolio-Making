# Portfolio publishing

## Release status

Publishing preparation is in place, but this is **not a verified live release**.
The deployment service reported no active deployment and no production URL on
October 25, 2026. Nothing has been published or merged by this work.
`publishing.json` therefore deliberately contains `"siteUrl": null`.

The remaining release gate is to obtain the actual published URL, configure it,
and verify the approved live release. Do not treat local tests, the development
preview, or a successful configuration validation as evidence of live headers.

## Selected host and scope

The portfolio uses Replit's **static-file serving**, not a Vite server:

- In this multi-artifact workspace, the portfolio's
  `.replit-artifact/artifact.toml` builds `dist/public` and declares
  `serve = "static"`, production response headers, and route rewrites.
- The workspace-level `.replit` also declares the documented
  `deployment.responseHeaders`. Its existing multi-service deployment target
  is preserved; do not mistake it for a portfolio-only static deployment.
- `node scripts/export-portfolio.mjs` produces an allowlisted, standalone
  portfolio under `generated-artifacts/github-portfolio`. Its generated
  `.replit` selects `deploymentTarget = "static"`, builds with `pnpm build`,
  serves `dist`, and includes `deployment.responseHeaders` and
  `deployment.rewrites`. This export does not publish the unused API or canvas.

Replit documents response headers and rewrite matching here:
https://docs.replit.com/features/deployment-customization/static-deployments-advanced

`_headers` remains a portable output for hosts that explicitly support it.
**It is not Replit's response-header configuration.**

### Policies

`build/security.ts` is the policy source:

- CSP permits local scripts, stylesheets, fonts and connections, with no inline
  JavaScript or eval. Only style attributes are allowed inline for React state.
- `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN` prevent embedding
  by unrelated origins. They are production response headers, not meta tags.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` disables camera, microphone, geolocation, payment and USB.
- `Strict-Transport-Security: max-age=31536000`. No `includeSubDomains` or
  preload commitment is made for domains the portfolio does not control.

Replit provides TLS. Live verification must confirm a valid HTTPS connection
and an HTTP-to-HTTPS redirect; CSP upgrade rules and HSTS do not replace that
first-request check. Do not configure a `Location` response header (reserved by
the host), turn off certificate validation, or publish a development server.

Each known `/work` and `/work/:slug` URL, with and without a trailing slash,
rewrites to its own generated HTML shell. Both crawlers and direct page loads
receive the right title, description and, once configured, canonical/social
URLs. The final `/* → /index.html` rule retains the SPA not-found experience.
Static assets must take precedence over rewrites. The tests detect drift
between the project list, hosting rules, and policy values.

## Set the public URL only when it is known

1. After the user-approved publishing step in the main project, use the
   deployment tools' `getDeploymentInfo()` result. Require `success`,
   `isDeployed`, a successful current build, and the intended visibility.
   Use `primaryUrl`; never infer it from the project name, development
   environment variables, an old portfolio domain, or the GitHub repository.
2. Set `siteUrl` in `publishing.json` to that verified HTTPS origin, with no
   path, query, fragment or credentials. This is public configuration, not a
   secret. A custom-domain change requires the same verification and rebuild.
3. Build and review again. Only an explicitly approved subsequent publish can
   make the absolute metadata live. If the platform has no URL before the
   first publish, this requires a second reviewed release; do not fabricate
   a URL to avoid that step.

Once set, build-time metadata includes canonical URLs, `og:url`, Open Graph
and Twitter large-image cards, image alt text/type/dimensions, and a sitemap.
The 1200 × 630 JPEG uses the existing portfolio portrait and self-hosted fonts.
It is at `public/images/social-card.jpg`. Navigation updates the browser's
metadata too; no crawler needs JavaScript to read a known route's metadata.
Unknown client routes are marked `noindex`.

The `siteUrl` is an origin. `BASE_PATH`, when building a portable subdirectory
export, supplies the URL prefix. The checked-in Replit hosting rules target
the portfolio at `/`; a subdirectory host needs matching host-level rewrites.

## Checks

In this workspace:

```sh
pnpm --filter @workspace/je-portfolio run typecheck
pnpm --filter @workspace/je-portfolio run test:publishing
PORT=19218 BASE_PATH=/ pnpm --filter @workspace/je-portfolio run build
```

In the standalone export:

```sh
pnpm typecheck
pnpm test:publishing
pnpm build
```

The build warns when the public URL is unset and deliberately omits absolute
URLs. This permits local development and an initial approved bootstrap
release; it does **not** mean the portfolio is share-ready.

Only after the configured URL is live and publishing has been approved:

```sh
pnpm --filter @workspace/je-portfolio run verify:published
# Standalone repository: pnpm verify:published
```

This read-only checker fails unless all of these are true:

- HTTP redirects to the same HTTPS page and normal TLS verification succeeds.
- Real response headers carry all six policies.
- The homepage, work index and every direct project link, including trailing
  slash variants, return the correct crawler-visible metadata.
- Redirects stay on the approved production origin and preserve each route.
- SPA fallback returns the application; it is not a login page or a generic
  successful response from another service.
- The share image, résumé, preferences script, stylesheet, font and compiled
  bundles return real content and correct MIME types, not the SPA fallback.

It deliberately refuses to run without a configured, valid production URL.
It does not publish, log in, write data, or claim that fixture tests checked a
live service. Save its actual output when the live gate can be completed.

## Review and approval boundaries

Keep the existing GitHub draft review workflow. Export only the portfolio
allowlist, preserve unrelated repository files, and do not push this
workspace's checkpoint commits as the standalone website.
Any remote author and committer must be the user's connected GitHub identity,
without agent attribution or co-author trailers.
Do not force-push, merge, publish, change the original Framer site, or enable
an automatic deployment as part of this preparation.
