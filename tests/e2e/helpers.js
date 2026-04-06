/**
 * Shared test helpers — registration, onboarding, navigation
 */

/** Generate a unique test email to avoid conflicts between runs */
export function testEmail(tag = 'a') {
    return `test.${tag}.${Date.now()}@parentpath-test.com`;
}

export const TEST_PASSWORD = 'Test1234!';

/**
 * Fill the Register form and submit.
 * Expects page to be at /register or AnimatedOnboarding root (/).
 * After this call, the page will be at /onboarding.
 */
export async function register(page, email, password = TEST_PASSWORD) {
    // Navigate to register if not already there
    if (!page.url().includes('/register')) {
        await page.goto('/register');
    }
    await page.getByPlaceholder(/email/i).fill(email);
    await page.getByPlaceholder(/password/i).first().fill(password);
    // Some forms have a confirm-password field
    const confirm = page.getByPlaceholder(/confirm|ripeti|conferma/i);
    if (await confirm.isVisible().catch(() => false)) {
        await confirm.fill(password);
    }
    await page.getByRole('button', { name: /registr|crea|inizia|avanti/i }).click();
    // Wait for onboarding to load
    await page.waitForURL('**/onboarding', { timeout: 20_000 });
}

/**
 * Complete the "new pregnancy" onboarding flow.
 * Returns the invite code shown in Profile (step: navigate to /profile after).
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ name: string, role?: 'mamma'|'papa', dueDate?: string }} opts
 */
export async function completeOnboardingNew(page, { name, role = 'papa', dueDate } = {}) {
    // Step 1: role + name
    await page.getByText(role === 'mamma' ? 'Mamma' : 'Papà').click();
    await page.getByPlaceholder(/nome|marco|sara/i).fill(name);
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 2: choose "new"
    await page.getByText(/nuovo percorso|inizia un nuovo/i).click();
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 3: baby name (skip)
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 4: due date
    const dueDateValue = dueDate ?? (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 4);
        return d.toISOString().split('T')[0];
    })();
    await page.locator('input[type="date"]').fill(dueDateValue);
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 5: skip partner invite
    await page.getByText(/più tardi|solitaria/i).click();
    await page.getByRole('button', { name: /completa|avanti/i }).click();

    // Wait for welcome screen then click "Inizia il percorso"
    await page.waitForSelector('text=Inizia il percorso', { timeout: 20_000 });
    await page.getByRole('button', { name: /inizia il percorso/i }).click();

    // Wait for home
    await page.waitForURL('**/home', { timeout: 20_000 });
}

/**
 * Complete the "join with code" onboarding flow.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ name: string, role?: 'mamma'|'papa', inviteCode: string }} opts
 */
export async function completeOnboardingJoin(page, { name, role = 'mamma', inviteCode }) {
    // Step 1: role + name
    await page.getByText(role === 'mamma' ? 'Mamma' : 'Papà').click();
    await page.getByPlaceholder(/nome|marco|sara/i).fill(name);
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 2: choose "join"
    await page.getByText(/codice partner|ho già un codice/i).click();
    await page.getByRole('button', { name: /avanti/i }).click();

    // Step 3: enter code
    await page.getByPlaceholder(/es.*a8b2/i).fill(inviteCode);
    await page.getByRole('button', { name: /cerca partner/i }).click();

    // Step 3.5: confirm
    await page.waitForSelector('text=Eccoli', { timeout: 15_000 });
    await page.getByRole('button', { name: /conferma e collegati/i }).click();

    // Welcome → home
    await page.waitForSelector('text=Inizia il percorso', { timeout: 20_000 });
    await page.getByRole('button', { name: /inizia il percorso/i }).click();
    await page.waitForURL('**/home', { timeout: 20_000 });
}

/**
 * Get the invite code from the Profile page.
 * Opens partner modal if needed.
 */
export async function getInviteCode(page) {
    await page.goto('/profile');
    // Open partner section
    const partnerBtn = page.getByText(/partner|collega/i).first();
    if (await partnerBtn.isVisible().catch(() => false)) {
        await partnerBtn.click();
    }
    // Click "Genera Codice Invito" if not yet generated
    const generateBtn = page.getByText(/genera codice/i);
    if (await generateBtn.isVisible().catch(() => false)) {
        await generateBtn.click();
        await page.waitForSelector('[data-testid="invite-code"]', { timeout: 10_000 });
    }
    return page.locator('[data-testid="invite-code"]').textContent();
}
