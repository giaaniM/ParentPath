import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { weeklyContent, pregnancy } from '../data/mockData';
import { useUser } from '../context/UserContext';
import {
    ChevronRight, Sparkles, Stethoscope, ShoppingBag, ClipboardCheck,
    Heart, CheckCircle2, Circle, Target, Lightbulb, Activity,
    SmilePlus, Smile, Meh, Frown, Coffee
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import DailyDiscovery from '../components/DailyDiscovery';
import DidYouKnow from '../components/DidYouKnow';
import './Home.css';

// Using lucide-react icons instead of emojis for a sleeker look
const MOODS = [
    { id: 'tired', icon: <Coffee strokeWidth={2.5} size={28} />, color: '#D4A95B', label: 'Stanca' },
    { id: 'good', icon: <Smile strokeWidth={2.5} size={28} />, color: '#3DAB96', label: 'Bene' },
    { id: 'great', icon: <SmilePlus strokeWidth={2.5} size={28} />, color: '#5B8FD4', label: 'Ottima' },
    { id: 'anxious', icon: <Meh strokeWidth={2.5} size={28} />, color: '#D4725B', label: 'Ansiosa' },
    { id: 'sick', icon: <Frown strokeWidth={2.5} size={28} />, color: '#9A9A9A', label: 'Nausea' },
];
const MOODS_PAPA = [
    { id: 'chill', icon: <Smile strokeWidth={2.5} size={28} />, color: '#5B8FD4', label: 'Sereno' },
    { id: 'good', icon: <SmilePlus strokeWidth={2.5} size={28} />, color: '#3DAB96', label: 'Bene' },
    { id: 'excited', icon: <Sparkles strokeWidth={2.5} size={28} />, color: '#D4A95B', label: 'Euforico' },
    { id: 'anxious', icon: <Meh strokeWidth={2.5} size={28} />, color: '#D4725B', label: 'Ansioso' },
    { id: 'tired', icon: <Coffee strokeWidth={2.5} size={28} />, color: '#9A9A9A', label: 'Stanco' },
];

const ICON_MAP = {
    'Sviluppo': <Sparkles size={22} />,
    'Da fare': <ClipboardCheck size={22} />,
    'Da avere': <ShoppingBag size={22} />,
    'Salute': <Stethoscope size={22} />,
    'Supporto': <Heart size={22} />,
    'Legame': <Sparkles size={22} />,
};

const getTrimester = (w) => {
    if (w <= 13) return 1;
    if (w <= 27) return 2;
    return 3;
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
    'Prendi l\'acido folico',
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
    'Pulisci e organizza la cameretta',
    'Prenota un\'attività rilassante per lei',
    'Fai un complimento sincero alla mamma',
    'Controlla la lista nascita',
    'Accompagnala a fare una passeggiata',
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

export default function Home() {
    const navigate = useNavigate();
    const { userName, isMamma, getWeeksPregnant } = useUser();
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodSaved, setMoodSaved] = useState(false);
    const scrollRef = useRef(null);

    // Interactive Checklist State
    const [checkedTasks, setCheckedTasks] = useState({
        task1: false,
        task2: false,
        task3: false,
    });

    const toggleTask = (taskId) => {
        setCheckedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const weeks = getWeeksPregnant();
    const tips = isMamma ? weeklyContent.mammaTips : weeklyContent.papaTips;
    const moods = isMamma ? MOODS : MOODS_PAPA;
    const dailyTasks = useMemo(() => getDailyTasks(isMamma), [isMamma]);

    const completedCount = Object.values(checkedTasks).filter(Boolean).length;

    useEffect(() => {
        if (scrollRef.current) {
            const activeEl = scrollRef.current.querySelector('.dash__week-circle--current');
            if (activeEl) {
                const scrollLeft = activeEl.offsetLeft - scrollRef.current.offsetWidth / 2 + activeEl.offsetWidth / 2;
                scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'instant' });
            }
        }
    }, [weeks]);

    const handleMood = (mood) => {
        setSelectedMood(mood);
        setTimeout(() => setMoodSaved(true), 400);
    };

    const handleShare = (text) => {
        console.log('Share with partner:', text);
    };

    return (
        <div className="page page-enter dash">

            {/* ── Blocco 1: Saluto + Mood Picker (Daily Ritual) ── */}
            <section className="dash__greeting-mood">
                <h2 className="dash__section-title dash__section-title--left">Ciao, {userName}!</h2>

                <div className="dash__mood">
                    {!moodSaved ? (
                        <>
                            <p className="dash__mood__label" style={{ marginTop: '0' }}>Come ti senti oggi?</p>
                            <div className="dash__mood__options">
                                {moods.map((m) => (
                                    <button
                                        key={m.id}
                                        className={`dash__mood__btn ${selectedMood?.id === m.id ? 'dash__mood__btn--selected' : ''}`}
                                        onClick={() => handleMood(m)}
                                    >
                                        <span className="dash__mood__emoji" style={{ color: selectedMood?.id === m.id ? 'var(--color-primary)' : m.color }}>
                                            {m.icon}
                                        </span>
                                        <span className="dash__mood__text">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="dash__mood__saved">
                            <span style={{ color: selectedMood.color }}>{selectedMood.icon}</span>
                            <p>Grazie! Salvato per oggi.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Blocco 2: Card Hero — Scoperta del Giorno ── */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <DailyDiscovery week={weeks} onShare={handleShare} />
            </div>

            {/* ── Blocco 3: Settimana + Baby View + Progress ── */}
            {/* Rimosso il task checklist da questa macro-card per unificarlo nei Consigli sotto */}
            <section className="dash__macro-card dash__macro-card--gradient-blue">
                <div className="dash__macro-header">
                    <div className="dash__macro-icon"><Activity size={20} /></div>
                    <h2 className="dash__macro-title">Settimana {weeks}</h2>
                </div>

                <div className="dash__baby-view" onClick={() => navigate('/baby')}>
                    <div className="dash__baby-view__visual">
                        <div className="dash__baby-view__blob"></div>
                        <img src="/baby-24w-alpha.png" alt="Feto" className="dash__baby-view__img" />
                    </div>

                    <div className="dash__baby-view__info">
                        <div className="dash__baby-view__header">
                            <h3 className="dash__baby-view__name">
                                {pregnancy.babyNickname}
                            </h3>
                            <span className="dash__baby-view__week">Sett {weeks} · {getTrimester(weeks)}° Trim</span>
                        </div>

                        <div className="dash__baby-view__comparison">
                            <span className="dash__baby-view__comparison-emoji" style={{ fontSize: '1.2rem' }}>{pregnancy.stats.sizeEmoji}</span>
                            <span>{pregnancy.stats.sizeComparison}</span>
                        </div>
                    </div>
                </div>

                <ProgressBar weeks={weeks} totalWeeks={40} />
            </section>

            {/* ── Blocco 4: Oggi per te (Consigli/Task Unificati + Card Curiosità) ── */}
            <section className="dash__macro-card dash__macro-card--gradient-green">
                <div className="dash__macro-header">
                    <div className="dash__macro-icon"><Target size={20} /></div>
                    <h2 className="dash__macro-title">Oggi per te</h2>
                </div>

                {/* Cosa fare questa settimana (Spostato qui e snellito) */}
                <div className="dash__checklist-section">
                    <div className="dash__checklist-header">
                        <h3 className="dash__section-title dash__section-title--left" style={{ fontSize: '1.05rem', marginBottom: 0 }}>Da fare: {completedCount}/{dailyTasks.length}</h3>
                    </div>
                    <div className="dash__checklist">
                        {dailyTasks.map(task => {
                            const isChecked = checkedTasks[task.id];
                            return (
                                <button
                                    key={task.id}
                                    className={`dash__checklist-item ${isChecked ? 'dash__checklist-item--checked' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                >
                                    {isChecked ? (
                                        <CheckCircle2 className="dash__checklist-icon dash__checklist-icon--checked" size={24} />
                                    ) : (
                                        <Circle className="dash__checklist-icon" size={24} />
                                    )}
                                    <span className="dash__checklist-text">{task.text}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Did You Know Carousel */}
                <div style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                    <DidYouKnow week={weeks} />
                </div>

                {/* Quiz Teaser (link, non inline) */}
                <div
                    className="dash__quiz-teaser"
                    onClick={() => navigate('/article')}
                >
                    <span className="dash__quiz-teaser__emoji">
                        <Lightbulb color="#D4A95B" size={24} strokeWidth={2.5} />
                    </span>
                    <div className="dash__quiz-teaser__body">
                        <span className="dash__quiz-teaser__title">Quiz della settimana {weeks}</span>
                        <span className="dash__quiz-teaser__subtitle">3 domande per metterti alla prova</span>
                    </div>
                    <ChevronRight size={18} className="dash__tip__arrow" />
                </div>
            </section>

            {/* ── Blocco 5: Consigli Generici (max 2, per profilo attivo) ── */}
            {tips.length > 0 && (
                <section className="dash__macro-card dash__macro-card--gradient-yellow">
                    <div className="dash__macro-header">
                        <div className="dash__macro-icon"><Heart size={20} /></div>
                        <h2 className="dash__macro-title">Articoli e Consigli</h2>
                    </div>

                    <div className="dash__tips">
                        {tips.slice(0, 2).map((tip) => (
                            <div
                                key={tip.id}
                                className="dash__tip"
                                onClick={() => navigate('/tip', { state: { tip } })}
                            >
                                <div className="dash__tip__icon" style={{ background: tip.bg, color: tip.color }}>
                                    {ICON_MAP[tip.category] || <Sparkles size={22} />}
                                </div>
                                <div className="dash__tip__body">
                                    <span className="dash__tip__label">{tip.category}</span>
                                    <p className="dash__tip__text">{tip.preview}</p>
                                </div>
                                <ChevronRight size={18} className="dash__tip__arrow" />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
