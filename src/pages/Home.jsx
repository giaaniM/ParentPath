import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { weeklyContent, pregnancy } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { ChevronRight, Sparkles, Stethoscope, ShoppingBag, ClipboardCheck, Heart, CheckCircle2, Circle } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
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
    'Da avere': <ShoppingBag size={22} />, // Renamed from "Shopping"
    'Salute': <Stethoscope size={22} />,
    'Supporto': <Heart size={22} />,
    'Legame': <Sparkles size={22} />,
};

const getTrimester = (w) => {
    if (w <= 13) return 1;
    if (w <= 27) return 2;
    return 3;
};

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

    // Daily tasks tailored to role
    const dailyTasks = isMamma ? [
        { id: 'task1', text: 'Prendi le vitamine prenatali' },
        { id: 'task2', text: "Bevi 2 litri d'acqua" },
        { id: 'task3', text: 'Fai 10 minuti di stretching' }
    ] : [
        { id: 'task1', text: 'Chiedi alla mamma come si sente' },
        { id: 'task2', text: "Organizza la borsa per l'ospedale" },
        { id: 'task3', text: 'Massaggio serale alla schiena' }
    ];

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

    return (
        <div className="page page-enter dash">

            {/* ── Header ── */}
            <header className="dash__header">
                <div className="dash__avatar">
                    {isMamma ? '🤰' : '👨'}
                </div>
                <p className="dash__greeting">Ciao, {userName || 'Sara'}</p>
            </header>

            {/* ── What to expect (Baby Section) ── */}
            <section className="dash__expect">
                <h2 className="dash__section-title dash__section-title--left">A che punto siamo</h2>

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

                {/* Baby Card - SUPER Enlarged */}
                <div className="dash__baby-card" onClick={() => navigate('/baby')}>
                    <div className="dash__baby-card__visual">
                        <div className="dash__baby-card__blob"></div>
                        <img src="/baby-24w-alpha.png" alt="Feto" className="dash__baby-card__img" />
                    </div>

                    <div className="dash__baby-card__info">
                        <div className="dash__baby-card__header">
                            <h3 className="dash__baby-card__name">
                                {pregnancy.babyNickname} {pregnancy.sex === 'M' ? '♂️' : '♀️'}
                            </h3>
                            <span className="dash__baby-card__week">Sett {weeks} - {getTrimester(weeks)}° Trim</span>
                        </div>

                        <div className="dash__baby-card__comparison">
                            <span className="dash__baby-card__comparison-emoji">{pregnancy.stats.sizeEmoji}</span>
                            <span>{pregnancy.stats.sizeComparison}</span>
                        </div>

                        <div className="dash__baby-card__stats">
                            <div className="dash__baby-card__stat">
                                <span className="dash__baby-card__stat-label">Lunghezza</span>
                                <span className="dash__baby-card__stat-value">{pregnancy.stats.length}</span>
                            </div>
                            <div className="dash__baby-card__stat">
                                <span className="dash__baby-card__stat-label">Peso</span>
                                <span className="dash__baby-card__stat-value">{pregnancy.stats.weight}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Progress Bar Component */}
                <ProgressBar weeks={weeks} totalWeeks={40} />

                {/* Weekly Info Block */}
                <div className="dash__weekly-info">
                    <h3 className="dash__weekly-info__title">Questa settimana</h3>
                    <p className="dash__weekly-info__text">
                        {weeklyContent.hero.subtitle}
                    </p>
                </div>
            </section>

            {/* ── Interactive Checklist: Cosa puoi fare ── */}
            <section className="dash__checklist-section">
                <h2 className="dash__section-title dash__section-title--left">Cosa puoi fare oggi</h2>
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
            </section>

            {/* ── Mood Check-in ── */}
            <section className="dash__mood">
                {!moodSaved ? (
                    <>
                        <p className="dash__mood__label">Come ti senti oggi?</p>
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
            </section>

            {/* ── Weekly Tips -> Renamed to Info per ... ── */}
            <h2 className="dash__section-title">Info per {isMamma ? 'la mamma' : 'il papà'}</h2>
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
                        <ChevronRight size={16} className="dash__tip__arrow" />
                    </div>
                ))}
            </div>
        </div>
    );
}
