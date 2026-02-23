import { pregnancy, milestones } from '../data/mockData';
import ProgressBar from '../components/ProgressBar';
import './BabyDev.css';
import './Milestones.css';

export default function BabyDev() {
    const progress = Math.round((pregnancy.currentWeek / pregnancy.totalWeeks) * 100);

    return (
        <div className="page page-enter baby-page">
            <h1 className="page-title">Il tuo bambino</h1>
            <p className="page-subtitle">Settimana {pregnancy.currentWeek} di {pregnancy.totalWeeks}</p>

            {/* Fetus 3D Render */}
            <div className="baby-echo">
                <div className="baby-echo__container">
                    <div className="baby-echo__glow"></div>
                    <img src="/baby-24w-alpha.png" alt="Baby" className="baby-echo__image" />
                    <div className="baby-echo__pulse"></div>
                    <div className="baby-echo__pulse baby-echo__pulse--delayed"></div>
                </div>
                <p className="baby-echo__comparison">
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
            <ProgressBar weeks={pregnancy.currentWeek} totalWeeks={pregnancy.totalWeeks} />

            {/* Full Milestones Grid */}
            <h2 className="baby-section-title">Tappe del percorso</h2>
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
