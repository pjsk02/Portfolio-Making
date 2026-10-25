import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { build } from "vite";
import { escapeHtml, metadataForPath, PUBLIC_ROUTES, renderMetadata, validateSiteUrl } from "../src/metadata.ts";
import { portfolioPublishing, replitHostingRules, routeFile, standaloneReplitConfig } from "./publishing.ts";
import { contentSecurityPolicy, portfolioSecurity, responseHeaders } from "./security.ts";
import { checkHeaders, checkHtmlMetadata, verifyPublishedSite } from "./verify-published.ts";

// Reserved documentation origin, only for test fixtures; never app configuration.
const origin = "https://portfolio.example.com";
const htmlFor = (route: string) => `<head>${renderMetadata(metadataForPath(route, origin))}</head><div id="root"></div><script type="module" src="/assets/index-test.js"></script><link rel="stylesheet" href="/assets/index-test.css">`;

test("a missing production URL never invents canonical, social-image, or og:url URLs", () => {
  assert.equal(validateSiteUrl(null), null);
  for (const route of PUBLIC_ROUTES) {
    const tags = metadataForPath(route, null);
    assert.ok(!tags.some((tag) => tag.attrs.rel === "canonical" || ["og:url", "og:image"].includes(tag.attrs.property) || tag.attrs.name === "twitter:image"));
  }
});

test("only an HTTPS production origin is accepted", () => {
  assert.equal(validateSiteUrl(`${origin}/`), origin);
  for (const url of ["", undefined, "http://portfolio.example.com", "https://localhost", "https://127.0.0.1", "https://preview.replit.dev", "https://demo.repl.co", "https://portfolio.example.com/work", "https://portfolio.example.com?token=private", "https://user:password@portfolio.example.com", "https://portfolio.example.com:8080", "https://portfolio.example.com#work"]) {
    assert.throws(() => validateSiteUrl(url));
  }
});

test("every project has unique crawler metadata, absolute URLs, and base-path support", () => {
  const titles = new Set<string>();
  for (const route of PUBLIC_ROUTES) {
    const tags = metadataForPath(route, origin, "/portfolio/");
    titles.add(tags.find((tag) => tag.tag === "title")!.text!);
    assert.equal(tags.find((tag) => tag.attrs.rel === "canonical")!.attrs.href, `${origin}/portfolio/${route.slice(1)}`);
    assert.equal(tags.find((tag) => tag.attrs.property === "og:image")!.attrs.content, `${origin}/portfolio/images/social-card.jpg`);
    assert.deepEqual(tags, metadataForPath(`${route}/`, origin, "/portfolio/"));
  }
  assert.equal(titles.size, PUBLIC_ROUTES.length);
  assert.ok(metadataForPath("/missing", origin).some((tag) => tag.attrs.name === "robots" && tag.attrs.content === "noindex, follow"));
  assert.equal(escapeHtml('<"&\'>'), "&lt;&quot;&amp;&#39;&gt;");
});

test("headers are real HTTP policies; frame-ancestors is not put in the meta policy", () => {
  checkHeaders(new Headers(responseHeaders));
  assert.ok(!contentSecurityPolicy.includes("frame-ancestors"));
  assert.match(responseHeaders["Content-Security-Policy"], /frame-ancestors 'self'/);
  for (const name of Object.keys(responseHeaders)) {
    const headers = new Headers(responseHeaders);
    headers.delete(name);
    assert.throws(() => checkHeaders(headers), /Missing HTTP response header/);
  }
  const weak = new Headers(responseHeaders);
  weak.set("Content-Security-Policy", "default-src * 'unsafe-inline'");
  assert.throws(() => checkHeaders(weak), /Unexpected Content-Security-Policy/);
});

test("Replit static rules cover route variants, preserve fallback, and do not rely on _headers", () => {
  const rules = replitHostingRules("services.production");
  const artifactPath = new URL("../.replit-artifact/artifact.toml", import.meta.url);
  if (existsSync(artifactPath)) {
    const config = readFileSync(artifactPath, "utf8");
    assert.ok(config.includes(rules.trim()), "Artifact hosting rules have drifted from build/security.ts or the project routes.");
    assert.match(config, /serve = "static"/);
    const rootConfig = readFileSync(new URL("../../../.replit", import.meta.url), "utf8");
    for (const [name, value] of Object.entries(responseHeaders)) {
      assert.ok(rootConfig.includes(`name = ${JSON.stringify(name)}\nvalue = ${JSON.stringify(value)}`), `Root deployment header drift: ${name}`);
    }
  } else {
    assert.equal(readFileSync(new URL("../.replit", import.meta.url), "utf8"), standaloneReplitConfig());
  }
  for (const route of PUBLIC_ROUTES.slice(1)) {
    assert.ok(rules.includes(`from = "${route}"\nto = "/${routeFile(route)}"`));
    assert.ok(rules.includes(`from = "${route}/"\nto = "/${routeFile(route)}"`));
  }
  assert.ok(rules.endsWith('from = "/*"\nto = "/index.html"\n'));
  assert.ok(!rules.includes("_headers"));
});

test("verification rejects a generic home shell for a direct project share", () => {
  for (const route of PUBLIC_ROUTES) checkHtmlMetadata(htmlFor(route), route, origin);
  assert.throws(() => checkHtmlMetadata(htmlFor("/"), "/work/medfind", origin));
  assert.throws(() => checkHtmlMetadata('<html>Sign in</html>', "/", origin));
});

test("the actual build emits route HTML and absolute metadata without executing browser JavaScript", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "portfolio-publishing-"));
  try {
    writeFileSync(path.join(root, "publishing.json"), JSON.stringify({ siteUrl: origin }));
    writeFileSync(path.join(root, "index.html"), '<!doctype html><html><head><!-- portfolio:metadata:start --><!-- portfolio:metadata:end --></head><body><div id="root"></div></body></html>');
    await build({
      configFile: false, root, base: "/portfolio/", logLevel: "silent",
      plugins: [portfolioSecurity(), portfolioPublishing()],
    });
    for (const route of PUBLIC_ROUTES) {
      const html = readFileSync(path.join(root, "dist", routeFile(route)), "utf8");
      checkHtmlMetadata(html, route, origin, "/portfolio/");
      assert.match(html, /http-equiv="Content-Security-Policy"/);
    }
    const sitemap = readFileSync(path.join(root, "dist/sitemap.xml"), "utf8");
    for (const route of PUBLIC_ROUTES) assert.ok(sitemap.includes(`${origin}/portfolio/${route.slice(1)}</loc>`));
    assert.ok(readFileSync(path.join(root, "dist/_headers"), "utf8").includes("frame-ancestors 'self'"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the live verifier covers HTTPS, all direct links, fallback, and assets without a real publish", async () => {
  const requested: string[] = [];
  const fixtureFetch = (async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : input);
    requested.push(url.href);
    if (url.protocol === "http:") return new Response(null, { status: 301, headers: { Location: `${origin}/` } });
    const route = url.pathname.replace(/\/$/, "") || "/";
    let body: string | Uint8Array<ArrayBuffer> = htmlFor(PUBLIC_ROUTES.includes(route) ? route : "/");
    let type = "text/html; charset=utf-8";
    if (route.endsWith(".jpg")) { type = "image/jpeg"; body = new Uint8Array([255, 216, 255, 1]); }
    if (route.endsWith(".pdf")) { type = "application/pdf"; body = "%PDF-fixture"; }
    if (route.endsWith(".js")) { type = "text/javascript"; body = "/* fixture */"; }
    if (route.endsWith(".css")) { type = "text/css"; body = "/* fixture */"; }
    if (route.endsWith(".woff2")) { type = "font/woff2"; body = "wOF2"; }
    return new Response(body, { headers: { ...responseHeaders, "Content-Type": type } });
  }) as typeof fetch;
  const checks = await verifyPublishedSite(origin, "/", fixtureFetch);
  assert.ok(checks.length > PUBLIC_ROUTES.length);
  for (const route of PUBLIC_ROUTES) assert.ok(requested.includes(`${origin}${route}`));
  assert.ok(requested.includes(`${origin}/images/social-card.jpg`));
  assert.ok(requested.includes(`${origin}/documents/je-kailash-resume.pdf`));
});
