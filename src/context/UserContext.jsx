import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [userRole, setUserRole] = useState(null); // 'mamma' | 'papa'
    const [userName, setUserName] = useState('');
    const [babyName, setBabyName] = useState('');
    const [conceptionDate, setConceptionDate] = useState(null);
    const [onboardingDone, setOnboardingDone] = useState(false);

    // New Feature States
    const [babyStatus, setBabyStatus] = useState('gravidanza'); // 'gravidanza' | 'nato'
    const [diaryEntries, setDiaryEntries] = useState({}); // { weekNum: [ { id, text, type } ] }
    const [hospitalBag, setHospitalBag] = useState({}); // { itemId: boolean }

    // Newborn Trackers
    const [trackers, setTrackers] = useState({
        feeding: [], // { id, timestamp, type: 'breast'|'bottle', amount?: number, duration?: number, side?: 'left'|'right'|'both' }
        sleep: [],   // { id, startTime, endTime, duration }
        diapers: []  // { id, timestamp, type: 'wet'|'dirty'|'both' }
    });

    const [activeFeedTimer, setActiveFeedTimer] = useState(null); // { startTime: Date, type: 'breast'|'bottle', side: 'left'|'right' }
    const [lastBreastSide, setLastBreastSide] = useState('left'); // 'left' | 'right'
    const [activeSleepTimer, setActiveSleepTimer] = useState(null); // { startTime: Date }
    const completeOnboarding = ({ role, name, baby, status, conception }) => {
        setUserRole(role);
        setUserName(name);
        setBabyName(baby || '');
        setConceptionDate(conception);
        if (status) setBabyStatus(status);
        setOnboardingDone(true);
    };

    // Quick login for dev
    const devLogin = (role, status = 'gravidanza') => {
        setUserRole(role);
        setUserName(role === 'mamma' ? 'Sara' : 'Marco');
        setBabyName('');
        setConceptionDate(new Date('2025-08-10'));
        setBabyStatus(status);
        setOnboardingDone(true);
    };

    // Compute weeks from conception
    const getWeeksPregnant = () => {
        if (!conceptionDate) return 24; // fallback
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
        // Return at least month 1 if born
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

        // Find the last completed sleep
        const completedSleeps = trackers.sleep.filter(s => s.endTime).sort((a, b) => b.endTime - a.endTime);
        if (completedSleeps.length === 0) return null;

        const lastSleep = completedSleeps[0];
        const ageWeeks = getBabyAgeWeeks();

        // Determine optimal Wake Window based on age (in minutes)
        // 0-4 weeks: ~60 mins
        // 4-12 weeks: ~90 mins
        // 12-24 weeks: ~120 mins
        // >24 weeks: ~180 mins
        let wakeWindowMins = 60;
        if (ageWeeks >= 4 && ageWeeks < 12) wakeWindowMins = 90;
        else if (ageWeeks >= 12 && ageWeeks < 24) wakeWindowMins = 120;
        else if (ageWeeks >= 24) wakeWindowMins = 180;

        const nextNapTime = new Date(lastSleep.endTime.getTime() + wakeWindowMins * 60000);
        return {
            lastSleepEnd: lastSleep.endTime,
            wakeWindowMins,
            nextNapTime
        };
    };

    const getDueDate = () => {
        if (!conceptionDate) return null;
        const due = new Date(conceptionDate);
        due.setDate(due.getDate() + 280); // 40 weeks
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
            userRole, setUserRole, userName, setUserName, babyName, setBabyName, conceptionDate, setConceptionDate,
            onboardingDone, babyStatus, setBabyStatus, diaryEntries, addDiaryEntry, removeDiaryEntry,
            hospitalBag, toggleBagItem,
            trackers, addTrackerEntry, removeTrackerEntry,
            activeFeedTimer, setActiveFeedTimer, lastBreastSide, setLastBreastSide,
            activeSleepTimer, setActiveSleepTimer,
            isMamma, isPapa,
            completeOnboarding, devLogin,
            getWeeksPregnant, getWeeksRemaining, getDueDate, getBabyAgeWeeks, getBabyAgeMonths, getBabyPreciseAgeString, getSweetSpot,
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
