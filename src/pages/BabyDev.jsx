import { useState } from 'react';
import { Baby, Footprints, ChevronRight, Sparkles, X, Brain, Ear, Eye } from 'lucide-react';
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
        icon: i === 0 ? <Brain size={24} /> : i === 1 ? <Ear size={24} /> : <Eye size={24} />,
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
                <div className="bd-pregnancy-mini-card minimal" onClick={toggleBabyStatus}>
                    <div className="mini-card-text">
                        <span>🤰 Gravidanza conclusa</span>
                        <span style={{ opacity: 0.6, fontSize: '13px' }}> - Rivedi ricordi</span>
                    </div>
                    <ChevronRight size={18} color="var(--stone)" />
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
                <div className="bd-hero fi" style={{ padding: '20px', borderRadius: '0 0 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Top Row: Avatar + Name & Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                        <div
                            className={`bd-circle ${pregnancy.sex === 'M' ? 'bd-circle--boy' : ''}`}
                            style={{ width: '90px', height: '90px', marginBottom: 0, flexShrink: 0 }}
                        >
                            <img src="/baby-24w.png" alt="Fetus" className="bd-fetus" style={{ width: '90px', animation: 'float 6s ease-in-out infinite' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, gap: '6px' }}>
                            <div className="bd-name" style={{ margin: 0, fontSize: '26px' }}>
                                {pregnancy.babyNickname} <span style={{ fontSize: '22px' }}>{pregnancy.sex === 'M' ? '♂' : '♀'}</span>
                            </div>
                            <div className="bd-pill" style={{ margin: 0, padding: '6px 14px', alignSelf: 'flex-start' }}>
                                <span className="bd-pill-em" style={{ fontSize: '13px' }}>{pregnancy.stats.sizeEmoji}</span>
                                <span className="bd-pill-tx" style={{ fontSize: '12px' }}>Grande come {weekData.sizeLabel?.toLowerCase() || pregnancy.stats.sizeComparison.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bd-stats-grid" style={{ marginBottom: 0 }}>
                        <div className="bd-stat-box" style={{ padding: '12px 10px' }}>
                            <div className="bd-sv" style={{ fontSize: '20px' }}>{pregnancy.stats.length}</div>
                            <div className="bd-sl">LUNGHEZZA</div>
                        </div>
                        <div className="bd-stat-box" style={{ padding: '12px 10px' }}>
                            <div className="bd-sv" style={{ fontSize: '20px' }}>{pregnancy.stats.weight}</div>
                            <div className="bd-sl">PESO</div>
                        </div>
                        <div className="bd-stat-box" style={{ padding: '12px 10px' }}>
                            <div className="bd-sv" style={{ fontSize: '20px' }}>{percent}%</div>
                            <div className="bd-sl">PERCORSO</div>
                        </div>
                    </div>

                    <div className="bd-prog-card" style={{ padding: '16px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div className="bd-prog-head" style={{ marginBottom: '12px' }}>
                            <span>Inizio</span>
                            <span>Oggi</span>
                            <span>Sett. 40</span>
                        </div>
                        <div className="bd-slider-wrap" style={{ marginBottom: '16px' }}>
                            <div className="bd-slider-bg"></div>
                            <div className="bd-slider-fill" style={{ width: `${percent}%` }}></div>
                            <div className="bd-slider-thumb" style={{ left: `${percent}%`, borderColor: 'var(--white)', width: '22px', height: '22px', fontSize: '9px' }}>{currentWeek}</div>
                        </div>

                        <div className="bd-insights" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--midnight)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Brain size={16} color="var(--aqua)" /> {weekData.title || `Sviluppo Settimana ${currentWeek}`}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--stone)', lineHeight: 1.5 }}>
                                {weekData.subtitle || weekData.events[0] || 'Il tuo bambino sta crescendo rapidamente. I suoi sensi si stanno sviluppando e inizia a prepararsi per il mondo esterno.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* QUESTA SETTIMANA */}
                <div className="qsett ru d1">
                    <div className="qsett-hd">
                        <div className="qsett-tt">Questa settimana</div>
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
