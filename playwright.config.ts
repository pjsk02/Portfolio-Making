import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const port = 4175;
const basePath = process.env.PORTFOLIO_TEST_BASE_PATH || "/";
if (!/^\/(?:[\w-]+\/)*$/.test(basePath)) {
  throw new Error("PORTFOLIO_TEST_BASE_PATH must be / or a path such as /portfolio/.");
}
const baseURL = `http://127.0.0.1:${port}${basePath}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/repl/tools/bin/chromium") ? "/repl/tools/bin/chromium" : undefined);

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./generated-artifacts/tests/results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A retry must not turn a flaky regression into a green check.
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "./generated-artifacts/tests/report", open: "never" }],
  ],
  use: {
    baseURL,
    browserName: "chromium",
    launchOptions: { executablePath },
    reducedMotion: "no-preference",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", viewport: { width: 1280, height: 900 } },
    { name: "mobile", viewport: { width: 390, height: 844 } },
    { name: "narrow-mobile", viewport: { width: 320, height: 740 } },
  ].flatMap(({ name, viewport }) =>
    (["light", "dark"] as const).map((colorScheme) => ({
      name: `${name}-${colorScheme}`,
      use: { viewport, colorScheme },
    })),
  ),
  webServer: {
    // A short-lived production server, not the managed development preview.
    // Never reuse a server that could be serving stale code or a relaxed CSP.
    command: "node tests/support/production-server.mjs",
    url: baseURL,
    env: { NODE_ENV: "production", PORT: String(port), BASE_PATH: basePath },
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
