import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { weeklyContent, pregnancy } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { ChevronRight, Sparkles, Stethoscope, ShoppingBag, ClipboardCheck, Heart, CheckCircle2, Circle, Target, Lightbulb, Activity } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import DailyDiscovery from '../components/DailyDiscovery';
import DidYouKnow from '../components/DidYouKnow';
import WeeklyQuiz from '../components/WeeklyQuiz';
import './Home.css';

const MOODS = [
    { emoji: '😴', label: 'Stanca' },
    { emoji: '😊', label: 'Bene' },
    { emoji: '🤩', label: 'Ottima' },
    { emoji: '😰', label: 'Ansiosa' },
    { emoji: '🤢', label: 'Nausea' },
];
const MOODS_PAPA = [
    { emoji: '😌', label: 'Sereno' },
    { emoji: '😊', label: 'Bene' },
    { emoji: '🤩', label: 'Euforico' },
    { emoji: '😰', label: 'Ansioso' },
    { emoji: '😴', label: 'Stanco' },
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
// Rotates tasks based on the day of the year so checklist feels fresh daily
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

    // Count completed
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
            {/* ── ✨ Daily Discovery Card ── */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <DailyDiscovery week={weeks} onShare={handleShare} />
            </div>

            {/* ── Baby Section ── */}
            <section className="dash__expect">
                <h2 className="dash__section-title dash__section-title--left">Ciao, {userName}!</h2>

                {/* Week Selector */}
                <div className="dash__week-selector" ref={scrollRef}>
                    {Array.from({ length: 42 }, (_, i) => i + 1).map((w) => {
                        let stateClass = 'dash__week-circle--future';
                        if (w < weeks) stateClass = 'dash__week-circle--past';
                        if (w === weeks) stateClass = 'dash__week-circle--current';
                        return (
                            <div key={w} className={`dash__week-circle ${stateClass}`}>
                                {w}
                            </div>
                        );
                    })}
                </div>

                {/* Vertical Baby View (Image top, text bottom) */}
                <div className="dash__baby-view" onClick={() => navigate('/baby')}>
                    <div className="dash__baby-view__visual">
                        <div className="dash__baby-view__blob"></div>
                        <img src="/baby-24w-alpha.png" alt="Feto" className="dash__baby-view__img" />
                    </div>

                    <div className="dash__baby-view__info">
                        <div className="dash__baby-view__header">
                            <h3 className="dash__baby-view__name">
                                {pregnancy.babyNickname} {pregnancy.sex === 'M' ? '♂️' : '♀️'}
                            </h3>
                            <span className="dash__baby-view__week">Sett {weeks} · {getTrimester(weeks)}° Trim</span>
                        </div>

                        <div className="dash__baby-view__comparison">
                            <span className="dash__baby-view__comparison-emoji">{pregnancy.stats.sizeEmoji}</span>
                            <span>{pregnancy.stats.sizeComparison}</span>
                        </div>

                        <div className="dash__baby-view__stats">
                            <div className="dash__baby-view__stat">
                                <span className="dash__baby-view__stat-label">Lunghezza</span>
                                <span className="dash__baby-view__stat-value">{pregnancy.stats.length}</span>
                            </div>
                            <div className="dash__baby-view__stat">
                                <span className="dash__baby-view__stat-label">Peso</span>
                                <span className="dash__baby-view__stat-value">{pregnancy.stats.weight}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <ProgressBar weeks={weeks} totalWeeks={40} />
            </section>

            {/* ── Macro Card 2: Oggi per te (Quiz, Facts & Mood) ── */}
            <section className="dash__macro-card dash__macro-card--gradient-green">
                <div className="dash__macro-header">
                    <div className="dash__macro-icon"><Target size={24} /></div>
                    <h2 className="dash__macro-title">Oggi per te</h2>
                </div>

                {/* Did You Know Carousel */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <DidYouKnow week={weeks} />
                </div>

                {/* Weekly Quiz */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 className="dash__section-title dash__section-title--left" style={{ fontSize: '1.1rem', marginTop: 'var(--space-md)' }}>Mettiti alla prova</h3>
                    <WeeklyQuiz week={weeks} />
                </div>

                {/* Mood Check-in */}
                <div className="dash__mood">
                    {!moodSaved ? (
                        <>
                            <p className="dash__mood__label" style={{ marginTop: '0' }}>Come ti senti oggi?</p>
                            <div className="dash__mood__options">
                                {moods.map((m) => (
                                    <button
                                        key={m.label}
                                        className={`dash__mood__btn ${selectedMood?.label === m.label ? 'dash__mood__btn--selected' : ''}`}
                                        onClick={() => handleMood(m)}
                                    >
                                        <span className="dash__mood__emoji">{m.emoji}</span>
                                        <span className="dash__mood__text">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="dash__mood__saved">
                            <span>{selectedMood.emoji}</span>
                            <p>Grazie! Salvato per oggi.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Macro Card 3: Cosa puoi fare (Checklist & Tips) ── */}
            <section className="dash__macro-card dash__macro-card--gradient-yellow">
                <div className="dash__macro-header">
                    <div className="dash__macro-icon"><Lightbulb size={24} /></div>
                    <h2 className="dash__macro-title">Cosa puoi fare</h2>
                </div>

                {/* Daily Checklist */}
                <div className="dash__checklist-section">
                    <div className="dash__checklist-header">
                        <h3 className="dash__section-title dash__section-title--left" style={{ fontSize: '1.1rem', marginBottom: 0 }}>Da fare: {completedCount}/{dailyTasks.length}</h3>
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
                                        <CheckCircle2 className="dash__checklist-icon dash__checklist-icon--checked" size={26} />
                                    ) : (
                                        <Circle className="dash__checklist-icon" size={26} />
                                    )}
                                    <span className="dash__checklist-text">{task.text}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>


                {/* Info Tips */}
                <div className="dash__tips-section">
                    <h3 className="dash__section-title dash__section-title--left" style={{ fontSize: '1.1rem' }}>Consigli per {isMamma ? 'la mamma' : 'il papà'}</h3>
                    <div className="dash__tips">
                        {tips.map((tip) => (
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
                </div>
            </section>
        </div>
    );
}
