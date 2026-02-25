import { useState } from 'react';
import { Baby, Footprints, ChevronRight } from 'lucide-react';
import { pregnancy, milestones } from '../data/mockData';
import { useUser } from '../context/UserContext';
import './BabyDev.css';

export default function BabyDev() {
    const { getWeeksPregnant, getDueDate } = useUser();
    const currentWeek = getWeeksPregnant();
    const percent = Math.min(100, Math.round((currentWeek / pregnancy.totalWeeks) * 100));
    const dueDate = getDueDate();
    const dueDateStr = dueDate ? dueDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }) : null;

    // Hardcoded "Cosa succede" data based on V3 prototype for this week
    const weeklyEvents = [
        { id: 1, type: 'dev', icon: '🧠', label: 'Sviluppo', desc: 'Il cervello entra in fase REM, sogna!' },
        { id: 2, type: 'dev', icon: '👂', label: 'Sviluppo', desc: 'Sente la tua voce e reagisce ai suoni' },
        { id: 3, type: 'new', icon: '👁️', label: 'Novità', desc: 'Apre e chiude gli occhi — ci vede già!' },
    ];

    return (
        <div className="page baby-page">

            {/* HERO CARD V4 */}
            <div className="bd-hero fi">
                <div className="bd-eyebrow">IL NOSTRO VIAGGIO INSIEME</div>

                <div className="bd-circle">
                    <img src="/pregnant-fetus.webp" alt="Fetus" className="bd-fetus" style={{ animation: 'float 6s ease-in-out infinite' }} />
                </div>

                <div className="bd-name">
                    {pregnancy.babyNickname} <span>{pregnancy.sex === 'M' ? '♂' : '♀'}</span>
                </div>

                <div className="bd-sub">
                    Settimana {currentWeek} · {Math.ceil(currentWeek / 13)}° Trimestre · Gravidanza
                </div>

                <div className="bd-pill">
                    <span className="bd-pill-em">{pregnancy.stats.sizeEmoji}</span>
                    <span className="bd-pill-tx">Grande come {pregnancy.stats.sizeComparison.toLowerCase()}</span>
                </div>

                <div className="bd-stats-grid">
                    <div className="bd-stat-box">
                        <div className="bd-sv">{pregnancy.stats.length}</div>
                        <div className="bd-sl">LUNGHEZZA</div>
                    </div>
                    <div className="bd-stat-box">
                        <div className="bd-sv">{pregnancy.stats.weight}</div>
                        <div className="bd-sl">PESO</div>
                    </div>
                    <div className="bd-stat-box">
                        <div className="bd-sv">{percent}%</div>
                        <div className="bd-sl">PERCORSO</div>
                    </div>
                </div>

                <div className="bd-prog-card">
                    <div className="bd-prog-head">
                        <span>Inizio</span>
                        <span>Oggi</span>
                        <span>Sett. 40</span>
                    </div>
                    <div className="bd-slider-wrap">
                        <div className="bd-slider-bg"></div>
                        <div className="bd-slider-fill" style={{ width: `${percent}%` }}></div>
                        <div className="bd-slider-thumb" style={{ left: `${percent}%` }}>{currentWeek}</div>
                    </div>
                    <div className="bd-prog-footer">
                        Hai completato il <strong>{percent}%</strong>. Mancano <strong>{40 - currentWeek} settimane</strong>!
                    </div>
                </div>
            </div>

            {/* QUESTA SETTIMANA */}
            <div className="qsett ru d1">
                <div className="qsett-hd">
                    <div className="qsett-tt">🫀 Cosa succede questa settimana</div>
                    <div className="qsett-cta">Tutto ›</div>
                </div>
                {weeklyEvents.map(ev => (
                    <div key={ev.id} className="qsr">
                        <div className={`qsr-ic ${ev.type}`}>{ev.icon}</div>
                        <div className="qsr-t">
                            <div className="qsr-lb">{ev.label}</div>
                            <div className="qsr-d">{ev.desc}</div>
                        </div>
                        <div className="qsr-ar">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* MILESTONE */}
            <div className="mile-card ru d2">
                <div className="mile-tt">Tappe del percorso</div>
                <div className="mile-grid">
                    {milestones.map((milestone) => {
                        const isCurrent = milestone.week === currentWeek;
                        const isPast = milestone.week < currentWeek || milestone.completed;
                        const stateClass = isPast ? 'done' : isCurrent ? 'now' : 'lock';

                        return (
                            <div key={milestone.id} className={`mile ${stateClass}`}>
                                {isPast && <div className="mile-ck"></div>}
                                <div className="mile-ic">
                                    {/* Using string emoji if no icon prop, this is just a fallback for the new prototype look */}
                                    {milestone.icon || '👶'}
                                </div>
                                <div className="mile-lb">{milestone.title}</div>
                                <div className="mile-wk">
                                    Sett. {milestone.week} {isCurrent ? '←' : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* NEXT PHASES (LOCKED) */}
            <div className="nxph ru d3">
                <div className="nxph-ic">👶</div>
                <div className="nxph-t">
                    <div className="nxph-n">Primi Mesi (0–6)</div>
                    <div className="nxph-w">Disponibile {dueDateStr ? `da ${dueDateStr}` : 'dopo il parto'}</div>
                </div>
                <span>🔒</span>
            </div>

            <div className="nxph ru d4" style={{ marginBottom: 0 }}>
                <div className="nxph-ic">👣</div>
                <div className="nxph-t">
                    <div className="nxph-n">I Primi Passi (1–3 anni)</div>
                    <div className="nxph-w">Disponibile dopo il parto</div>
                </div>
                <span>🔒</span>
            </div>

        </div>
    );
}
