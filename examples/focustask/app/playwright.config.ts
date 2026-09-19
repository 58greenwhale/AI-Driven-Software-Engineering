import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const config = JSON.parse(
  fs.readFileSync(new URL("./.runtime/test.json", import.meta.url), "utf8"),
);
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: [["list"], ["json", { outputFile: ".runtime/e2e-results.json" }]],
  use: {
    baseURL: config.APP_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"], launchOptions: { executablePath: fileURLToPath(new URL('./.runtime/browsers/webkit-2359/pw_run.sh', import.meta.url)) } } },
  ],
  webServer: {
    command: "node scripts/start-production.mjs test",
    url: `${config.APP_BASE_URL}/api/v1/health`,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
