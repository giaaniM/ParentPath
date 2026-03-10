import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { weeklyContent, pregnancy, getWeekData } from '../data/mockData';
import {
    Sparkles, Stethoscope, ShoppingBag, ClipboardCheck,
    Heart, SmilePlus, Smile, Meh, Frown, Coffee, ArrowRight, Edit2
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import EditProfileModal from '../components/EditProfileModal';
import TipBottomSheet from '../components/TipBottomSheet';
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

const ICON_MAP = {
    'Sviluppo': <Sparkles size={28} strokeWidth={1.5} />,
    'Da fare': <ClipboardCheck size={28} strokeWidth={1.5} />,
    'Da avere': <ShoppingBag size={28} strokeWidth={1.5} />,
    'Salute': <Stethoscope size={28} strokeWidth={1.5} />,
    'Supporto': <Heart size={28} strokeWidth={1.5} />,
    'Legame': <Sparkles size={28} strokeWidth={1.5} />,
};

// ── Dynamic Daily Tasks ──
const MAMMA_TASK_POOL = [
    'Prendi le vitamine prenatali',
    "Bevi 2 litri d'acqua",
    'Fai 10 minuti di stretching',
    'Mangia una porzione di frutta',
    'Fai una passeggiata di 15 minuti',
    'Scrivi un pensiero nel diario',
    "Fai esercizi di Kegel (5 min)",
    'Riposati 20 minuti nel pomeriggio',
    'Bevi una tisana senza caffeina',
    'Misura la pressione',
    'Parla col bambino per 5 minuti',
];
const PAPA_TASK_POOL = [
    'Chiedi alla mamma come si sente',
    "Organizza la borsa per l'ospedale",
    'Massaggio serale alla schiena',
    'Prepara la cena stasera',
    'Leggi un articolo sulla paternità',
    'Parla col bambino appoggiandoti alla pancia',
    'Vai a fare la spesa',
    'Prenota un\'attività rilassante per lei',
    'Fai un complimento sincero alla mamma',
    'Controlla la lista nascita',
];

function getDailyTasks(isMamma) {
    const pool = isMamma ? MAMMA_TASK_POOL : PAPA_TASK_POOL;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const startIdx = (dayOfYear * 3) % pool.length;
    return [
        { id: 'task1', text: pool[startIdx % pool.length] },
        { id: 'task2', text: pool[(startIdx + 1) % pool.length] },
        { id: 'task3', text: pool[(startIdx + 2) % pool.length] },
    ];
}

// Used to make sure we only trigger the welcome push once per session
let hasTriggeredWelcomePush = false;

export default function Home() {
    const navigate = useNavigate();
    const { babyStatus, getWeeksPregnant, getBabyAgeMonths, getBabyPreciseAgeString, userName, ruolom } = useUser();
    const isMamma = ruolom?.toLowerCase().includes('mamma');
    const weeks = getWeeksPregnant();
    const months = getBabyAgeMonths();

    const [selectedMood, setSelectedMood] = useState(null);
    const [moodSaved, setMoodSaved] = useState(false);
    const [hideDiscovery, setHideDiscovery] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSosOpen, setIsSosOpen] = useState(false);
    const [selectedTip, setSelectedTip] = useState(null);

    // Interactive Checklist State
    const [checkedTasks, setCheckedTasks] = useState({
        task1: false, task2: false, task3: false,
    });

    // Simulate opening from a push or registering a push
    const scheduleWelcomePush = async () => {
        if (hasTriggeredWelcomePush) return;
        hasTriggeredWelcomePush = true;

        try {
            // Request permissions first (required on iOS and Android 13+)
            const permStatus = await LocalNotifications.requestPermissions();
            if (permStatus.display === 'granted') {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Ciao " + userName + "! 👋",
                            body: "Il tuo bimbo ti aspetta. Entra per vedere com'è cresciuto! 👶",
                            id: 1,
                            schedule: { at: new Date(Date.now() + 4000) }, // Fire in 4 seconds
                            sound: null,
                            attachments: null,
                            actionTypeId: "",
                            extra: null
                        }
                    ]
                });
            }
        } catch (e) {
            console.log("Not running in a native context or push failed", e);
        }
    };

    // Request permissions on mount and handle initial welcome push logic
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

    const toggleTask = async (taskId) => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        setCheckedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handleMood = async (mood) => {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
        setSelectedMood(mood);
        setTimeout(() => setMoodSaved(true), 800);
    };

    const tips = isMamma ? weeklyContent.mammaTips : weeklyContent.papaTips;
    const moods = isMamma ? MOODS : MOODS_PAPA;
    const dailyTasks = useMemo(() => getDailyTasks(isMamma), [isMamma]);

    const completedCount = Object.values(checkedTasks).filter(Boolean).length;
    const percent = Math.min(100, Math.round((weeks / 40) * 100));

    return (
        <div className="page home-wrap">

            {/* GREETING */}
            <div className="greeting fi">Ciao {userName}! 👋</div>





            {/* SCOPERTA DEL GIORNO (MODAL) */}
            {!hideDiscovery && (
                <div className="disc-modal-overlay">
                    <div className="disc-modal-card po">
                        <div className="disc-modal-ic">✨</div>
                        <h3 className="disc-modal-title">Scoperta del giorno</h3>
                        <p className="disc-modal-text">
                            {babyStatus === 'nato'
                                ? "Goditi i primi momenti post-parto, la mamma ha bisogno di riposo e comprensione."
                                : (!isMamma ? getWeekData(weeks).papaTip : getWeekData(weeks).mamaTip)
                            }
                        </p>
                        <button className="disc-modal-btn" onClick={() => setHideDiscovery(true)}>
                            Ho capito ✓
                        </button>
                    </div>
                </div>
            )}

            {/* HERO CARD GRAVIDANZA OR PRIMI MESI */}
            {babyStatus !== 'nato' ? (
                <div className="hc ru d4" onClick={() => navigate('/baby')}>
                    <button
                        className="hc-edit"
                        onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                        aria-label="Modifica Profilo"
                    >
                        <Edit2 size={18} />
                    </button>
                    <div className="hc-mesh"></div>
                    <div className="hc-grid"></div>

                    <div className="hc-arr"><ArrowRight size={24} strokeWidth={1.5} /></div>
                    <div className="hc-eyebrow">Settimana {weeks}</div>
                    <div className="hc-title" style={{ fontSize: '28px', color: 'var(--midnight)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        {pregnancy?.babyNickname} <span style={{ fontSize: '22px' }}>{pregnancy?.sex === 'M' ? '♂' : '♀'}</span>
                    </div>
                    <div className="hc-prg"><div className="hc-prg-fill" style={{ width: `${percent}%` }}></div></div>
                    <div className="hc-prg-lb">{percent}% del percorso</div>

                    <img src="/baby-24w-alpha.png" alt="Baby" className="hc-img" style={{ animation: 'float 6s ease-in-out infinite' }} />

                    <div className="hc-badge">
                        <span>{getWeekData(weeks).sizeEmoji}</span> Grande come {getWeekData(weeks).sizeLabel?.toLowerCase() || pregnancy.stats.sizeComparison.toLowerCase()}
                    </div>
                </div>
            ) : (
                <div className={`hc ru d4 ${pregnancy?.sex === 'M' ? 'hc--boy' : 'hc--girl'}`} onClick={() => navigate('/baby')} style={{ overflow: 'hidden' }}>
                    <button
                        className="hc-edit"
                        onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                        aria-label="Modifica Profilo"
                    >
                        <Edit2 size={18} />
                    </button>
                    <div className="hc-mesh"></div>
                    <div className="hc-grid" style={{ opacity: 0.3 }}></div>
                    <div className="hc-arr"><ArrowRight size={24} strokeWidth={1.5} /></div>

                    <div className="hc-eyebrow" style={{ color: 'var(--stone)', letterSpacing: '1px' }}>Età: {getBabyPreciseAgeString()}</div>
                    <div className="hc-title" style={{ fontSize: '28px', color: pregnancy?.sex === 'M' ? '#4A90E2' : 'var(--midnight)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        {pregnancy?.babyNickname || 'Il tuo Bimbo'} <span>{pregnancy?.sex === 'M' ? '♂' : '♀'}</span>
                    </div>

                    <div className="hc-prg">
                        <div className="hc-prg-fill" style={{ width: `${Math.min(100, (months / 12) * 100)}%`, background: pregnancy?.sex === 'M' ? '#4A90E2' : '#D65D3C' }}></div>
                    </div>
                    <div className="hc-prg-lb">{months} / 12 mesi completati</div>

                    <div style={{ position: 'absolute', bottom: '-4px', right: '12px', fontSize: '90px', transform: 'rotate(-5deg)', animation: 'float 6s ease-in-out infinite' }}>👶</div>

                    <div className="hc-badge" style={{ marginTop: '20px' }}>
                        <span>🎉</span> I Primi Mesi
                    </div>
                </div>
            )}

            {/* SOS NOTTE BANNER (Primi Mesi solo) */}
            {babyStatus === 'nato' && (
                <div className="sos-home-banner ru d5" onClick={() => setIsSosOpen(true)}>
                    <div className="sos-hb-icon"><Moon size={24} strokeWidth={2} /></div>
                    <div className="sos-hb-text">
                        <div className="sos-hb-title">SOS Notte</div>
                        <div className="sos-hb-sub">Rumori bianchi e coliche</div>
                    </div>
                    <div className="sos-hb-go">Apri</div>
                </div>
            )}

            {/* DA FARE QUESTA SETTIMANA */}
            <div className={`tw ru d${babyStatus === 'nato' ? '6' : '5'}`}>
                <div className="tw-head">
                    <div className="tw-tit">Da fare questa settimana</div>
                    <div className="tw-bdg">{completedCount} / {dailyTasks.length}</div>
                </div>

                {dailyTasks.map(task => {
                    const isChecked = checkedTasks[task.id];
                    return (
                        <div
                            key={task.id}
                            className={`t-row ${isChecked ? 'done' : ''}`}
                            onClick={() => toggleTask(task.id)}
                        >
                            <div className="t-chk"></div>
                            <div className="t-txt">{task.text}</div>
                        </div>
                    );
                })}
            </div>

            {/* CONSIGLI UNIFICATI (FEED) */}
            {tips.length > 0 && (
                <>
                    <div className="sec-head ru d6">
                        <div className="sec-title">Articoli e Strumenti per te</div>
                        <div className="sec-more" onClick={() => navigate('/tips-list')}>Vedi tutti</div>
                    </div>
                    <div className="consigli-row ru d6">
                        {tips.map((tip, index) => {
                            const conf = getCategoryConfig(tip.category);

                            return (
                                <div
                                    key={tip.id}
                                    className="cons-card"
                                    style={{ backgroundImage: `url('/${conf.cardBgImage}')` }}
                                    onClick={() => setSelectedTip(tip)}
                                >
                                    <div className="cons-layer" style={{ background: `linear-gradient(to top, ${conf.color}E6 0%, ${conf.color}66 50%, transparent 100%)` }}>
                                        <div className="cons-cat" style={{ background: conf.bg, color: conf.color }}>{tip.category}</div>

                                        <div className="cons-bottom">
                                            <div className="cons-ic-wrap" style={{ fontSize: '28px' }}>{conf.icon}</div>
                                            <div className="cons-title">{tip.preview}</div>
                                            <div className="cons-dur">{index === 0 ? '3 esami in sospeso' : '4 min di lettura'}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* QUIZ BANNER */}
            <div style={{ paddingBottom: '10px' }} className="ru d8">
                <div className="sec-head">
                    <div className="sec-title">Mettiti alla prova</div>
                </div>
                <div className="qb" onClick={() => navigate('/article')}>
                    <div className="qb-ic"><Brain size={32} strokeWidth={1.5} color="var(--midnight)" /></div>
                    <div className="qb-t">
                        <div className="qb-title">Quiz settimana {weeks}</div>
                        <div className="qb-sub">3 domande · 2 minuti</div>
                    </div>
                    <div className="qb-badge">Inizia →</div>
                </div>
            </div>

            <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
            <TipBottomSheet tip={selectedTip} onClose={() => setSelectedTip(null)} />
            <SosNotteModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
        </div>
    );
}
