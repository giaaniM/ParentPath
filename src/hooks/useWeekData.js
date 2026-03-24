import legacyWeekData from '../data/weekData.json';
import hubTasks from '../data/parentpath_gravidanza_v2.json';

/**
 * Returns the week data for the given week number.
 * Falls back to the nearest available week if exact match not found.
 */
export function useWeekData(weekNumber) {
    // 1. Find nearest legacy data
    const sortedLegacy = [...legacyWeekData].sort((a, b) => Math.abs(a.week - weekNumber) - Math.abs(b.week - weekNumber));
    const legacy = sortedLegacy[0] || {};

    // 2. Find new JSON data
    let hubData = hubTasks.find(w => w.week === weekNumber || w.id === `S${weekNumber}`);
    if (!hubData) {
        // Fallback to nearest if exact not found
        const sortedHub = [...hubTasks]
            .filter(w => w.week !== undefined)
            .sort((a, b) => Math.abs(a.week - weekNumber) - Math.abs(b.week - weekNumber));
        hubData = sortedHub[0];
    }

    if (!hubData) return legacy;

    // 3. Flatten Tasks
    const flatTasks = [];
    if (hubData.tasks) {
        const parseTask = (t) => typeof t === 'string' ? { text: t, why: '' } : t;
        const weekToken = hubData.id || `S${weekNumber}`;
        (hubData.tasks.mom || []).forEach((t, i) => flatTasks.push({ id: `h_${weekToken}_m_${i}`, text: parseTask(t).text, why: parseTask(t).why, assignee: 'mamma', suggested: true, category: 'da fare', priority: 'media' }));
        (hubData.tasks.dad || hubData.tasks.partner || []).forEach((t, i) => flatTasks.push({ id: `h_${weekToken}_p_${i}`, text: parseTask(t).text, why: parseTask(t).why, assignee: 'partner', suggested: true, category: 'da fare', priority: 'media' }));
        (hubData.tasks.couple || []).forEach((t, i) => flatTasks.push({ id: `h_${weekToken}_c_${i}`, text: parseTask(t).text, why: parseTask(t).why, assignee: 'entrambi', suggested: true, category: 'da fare', priority: 'media' }));
    }

    // 4. Format weight & length
    const formatWeight = (g) => {
        if (!g && g !== 0) return undefined;
        if (g < 1) return '<1';
        return g;
    };
    const formatLength = (mm) => {
        if (!mm && mm !== 0) return undefined;
        if (mm < 10) return '<1';
        return (mm / 10).toFixed(1).replace('.0', '');
    };

    return {
        ...legacy,
        week: hubData.week,
        sizeLabel: hubData.fetus?.visual_comparison || hubData.comparative_size || null,
        length: hubData.fetus?.length_mm !== undefined ? formatLength(hubData.fetus.length_mm) : legacy.length,
        weight: hubData.fetus?.weight_g !== undefined ? formatWeight(hubData.fetus.weight_g) : legacy.weight,
        developmentDetails: {
            title: legacy.developmentDetails?.title || 'Sviluppo fetale',
            fact: 'Lo sapevi che?',
            longDesc: hubData.fetus?.milestone || hubData.baby_development || legacy.developmentDetails?.longDesc
        },
        curiosities: hubData.fetus?.note ? [hubData.fetus.note] : legacy.curiosities,
        recommendedVisits: hubData.clinical_anchors || [],
        tasks: flatTasks
    };
}
