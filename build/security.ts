import type { Plugin } from "vite";

// Production-only: the development preview needs Vite's HMR and editor tools.
// Inline style attributes are used for local visual state; inline JavaScript
// and eval remain disallowed. No external font, analytics, or AI requests.
export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "media-src 'none'",
  "worker-src 'none'",
  "form-action 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const responseHeaders = {
  "Content-Security-Policy": `${contentSecurityPolicy}; frame-ancestors 'self'`,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "X-Frame-Options": "SAMEORIGIN",
};

export function portfolioSecurity(): Plugin {
  return {
    name: "portfolio-production-security",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler() {
        return [{
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: contentSecurityPolicy },
          injectTo: "head-prepend",
        }];
      },
    },
    generateBundle() {
      // Netlify / Cloudflare Pages understand this file. Replit uses
      // deployment.responseHeaders instead; see SECURITY.md. Do not assume
      // this file configures a host which does not document support for it.
      this.emitFile({
        type: "asset",
        fileName: "_headers",
        source: `/*\n${Object.entries(responseHeaders).map(([key, value]) => `  ${key}: ${value}`).join("\n")}\n`,
      });
    },
  };
}
