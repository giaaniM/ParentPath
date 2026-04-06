import { test, expect } from '@playwright/test';
import { testEmail, TEST_PASSWORD, register, completeOnboardingNew } from './helpers.js';

test.describe('Onboarding — nuovo percorso', () => {

    test('registrazione + onboarding completo arriva alla Home', async ({ page }) => {
        const email = testEmail('new1');
        await register(page, email);
        await completeOnboardingNew(page, { name: 'Marco Test', role: 'papa' });

        // Deve essere in /home
        await expect(page).toHaveURL(/\/home/);
        // Deve mostrare il nome
        await expect(page.getByText(/marco/i).first()).toBeVisible();
    });

    test('step 1: non si può andare avanti senza nome', async ({ page }) => {
        const email = testEmail('new2');
        await register(page, email);

        // Seleziona ruolo ma lascia nome vuoto
        await page.getByText('Papà').click();
        const nextBtn = page.getByRole('button', { name: /avanti/i });
        await expect(nextBtn).toBeDisabled();
    });

    test('step 1: non si può andare avanti senza ruolo', async ({ page }) => {
        const email = testEmail('new3');
        await register(page, email);

        // Nessun ruolo, scrivi il nome
        await page.getByPlaceholder(/marco|sara/i).fill('TestUser').catch(() => {});
        const nextBtn = page.getByRole('button', { name: /avanti/i });
        await expect(nextBtn).toBeDisabled();
    });

    test('loader di benvenuto mostra il nome utente', async ({ page }) => {
        const email = testEmail('new4');
        await register(page, email);

        // Completa onboarding fino al welcome screen
        await page.getByText('Mamma').click();
        await page.getByPlaceholder(/marco|sara/i).fill('Giulia');
        await page.getByRole('button', { name: /avanti/i }).click();

        await page.getByText(/nuovo percorso|inizia un nuovo/i).click();
        await page.getByRole('button', { name: /avanti/i }).click();
        await page.getByRole('button', { name: /avanti/i }).click();

        const d = new Date();
        d.setMonth(d.getMonth() + 5);
        await page.locator('input[type="date"]').fill(d.toISOString().split('T')[0]);
        await page.getByRole('button', { name: /avanti/i }).click();

        await page.getByText(/più tardi|solitaria/i).click();
        await page.getByRole('button', { name: /completa|avanti/i }).click();

        // Welcome screen — deve mostrare ciao + nome
        await expect(page.getByText(/giulia/i)).toBeVisible({ timeout: 15_000 });

        // Click inizia → loader → benvenuto/a
        await page.getByRole('button', { name: /inizia il percorso/i }).click();
        await expect(page.getByText(/benvenuta/i)).toBeVisible({ timeout: 8_000 });
        await expect(page.getByText(/giulia/i)).toBeVisible();
    });

    test('profilo eliminato → app fa logout automatico', async ({ page }) => {
        // Simula stato: onboardingDone=true in localStorage ma nessun profilo in DB
        await page.goto('/home');
        await page.evaluate(() => {
            localStorage.setItem('pp_onboardingDone', 'true');
            localStorage.setItem('pp_userName', 'Ghost');
            localStorage.setItem('pp_userRole', 'papa');
        });

        // Refresh: il UserContext chiamerà restoreSession che non trova profilo nel DB
        // → dovrebbe fare logout e tornare alla root
        await page.reload();
        // Con sessione Supabase assente l'app dovrebbe stare alla root o /register
        // Dopo il reload senza sessione JWT valida, il guard in Onboarding.jsx manda a /register
        await page.waitForURL(/(\/|\/register)$/, { timeout: 15_000 });
    });

});
