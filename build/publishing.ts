import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { escapeHtml, metadataForPath, PUBLIC_ROUTES, renderMetadata, validateSiteUrl } from "../src/metadata.ts";
import { responseHeaders } from "./security.ts";

const metadataRegion = /<!-- portfolio:metadata:start -->[\s\S]*?<!-- portfolio:metadata:end -->/;

export function routeFile(route: string): string {
  return route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
}

export function replitHostingRules(prefix = "deployment"): string {
  const headers = Object.entries(responseHeaders).map(([name, value]) =>
    `[[${prefix}.responseHeaders]]\npath = "/*"\nname = ${JSON.stringify(name)}\nvalue = ${JSON.stringify(value)}\n`);
  const rewrites = PUBLIC_ROUTES.filter((route) => route !== "/").flatMap((route) =>
    [route, `${route}/`].map((from) =>
      `[[${prefix}.rewrites]]\nfrom = ${JSON.stringify(from)}\nto = ${JSON.stringify(`/${routeFile(route)}`)}\n`));
  return [...headers, ...rewrites, `[[${prefix}.rewrites]]\nfrom = "/*"\nto = "/index.html"\n`].join("\n");
}

export function standaloneReplitConfig(): string {
  return `# Static portfolio only; no API or development server is published.\nmodules = ["nodejs-24"]\n\n[deployment]\ndeploymentTarget = "static"\nbuild = ["pnpm", "build"]\npublicDir = "dist"\n\n${replitHostingRules()}`;
}

export function portfolioPublishing(): Plugin {
  let siteUrl: string | null = null;
  let basePath = "/";
  const withMetadata = (html: string, route: string) => {
    if (!metadataRegion.test(html)) throw new Error("The portfolio metadata markers are missing from index.html.");
    return html.replace(metadataRegion, () =>
      `<!-- portfolio:metadata:start -->\n    ${renderMetadata(metadataForPath(route, siteUrl, basePath))}\n    <!-- portfolio:metadata:end -->`);
  };
  return {
    name: "portfolio-publishing",
    enforce: "post",
    configResolved(config) {
      siteUrl = validateSiteUrl(JSON.parse(readFileSync(path.join(config.root, "publishing.json"), "utf8")).siteUrl);
      basePath = config.base;
      if (!basePath.startsWith("/") || !basePath.endsWith("/") || basePath.startsWith("//")) {
        throw new Error("The portfolio needs an absolute path prefix with a trailing slash (for example / or /portfolio/).");
      }
      if (config.command === "build" && !siteUrl) {
        config.logger.warn("No verified production URL: canonical and absolute social-image tags are intentionally omitted. See PUBLISHING.md.");
      }
    },
    transformIndexHtml: { order: "post", handler: (html) => withMetadata(html, "/") },
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("The built portfolio HTML is missing.");
      const html = typeof index.source === "string" ? index.source : new TextDecoder().decode(index.source);
      for (const route of PUBLIC_ROUTES.filter((item) => item !== "/")) {
        this.emitFile({ type: "asset", fileName: routeFile(route), source: withMetadata(html, route) });
      }
      if (siteUrl) {
        const base = new URL(basePath, `${siteUrl}/`);
        this.emitFile({
          type: "asset", fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_ROUTES.map((route) => `  <url><loc>${escapeHtml(new URL(route.slice(1), base).href)}</loc></url>`).join("\n")}\n</urlset>\n`,
        });
      }
    },
  };
}
