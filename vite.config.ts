import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { portfolioSecurity } from "./build/security";
import { portfolioPublishing } from "./build/publishing";

const root = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss(), portfolioSecurity(), portfolioPublishing()],
  resolve: { alias: { "@": path.join(root, "src") } },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 5173),
    allowedHosts: ["localhost", ".replit.dev", ".repl.co"],
  },
  build: { outDir: "dist" },
});
