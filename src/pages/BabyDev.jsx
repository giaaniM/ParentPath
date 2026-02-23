import { useState } from 'react';
import { ChevronDown, Lock, Baby, Footprints } from 'lucide-react';
import { pregnancy, milestones, weeklyContent } from '../data/mockData';
import { useUser } from '../context/UserContext';
import ProgressBar from '../components/ProgressBar';
import './BabyDev.css';
import './Milestones.css';

export default function BabyDev() {
    const { getWeeksPregnant, getDueDate } = useUser();
    const currentWeek = getWeeksPregnant();
    const progress = Math.round((currentWeek / pregnancy.totalWeeks) * 100);
    const [weeklyOpen, setWeeklyOpen] = useState(false);
    const dueDate = getDueDate();
    const dueDateStr = dueDate ? dueDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : null;

    return (
        <div className="page page-enter baby-page">

            <h2 className="baby-section-title baby-section-title--macro">Il nostro viaggio insieme</h2>

            <div className="baby-phases">
                {/* ── Active Phase: Gravidanza ── */}
                <div className="baby-phase-card baby-phase-card--active">

                    {/* Phase Header */}
                    <div className="baby-phase-header">
                        <div className="baby-phase-icon">🤰</div>
                        <div className="baby-phase-title">
                            <h3>Gravidanza</h3>
                            <span className="baby-phase-status">Fase attuale</span>
                        </div>
                    </div>

                    {/* Phase Content (The actual BabyDev content) */}
                    <div className="baby-phase-body">
                        {/* Hero: Baby Visual */}
                        <div className="baby-hero">
                            <div className="baby-hero__visual">
                                <div className="baby-hero__blob"></div>
                                <img src="/baby-24w-alpha.png" alt="Baby" className="baby-hero__img" />
                                <div className="baby-hero__pulse"></div>
                                <div className="baby-hero__pulse baby-hero__pulse--delayed"></div>
                            </div>

                            <h1 className="baby-hero__name">
                                {pregnancy.babyNickname} {pregnancy.sex === 'M' ? '♂️' : '♀️'}
                            </h1>
                            <p className="baby-hero__week">
                                Settimana {currentWeek} di {pregnancy.totalWeeks}
                            </p>
                            <p className="baby-hero__comparison">
                                {pregnancy.stats.sizeEmoji} {pregnancy.stats.sizeComparison}
                            </p>
                        </div>

                        {/* Stats Row */}
                        <div className="baby-stats-row">
                            <div className="baby-stat-box">
                                <span className="baby-stat-box__value">{pregnancy.stats.length}</span>
                                <span className="baby-stat-box__label">Lunghezza</span>
                            </div>
                            <div className="baby-stat-box">
                                <span className="baby-stat-box__value">{pregnancy.stats.weight}</span>
                                <span className="baby-stat-box__label">Peso</span>
                            </div>
                            <div className="baby-stat-box">
                                <span className="baby-stat-box__value">{progress}%</span>
                                <span className="baby-stat-box__label">Progresso</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <ProgressBar weeks={currentWeek} totalWeeks={pregnancy.totalWeeks} />

                        {/* Collapsible Weekly Info Block */}
                        <button
                            className={`baby__weekly-toggle ${weeklyOpen ? 'baby__weekly-toggle--open' : ''}`}
                            onClick={() => setWeeklyOpen(!weeklyOpen)}
                        >
                            <span className="baby__weekly-toggle__label">📖 Questa settimana ({currentWeek})</span>
                            <ChevronDown
                                size={20}
                                className={`baby__weekly-toggle__icon ${weeklyOpen ? 'baby__weekly-toggle__icon--open' : ''}`}
                            />
                        </button>
                        <div className={`baby__weekly-info ${weeklyOpen ? 'baby__weekly-info--open' : ''}`}>
                            <p className="baby__weekly-info__text">
                                {weeklyContent.hero.subtitle}
                            </p>
                        </div>

                        {/* Milestones */}
                        <h2 className="baby-section-title">Tappe del percorso</h2>
                        <div className="miles-grid">
                            {milestones.map((milestone) => {
                                const isCurrent = milestone.week === currentWeek;
                                const isPast = milestone.completed;
                                const stateClass = isPast ? 'miles-item--completed' : isCurrent ? 'miles-item--current' : 'miles-item--upcoming';
                                return (
                                    <div
                                        key={milestone.id}
                                        className={`miles-item ${stateClass}`}
                                    >
                                        <div className="miles-item__icon-wrap">
                                            <span className="miles-item__icon">{milestone.icon}</span>
                                            {isPast && (
                                                <span className="miles-item__check">✓</span>
                                            )}
                                        </div>
                                        <span className="miles-item__title">{milestone.title}</span>
                                        <span className="miles-item__week">Sett. {milestone.week}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Future Phase: Primi Mesi ── */}
                <div className="baby-phase-card baby-phase-card--locked">
                    <div className="baby-phase-header">
                        <div className="baby-phase-icon"><Baby size={28} /></div>
                        <div className="baby-phase-title">
                            <h3>Primi Mesi (0-6)</h3>
                            <span className="baby-phase-status"><Lock size={12} /> {dueDateStr ? `Disponibile da ${dueDateStr}` : 'Disponibile dopo il parto'}</span>
                        </div>
                    </div>
                </div>

                {/* ── Future Phase: Primi Passi ── */}
                <div className="baby-phase-card baby-phase-card--locked">
                    <div className="baby-phase-header">
                        <div className="baby-phase-icon"><Footprints size={28} /></div>
                        <div className="baby-phase-title">
                            <h3>I Primi Passi (1-3 anni)</h3>
                            <span className="baby-phase-status"><Lock size={12} /> Disponibile dopo il parto</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
