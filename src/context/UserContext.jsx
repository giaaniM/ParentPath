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

    const completeOnboarding = ({ role, name, baby, conception }) => {
        setUserRole(role);
        setUserName(name);
        setBabyName(baby || '');
        setConceptionDate(conception);
        setOnboardingDone(true);
    };

    // Quick login for dev
    const devLogin = (role) => {
        setUserRole(role);
        setUserName(role === 'mamma' ? 'Sara' : 'Marco');
        setBabyName('');
        setConceptionDate(new Date('2025-08-10'));
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

    const isMamma = userRole === 'mamma';
    const isPapa = userRole === 'papa';

    return (
        <UserContext.Provider value={{
            userRole, userName, babyName, conceptionDate, onboardingDone,
            babyStatus, setBabyStatus, diaryEntries, addDiaryEntry, removeDiaryEntry,
            isMamma, isPapa,
            completeOnboarding, devLogin,
            getWeeksPregnant, getWeeksRemaining, getDueDate,
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
