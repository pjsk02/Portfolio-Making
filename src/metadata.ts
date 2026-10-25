import { PROJECTS } from "./data.ts";

export const SITE_TITLE = "Je Sai Kailash Pulipati — Data & AI Engineer";
export const SITE_DESCRIPTION = "Je Sai Kailash Pulipati builds data pipelines and AI systems end-to-end, shaped by business analysis and manufacturing data work.";
export const SHARE_IMAGE = "images/social-card.jpg";
export const SHARE_IMAGE_ALT = "Je Sai Kailash Pulipati — Data & AI. From business analytics to data engineering and applied AI.";
export const PUBLIC_ROUTES = ["/", "/work", ...PROJECTS.map((project) => `/work/${project.slug}`)];

export type MetadataTag = {
  tag: "title" | "meta" | "link";
  attrs: Record<string, string>;
  text?: string;
};

// This is a verified production origin, not the preview address or the old
// Framer content source. Null intentionally omits absolute URL tags.
export function validateSiteUrl(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.trim() !== value || !value) {
    throw new Error("publishing.json siteUrl must be null or a verified HTTPS production origin.");
  }
  const url = new URL(value);
  if (
    url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
    url.pathname !== "/" || url.port ||
    !url.hostname.includes(".") ||
    /(^localhost$|\.localhost$|\.local$|\.replit\.dev$|\.repl\.co$|^\d+\.\d+\.\d+\.\d+$|:)/i.test(url.hostname)
  ) {
    throw new Error("Use the verified HTTPS production origin without credentials, a path, port, query, or fragment; preview/local URLs are not production.");
  }
  return url.origin;
}

export function metadataForPath(path: string, siteUrl: string | null, basePath = "/"): MetadataTag[] {
  const route = path.replace(/\/+$/, "") || "/";
  const project = PROJECTS.find((item) => `/work/${item.slug}` === route);
  const known = PUBLIC_ROUTES.includes(route);
  const title = project ? `${project.title} — Je Sai Kailash Pulipati`
    : route === "/work" ? "Selected work — Je Sai Kailash Pulipati"
    : known ? SITE_TITLE : "Page not found — Je Sai Kailash Pulipati";
  const description = project
    ? `${project.context}. ${project.short}${project.boundary ? ` ${project.boundary}` : ""}`
    : route === "/work"
      ? "Explore Je Sai Kailash Pulipati's projects in applied AI, data engineering, analytics, and product development, with case studies and source links."
      : SITE_DESCRIPTION;
  const meta = (attribute: "name" | "property", key: string, content: string): MetadataTag =>
    ({ tag: "meta", attrs: { [attribute]: key, content } });
  const tags: MetadataTag[] = [
    { tag: "title", attrs: {}, text: title },
    meta("name", "description", description),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", "Je — Data & AI"),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:card", siteUrl && known ? "summary_large_image" : "summary"),
  ];
  if (!known) tags.push(meta("name", "robots", "noindex, follow"));
  if (siteUrl && known) {
    const base = new URL(basePath, `${siteUrl}/`);
    const canonical = new URL(route.slice(1), base).href;
    const image = new URL(SHARE_IMAGE, base).href;
    tags.push(
      { tag: "link", attrs: { rel: "canonical", href: canonical } },
      meta("property", "og:url", canonical),
      meta("property", "og:image", image),
      meta("property", "og:image:secure_url", image),
      meta("property", "og:image:type", "image/jpeg"),
      meta("property", "og:image:width", "1200"),
      meta("property", "og:image:height", "630"),
      meta("property", "og:image:alt", SHARE_IMAGE_ALT),
      meta("name", "twitter:image", image),
      meta("name", "twitter:image:alt", SHARE_IMAGE_ALT),
    );
  }
  return tags;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function renderMetadata(tags: MetadataTag[]): string {
  return tags.map(({ tag, attrs, text }) => {
    const attributes = Object.entries(attrs).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join("");
    return `<${tag} data-portfolio-meta${attributes}>${tag === "title" ? `${escapeHtml(text ?? "")}</title>` : ""}`;
  }).join("\n    ");
}
