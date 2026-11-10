import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "iphone-webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev -- --host 0.0.0.0 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env["CI"],
    timeout: 120000,
  },
});
