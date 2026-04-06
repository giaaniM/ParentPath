import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false, // partner-linking test needs sequential contexts
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    timeout: 60_000,
    reporter: [['html', { open: 'never' }], ['line']],

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        // Mobile viewport (app is mobile-first)
        viewport: { width: 390, height: 844 },
        // Slower for reliability on Supabase round-trips
        actionTimeout: 15_000,
        navigationTimeout: 20_000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Starts Vite dev server automatically before tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 30_000,
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
