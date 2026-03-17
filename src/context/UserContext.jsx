import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);

// --- localStorage helpers ---
function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}
function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export function UserProvider({ children }) {
    const [userRole, setUserRole] = useState('papa'); // Default to papa as requested
    const [userName, setUserName] = useState('Valerio');
    const [babyName, setBabyName] = useState('Giacomo');
    const [babySex, setBabySex] = useState('M'); // 'M' | 'F' | null
    const [partnerName, setPartnerName] = useState('Sara');
    const [conceptionDate, setConceptionDate] = useState(null);
    const [onboardingDone, setOnboardingDone] = useState(false);

    // New Feature States
    const [babyStatus, setBabyStatus] = useState('gravidanza'); // 'gravidanza' | 'nato'
    const [diaryEntries, setDiaryEntries] = useState({}); // { weekNum: [ { id, text, type } ] }
    const [hospitalBag, setHospitalBag] = useState({}); // { itemId: boolean }

    // --- MVP Agenda / Task State (persisted) ---
    const [completedTasks, setCompletedTasks] = useState(() => loadJSON('pp_completedTasks', {}));
    const [weekNotes, setWeekNotes] = useState(() => loadJSON('pp_weekNotes', {}));
    const [appointments, setAppointments] = useState(() => loadJSON('pp_appointments', []));
    const [customTasks, setCustomTasks] = useState(() => loadJSON('pp_customTasks', []));
    const [dismissedTasks, setDismissedTasks] = useState(() => loadJSON('pp_dismissedTasks', []));

    // --- Pregnancy Tracker State ---
    const [hydration, setHydration] = useState(() => loadJSON('pp_hydration', { count: 0, target: 8 }));
    const [kicks, setKicks] = useState(() => loadJSON('pp_kicks', { count: 0, target: 10 }));

    // --- User Status Mapping (to demonstrate sync/UI) ---
    const [userMood, setUserMood] = useState(() => localStorage.getItem('pp_userMood') || 'good');
    const [userActivity, setUserActivity] = useState(() => localStorage.getItem('pp_userActivity') || 'Riposando');
    const [partnerStatus, setPartnerStatus] = useState(() => loadJSON('pp_partnerStatus', {
        status: 'In attesa...',
        lastUpdate: 'Poco fa',
        activity: 'Occupato'
    }));

    // Persist on change
    useEffect(() => { saveJSON('pp_completedTasks', completedTasks); }, [completedTasks]);
    useEffect(() => { saveJSON('pp_weekNotes', weekNotes); }, [weekNotes]);
    useEffect(() => { saveJSON('pp_appointments', appointments); }, [appointments]);
    useEffect(() => { saveJSON('pp_customTasks', customTasks); }, [customTasks]);
    useEffect(() => { saveJSON('pp_dismissedTasks', dismissedTasks); }, [dismissedTasks]);
    useEffect(() => { saveJSON('pp_hydration', hydration); }, [hydration]);
    useEffect(() => { saveJSON('pp_kicks', kicks); }, [kicks]);
    useEffect(() => { localStorage.setItem('pp_userMood', userMood); }, [userMood]);
    useEffect(() => { localStorage.setItem('pp_userActivity', userActivity); }, [userActivity]);
    useEffect(() => { saveJSON('pp_partnerStatus', partnerStatus); }, [partnerStatus]);

    // --- Tracker Helpers ---
    const addHydration = useCallback(() => {
        setHydration(prev => ({ ...prev, count: Math.min(prev.count + 1, 20) }));
    }, []);

    const removeHydration = useCallback(() => {
        setHydration(prev => ({ ...prev, count: Math.max(prev.count - 1, 0) }));
    }, []);

    const addKick = useCallback(() => {
        setKicks(prev => ({ ...prev, count: prev.count + 1 }));
    }, []);

    const removeKick = useCallback(() => {
        setKicks(prev => ({ ...prev, count: Math.max(prev.count - 1, 0) }));
    }, []);

    const addFeeding = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            feeding: { ...prev.feeding, count: prev.feeding.count + 1, last: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
        }));
    }, []);

    const removeFeeding = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            feeding: { ...prev.feeding, count: Math.max((prev.feeding?.count || 0) - 1, 0) }
        }));
    }, []);

    const addDiaper = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            diapers: { ...prev.diapers, count: (prev.diapers?.count || 0) + 1, last: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
        }));
    }, []);

    const removeDiaper = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            diapers: { ...prev.diapers, count: Math.max((prev.diapers?.count || 0) - 1, 0) }
        }));
    }, []);

    // --- Task helpers ---
    const toggleTaskCompleted = useCallback((weekKey, taskId) => {
        const key = `${weekKey}_${taskId}`;
        setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const isTaskCompleted = useCallback((weekKey, taskId) => {
        return !!completedTasks[`${weekKey}_${taskId}`];
    }, [completedTasks]);

    // --- Week notes helpers ---
    const setWeekNote = useCallback((week, text) => {
        setWeekNotes(prev => ({ ...prev, [week]: text }));
    }, []);

    const getWeekNote = useCallback((week) => {
        return weekNotes[week] || '';
    }, [weekNotes]);

    // --- Appointment helpers ---
    const addAppointment = useCallback((appt) => {
        setAppointments(prev => [...prev, { id: Date.now().toString(), ...appt }]);
    }, []);

    const removeAppointment = useCallback((id) => {
        setAppointments(prev => prev.filter(a => a.id !== id));
    }, []);

    // --- Custom task helpers ---
    const addCustomTask = useCallback((task) => {
        setCustomTasks(prev => [...prev, { id: Date.now().toString(), suggested: false, ...task }]);
    }, []);

    const removeCustomTask = useCallback((id) => {
        setCustomTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateCustomTask = useCallback((id, updates) => {
        setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const dismissTask = useCallback((id) => {
        setDismissedTasks(prev => [...prev, id]);
    }, []);

    const isTaskDismissed = useCallback((id) => {
        return dismissedTasks.includes(id);
    }, [dismissedTasks]);

    const getCustomTasksForWeek = useCallback((week) => {
        return customTasks.filter(t => t.weekNumber === week);
    }, [customTasks]);

    const getAppointmentsForWeek = useCallback((week) => {
        return appointments.filter(a => a.weekNumber === week);
    }, [appointments]);

    // Newborn Trackers
    const [trackers, setTrackers] = useState({
        feeding: [],
        sleep: [],
        diapers: []
    });

    const [activeFeedTimer, setActiveFeedTimer] = useState(null);
    const [lastBreastSide, setLastBreastSide] = useState('left');
    const [activeSleepTimer, setActiveSleepTimer] = useState(null);

    const completeOnboarding = ({ role, name, baby, status, conception, sex, partner }) => {
        setUserRole(role);
        setUserName(name);
        setBabyName(baby || '');
        setConceptionDate(conception);
        if (status) setBabyStatus(status);
        if (sex) setBabySex(sex);
        if (partner) setPartnerName(partner);
        setOnboardingDone(true);
    };

    // Main login helper
    const login = (role, name) => {
        setUserRole(role);
        setUserName(name);
        setBabyStatus('gravidanza'); // Force pregnancy for now as requested
        setOnboardingDone(true);
    };

    // Quick login for dev
    const devLogin = (role, status = 'gravidanza') => {
        setUserRole(role);
        setUserName(role === 'mamma' ? 'Sara' : 'Valerio');
        setBabyName('Giacomo');
        setBabySex('M');
        setPartnerName(role === 'mamma' ? 'Valerio' : 'Sara');
        setConceptionDate(new Date('2025-08-10'));
        setBabyStatus('gravidanza'); // Force pregnancy
        setOnboardingDone(true);
    };

    // Compute weeks from conception
    const getWeeksPregnant = () => {
        if (!conceptionDate) return 31; // fallback to demo week
        const now = new Date();
        const diffMs = now - new Date(conceptionDate);
        const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        return Math.min(Math.max(weeks, 1), 42);
    };

    const getWeeksRemaining = () => {
        return Math.max(0, 40 - getWeeksPregnant());
    };

    // calculate newborn age in weeks
    const getBabyAgeWeeks = () => {
        return Math.max(0, getWeeksPregnant() - 40);
    };

    // calculate newborn age in months (approx 4.33 weeks per month)
    const getBabyAgeMonths = () => {
        const weeks = getBabyAgeWeeks();
        if (babyStatus === 'nato' && weeks < 4.33) return 1;
        return Math.floor(weeks / 4.33) + 1;
    };

    const getBabyPreciseAgeString = () => {
        if (babyStatus !== 'nato') return '';
        const due = getDueDate();
        if (!due) return '1 mese';

        const now = new Date();
        const diffTime = now - due;
        if (diffTime < 0) return 'Appena nato';

        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Appena nato';

        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;

        let res = [];
        if (months === 1) res.push('1 mese');
        else if (months > 1) res.push(`${months} mesi`);

        if (days === 1) res.push('1 giorno');
        else if (days > 1) res.push(`${days} giorni`);

        return res.join(' e ') || 'Appena nato';
    };

    // --- SWEETSPOT ALGORITHM ---
    const getSweetSpot = () => {
        if (!trackers.sleep || trackers.sleep.length === 0) return null;

        const completedSleeps = trackers.sleep.filter(s => s.endTime).sort((a, b) => b.endTime - a.endTime);
        if (completedSleeps.length === 0) return null;

        const lastSleep = completedSleeps[0];
        const ageWeeks = getBabyAgeWeeks();

        let wakeWindowMins = 60;
        if (ageWeeks >= 4 && ageWeeks < 12) wakeWindowMins = 90;
        else if (ageWeeks >= 12 && ageWeeks < 24) wakeWindowMins = 120;
        else if (ageWeeks >= 24) wakeWindowMins = 180;

        const nextNapTime = new Date(lastSleep.endTime.getTime() + wakeWindowMins * 60000);
        return { lastSleepEnd: lastSleep.endTime, wakeWindowMins, nextNapTime };
    };

    // Derived phase
    const getAppPhase = () => {
        if (babyStatus === 'nato') return 'NEWBORN';
        return 'PREGNANCY';
    };

    const getDueDate = () => {
        if (!conceptionDate) return null;
        const due = new Date(conceptionDate);
        due.setDate(due.getDate() + 280);
        return due;
    };

    const addDiaryEntry = (weekNum, text, type = 'note') => {
        setDiaryEntries(prev => ({
            ...prev,
            [weekNum]: [...(prev[weekNum] || []), { id: Date.now().toString(), text, type }]
        }));
    };

    const removeDiaryEntry = (weekNum, entryId) => {
        setDiaryEntries(prev => ({
            ...prev,
            [weekNum]: (prev[weekNum] || []).filter(e => e.id !== entryId)
        }));
    };

    // Tracker Functions
    const addTrackerEntry = (category, data) => {
        setTrackers(prev => ({
            ...prev,
            [category]: [{ id: Date.now().toString(), ...data }, ...prev[category]]
        }));
    };

    const removeTrackerEntry = (category, id) => {
        setTrackers(prev => ({
            ...prev,
            [category]: prev[category].filter(entry => entry.id !== id)
        }));
    };

    const toggleBagItem = (itemId) => {
        setHospitalBag(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const isMamma = userRole === 'mamma';
    const isPapa = userRole === 'papa';

    return (
        <UserContext.Provider value={{
            userRole, setUserRole, userName, setUserName, babyName, setBabyName,
            babySex, setBabySex, partnerName, setPartnerName,
            conceptionDate, setConceptionDate,
            onboardingDone, babyStatus, setBabyStatus,
            diaryEntries, addDiaryEntry, removeDiaryEntry,
            hospitalBag, toggleBagItem,
            trackers, addTrackerEntry, removeTrackerEntry,
            activeFeedTimer, setActiveFeedTimer, lastBreastSide, setLastBreastSide,
            activeSleepTimer, setActiveSleepTimer,
            // MVP Agenda state
            completedTasks, toggleTaskCompleted, isTaskCompleted,
            weekNotes, setWeekNote, getWeekNote,
            appointments, addAppointment, removeAppointment, getAppointmentsForWeek,
            customTasks, addCustomTask, removeCustomTask, updateCustomTask, getCustomTasksForWeek,
            dismissedTasks, dismissTask, isTaskDismissed,
            // Pregnancy Tracker
            hydration, setHydration, addHydration, removeHydration,
            kicks, setKicks, addKick, removeKick,
            // Status states
            userMood, setUserMood, userActivity, setUserActivity, partnerStatus, setPartnerStatus,
            // Newborn Tracker
            setTrackers, addFeeding, removeFeeding, addDiaper, removeDiaper,
            //
            isMamma, isPapa,
            completeOnboarding, devLogin, login,
            getWeeksPregnant, getWeeksRemaining, getDueDate, getBabyAgeWeeks, getBabyAgeMonths, getBabyPreciseAgeString, getSweetSpot,
            getAppPhase,
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
