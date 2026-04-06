import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useInvalidatePregnancyData } from '../hooks/usePregnancyDataQuery';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { pregnancy, getWeekData, smartTrackerData, pregnancyWeather, newbornWeather, partnerSync, weeklyDevelopment, newbornDevelopment, pregnancyTasks, newbornTasks, getHomeTips } from '../data/mockData';
import { useWeekData } from '../hooks/useWeekData';
import {
    Sparkles, Stethoscope, ShoppingBag, ClipboardCheck, X,
    Heart, SmilePlus, Smile, Meh, Frown, Coffee, ArrowRight, Edit2, Check, Droplets, Clock, Plus, Minus, RefreshCw, Baby, Bell, Users
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import EditProfileModal from '../components/EditProfileModal';
import TipBottomSheet from '../components/TipBottomSheet';
import HomeProfileProgress from '../components/HomeProfileProgress';
import SosNotteModal from '../components/SosNotteModal';
import { getCategoryConfig } from '../utils/CategoryColors';
import { Brain, Moon } from 'lucide-react';
import './Home.css';

// Using lucide-react icons instead of emojis for a sleeker look
const MOODS = [
    { id: 'sick', icon: <Frown strokeWidth={2.5} size={28} />, label: 'Nausea' },
    { id: 'tired', icon: <Coffee strokeWidth={2.5} size={28} />, label: 'Stanca' },
    { id: 'good', icon: <Smile strokeWidth={2.5} size={28} />, label: 'Bene' },
    { id: 'great', icon: <SmilePlus strokeWidth={2.5} size={28} />, label: 'Ottima' },
    { id: 'anxious', icon: <Meh strokeWidth={2.5} size={28} />, label: 'Ansiosa' },
];
const MOODS_PAPA = [
    { id: 'chill', icon: <Smile strokeWidth={2.5} size={28} />, label: 'Sereno' },
    { id: 'good', icon: <SmilePlus strokeWidth={2.5} size={28} />, label: 'Bene' },
    { id: 'excited', icon: <Sparkles strokeWidth={2.5} size={28} />, label: 'Euforico' },
    { id: 'anxious', icon: <Meh strokeWidth={2.5} size={28} />, label: 'Ansioso' },
    { id: 'tired', icon: <Coffee strokeWidth={2.5} size={28} />, label: 'Stanco' },
];

const PRIORITY_ORDER = { critica: 0, alta: 1, media: 2, bassa: 3 };

// Used to make sure we only trigger the welcome push once per session
let hasTriggeredWelcomePush = false;

const APP_TIPS = [
    "Per vedere l'avanzamento della crescita del tuo bambino, scorri verso il basso o vai nella tab Bimbo.",
    "Per segnare i suoi calcetti usa il rapido counter qui nella schermata Home.",
    "Vai nell'Agenda per gestire le cose da fare e visualizzare le visite.",
    "Tieni traccia di quanto bevi ogni giorno usando il contatore Acqua in Home.",
    "Aggiorna l'umore ogni giorno per tenere traccia di come ti senti col passare del tempo.",
    "Puoi segnare gli eventi e le visite mediche direttamente dalla tab Bimbo, finiranno nell'Agenda.",
    "Sincronizza il tuo stato con il partner per fargli sapere come procede la giornata.",
    "Aggiungi un nuovo task personalizzato dall'Agenda per non dimenticare la spesa ospedaliera."
];

const DotIndicator = ({ current, total, color }) => {
    return (
        <div className="dot-indicator">
            {[...Array(total)].map((_, i) => (
                <div 
                    key={i} 
                    className="dot" 
                    style={{ 
                        backgroundColor: i < current ? color : '#E5E7EB',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%'
                    }}
                />
            ))}
        </div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const {
        userName, babyName, babyStatus, conceptionDate, onboardingDone,
        getWeeksPregnant, getBabyAgeMonths, getBabyPreciseAgeString,
        hydration, kicks, trackers, addHydration, removeHydration, addKick, removeKick,
        addFeeding, removeFeeding, addDiaper, removeDiaper, appointments,
        userMood, setUserMood, userActivity, setUserActivity,
        partnerStatus, setPartnerStatus, isMamma, partnerName, partnerId,
        mockWeek, setMockWeek, isDevUser,
        toggleTaskCompleted, isTaskCompleted, isTaskDismissed, getCustomTasksForWeek,
        babySex, realtimeNotifications,
        activeSleepTimer, setActiveSleepTimer, addTrackerEntry,
    } = useUser();
    const invalidatePregnancyData = useInvalidatePregnancyData();

    const weeks = getWeeksPregnant();
    const weekJsonData = useWeekData(weeks);
    const isBorn = babyStatus === 'nato';

    // Solo appuntamenti reali dell'utente — le visite consigliate dal JSON
    // sono già mostrate in BabyDev, non devono gonfiare il contatore in Home
    const weeklyAppts = (appointments || []).filter(a => a.weekNumber === weeks);
    const totalWeeklyVisits = weeklyAppts.length;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSosOpen, setIsSosOpen] = useState(false);
    const [selectedTip, setSelectedTip] = useState(null);
    const [showRoleTip, setShowRoleTip] = useState(true);
    const [randomTip] = useState(() => APP_TIPS[Math.floor(Math.random() * APP_TIPS.length)]);

    const nextAppointment = useMemo(() => {
        if (!appointments || appointments.length === 0) return null;
        
        // Sort by date then by time
        const sorted = [...appointments].sort((a, b) => {
            // First priority: items with dates
            if (a.date && !b.date) return -1;
            if (!a.date && b.date) return 1;
            if (a.date && b.date) {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
            }
            // Fallback to week number
            if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
            // Time sort
            return a.time.localeCompare(b.time);
        });
        
        return sorted[0];
    }, [appointments]);

    const getVisitDaysRemaining = (appt) => {
        if (!appt) return null;
        if (appt.date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const apptDate = new Date(appt.date);
            apptDate.setHours(0, 0, 0, 0);
            const diffTime = apptDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Oggi';
            if (diffDays === 1) return 'Domani';
            if (diffDays < 0) return 'Scaduto';
            return `Tra ${diffDays} giorni`;
        }
        
        // Fallback to legacy logic
        const diff = appt.weekNumber - weeks;
        if (diff === 0) return 'Oggi';
        if (diff === 1) return 'Tra 7 gg';
        return `${diff * 7} giorni`;
    };

    // Dynamic Weather Logic based on Mood
    const getMoodWeather = (moodId) => {
        const config = {
            great: { condition: 'Radioso', icon: '✨', description: 'Ti senti alla grande! Energia al massimo.', tips: 'Approfittane per fare qualcosa che ami.' },
            good: { condition: 'Sereno', icon: '☀️', description: 'Una bella giornata. Ti senti bene e in equilibrio.', tips: 'Una passeggiata leggera è l\'ideale.' },
            tired: { condition: 'Nuvoloso', icon: '☁️', description: 'Un po\' di stanchezza oggi. È normale sentirsi così.', tips: 'Riposati più che puoi, te lo meriti.' },
            sick: { condition: 'Pioggia', icon: '🌧️', description: 'Giornata difficile. La nausea o il malessere si fanno sentire.', tips: 'Tisana allo zenzero e tanto relax.' },
            anxious: { condition: 'Variabile', icon: '⛅', description: 'Tanti pensieri in testa. Respira, andrà tutto bene.', tips: 'Prova 5 minuti di meditazione guidata.' },
            excited: { condition: 'Elettrizzante', icon: '⚡', description: 'Non vedi l\'ora! L\'entusiasmo è contagioso.', tips: 'Condividi questa gioia con il partner.' },
            chill: { condition: 'Calmo', icon: '🌊', description: 'Pace e tranquillità. Ti stai godendo il momento.', tips: 'Leggi un buon libro o ascolta musica.' },
            dark: { condition: 'Tempesta', icon: '⛈️', description: 'Oggi è proprio no. Non forzarti a sorridere.', tips: 'Parlane con qualcuno di cui ti fidi.' }
        };
        return config[moodId] || config.good;
    };

    const weatherData = getMoodWeather(userMood);

    // Handle status update
    const handleMoodChange = async (moodId) => {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
        setUserMood(moodId);
    };

    const handleActivityChange = (activity) => {
        setUserActivity(activity);
    };

    const moods = isMamma ? MOODS : MOODS_PAPA;

    const percent = isBorn ? 100 : Math.min(100, Math.round((weeks / pregnancy.totalWeeks) * 100));

    // Dynamic Phase Data
    const phaseDev = isBorn ? newbornDevelopment.month1 : getWeekData(weeks);
    const sizeEmoji = phaseDev?.sizeEmoji || '✨';
    const sizeLabel = phaseDev?.sizeLabel || '...';

    // Dynamic Phase Data
    const phaseArticles = getHomeTips(isBorn, isMamma ? 'mamma' : 'papa');

    const partnerInfo = {
        name: partnerName || (isMamma ? 'Marco' : 'Sara'),
        avatar: isMamma ? '👨' : '👩'
    };

    const babyAgeMonths = getBabyAgeMonths();
    const timeframeLabel = isBorn ? `nel Mese ${babyAgeMonths}` : `nella Settimana ${weeks}`;

    // Weekly insight: il "wow fact" che fa aprire l'app ogni giorno
    const weekInsightFact = !isBorn
        ? (weekJsonData?.developmentDetails?.fact || weekJsonData?.curiosities?.[0] || null)
        : (newbornDevelopment?.month1?.developmentDetails?.fact || newbornDevelopment?.month1?.subtitle || null);
    const weekInsightEmoji = !isBorn ? (weekJsonData?.sizeEmoji || '✨') : '👶';
    const weekInsightLabel = !isBorn ? `Sett. ${weeks} — Lo sapevi?` : `Mese ${babyAgeMonths} — Lo sapevi?`;

    // Used to make sure we only trigger the welcome push once per session
    const scheduleWelcomePush = async () => {
        if (hasTriggeredWelcomePush) return;
        hasTriggeredWelcomePush = true;

        try {
            const permStatus = await LocalNotifications.requestPermissions();
            if (permStatus.display === 'granted') {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Ciao " + userName + "! 👋",
                            body: "Il tuo bimbo ti aspetta. Entra per vedere com'è cresciuto! 👶",
                            id: 1,
                            schedule: { at: new Date(Date.now() + 4000) },
                            sound: null, attachments: null, actionTypeId: "", extra: null
                        }
                    ]
                });
            }
        } catch (e) {
            console.log("Not running in a native context or push failed", e);
        }
    };

    useEffect(() => {
        const initNotifications = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    const permStatus = await LocalNotifications.checkPermissions();
                    if (permStatus.display === 'prompt') {
                        await LocalNotifications.requestPermissions();
                    }
                } catch (e) {
                    console.log("Error checking/requesting notifications", e);
                }
            }
        };

        initNotifications();

        const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive) {
                scheduleWelcomePush();
            }
        });

        return () => {
            appStateListener.then(l => l.remove());
        };
    }, [userName]);

    // Task logic - Sync with Agenda.jsx
    const allTasks = useMemo(() => {
        const jsonTasks = weekJsonData?.tasks || [];
        
        // Combine JSON suggested tasks + user custom tasks only
        const combined = [...jsonTasks, ...getCustomTasksForWeek(weeks)];
        
        // Filter out empty tasks, those missing text, AND DISMISSED TASKS
        return combined.filter(t => t.text && t.text.trim() && !isTaskDismissed(t.id));
    }, [weekJsonData, babyStatus, getCustomTasksForWeek, weeks, isTaskDismissed]);

    const homeTasks = allTasks;
    const completedCount = homeTasks.filter(t => isTaskCompleted(weeks, t.id)).length;
    const totalTasks = homeTasks.length;

    const handleToggleTask = async (taskId) => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        toggleTaskCompleted(weeks, taskId);
    };

    const handleAddHydration = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        addHydration();
    };

    const handleRemoveHydration = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        removeHydration();
    };

    const handleAddKick = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
        addKick();
    };

    const handleRemoveKick = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        removeKick();
    };

    const handleAddFeeding = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        addFeeding();
    };

    const handleRemoveFeeding = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        removeFeeding();
    };

    const handleAddDiaper = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        addDiaper();
    };

    const handleRemoveDiaper = async (e) => {
        e.stopPropagation();
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        removeDiaper();
    };

    // Sleep tracker — aggiorna l'elapsed ogni 30s
    const [sleepElapsedStr, setSleepElapsedStr] = useState('');
    useEffect(() => {
        if (!activeSleepTimer?.startTime) { setSleepElapsedStr(''); return; }
        const update = () => {
            const mins = Math.floor((Date.now() - new Date(activeSleepTimer.startTime).getTime()) / 60000);
            setSleepElapsedStr(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`);
        };
        update();
        const id = setInterval(update, 30000);
        return () => clearInterval(id);
    }, [activeSleepTimer]);

    const handleToggleSleep = async () => {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
        if (activeSleepTimer?.startTime) {
            const endTime = new Date();
            const dur = Math.round((endTime - new Date(activeSleepTimer.startTime).getTime()) / 60000);
            addTrackerEntry('sleep', { startTime: activeSleepTimer.startTime, endTime, duration: dur });
            setActiveSleepTimer(null);
        } else {
            setActiveSleepTimer({ startTime: new Date() });
        }
    };

    // ── Pull-to-Refresh ──
    const scrollRef = useRef(null);
    const pullStartY = useRef(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const PULL_THRESHOLD = 70;

    const handlePullTouchStart = useCallback((e) => {
        if (scrollRef.current?.scrollTop === 0) {
            pullStartY.current = e.touches[0].clientY;
        } else {
            pullStartY.current = 0;
        }
    }, []);

    const handlePullTouchMove = useCallback((e) => {
        if (!pullStartY.current || isRefreshing) return;
        const delta = e.touches[0].clientY - pullStartY.current;
        if (delta > 0) setPullDistance(Math.min(delta, PULL_THRESHOLD + 20));
    }, [isRefreshing]);

    const handlePullTouchEnd = useCallback(async () => {
        if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(0);
            invalidatePregnancyData();   // invalida → React Query ricarica in background
            // Aspetta abbastanza da far sentire il refresh (la query è async)
            await new Promise(r => setTimeout(r, 800));
            setIsRefreshing(false);
        } else {
            setPullDistance(0);
        }
        pullStartY.current = 0;
    }, [pullDistance, isRefreshing, invalidatePregnancyData]);

    // Ultima sessione di sonno completata
    const lastSleepEntry = Array.isArray(trackers?.sleep) ? trackers.sleep.find(s => s.endTime) : null;
    const lastSleepSubtitle = (() => {
        if (activeSleepTimer?.startTime) return `Dorme da ${sleepElapsedStr || '0 min'}`;
        if (!lastSleepEntry) return 'Tocca per registrare la nanna';
        const agoMins = Math.floor((Date.now() - new Date(lastSleepEntry.endTime).getTime()) / 60000);
        const agoStr = agoMins < 60 ? `${agoMins} min fa` : `${Math.floor(agoMins / 60)}h fa`;
        const durStr = lastSleepEntry.duration < 60
            ? `${lastSleepEntry.duration} min`
            : `${Math.floor(lastSleepEntry.duration / 60)}h ${lastSleepEntry.duration % 60}min`;
        return `Ultima nanna: ${durStr} • Finita ${agoStr}`;
    })();

    const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

    return (
        <div
            className="page home-wrap"
            ref={scrollRef}
            onTouchStart={handlePullTouchStart}
            onTouchMove={handlePullTouchMove}
            onTouchEnd={handlePullTouchEnd}
        >
            {/* Pull-to-refresh indicator */}
            {(pullDistance > 8 || isRefreshing) && (
                <div className="ptr-indicator" style={{ opacity: isRefreshing ? 1 : pullProgress }}>
                    <div className={`ptr-spinner ${isRefreshing ? 'ptr-spinning' : ''}`}
                         style={{ transform: `rotate(${pullProgress * 270}deg)` }} />
                </div>
            )}

            <div className="greeting-wrapper fi" style={{ margin: '2px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    <h2 className="greeting" style={{ margin: 0 }}>
                        Ciao {userName || 'Genitore'}!
                    </h2>
                    {isDevUser && (
                        <div className="home-mock-selector">
                            <Baby size={14} className="home-mock-icon" />
                            <select
                                className="home-mock-select"
                                value={mockWeek || ''}
                                onChange={e => setMockWeek(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">Sett. Reale</option>
                                {[...Array(42)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Sett {i + 1}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button className="home-notif-btn" onClick={() => navigate('/notifications')}>
                    <Bell size={24} strokeWidth={1.8} color="var(--midnight)" />
                    {(realtimeNotifications?.length || 0) > 0 && (
                        <div className="home-notif-badge">{realtimeNotifications.length}</div>
                    )}
                </button>
            </div>

            {/* COMPLETAMENTO PROFILO — in cima, sparisce al 100% */}
            <HomeProfileProgress />

            {/* TIP APP — subito sotto il completamento profilo */}
            {showRoleTip && (
                <div className="home-role-tip ru d2" style={{ margin: '-4px 20px 18px' }}>
                    <div className="home-rt-icon">💡</div>
                    <div className="home-rt-text">
                        <div className="home-rt-title">Suggerimento</div>
                        <div className="home-rt-sub">{randomTip}</div>
                    </div>
                    <button className="home-rt-close" onClick={() => setShowRoleTip(false)}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* PARTNER BANNER — visibile finché il partner non è collegato */}
            {!partnerId && (
                <div className="home-partner-banner ru d1" onClick={() => navigate('/profile', { state: { openPartner: true } })}>
                    <div className="hpb-icon-wrap">
                        <Users size={22} color="var(--aqua)" strokeWidth={2} />
                    </div>
                    <div className="hpb-text">
                        <div className="hpb-title">Invita il tuo partner</div>
                        <div className="hpb-sub">Condividete il percorso insieme — genera il tuo codice invito</div>
                    </div>
                    <ArrowRight size={18} color="var(--aqua)" strokeWidth={2.5} />
                </div>
            )}

            {/* HERO CARD (REDESIGNED V4 - PREMIUM GLASS) */}
            <div className={`hc-v4 glass ${isBorn ? 'hc--born' : ''} ru d1`} onClick={() => navigate('/baby')} style={{ marginBottom: '24px' }}>
                <div className="hc-mesh-v2"></div>
                
                <div className="hc-arr-v4"><ArrowRight size={18} strokeWidth={2} /></div>
                
                <div className="hc-content-v4">
                    <div className="hc-fetus-mini animated-float">
                        <img src={isBorn ? "/baby-newborn.png" : "/baby-24w-alpha.png"} alt="Bimbo" />
                    </div>
                    
                    <div className="hc-info-v4">
                        <div className="hc-eyebrow-v4">{isBorn ? 'Il tuo bimbo' : timeframeLabel}</div>
                        <h2 className="hc-title-v4">
                            {babyName || 'Il tuo Bimbo'} 
                            <span className="hc-sex-v4">
                                {(babySex || pregnancy.sex) === 'M' ? '♂' : ((babySex || pregnancy.sex) === 'F' ? '♀' : '')}
                            </span>
                        </h2>
                        
                        {!isBorn ? (
                            <div className="hc-stats-v4">
                                <div className="hc-stat-row-v4">
                                    <div className="hc-prg-v4">
                                        <div className="hc-prg-fill-v4" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <span className="hc-percent-v4">{percent}%</span>
                                </div>
                                {sizeLabel && (
                                    <div className="hc-size-v4">
                                        <span className="hc-size-emoji">{sizeEmoji}</span>
                                        <div className="hc-size-info-text">
                                            <span className="hc-size-label-small">Grande come</span>
                                            <span className="hc-size-val-bold">{sizeLabel}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hc-born-v4">
                                <Sparkles size={16} color="var(--aqua)" />
                                <span>{getBabyPreciseAgeString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>




            {/* CONSOLIDATED WEEKLY VISITS NOTIFICATION */}
            {totalWeeklyVisits > 0 && (
                <div 
                    className="home-visit-notification ru d2" 
                    onClick={() => navigate('/agenda')}
                >
                    <div className="hvn-icon-wrap">
                        <Stethoscope size={24} color="var(--aqua)" />
                        {totalWeeklyVisits > 1 && <span className="hvn-badge">{totalWeeklyVisits}</span>}
                    </div>
                    <div className="hvn-content">
                        <div className="hvn-label">Agenda • Settimana {weeks}</div>
                        <div className="hvn-text">
                            Hai {totalWeeklyVisits} {totalWeeklyVisits === 1 ? 'visita in programma' : 'visite in programma'} questa settimana.
                        </div>
                        <div className="hvn-cta">Vedi in Agenda <ArrowRight size={14} /></div>
                    </div>
                </div>
            )}

            {/* TASK PROGRESS CARD */}
            <div
                className={`home-task-progress-card ru d${isBorn ? '6' : '3'}`}
                onClick={() => navigate('/agenda')}
                style={{ margin: '0 20px 24px' }}
            >
                <div className="htp-content">
                    <div className="htp-info">
                        <div className="htp-eyebrow">Agenda: {isBorn ? `Mese ${babyAgeMonths}` : `Settimana ${weeks}`}</div>
                        <div className="htp-title">
                            {totalTasks === 0 
                                ? "Nessun task da fare" 
                                : completedCount === totalTasks 
                                    ? "Tutti i Task Completati"
                                    : `${completedCount} di ${totalTasks} completati`}
                        </div>
                        <div className="htp-desc">
                            {totalTasks === 0 ? "Tocca qui per creare task in Agenda" : "Premi per visualizzare i task"}
                        </div>
                    </div>

                    <div className="htp-ring-container">
                        <svg className="htp-ring" viewBox="0 0 100 100">
                            <circle className="htp-ring-bg" cx="50" cy="50" r="40"></circle>
                            <circle
                                className="htp-ring-fill"
                                cx="50" cy="50" r="40"
                                strokeDasharray="251.2"
                                strokeDashoffset={totalTasks > 0 ? 251.2 - (251.2 * (completedCount / totalTasks)) : 251.2}
                            ></circle>
                        </svg>
                        <div className="htp-ring-text">
                            <ClipboardCheck size={24} color={completedCount === totalTasks && totalTasks > 0 ? "var(--aqua)" : "var(--midnight)"} />
                        </div>
                    </div>
                </div>
                
                {homeTasks.length > 0 && completedCount < totalTasks && (
                    <div className="htp-preview">
                        <span className="htp-preview-label">Task:</span>
                        <span className="htp-preview-text">{homeTasks.find(t => !isTaskCompleted(weeks, t.id))?.text || homeTasks[0].text}</span>
                    </div>
                )}


            </div>

            {/* SOS NOTTE BANNER (Newborn only) */}
            {isBorn && (
                <div className="sos-home-banner ru d5" onClick={() => setIsSosOpen(true)}>
                    <div className="sos-hb-icon"><Moon size={24} strokeWidth={2} /></div>
                    <div className="sos-hb-text">
                        <div className="sos-hb-title">SOS Notte</div>
                        <div className="sos-hb-sub">Rumori bianchi e coliche</div>
                    </div>
                    <div className="sos-hb-go">Apri</div>
                </div>
            )}


            {/* SYNC & SMART WIDGETS */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Griglia tracker: 2 colonne se mostriamo entrambi, 1 se calci nascosti */}
                <div style={{ display: 'grid', gridTemplateColumns: (isBorn || weeks >= 18) ? '1fr 1fr' : '1fr', gap: '12px' }}>

                    {/* LEFT: Idratazione (gravidanza) / Poppate (nato) */}
                    <div className="smart-tracker-widget ru d6" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--aqua3), var(--aqua2))', borderRadius: '24px', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                {isBorn ? <Coffee size={20} color="var(--aqua)" /> : <Droplets size={20} color="var(--aqua)" />}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="trkr-btn trkr-btn--minus" onClick={isBorn ? handleRemoveFeeding : handleRemoveHydration}>
                                    <Minus size={16} />
                                </button>
                                <button className="trkr-btn trkr-btn--plus" onClick={isBorn ? handleAddFeeding : handleAddHydration}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--slate)', textTransform: 'uppercase' }}>{isBorn ? 'Poppate' : 'Idratazione'}</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--midnight)', margin: '4px 0' }}>
                            {isBorn ? (trackers?.feeding?.count || 0) : (hydration?.count || 0)}
                            <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--aqua)' }}>/{isBorn ? (trackers?.feeding?.target || 8) : (hydration?.target || 8)}</span>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>
                            {isBorn
                                ? `Ultima: ${trackers?.feeding?.last || '--'}`
                                : hydration?.count >= (hydration?.target || 8)
                                    ? '🎉 Obiettivo raggiunto!'
                                    : `Ancora ${(hydration?.target || 8) - (hydration?.count || 0)} bicchieri`}
                        </div>
                        <DotIndicator
                            current={isBorn ? (trackers?.feeding?.count || 0) : (hydration?.count || 0)}
                            total={isBorn ? (trackers?.feeding?.target || 8) : (hydration?.target || 8)}
                            color="var(--aqua)"
                        />
                    </div>

                    {/* RIGHT: Calcetti (sett. 18+) / Pannolini (nato) — nascosto nelle prime settimane */}
                    {(isBorn || weeks >= 18) && (
                        <div className="smart-tracker-widget ru d6" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--blush3), var(--blush2))', borderRadius: '24px', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                    {isBorn ? <Sparkles size={20} color="var(--color-error)" /> : <Heart size={20} color="var(--color-error)" />}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button className="trkr-btn trkr-btn--minus" onClick={isBorn ? handleRemoveDiaper : handleRemoveKick}>
                                        <Minus size={16} />
                                    </button>
                                    <button className="trkr-btn trkr-btn--plus" onClick={isBorn ? handleAddDiaper : handleAddKick}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-error)', textTransform: 'uppercase' }}>{isBorn ? 'Pannolini' : 'Calcetti'}</div>
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--midnight)', margin: '4px 0' }}>
                                {isBorn ? (trackers?.diapers?.count || 0) : (kicks?.count || 0)}
                                <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--blush)' }}>/{isBorn ? (trackers?.diapers?.target || 7) : (kicks?.target || 10)}</span>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-error)', marginBottom: '8px' }}>
                                {isBorn
                                    ? `Ultimo: ${trackers?.diapers?.last || '--'}`
                                    : kicks?.count === 0
                                        ? 'Nessun calcio ancora oggi'
                                        : kicks?.count < 5
                                            ? 'Tranquillo — continua a monitorare'
                                            : kicks?.count >= (kicks?.target || 10)
                                                ? '🎉 Obiettivo raggiunto!'
                                                : `${kicks?.count} calci registrati`}
                            </div>
                            <DotIndicator
                                current={isBorn ? (trackers?.diapers?.count || 0) : (kicks?.count || 0)}
                                total={isBorn ? (trackers?.diapers?.target || 7) : (kicks?.target || 10)}
                                color="var(--color-error)"
                            />
                        </div>
                    )}
                </div>

                {/* SLEEP TRACKER — solo per neonato */}
                {isBorn && (
                    <div className={`home-sleep-card ru d7 ${activeSleepTimer ? 'sleep-active' : ''}`}>
                        <div className="hsl-left">
                            <div className="hsl-icon-wrap">
                                <Moon size={20} strokeWidth={2} color={activeSleepTimer ? '#6B7FFF' : 'var(--midnight)'} />
                            </div>
                            <div className="hsl-info">
                                <div className="hsl-title">Nanna</div>
                                <div className="hsl-sub">{lastSleepSubtitle}</div>
                            </div>
                        </div>
                        <button className={`hsl-toggle-btn ${activeSleepTimer ? 'hsl-toggle--awake' : 'hsl-toggle--sleep'}`} onClick={handleToggleSleep}>
                            {activeSleepTimer ? '☀️ Svegliato' : '💤 Si addormenta'}
                        </button>
                    </div>
                )}

            </div>


            {/* CONSIGLI UTILI */}
            <div className="sec-head ru d6" style={{ marginTop: '24px' }}>
                <div className="sec-title">Consigli per te</div>
                <div className="sec-more" onClick={() => navigate('/tips-list')}>Vedi tutti</div>
            </div>
            <div className="consigli-row ru d6">
                {phaseArticles.map((tip) => {
                    const conf = getCategoryConfig(tip.category);
                    return (
                        <div
                            key={tip.id}
                            className="cons-card"
                            style={{ backgroundImage: `url('/${conf.cardBgImage}')` }}
                            onClick={() => setSelectedTip(tip)}
                        >
                            <div className="cons-layer" style={{ background: `linear-gradient(to top, ${conf.color}E6 0%, ${conf.color}66 50%, transparent 100%)` }}>
                                <div className="cons-cat" style={{ background: conf.bg, color: conf.color }}>{conf.name}</div>
                                <div className="cons-bottom">
                                    <div className="cons-ic-wrap" style={{ fontSize: '28px' }}>{conf.icon}</div>
                                    <div className="cons-title">{tip.title}</div>
                                    <div className="cons-dur">{tip.readingTime} di lettura</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SPACER FOR BOTTOM PADDING */}
            <div style={{ height: '40px' }}></div>

            <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
            <TipBottomSheet key={selectedTip?.id || 'none'} tip={selectedTip} onClose={() => setSelectedTip(null)} />
            <SosNotteModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
        </div>
    );
}
