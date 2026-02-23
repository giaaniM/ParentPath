import { milestones, pregnancy } from '../data/mockData';
import './Milestones.css';

export default function Milestones() {
    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / milestones.length) * 100);

    return (
        <div className="page page-enter">
            <header className="miles-header">
                <h1 className="miles-header__title">Tappe del percorso</h1>
                <p className="miles-header__subtitle">
                    Settimana {pregnancy.currentWeek} · {completedCount} di {milestones.length} raggiunte
                </p>
            </header>

            {/* Progress Overview */}
            <div className="miles-progress">
                <div className="miles-progress__circle">
                    <svg viewBox="0 0 120 120" className="miles-progress__svg">
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke="var(--color-bg-subtle)"
                            strokeWidth="8"
                        />
                        <circle
                            className="miles-progress__ring"
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke="url(#progressGrad)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                            transform="rotate(-90 60 60)"
                        />
                        <defs>
                            <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop stopColor="var(--color-primary)" />
                                <stop offset="1" stopColor="var(--color-accent-papa)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="miles-progress__label">
                        <span className="miles-progress__value">{progress}%</span>
                        <span className="miles-progress__text">completato</span>
                    </div>
                </div>
            </div>

            {/* Milestone Grid */}
            <div className="miles-grid">
                {milestones.map((milestone) => (
                    <div
                        key={milestone.id}
                        className={`miles-item ${milestone.completed ? 'miles-item--completed' : 'miles-item--upcoming'}`}
                    >
                        <div className="miles-item__icon-wrap">
                            <span className="miles-item__icon">{milestone.icon}</span>
                            {milestone.completed && (
                                <span className="miles-item__check">✓</span>
                            )}
                        </div>
                        <span className="miles-item__title">{milestone.title}</span>
                        <span className="miles-item__week">Sett. {milestone.week}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
