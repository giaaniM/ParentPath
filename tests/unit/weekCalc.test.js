import { describe, it, expect } from 'vitest';

/**
 * Unit test per la logica di calcolo settimane — estratta da UserContext.
 * Questi test NON dipendono da React/Supabase, girano in puro JS.
 */

/** Replica esatta della logica in UserContext.getWeeksPregnant */
function getWeeksPregnant(conceptionDate, babyStatus = 'gravidanza', now = new Date()) {
    if (!conceptionDate) return 31; // fallback demo
    const diffMs = now - new Date(conceptionDate);
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    if (babyStatus === 'nato') return Math.max(weeks, 40);
    return Math.min(Math.max(weeks, 1), 42);
}

function getBabyAgeWeeks(conceptionDate, now = new Date()) {
    return Math.max(0, getWeeksPregnant(conceptionDate, 'nato', now) - 40);
}

function getBabyAgeMonths(conceptionDate, now = new Date()) {
    const weeks = getBabyAgeWeeks(conceptionDate, now);
    if (weeks < 4.33) return 1;
    return Math.floor(weeks / 4.33) + 1;
}

// Usa un "now" fisso per rendere i calcoli deterministici
const NOW = new Date('2024-06-15T12:00:00.000Z');

// Helper: conception date esattamente N settimane prima di NOW (ms arithmetic, no DST issues)
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
function weeksAgo(n) {
    return new Date(NOW.getTime() - n * WEEK_MS);
}

// Wrapper che passa il NOW fisso
function weeksPregnant(n, status = 'gravidanza') {
    return getWeeksPregnant(weeksAgo(n), status, NOW);
}
function babyAgeWeeks(n) { return getBabyAgeWeeks(weeksAgo(n), NOW); }
function babyAgeMonths(n) { return getBabyAgeMonths(weeksAgo(n), NOW); }

describe('getWeeksPregnant', () => {
    it('restituisce 31 se non c\'è conception date (fallback demo)', () => {
        expect(getWeeksPregnant(null, 'gravidanza', NOW)).toBe(31);
    });

    it('calcola correttamente a 20 settimane', () => {
        expect(weeksPregnant(20)).toBe(20);
    });

    it('calcola correttamente a 12 settimane', () => {
        expect(weeksPregnant(12)).toBe(12);
    });

    it('non scende sotto 1 (inizio gravidanza)', () => {
        // conception date = NOW (0 settimane) → clampato a 1
        expect(getWeeksPregnant(NOW, 'gravidanza', NOW)).toBe(1);
    });

    it('non supera 42 settimane in gravidanza', () => {
        expect(weeksPregnant(50)).toBe(42);
    });

    it('per bimbi nati non applica il cap a 42', () => {
        expect(weeksPregnant(45, 'nato')).toBe(45);
    });

    it('per bimbi nati restituisce almeno 40 (parto anticipato nel DB)', () => {
        expect(weeksPregnant(35, 'nato')).toBe(40);
    });
});

describe('getBabyAgeWeeks', () => {
    it('0 se appena nati (conception 40 settimane fa)', () => {
        expect(babyAgeWeeks(40)).toBe(0);
    });

    it('4 settimane se nato 4 settimane fa', () => {
        expect(babyAgeWeeks(44)).toBe(4);
    });
});

describe('getBabyAgeMonths', () => {
    it('mese 1 se < 4.33 settimane di vita', () => {
        expect(babyAgeMonths(42)).toBe(1); // 2 settimane di vita
    });

    it('mese 2 dopo ~8 settimane di vita', () => {
        expect(babyAgeMonths(48)).toBe(2); // 8 settimane di vita
    });

    it('mese 3 dopo ~12 settimane di vita', () => {
        expect(babyAgeMonths(52)).toBe(3); // 12 settimane di vita
    });
});
