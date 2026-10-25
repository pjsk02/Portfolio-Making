import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

async function filesUnder(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const relative = path.posix.join(prefix, entry.name);
    return entry.isDirectory()
      ? filesUnder(path.join(directory, entry.name), relative)
      : [relative];
  }));
  return files.flat();
}

export async function checkBuild(directory) {
  const files = await filesUnder(directory);
  assert(!files.some((file) => /(^|\/)(tests|node_modules|\.github|playwright-report|test-results)(\/|$)|\.map$/.test(file)),
    "Production output must not contain tests, reports, dependencies, or source maps");

  const html = await readFile(path.join(directory, "index.html"), "utf8");
  const cspTag = html.match(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/i)?.[0];
  assert(cspTag, "Production HTML must include the CSP");
  assert(html.indexOf(cspTag) < html.indexOf("<script"), "CSP must precede scripts");
  const encodedPolicy = cspTag.match(/\bcontent="([^"]+)"/)?.[1];
  assert(encodedPolicy, "CSP must have a policy");
  // Vite HTML-escapes attribute quotes; compare the value a browser receives.
  const policy = encodedPolicy
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, decimal) =>
      String.fromCodePoint(Number.parseInt(hex || decimal, hex ? 16 : 10)))
    .replace(/&(quot|apos|amp|lt|gt);/g, (_, name) =>
      ({ quot: '"', apos: "'", amp: "&", lt: "<", gt: ">" })[name]);
  const directives = new Map(policy.split(";").map((rule) => {
    const [name, ...values] = rule.trim().split(/\s+/);
    return [name, values.join(" ")];
  }));
  for (const name of ["default-src", "script-src", "style-src", "font-src", "connect-src"]) {
    assert.equal(directives.get(name), "'self'", `${name} must remain self-only`);
  }
  for (const name of ["object-src", "frame-src", "worker-src", "form-action"]) {
    assert.equal(directives.get(name), "'none'", `${name} must remain blocked`);
  }
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    assert.match(attributes, /\bsrc="(?!https?:|\/\/)[^"]+"/, "Scripts must be local external files");
    assert.equal(body.trim(), "", "Inline executable scripts must remain forbidden");
  }
  assert(html.indexOf("preferences.js") < html.indexOf('type="module"'),
    "Preferences must run before the React entry point");
  const headers = await readFile(path.join(directory, "_headers"), "utf8");
  assert.match(headers, /frame-ancestors 'self'/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);

  // Sum ALL shipped JS/CSS, including bootstrap and font CSS, not just the entry.
  // Caps allow small bundler variation around the documented ~87.2/9.8 kB gzip
  // entry baseline; increasing them requires an explicit performance decision.
  const budgets = {
    js: { raw: 285_000, gzip: 90_000 },
    css: { raw: 51_000, gzip: 11_000 },
  };
  for (const [extension, budget] of Object.entries(budgets)) {
    const assets = files.filter((file) => file.endsWith(`.${extension}`));
    assert(assets.length > 0, `Missing built ${extension}`);
    let raw = 0;
    let gzip = 0;
    for (const file of assets) {
      const content = await readFile(path.join(directory, file));
      raw += content.length;
      gzip += gzipSync(content).length;
      if (extension === "js") {
        // "Playwright" also appears legitimately in the portfolio's work history.
        assert(!/@playwright\/test|playwright-core|node:test|tests\/browser|__portfolioScrollCalls/i.test(content.toString()),
          `Test tooling leaked into ${file}`);
      }
    }
    assert(raw <= budget.raw, `${extension} raw budget exceeded: ${raw} > ${budget.raw} bytes`);
    assert(gzip <= budget.gzip, `${extension} gzip budget exceeded: ${gzip} > ${budget.gzip} bytes`);
    console.log(`Production ${extension}: ${raw} bytes, ${gzip} gzip (cap ${budget.gzip})`);
  }
}
