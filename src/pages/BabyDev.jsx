import { useState } from 'react';
import { Baby, Footprints, ChevronRight, Sparkles, X } from 'lucide-react';
import { pregnancy, milestones, getWeekData } from '../data/mockData';
import { useUser } from '../context/UserContext';
import EarlyYears from '../components/EarlyYears';
import './BabyDev.css';

export default function BabyDev() {
    const { getWeeksPregnant, getDueDate, babyStatus, setBabyStatus } = useUser();
    const currentWeek = getWeeksPregnant();
    const percent = Math.min(100, Math.round((currentWeek / pregnancy.totalWeeks) * 100));
    const dueDate = getDueDate();
    const dueDateStr = dueDate ? dueDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }) : null;

    // Dynamic weekly events from dataset
    const weekData = getWeekData(currentWeek);
    const weeklyEvents = (weekData.events || []).map((desc, i) => ({
        id: i + 1,
        type: i === 0 ? 'dev' : i === 1 ? 'dev' : 'new',
        icon: i === 0 ? '🧠' : i === 1 ? '👂' : '👁️',
        label: i < 2 ? 'Sviluppo' : 'Novità',
        desc,
    }));

    const isNato = babyStatus === 'nato';
    const [showBornModal, setShowBornModal] = useState(false);

    const toggleBabyStatus = () => {
        if (!isNato) {
            setBabyStatus('nato');
            setShowBornModal(true);
        } else {
            setBabyStatus('gravidanza');
        }
    };

    return (
        <div className="page baby-page">

            {/* BORN TOGGLE / MINI-CARD AT TOP */}
            {isNato ? (
                <div className="bd-pregnancy-mini-card" onClick={toggleBabyStatus}>
                    <div className="mini-card-icon">🤰</div>
                    <div className="mini-card-text">
                        <div className="mini-card-title">Il tuo viaggio in gravidanza</div>
                        <div className="mini-card-sub">Clicca per riaprire e rivedere i ricordi</div>
                    </div>
                    <ChevronRight size={20} color="var(--stone)" />
                </div>
            ) : (
                <div className="bd-status-toggle" style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <button
                        className="bd-status-btn"
                        onClick={toggleBabyStatus}
                    >
                        <Sparkles size={16} />
                        Il bimbo è nato! ✨
                    </button>
                </div>
            )}

            {/* EARLY YEARS VIEW */}
            {isNato && (
                <div className="bd-collapse-enter">
                    <EarlyYears />
                </div>
            )}

            {/* PREGNANCY VIEW */}
            <div className={`bd-pregnancy-wrap ${isNato ? 'bd-collapsed' : ''}`}>
                {/* HERO CARD V4 */}
                <div className="bd-hero fi">
                    <div className="bd-eyebrow">IL NOSTRO VIAGGIO INSIEME</div>

                    <div className={`bd-circle ${pregnancy.sex === 'M' ? 'bd-circle--boy' : ''}`}>
                        <img src="/baby-24w.png" alt="Fetus" className="bd-fetus" style={{ animation: 'float 6s ease-in-out infinite' }} />
                    </div>

                    <div className="bd-name">
                        {pregnancy.babyNickname} <span>{pregnancy.sex === 'M' ? '♂' : '♀'}</span>
                    </div>

                    <div className="bd-sub">
                        {weekData.subtitle}
                    </div>

                    <div className="bd-pill">
                        <span className="bd-pill-em">{pregnancy.stats.sizeEmoji}</span>
                        <span className="bd-pill-tx">Grande come {weekData.sizeLabel?.toLowerCase() || pregnancy.stats.sizeComparison.toLowerCase()}</span>
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

            </div> {/* End of pregnancy wrap */}

            {/* BORN MODAL */}
            {showBornModal && (
                <div className="bd-modal-overlay">
                    <div className="bd-modal-content born-celebration">
                        <button className="bd-modal-close" onClick={() => setShowBornModal(false)}>
                            <X size={24} />
                        </button>
                        <div className="bd-modal-icon">🎉</div>
                        <h2>Tanti Auguri!</h2>
                        <p>Benvenuto al mondo al tuo piccolo miracolo!</p>
                        <div className="bd-modal-tips">
                            <div className="bd-tip-item">
                                <strong style={{ color: 'var(--midnight)' }}>Cosa fare ora in breve:</strong> Goditi questi primi momenti unici e preziosi, riposati quando il bimbo dorme, e non esitare a chiedere supporto.
                            </div>
                            <div className="bd-tip-item">
                                <strong style={{ color: 'var(--midnight)' }}>Cosa troverai in app:</strong> La sezione Bimbo si trasformerà per accompagnarti nei "Primi Anni", con nuove tappe di sviluppo, strumenti dedicati (nanna, pappe) e consigli specifici per i primissimi mesi!
                            </div>
                        </div>
                        <button className="bd-modal-cta" onClick={() => setShowBornModal(false)}>
                            Scopri le novità
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
