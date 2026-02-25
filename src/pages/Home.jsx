import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { weeklyContent, pregnancy, getWeekData } from '../data/mockData';
import { useUser } from '../context/UserContext';
import {
    Sparkles, Stethoscope, ShoppingBag, ClipboardCheck,
    Heart, SmilePlus, Smile, Meh, Frown, Coffee, ArrowRight
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapacitorApp } from '@capacitor/app';
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
    const { userName, isMamma, getWeeksPregnant } = useUser();
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodSaved, setMoodSaved] = useState(false);
    const [hideDiscovery, setHideDiscovery] = useState(false);

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

    // Trigger on background
    useMemo(() => {
        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive) {
                scheduleWelcomePush();
            }
        });
    }, []);

    const toggleTask = async (taskId) => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        setCheckedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handleMood = async (mood) => {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
        setSelectedMood(mood);
        setTimeout(() => setMoodSaved(true), 800);
    };

    const weeks = getWeeksPregnant();
    const tips = isMamma ? weeklyContent.mammaTips : weeklyContent.papaTips;
    const moods = isMamma ? MOODS : MOODS_PAPA;
    const dailyTasks = useMemo(() => getDailyTasks(isMamma), [isMamma]);

    const completedCount = Object.values(checkedTasks).filter(Boolean).length;
    const percent = Math.min(100, Math.round((weeks / 40) * 100));

    return (
        <div className="page home-wrap">

            {/* GREETING */}
            <div className="greeting fi">Ciao {userName}! 👋</div>

            {/* MOOD STRIP */}
            {!moodSaved ? (
                <>
                    <div className="mood-lbl ru d1">Come ti senti oggi?</div>
                    <div className="mood-strip ru d2">
                        {moods.map(m => (
                            <div
                                key={m.id}
                                className={`md ${selectedMood?.id === m.id ? 'on' : ''}`}
                                onClick={() => handleMood(m)}
                            >
                                <div className="md-emoji-wrap">{m.icon}</div>
                                <div className="md-lb">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="mood-saved-badge po">
                    <div className="ms-ic">{selectedMood?.icon}</div>
                    <div className="ms-t">
                        <div className="ms-tt">L'hai registrato!</div>
                        <div className="ms-ss">Il tuo mood: {selectedMood?.label}</div>
                    </div>
                    <div className="ms-ar" onClick={() => { setMoodSaved(false); setSelectedMood(null); }}>Cambia</div>
                </div>
            )}

            {/* SCOPERTA DEL GIORNO */}
            <div className={`disc-strip ru d3 ${hideDiscovery ? 'gone' : ''}`}>
                <div className="disc-ic">✨</div>
                <div className="disc-t">
                    <div className="disc-t-h">Scoperta del giorno</div>
                    <div className="disc-t-s">
                        {!isMamma
                            ? getWeekData(weeks).papaTip
                            : getWeekData(weeks).mamaTip
                        }
                    </div>
                </div>
                <div className="disc-x" onClick={() => setHideDiscovery(true)}>✕</div>
            </div>

            {/* HERO CARD */}
            <div className="hc ru d4" onClick={() => navigate('/baby')}>
                <div className="hc-mesh"></div>
                <div className="hc-grid"></div>

                <div className="hc-arr"><ArrowRight size={24} strokeWidth={1.5} /></div>
                <div className="hc-eyebrow">Settimana {weeks}</div>
                <div className="hc-title">{getWeekData(weeks).heroTitle}</div>
                <div className="hc-prg"><div className="hc-prg-fill" style={{ width: `${percent}%` }}></div></div>
                <div className="hc-prg-lb">{percent}% del percorso</div>

                <img src="/baby-24w-alpha.png" alt="Baby" className="hc-img" style={{ animation: 'float 6s ease-in-out infinite' }} />

                <div className="hc-badge">
                    <span>{getWeekData(weeks).sizeEmoji}</span> Grande come {getWeekData(weeks).sizeLabel?.toLowerCase() || pregnancy.stats.sizeComparison.toLowerCase()}
                </div>
            </div>

            {/* DA FARE QUESTA SETTIMANA */}
            <div className="tw ru d5">
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

            {/* OGGI PER TE */}
            <div className="sec-head ru d6">
                <div className="sec-title">Oggi per te</div>
            </div>
            <div className="oggi-row ru d6">
                <div className="og-card blue">
                    <div className="og-ic-wrap"><Stethoscope size={28} strokeWidth={2} /></div>
                    <div className="og-tit">Salute</div>
                    <div className="og-sub">Misura la pressione</div>
                </div>
                <div className="og-card blush">
                    <div className="og-ic-wrap"><Smile size={28} strokeWidth={2} /></div>
                    <div className="og-tit">Relax</div>
                    <div className="og-sub">5 min di meditazione</div>
                </div>
                <div className="og-card sage">
                    <div className="og-ic-wrap"><ShoppingBag size={28} strokeWidth={2} /></div>
                    <div className="og-tit">Acquisti</div>
                    <div className="og-sub">Checklist borsa parto</div>
                </div>
            </div>

            {/* CONSIGLI */}
            {tips.length > 0 && (
                <>
                    <div className="sec-head ru d7">
                        <div className="sec-title">Consigli per te</div>
                        <div className="sec-more">Vedi tutti</div>
                    </div>
                    <div className="consigli-row ru d7">
                        {tips.map((tip, index) => (
                            <div key={tip.id} className="cons-card" onClick={() => navigate('/tip', { state: { tip } })}>
                                <div className="cons-cat">{tip.category}</div>
                                <div className="cons-ic-wrap">{ICON_MAP[tip.category] || <Sparkles size={28} strokeWidth={1.5} />}</div>
                                <div className="cons-title">{tip.preview}</div>
                                <div className="cons-dur">{index === 0 ? '3 esami in sospeso' : '4 min di lettura'}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* QUIZ BANNER */}
            <div style={{ paddingBottom: '10px' }} className="ru d8">
                <div className="sec-head">
                    <div className="sec-title">Mettiti alla prova</div>
                </div>
                <div className="qb" onClick={() => navigate('/article')}>
                    <div className="qb-ic">🧠</div>
                    <div className="qb-t">
                        <div className="qb-title">Quiz settimana {weeks}</div>
                        <div className="qb-sub">3 domande · 2 minuti</div>
                    </div>
                    <div className="qb-badge">Inizia →</div>
                </div>
            </div>

        </div>
    );
}
