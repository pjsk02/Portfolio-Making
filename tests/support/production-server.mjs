import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
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

// WebKit upgrades loopback HTTP assets under upgrade-insecure-requests. Serve
// HTTPS instead of stripping that production directive or bypassing the CSP.
// Generate a fresh one-day certificate outside the served build; never commit
// a private key or change any publishing/production TLS configuration.
const tlsDir = await mkdtemp(path.join(path.dirname(outDir), "tls-"));
const keyFile = path.join(tlsDir, "key.pem");
const certFile = path.join(tlsDir, "cert.pem");
let https;
try {
  try {
    execFileSync("openssl", [
      "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
      "-keyout", keyFile, "-out", certFile, "-subj", "/CN=127.0.0.1",
      "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost",
    ], { stdio: "pipe", timeout: 10_000 });
  } catch (cause) {
    throw new Error("Browser regression HTTPS requires OpenSSL on the test runner.", { cause });
  }
  https = { key: await readFile(keyFile), cert: await readFile(certFile) };
} finally {
  // Keep only in-memory buffers, even if Playwright later force-stops the
  // server. No certificate/private-key files survive readiness or an error.
  await rm(tlsDir, { recursive: true, force: true });
}
const server = await preview({
  root,
  mode: "production",
  build: { outDir },
  preview: { host: "127.0.0.1", port, strictPort: true, https },
});
const stop = () => server.httpServer.close(() => process.exit(0));
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
console.log(`Production regression server ready at https://127.0.0.1:${port}${process.env.BASE_PATH}`);
