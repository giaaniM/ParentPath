import './ProgressBar.css';

export default function ProgressBar({ weeks, totalWeeks = 40 }) {
    const progress = Math.round((weeks / totalWeeks) * 100);
    const weeksRemaining = Math.max(0, totalWeeks - weeks);

    return (
        <div className="progress-tracker">
            <div className="progress-tracker__labels">
                <span className="progress-tracker__label">Inizio</span>
                <span className="progress-tracker__label progress-tracker__label--current">Oggi</span>
                <span className="progress-tracker__label">Sett {totalWeeks}</span>
            </div>
            <div className="progress-tracker__bar-bg">
                <div className="progress-tracker__bar-fill" style={{ width: `${progress}%` }}>
                    <div className="progress-tracker__thumb">
                        <span>{weeks}w</span>
                    </div>
                </div>
            </div>
            <p className="progress-tracker__desc">
                Hai completato il <strong>{progress}%</strong> del percorso. Mancano {weeksRemaining} settimane!
            </p>
        </div>
    );
}
