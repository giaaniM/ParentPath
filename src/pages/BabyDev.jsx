import { useState } from 'react';
import { Baby, Footprints, ChevronRight, Sparkles, X, Brain, Ear, Eye, Check, Plus } from 'lucide-react';
import { pregnancy, milestones, getWeekData, newbornDevelopment, weeklyDevelopment } from '../data/mockData';
import { useUser } from '../context/UserContext';
import EarlyYears from '../components/EarlyYears';
import './BabyDev.css';

export default function BabyDev() {
    const { getWeeksPregnant, getDueDate, babyStatus, setBabyStatus } = useUser();
    const isBorn = babyStatus === 'nato';
    const currentWeek = isBorn ? 0 : getWeeksPregnant();
    const percent = isBorn ? 100 : Math.min(100, Math.round((currentWeek / pregnancy.totalWeeks) * 100));
    const dueDate = getDueDate();
    const dueDateStr = dueDate ? dueDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }) : null;

    // Dynamic Phase Data
    const phaseDev = isBorn ? newbornDevelopment.month1 : getWeekData(currentWeek);
    const weekData = getWeekData(currentWeek);

    const weeklyEvents = (phaseDev?.events || []).map((desc, i) => ({
        id: i + 1,
        type: i === 0 ? 'dev' : i === 1 ? 'dev' : 'new',
        icon: i === 0 ? <Brain size={24} /> : i === 1 ? <Ear size={24} /> : <Eye size={24} />,
        label: i < 2 ? 'Sviluppo' : 'Novità',
        desc,
    }));

    const [showBornModal, setShowBornModal] = useState(false);
    const [isFullJourneyOpen, setIsFullJourneyOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    // Finding synthetic row milestones (Last, Current, Next)
    const currentMilestoneIndex = milestones.findIndex(m => !m.completed && m.week > (isBorn ? 40 : currentWeek)) - 1;
    const actualCurrentIndex = currentMilestoneIndex < 0 ? milestones.findIndex(m => m.week >= (isBorn ? 40 : currentWeek)) : currentMilestoneIndex;
    
    // Synthetic 3 (Last, Current, Next)
    const previewMilestones = [
        milestones[actualCurrentIndex - 1],
        milestones[actualCurrentIndex],
        milestones[actualCurrentIndex + 1]
    ].filter(Boolean);

    const toggleBabyStatus = () => {
        // In a real app this would call setBabyStatus, 
        // for this mock we rely on the manual toggle in mockData.js or a dev button.
        // But we'll keep the visual toggle for now.
        setBabyStatus(isBorn ? 'gravidanza' : 'nato');
        if (!isBorn) setShowBornModal(true);
    };

    return (
        <div className="page baby-page">

            {/* BORN TOGGLE MOVED TO BOTTOM */}

            {/* EARLY YEARS VIEW */}
            {isBorn && (
                <div className="bd-collapse-enter">
                    <EarlyYears />
                </div>
            )}

            {/* PREGNANCY VIEW */}
            <div className={`bd-pregnancy-wrap ${isBorn ? 'bd-collapsed' : ''}`}>                {/* HERO CARD (COMPACTED) */}
                <div className="bd-hero fi" style={{ padding: '20px', borderRadius: '0 0 32px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div className="hc-eyebrow" style={{ color: 'var(--stone)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0px' }}>
                        {isBorn ? 'IL TUO NEONATO' : `LA TUA SETTIMANA ${currentWeek}`}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', marginTop: '-10px' }}>
                        <div className="bd-circle-clear" style={{ width: '90px', height: '90px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={isBorn ? "/baby-newborn.png" : "/baby-24w-alpha.png"} alt="Fetus" className="bd-fetus" style={{ width: isBorn ? '80px' : '95px', animation: 'float 6s ease-in-out infinite', mixBlendMode: 'multiply' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div className="bd-name" style={{ fontSize: '24px', marginBottom: '4px' }}>
                                {pregnancy.babyNickname} <span style={{ fontSize: '20px' }}>{pregnancy.babySex === 'M' ? '♂' : '♀'}</span>
                            </div>
                            <div className="bd-pill" style={{ padding: '4px 10px', alignSelf: 'flex-start' }}>
                                <span style={{ fontSize: '12px' }}>{phaseDev?.sizeEmoji || '✨'} {isBorn ? (phaseDev?.sizeLabel || 'Neonato') : `Grande come ${phaseDev?.sizeLabel?.toLowerCase() || '...'}`}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bd-stats-grid" style={{ marginBottom: 0, gap: '8px' }}>
                        <div className="bd-stat-box" style={{ padding: '10px 8px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--midnight)' }}>{phaseDev?.length || '--'}</div>
                            <div style={{ fontSize: '10px', color: 'var(--stone)', fontWeight: 700 }}>LUNGHEZZA</div>
                        </div>
                        <div className="bd-stat-box" style={{ padding: '10px 8px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--midnight)' }}>{phaseDev?.weight || '--'}</div>
                            <div style={{ fontSize: '10px', color: 'var(--stone)', fontWeight: 700 }}>PESO</div>
                        </div>
                        <div className="bd-stat-box" style={{ padding: '10px 8px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--midnight)' }}>{isBorn ? 'Nato' : `${percent}%`}</div>
                            <div style={{ fontSize: '10px', color: 'var(--stone)', fontWeight: 700 }}>{isBorn ? 'STATO' : 'PERCORSO'}</div>
                        </div>
                    </div>

                    {/* FULL TERM LOADING BAR */}
                    <div className="bd-hero-loading-container">
                        <div className="bd-tl-bar-container">
                            <div className="bd-tl-bar-bg"></div>
                            <div className="bd-tl-bar-fill" style={{ width: `${percent}%` }}></div>
                            <div className="bd-tl-point active" style={{ left: `${percent}%` }}></div>
                        </div>
                        <div className="bd-tl-weeks">
                            <span>Inizio</span>
                            <span className="active">Oggi (Sett. {currentWeek})</span>
                            <span>Parto</span>
                        </div>
                    </div>
                </div>


                {/* SECTION 2: CURIOSITÀ (MEDICAL FACT) */}
                <div className="bd-section ru d2">
                    <div className="bd-curiosity-card">
                        <div className="bd-curiosity-icon">
                            <Sparkles size={24} color="var(--white)" />
                        </div>
                        <div className="bd-curiosity-content">
                            <div className="bd-curiosity-eyebrow">{phaseDev.developmentDetails?.title || 'Curiosità della settimana'}</div>
                            <div className="bd-curiosity-fact">{phaseDev.developmentDetails?.fact || 'Il tuo bimbo sta crescendo!'}</div>
                            <p className="bd-curiosity-desc">{phaseDev.developmentDetails?.longDesc}</p>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: CONSIGLI & ESAMI */}
                <div className="bd-section ru d3">
                    <div className="bd-section-header">
                        <div className="bd-section-title">Consigli e Visite</div>
                    </div>
                    <div className="bd-tips-grid">
                        {(phaseDev.essentialTips || []).map(tip => (
                            <div key={tip.id} className="bd-tip-card">
                                <div className={`bd-tip-type-ic ${tip.type}`}>
                                    {tip.type === 'visit' ? <Check size={16} /> : tip.type === 'health' ? <Plus size={16} /> : <Ear size={16} />}
                                </div>
                                <div className="bd-tip-info">
                                    <div className="bd-tip-title">{tip.title}</div>
                                    <div className="bd-tip-desc">{tip.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SMART PATH 3.0: SYNTHETIC ROW */}
                    <div className="bd-smart-path-3" style={{ marginTop: '24px' }}>
                        <div className="bd-smart-path-card">
                            <div className="bd-smart-path-header-v3">
                                <div className="bd-sp-h-left">
                                    <div className="bd-sp-h-dot"></div>
                                    <div className="bd-sp-h-title">Il tuo percorso</div>
                                </div>
                                <div className="bd-sp-h-cta" onClick={() => setIsFullJourneyOpen(true)}>
                                    Vedi tutti <ChevronRight size={14} />
                                </div>
                            </div>

                            <div className="bd-sp-row" style={{ paddingBottom: '10px' }}>
                                {previewMilestones.map((m, idx) => {
                                    const isCurrent = m.id === milestones[actualCurrentIndex]?.id;
                                    const isPast = milestones.indexOf(m) < actualCurrentIndex;
                                    return (
                                        <div 
                                            key={m.id} 
                                            className={`bd-sp-mini-card ${isCurrent ? 'is-current' : isPast ? 'is-past' : 'is-lock'}`}
                                            onClick={() => setSelectedMilestone(m)}
                                        >
                                            <div className="bd-sp-mini-icon">{m.icon}</div>
                                            <div className="bd-sp-mini-title">{m.title}</div>
                                            <div className="bd-sp-mini-meta">{`SETT. ${m.week}`}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEXT PHASES SECTION */}
                <div className="nxph-section ru d4" style={{ marginTop: '30px' }}>
                    <div className="nxph-title">Prossime fasi</div>
                    <div className="nxph">
                        <div className="nxph-ic">👶</div>
                        <div className="nxph-t">
                            <div className="nxph-n">Primi Mesi (0–6)</div>
                            <div className="nxph-w">Disponibile {dueDateStr ? `da ${dueDateStr}` : 'dopo il parto'}</div>
                        </div>
                        <div className="nxph-lock">🔒</div>
                    </div>
                    <div className="nxph">
                        <div className="nxph-ic">👣</div>
                        <div className="nxph-t">
                            <div className="nxph-n">I Primi Passi (1–3 anni)</div>
                            <div className="nxph-w">Sbloccabile dopo i 12 mesi</div>
                        </div>
                        <div className="nxph-lock">🔒</div>
                    </div>
                </div>

                {/* BORN TOGGLE / MINI-CARD AT BOTTOM */}
                {isBorn ? (
                    <div className="bd-pregnancy-mini-card minimal" onClick={toggleBabyStatus}>
                        <div className="mini-card-text">
                            <span>🤰 Gravidanza conclusa</span>
                            <span style={{ opacity: 0.6, fontSize: '13px' }}> - Rivedi ricordi</span>
                        </div>
                        <ChevronRight size={18} color="var(--stone)" />
                    </div>
                ) : (
                    <div className="bd-status-card ru d5">
                        <div className="bd-status-title">Il gran giorno è arrivato?</div>
                        <div className="bd-status-desc">Se il tuo bimbo è già tra le tue braccia, passa alla modalità Neonato per sbloccare nuovi strumenti.</div>
                        <button
                            className="bd-status-btn"
                            onClick={toggleBabyStatus}
                        >
                            <Sparkles size={18} />
                            È nato! ✨
                        </button>
                    </div>
                )}

                <div style={{ height: '40px' }}></div>
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

            {/* FULL JOURNEY MODAL */}
            {isFullJourneyOpen && (
                <div className="bd-modal-overlay full-view">
                    <div className="bd-modal-content journey-modal">
                        <div className="bd-modal-header-nav">
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>Tutto il percorso</div>
                            <button className="bd-close-btn" onClick={() => setIsFullJourneyOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="bd-milestones-grid-v3">
                            {milestones.map((m, idx) => {
                                const isCurrent = milestones.indexOf(m) === actualCurrentIndex;
                                const isPast = milestones.indexOf(m) < actualCurrentIndex;
                                
                                return (
                                    <div 
                                        key={m.id} 
                                        className={`bd-m-card-v3 ${isPast ? 'is-past' : isCurrent ? 'is-current' : 'is-lock'}`}
                                        onClick={() => setSelectedMilestone(m)}
                                    >
                                        <div className="bd-m-card-icon">{m.icon}</div>
                                        <div className="bd-m-card-meta">{m.week || m.month}</div>
                                        {isPast && <div className="bd-m-card-check-mini"><Check size={8} strokeWidth={4} /></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* MILESTONE DETAILS POPUP */}
            {selectedMilestone && (
                <div className="bd-modal-overlay popup-view" onClick={() => setSelectedMilestone(null)}>
                    <div className="bd-popup-card" onClick={e => e.stopPropagation()}>
                        <div className="bd-popup-icon-ring">
                            <div className="bd-popup-icon">{selectedMilestone.icon}</div>
                        </div>
                        <h3 className="bd-popup-title">{selectedMilestone.title}</h3>
                        <div className="bd-popup-week">
                            {selectedMilestone.month ? `Mese ${selectedMilestone.month}` : `Settimana ${selectedMilestone.week}`}
                        </div>
                        <p className="bd-popup-desc">{selectedMilestone.desc}</p>
                        <button className="bd-popup-btn" onClick={() => setSelectedMilestone(null)}>Ho capito</button>
                    </div>
                </div>
            )}

        </div>
    );
}
