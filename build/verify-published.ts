import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { metadataForPath, PUBLIC_ROUTES, SHARE_IMAGE, validateSiteUrl } from "../src/metadata.ts";
import { responseHeaders } from "./security.ts";

export function checkHeaders(headers: Headers): void {
  for (const [name, expected] of Object.entries(responseHeaders)) {
    const actual = headers.get(name);
    assert.ok(actual, `Missing HTTP response header: ${name} (HTML meta tags do not count).`);
    if (name === "Strict-Transport-Security") {
      const maxAge = actual.match(/(?:^|;)\s*max-age=(\d+)/i);
      assert.ok(maxAge && Number(maxAge[1]) >= 31536000, "HSTS max-age must be at least 31536000.");
    } else {
      assert.equal(actual.replace(/;\s*/g, "; ").trim(), expected, `Unexpected ${name}`);
    }
  }
}

const decode = (value: string) => value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity: string) =>
  ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[entity]!);

export function checkHtmlMetadata(html: string, route: string, siteUrl: string, basePath = "/"): void {
  assert.match(html, /<div\s+id=["']root["']/, "The response is not the portfolio application.");
  const elements = [...html.matchAll(/<(title|meta|link)\b([^>]*)>([^<]*)/g)].map((match) => ({
    tag: match[1], text: decode(match[3]),
    attrs: Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map((attribute) => [attribute[1], decode(attribute[2] ?? attribute[3])])),
  }));
  for (const expected of metadataForPath(route, siteUrl, basePath)) {
    const key = expected.tag === "meta" ? ("name" in expected.attrs ? "name" : "property") : "rel";
    const matches = elements.filter((element) => element.tag === expected.tag &&
      (expected.tag === "title" || element.attrs[key] === expected.attrs[key]));
    assert.equal(matches.length, 1, `Missing or duplicate ${expected.attrs[key] ?? "title"} at ${route}`);
    for (const [name, value] of Object.entries(expected.attrs)) assert.equal(matches[0].attrs[name], value, `${name} at ${route}`);
    if (expected.text) assert.equal(matches[0].text, expected.text, `title at ${route}`);
  }
}

// Read-only requests. Never signs in, publishes, changes data, or follows a
// redirect to another origin (for example a workspace login page).
export async function verifyPublishedSite(siteUrl: string, basePath = "/", request: typeof fetch = fetch): Promise<string[]> {
  const origin = validateSiteUrl(siteUrl);
  assert.ok(origin, "A verified production URL is required.");
  const base = new URL(basePath, `${origin}/`);
  assert.equal(base.origin, origin, "The base path must stay on the production origin.");
  const checked: string[] = [];
  const get = async (url: URL): Promise<Response> => {
    assert.equal(url.origin, origin, "A page or asset points outside the HTTPS production origin.");
    for (let redirects = 0; redirects < 6; redirects++) {
      const response = await request(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        assert.ok(location, `Redirect without Location at ${url.pathname}`);
        const next = new URL(location, url);
        assert.equal(next.origin, origin, `Unexpected redirect away from the HTTPS production site at ${url.pathname}`);
        // Directory slash normalization is fine; sending every case study home is not.
        assert.equal(next.pathname.replace(/\/+$/, ""), url.pathname.replace(/\/+$/, ""), `Route redirected to a different page: ${url.pathname}`);
        url = next;
        continue;
      }
      assert.equal(response.status, 200, `${url.pathname}: HTTP ${response.status}`);
      checkHeaders(response.headers);
      return response;
    }
    throw new Error("Too many redirects.");
  };

  const httpUrl = new URL(base);
  httpUrl.protocol = "http:";
  const redirect = await request(httpUrl, { redirect: "manual", signal: AbortSignal.timeout(15000) });
  assert.ok([301, 302, 307, 308].includes(redirect.status), "HTTP must redirect to HTTPS.");
  const location = redirect.headers.get("location");
  assert.ok(location, "The HTTPS redirect is missing Location.");
  assert.equal(new URL(location, httpUrl).href, base.href, "HTTP must redirect to the same HTTPS page.");
  checked.push("HTTP → HTTPS redirect and certificate-validated HTTPS requests");

  let homepage = "";
  for (const route of PUBLIC_ROUTES) {
    const forms = route === "/" ? [route] : [route, `${route}/`];
    for (const form of forms) {
      const response = await get(new URL(form.slice(1), base));
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/);
      const html = await response.text();
      checkHtmlMetadata(html, route, origin, basePath);
      if (route === "/") homepage = html;
      checked.push(`${form}: security headers and crawler-visible metadata`);
    }
  }
  const fallback = await get(new URL("work/__release-fallback-check__", base));
  assert.match(fallback.headers.get("content-type") ?? "", /^text\/html\b/);
  assert.match(await fallback.text(), /<div\s+id=["']root["']/, "SPA fallback is missing.");
  checked.push("SPA fallback");

  const assets = new Map<string, RegExp>([
    [SHARE_IMAGE, /^image\/jpeg\b/],
    ["documents/je-kailash-resume.pdf", /^application\/pdf\b/],
    ["preferences.js", /^(text|application)\/javascript\b/],
    ["fonts/fonts.css", /^text\/css\b/],
    ["fonts/bricolage-latin.woff2", /^(font\/woff2|application\/font-woff2)\b/],
  ]);
  for (const match of homepage.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+\.(js|css))"/g)) {
    assets.set(match[1], match[2] === "js" ? /^(text|application)\/javascript\b/ : /^text\/css\b/);
  }
  assert.ok([...assets.keys()].some((asset) => /\/assets\/.*\.js$/.test(asset)), "The production JavaScript bundle is missing.");
  for (const [asset, mime] of assets) {
    const response = await get(new URL(asset, base));
    assert.match(response.headers.get("content-type") ?? "", mime, `Wrong MIME type for ${asset}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.ok(bytes.length > 0, `Empty asset: ${asset}`);
    if (asset === SHARE_IMAGE) assert.deepEqual([...bytes.slice(0, 3)], [255, 216, 255], "Share image is not a JPEG.");
    if (asset.endsWith(".pdf")) assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-", "Résumé is not a PDF.");
    checked.push(`${asset}: headers, MIME type, and content`);
  }
  return checked;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const config = JSON.parse(readFileSync(new URL("../publishing.json", import.meta.url), "utf8"));
    const siteUrl = validateSiteUrl(config.siteUrl);
    assert.ok(siteUrl, "No verified published URL is configured. Obtain it from the deployment tools, set publishing.json siteUrl, and rebuild after approval. No live checks were run.");
    const checks = await verifyPublishedSite(siteUrl);
    for (const check of checks) console.log(`PASS ${check}`);
    console.log(`Verified ${checks.length} publishing checks against ${siteUrl}.`);
  } catch (error) {
    console.error(`Published verification failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
