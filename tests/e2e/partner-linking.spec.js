import { test, expect, chromium } from '@playwright/test';
import {
    testEmail, TEST_PASSWORD,
    register, completeOnboardingNew, completeOnboardingJoin,
    getInviteCode,
} from './helpers.js';

/**
 * Partner linking E2E test — usa DUE contesti browser separati
 * per simulare due utenti contemporaneamente, come faresti tu a mano.
 *
 * Flusso:
 *   Utente A (creatore) → onboarding new → genera codice → naviga a /profile
 *   Utente B (partner)  → onboarding join → usa codice di A
 *   Assert: B vede il nome di A in profilo, A vede B come partner collegato
 */
test('partner linking: A crea, B si unisce con codice', async ({ browser }) => {
    // Crea due contesti completamente isolati (cookie, localStorage separati)
    const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    const emailA = testEmail('creator');
    const emailB = testEmail('partner');

    try {
        // ── Utente A: registrazione + onboarding new ──────────────────────────
        await register(pageA, emailA);
        await completeOnboardingNew(pageA, { name: 'Lorenzo', role: 'papa' });

        // Vai a /profile e ottieni il codice
        const inviteCode = await getInviteCode(pageA);
        expect(inviteCode).toBeTruthy();
        expect(inviteCode!.length).toBeGreaterThanOrEqual(5);
        console.log(`Invite code: ${inviteCode}`);

        // ── Utente B: registrazione + onboarding join ──────────────────────────
        await register(pageB, emailB);
        await completeOnboardingJoin(pageB, {
            name: 'Sofia',
            role: 'mamma',
            inviteCode: inviteCode!.trim(),
        });

        // ── Verifica B: è in home, non vede errori ──────────────────────────
        await expect(pageB).toHaveURL(/\/home/);

        // ── Verifica A: naviga a /profile, vede B come partner collegato ──────
        await pageA.goto('/profile');
        await expect(pageA.getByText(/sofia/i)).toBeVisible({ timeout: 15_000 });

        // ── Verifica B: nel profilo vede Lorenzo come partner ──────
        await pageB.goto('/profile');
        await expect(pageB.getByText(/lorenzo/i)).toBeVisible({ timeout: 10_000 });

    } finally {
        await ctxA.close();
        await ctxB.close();
    }
});

test('partner linking: codice sbagliato mostra errore', async ({ page }) => {
    const email = testEmail('joinwrong');
    await register(page, email);

    // Step 1
    await page.getByText('Mamma').click();
    await page.getByPlaceholder(/marco|sara/i).fill('TestJoin');
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 2: join
    await page.getByText(/codice partner|ho già un codice/i).click();
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 3: codice invalido
    await page.getByPlaceholder(/es.*a8b2/i).fill('ZZZZZZ');
    await page.getByRole('button', { name: /cerca partner/i }).click();

    // Deve mostrare un errore
    await expect(page.getByText(/non valido|scaduto|errore/i)).toBeVisible({ timeout: 15_000 });
    // Non deve navigare via
    await expect(page).toHaveURL(/\/onboarding/);
});

test('partner linking: sync dati — A crea nota, B la vede', async ({ browser }) => {
    // Questo test assume che A e B siano già collegati (riusa il flusso completo)
    const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    const emailA = testEmail('syncA');
    const emailB = testEmail('syncB');

    try {
        // Setup: collega A e B
        await register(pageA, emailA);
        await completeOnboardingNew(pageA, { name: 'Marco', role: 'papa' });
        const inviteCode = await getInviteCode(pageA);

        await register(pageB, emailB);
        await completeOnboardingJoin(pageB, {
            name: 'Anna',
            role: 'mamma',
            inviteCode: inviteCode!.trim(),
        });

        // A va in Agenda e crea una nota
        await pageA.goto('/agenda');
        // Cerca il bottone per aggiungere nota
        const addNoteBtn = pageA.getByRole('button', { name: /nota|aggiungi/i }).first();
        if (await addNoteBtn.isVisible().catch(() => false)) {
            await addNoteBtn.click();
            const noteText = `Test nota ${Date.now()}`;
            await pageA.getByPlaceholder(/testo|nota|scrivi/i).fill(noteText);
            await pageA.getByRole('button', { name: /salva|aggiungi/i }).last().click();

            // B aggiorna la sua agenda (simula refresh)
            await pageB.goto('/agenda');
            await pageB.waitForTimeout(3000); // attendi sync realtime
            await expect(pageB.getByText(noteText)).toBeVisible({ timeout: 15_000 });
        }

    } finally {
        await ctxA.close();
        await ctxB.close();
    }
});
