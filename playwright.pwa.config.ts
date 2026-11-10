import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/pwa",
  outputDir: "test-results-pwa",
  use: { baseURL: "http://127.0.0.1:3001", trace: "retain-on-failure", serviceWorkers: "allow" },
  projects: [
    { name: "chromium-pwa", use: { ...devices["Desktop Chrome"] } },
    { name: "iphone-pwa", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run preview -- --port 3001 --ip 127.0.0.1",
    url: "http://127.0.0.1:3001/auth",
    reuseExistingServer: !process.env["CI"],
    timeout: 120000,
  },
});
