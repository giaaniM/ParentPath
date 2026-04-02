import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
    const [userRole, setUserRole] = useState(() => loadJSON('pp_userRole', null));
    const [userName, setUserName] = useState(() => loadJSON('pp_userName', ''));
    const [babyName, setBabyName] = useState(() => loadJSON('pp_babyName', ''));
    const [babySex, setBabySex] = useState(() => loadJSON('pp_babySex', null)); // 'M' | 'F' | null
    const [partnerName, setPartnerName] = useState(() => loadJSON('pp_partnerName', ''));
    const [conceptionDate, setConceptionDate] = useState(() => {
        const raw = loadJSON('pp_conceptionDate', null);
        return raw ? new Date(raw) : null;
    });
    const [onboardingDone, setOnboardingDone] = useState(() => loadJSON('pp_onboardingDone', false));
    const [isDevUser, setIsDevUser] = useState(false);

    // New Feature States
    const [babyStatus, setBabyStatus] = useState(() => loadJSON('pp_babyStatus', 'gravidanza')); // 'gravidanza' | 'nato'
    const [diaryEntries, setDiaryEntries] = useState({}); // { weekNum: [ { id, text, type } ] }
    const [hospitalBag, setHospitalBag] = useState({}); // { itemId: boolean }
    const [mockWeek, setMockWeek] = useState(null); // per debug/test

    // --- MVP Agenda / Task State (persisted) ---
    const [completedTasks, setCompletedTasks] = useState(() => loadJSON('pp_completedTasks', {}));
    
    // Support migrating old weekNotes if they exist
    const [notes, setNotes] = useState(() => {
        const existingNotes = loadJSON('pp_notes', []);
        if (existingNotes.length === 0) {
            // Migrate old weekNotes if present
            const oldNotes = loadJSON('pp_weekNotes', {});
            const migrated = Object.entries(oldNotes).map(([week, text]) => ({
                id: `migrated_${week}`,
                weekNumber: parseInt(week, 10),
                text
            })).filter(n => n.text);
            if (migrated.length > 0) return migrated;
        }
        return existingNotes;
    });

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

    // Persist profile fields
    useEffect(() => { saveJSON('pp_userRole', userRole); }, [userRole]);
    useEffect(() => { saveJSON('pp_userName', userName); }, [userName]);
    useEffect(() => { saveJSON('pp_babyName', babyName); }, [babyName]);
    useEffect(() => { saveJSON('pp_babySex', babySex); }, [babySex]);
    useEffect(() => { saveJSON('pp_partnerName', partnerName); }, [partnerName]);
    useEffect(() => { saveJSON('pp_conceptionDate', conceptionDate ? conceptionDate.toISOString() : null); }, [conceptionDate]);
    useEffect(() => { saveJSON('pp_onboardingDone', onboardingDone); }, [onboardingDone]);
    useEffect(() => { saveJSON('pp_babyStatus', babyStatus); }, [babyStatus]);

    // Ripristina sessione Supabase all'avvio: se c'è una sessione attiva ma nessun profilo in stato, ricarica da DB
    useEffect(() => {
        const restoreSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            // Se l'onboarding risulta già fatto (da localStorage), non serve ricaricare
            if (loadJSON('pp_onboardingDone', false)) return;

            const userId = session.user.id;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            const { data: pregnancy } = await supabase.from('pregnancies').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();

            if (profile) {
                let conceptionTime = null;
                if (pregnancy?.conception_date) conceptionTime = new Date(pregnancy.conception_date);
                setUserRole(profile.role || 'papa');
                setUserName(profile.name || '');
                setBabyName(pregnancy?.baby_name || '');
                setBabySex(pregnancy?.baby_sex || null);
                setBabyStatus(pregnancy?.status || 'gravidanza');
                setConceptionDate(conceptionTime);
                setOnboardingDone(true);
            }
        };
        restoreSession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist on change
    useEffect(() => { saveJSON('pp_completedTasks', completedTasks); }, [completedTasks]);
    useEffect(() => { saveJSON('pp_notes', notes); }, [notes]);
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

    // --- Notes helpers ---
    const addNote = useCallback((note) => {
        setNotes(prev => [...prev, { id: Date.now().toString(), ...note }]);
    }, []);

    const removeNote = useCallback((id) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    }, []);

    const updateNote = useCallback((id, updates) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    }, []);

    const getNotesForWeek = useCallback((week) => {
        return notes.filter(n => n.weekNumber === week);
    }, [notes]);

    // --- Appointment helpers ---
    const addAppointment = useCallback((appt) => {
        setAppointments(prev => [...prev, { id: Date.now().toString(), ...appt }]);
    }, []);

    const removeAppointment = useCallback((id) => {
        setAppointments(prev => prev.filter(a => a.id !== id));
    }, []);

    const updateAppointment = useCallback((id, updates) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
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
        setIsDevUser(false);
    };

    // Main login helper (usato internamente dopo signIn Supabase)
    const login = (role, name) => {
        setUserRole(role);
        setUserName(name);
        setBabyStatus('gravidanza');
        setOnboardingDone(true);
    };

    // Logout reale: termina sessione Supabase e pulisce lo stato locale
    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUserRole(null);
        setUserName('');
        setBabyName('');
        setBabySex(null);
        setConceptionDate(null);
        setBabyStatus('gravidanza');
        setOnboardingDone(false);
        setIsDevUser(false);
        // Pulizia localStorage profilo
        ['pp_userRole','pp_userName','pp_babyName','pp_babySex','pp_partnerName',
         'pp_conceptionDate','pp_onboardingDone','pp_babyStatus'].forEach(k => localStorage.removeItem(k));
    }, []);

    // Ripristina sessione Supabase al riavvio dell'app
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Se l'utente era loggato su Supabase ma non in React state, non forziamo nulla:
            // il flusso login/onboarding chiama già completeOnboarding().
            // Questo listener serve principalmente per gestire il logout da altri tab.
            if (!session && onboardingDone) {
                setUserRole(null);
                setUserName('');
                setOnboardingDone(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [onboardingDone]);

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
        setIsDevUser(true);
    };

    // Compute weeks from conception
    const getWeeksPregnant = () => {
        if (mockWeek !== null) return mockWeek;
        if (!conceptionDate) return 31; // fallback to demo week
        const now = new Date();
        const diffMs = now - new Date(conceptionDate);
        const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        // Per bimbi nati non applichiamo il cap a 42 così getBabyAgeWeeks() funziona correttamente
        if (babyStatus === 'nato') return Math.max(weeks, 40);
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
            notes, addNote, removeNote, updateNote, getNotesForWeek,
            appointments, addAppointment, removeAppointment, updateAppointment, getAppointmentsForWeek,
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
            isMamma, isPapa, isDevUser,
            completeOnboarding, devLogin, login, logout,
            getWeeksPregnant, getWeeksRemaining, getDueDate, getBabyAgeWeeks, getBabyAgeMonths, getBabyPreciseAgeString, getSweetSpot,
            getAppPhase,
            mockWeek, setMockWeek,
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
