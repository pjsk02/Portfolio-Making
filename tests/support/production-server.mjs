import { fileURLToPath } from "node:url";
import { build, preview } from "vite";
import { checkBuild } from "./check-build.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const outDir = fileURLToPath(new URL("../../generated-artifacts/tests/build", import.meta.url));
const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0 || !process.env.BASE_PATH) {
  throw new Error("Run through Playwright so PORT and BASE_PATH are configured.");
}

// Keep the real Vite plugins and CSP. Only the output directory and test listener
// differ from production. Nothing here is imported by the visitor's application.
await build({ root, mode: "production", build: { outDir, emptyOutDir: true }, logLevel: "warn" });
await checkBuild(outDir);
const server = await preview({
  root,
  mode: "production",
  build: { outDir },
  preview: { host: "127.0.0.1", port, strictPort: true },
});
const stop = () => server.httpServer.close(() => process.exit(0));
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
console.log(`Production regression server ready on port ${port}`);
