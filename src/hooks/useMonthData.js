import monthData from '../data/monthData.json';

/**
 * Returns the month data for the given month number.
 * Falls back to the nearest available month if exact match not found.
 */
export function useMonthData(monthNumber) {
    const exact = monthData.find(m => m.month === monthNumber);
    if (exact) return exact;

    // Find nearest available month
    const sorted = [...monthData].sort((a, b) => Math.abs(a.month - monthNumber) - Math.abs(b.month - monthNumber));
    return sorted[0] || null;
}
