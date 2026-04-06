import { test, expect } from '@playwright/test';
import { testEmail, TEST_PASSWORD, register, completeOnboardingNew } from './helpers.js';

/**
 * Visual regression tests — confrontano screenshot con baseline.
 *
 * Prima esecuzione (genera baseline):
 *   npm run test:visual:update
 *
 * Esecuzioni successive:
 *   npm run test:visual
 *
 * Se lo screenshot differisce, il test fallisce e mostra il diff.
 */

test.describe('Visual — schermate principali', () => {
    let page;
    let registeredEmail;

    // Registra un utente una volta per tutti i test visual di questo gruppo
    test.beforeAll(async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
        page = await ctx.newPage();
        registeredEmail = testEmail('visual');
        await register(page, registeredEmail);
        await completeOnboardingNew(page, { name: 'Valentina', role: 'mamma' });
    });

    test('splash / welcome screen (AnimatedOnboarding)', async ({ page: freshPage }) => {
        await freshPage.goto('/');
        await freshPage.waitForLoadState('networkidle');
        // Nasconde elementi dinamici (timer, date in tempo reale)
        await freshPage.addStyleTag({ content: '.dynamic-date, time { visibility: hidden !important; }' });
        await expect(freshPage).toHaveScreenshot('splash.png', { maxDiffPixels: 200 });
    });

    test('Home — schermata principale', async () => {
        await page.goto('/home');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(800); // aspetta animazioni CSS
        // Nasconde elementi che cambiano ogni settimana
        await page.addStyleTag({ content: '.dynamic, [data-week] { visibility: hidden !important; }' });
        await expect(page).toHaveScreenshot('home.png', { maxDiffPixels: 500 });
    });

    test('Profile — pagina profilo', async () => {
        await page.goto('/profile');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot('profile.png', { maxDiffPixels: 300 });
    });

    test('Agenda', async () => {
        await page.goto('/agenda');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot('agenda.png', { maxDiffPixels: 300 });
    });

    test('Onboarding — step 1 (ruolo)', async ({ page: freshPage }) => {
        // Vai direttamente all'onboarding senza sessione
        await freshPage.goto('/register');
        await freshPage.waitForLoadState('networkidle');
        await expect(freshPage).toHaveScreenshot('register.png', { maxDiffPixels: 200 });
    });
});
