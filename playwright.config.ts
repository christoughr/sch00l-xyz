import { defineConfig, devices } from "@playwright/test";

const productionUrl = process.env.PLAYWRIGHT_BASE_URL?.includes("sch00l.ai")
  ? process.env.PLAYWRIGHT_BASE_URL
  : undefined;
const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3099";
const baseURL = productionUrl ?? `http://127.0.0.1:${e2ePort}`;
const useLocal = !productionUrl;

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 25_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: useLocal
    ? {
        command: `npm run build && npm run start -- -p ${e2ePort}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000,
      }
    : undefined,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
