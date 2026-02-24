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

            {/* HERO CARD — clean mesh */}
            <div className="bimbo-hero-wrap fi">
                <div className="bimbo-hero-card">
                    <div className="bimbo-hero-bg"></div>
                    <div className="bimbo-hero-grid"></div>

                    <div className="bimbo-hero-inner">
                        <div className="bhc-left">
                            <div className="bhc-eyebrow">Il nostro viaggio</div>
                            <div className="bhc-name">
                                {pregnancy.babyNickname} {pregnancy.sex === 'M' ? '♂️' : '♀️'}
                            </div>
                            <div className="bhc-week">Settimana {currentWeek} · {Math.ceil(currentWeek / 13)}° Trimestre</div>
                            <div className="bhc-fruit">{pregnancy.stats.sizeEmoji} Grande come {pregnancy.stats.sizeComparison.toLowerCase()}</div>
                        </div>
                        <div className="bhc-right">
                            <div className="bhc-num">
                                <div className="bhc-num-val">{currentWeek}</div>
                                <div className="bhc-num-lbl">Settimana</div>
                            </div>
                            <div className="bhc-emoji">{pregnancy.stats.sizeEmoji}</div>
                        </div>
                    </div>

                    <div className="bhc-stats">
                        <div className="bhc-stat">
                            <div className="bhc-stat-v">{pregnancy.stats.length}</div>
                            <div className="bhc-stat-l">Lunghezza</div>
                        </div>
                        <div className="bhc-stat">
                            <div className="bhc-stat-v">{pregnancy.stats.weight}</div>
                            <div className="bhc-stat-l">Peso</div>
                        </div>
                        <div className="bhc-stat">
                            <div className="bhc-stat-v">{percent}%</div>
                            <div className="bhc-stat-l">Percorso</div>
                        </div>
                    </div>

                    <div className="bhc-prg">
                        <div className="bhc-prg-track">
                            <div className="bhc-prg-fill" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="bhc-prg-txt">
                            <span>Inizio</span>
                            <span>{40 - currentWeek} sett. al parto</span>
                        </div>
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
