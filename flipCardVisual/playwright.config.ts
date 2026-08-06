import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "visual-tests",
    outputDir: "test-results",
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
    use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4173",
        colorScheme: "light",
        locale: "en-US",
        serviceWorkers: "block",
        timezoneId: "UTC",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run visual:harness",
        reuseExistingServer: !process.env.CI,
        stderr: "pipe",
        stdout: "pipe",
        timeout: 120_000,
        url: "http://127.0.0.1:4173",
    },
});
