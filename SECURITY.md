# Security and privacy

## Scope

The portfolio is a static React website. It has no login, payments, uploads,
database access, message-delivery endpoint, AI API calls, or client-side secrets.
Contact links open the visitor's email application or the public profiles.
The workshop is explicitly an illustration; it does not process visitor data.
Only theme and motion preferences are stored locally, without cookies.

The surrounding Replit development workspace also contains an unused API
scaffold and a private component-preview sandbox. Neither is included in the
standalone portfolio export or required to serve the portfolio.

## Controls in the application

- Production builds inject a Content Security Policy before scripts. It blocks
  inline JavaScript, eval, external scripts, objects, frames, forms, and workers.
- Stylesheets and fonts are local. Inline style attributes remain allowed for
  React's visual state, not arbitrary HTML or JavaScript.
- Portfolio content is rendered as React text, not untrusted HTML.
- Theme values are allowlisted; storage failures fall back to system settings.
- Referrer metadata is present. External new-tab links use `noopener`/`noreferrer`.
- Source exports exclude secrets, conversation/research archives, local caches,
  dependencies, and development build output.
- Unused frontend libraries and starter UI components were removed.

## Hosting headers

The build emits `_headers` for hosts that document support for that format,
including Netlify and Cloudflare Pages. **Replit static publishing does not read
that file**: configure the equivalent response headers in its deployment
settings / `[[deployment.responseHeaders]]` configuration. Those entries are
now configured in the workspace `.replit` and in the standalone export's
generated static `.replit`. The portfolio artifact also declares production
response headers on its static service. See `PUBLISHING.md` for host scope,
the URL gate, review boundaries, and live checks.

The exact values are exported as `responseHeaders` in `build/security.ts`:

- `Content-Security-Policy` (including `frame-ancestors 'self'`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=31536000` (no subdomain/preload commitment)

The HTML policy works independently of hosting support, except that browsers
require **HTTP headers** for frame-ancestor protection, MIME-sniffing protection,
and permissions policy. Do not claim those controls are active until the
published response has been inspected. Use HTTPS and an SPA fallback to
`index.html`. Never publish the Vite development server.

Replit documentation:
https://docs.replit.com/features/deployment-customization/static-deployments-advanced

## Verification

Run `pnpm typecheck`, `pnpm test:publishing`, `pnpm build`, and a current
dependency audit before a release in the standalone export (use the portfolio
workspace filter here). Inspect the generated `dist/index.html` policy
(`dist/public/index.html` in the workspace). After an approved publish,
`pnpm verify:published` checks real HTTP headers, direct project links,
metadata, HTTPS, the share image, assets, and the résumé.
Development preview headers and development-tool traffic are not evidence of
production configuration.

Automated dependency, static-code, and privacy/data-flow scanning are useful
checks, not a penetration test or a guarantee that a site has no vulnerabilities.
Repeat after dependency updates or introducing forms, authentication, analytics,
third-party embeds, or a real AI backend.

### Review on October 24, 2026

| Check | Before remediation | After remediation |
| --- | --- | --- |
| Dependency advisories | 11: 4 high, 5 moderate, 2 low | 0 reported |
| Static-code security | 0 reported | 0 reported; scan complete |
| Privacy/data-flow | 0 reported | 0 reported |

The dependency fixes covered body-parser, fast-uri, undici, and Zod.
The vulnerable selector-parser dependency was removed with the unused
typography plugin, rather than forcing an incompatible parser major version.
The unused API scaffold also has smaller request-body limits and rejects
compressed bodies; it is not needed by the portfolio.

The production build and generated policy were checked locally. Published
HTTP headers, TLS configuration, and hosting access controls were **not**
verified; they require a separate check against the actual published site.

### Publishing preparation on October 25, 2026

The header and routing configurations have passed the platform's schema
validation. A build-time metadata pipeline and a read-only live verifier are
included. The deployment service reports no active deployment or production
URL, so live TLS/headers/routing and absolute social URLs remain **unverified**.
No publish or merge is authorized by this preparation. These changes do not
constitute a new security-scan result.
