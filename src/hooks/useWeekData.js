import weekData from '../data/weekData.json';

/**
 * Returns the week data for the given week number.
 * Falls back to the nearest available week if exact match not found.
 */
export function useWeekData(weekNumber) {
    const exact = weekData.find(w => w.week === weekNumber);
    if (exact) return exact;

    // Find nearest available week
    const sorted = [...weekData].sort((a, b) => Math.abs(a.week - weekNumber) - Math.abs(b.week - weekNumber));
    return sorted[0] || null;
}
