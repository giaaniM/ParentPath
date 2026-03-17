import { useState, useRef } from 'react';
import { Baby, Footprints, ChevronRight, Sparkles, X, Brain, Ear, Eye, Check, Plus, Lock, Heart, User, Hand, Droplets, Search, Activity, ShieldCheck, Fingerprint, Music, Cloud, Wind, RefreshCw, Stethoscope, ShoppingBag, Lightbulb, Hammer, Timer, Edit2 } from 'lucide-react';
import { pregnancy, milestones, getWeekData, newbornDevelopment, weeklyDevelopment } from '../data/mockData';
import { useUser } from '../context/UserContext';
import EarlyYears from '../components/EarlyYears';
import EditProfileModal from '../components/EditProfileModal';
import './BabyDev.css';

export default function BabyDev() {
    const { getWeeksPregnant, getDueDate, babyStatus, setBabyStatus, userRole, babySex } = useUser();
    const isBorn = babyStatus === 'nato';
    const currentWeek = isBorn ? 0 : getWeeksPregnant();
    const percent = isBorn ? 100 : Math.min(100, Math.round((currentWeek / pregnancy.totalWeeks) * 100));
    const dueDate = getDueDate() ? new Date(getDueDate()) : new Date();
    const conceptionDate = new Date(dueDate);
    conceptionDate.setDate(conceptionDate.getDate() - 280); // 40 weeks back
    
    const dateOptions = { day: 'numeric', month: 'short' };
    const conceptionStr = conceptionDate.toLocaleDateString('it-IT', dateOptions);
    const dueDateStr = dueDate.toLocaleDateString('it-IT', dateOptions);

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
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Swipe-to-dismiss logic for Journey Modal
    const sheetRef = useRef(null);
    const dragY = useRef(0);
    const startY = useRef(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const handleTouchStart = (e) => {
        // Only allow swipe if we are at the top of the scrollable content
        const grid = sheetRef.current?.querySelector('.bd-journey-grid-v4');
        if (grid && grid.scrollTop > 0) return;

        startY.current = e.touches[0].clientY;
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if (!isSwiping) return;
        const deltaY = e.touches[0].clientY - startY.current;
        if (deltaY > 0) {
            dragY.current = deltaY;
            if (sheetRef.current) {
                sheetRef.current.style.transform = `translateY(${deltaY}px)`;
            }
        }
    };

    const handleTouchEnd = () => {
        if (!isSwiping) return;
        setIsSwiping(false);
        if (dragY.current > 100) {
            setIsFullJourneyOpen(false);
        }
        if (sheetRef.current) {
            sheetRef.current.style.transform = '';
        }
        dragY.current = 0;
    };

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
        // Inhibited for now as requested - we'll work on Primi Mesi later
        setShowBornModal(true);
    };

    const getMilestoneIcon = (milestoneId, size = 20) => {
        const iconMap = {
            m1: <Heart size={size} />,
            m2: <Baby size={size} />,
            m3: <Hand size={size} />,
            m4: <Droplets size={size} />,
            m5: <Search size={size} />,
            m6: <Activity size={size} />,
            m7: <Ear size={size} />,
            m8: <ShieldCheck size={size} />,
            m9: <Fingerprint size={size} />,
            m10: <Music size={size} />,
            m11: <Eye size={size} />,
            m12: <Cloud size={size} />,
            m13: <Wind size={size} />,
            m14: <RefreshCw size={size} />,
            m15: <Wind size={size} />, // Lungs placeholder if Lungs icon missing in this version
            m16: <Sparkles size={size} />,
        };
        return iconMap[milestoneId] || <Sparkles size={size} />;
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
            <div className={`bd-pregnancy-wrap ${isBorn ? 'bd-collapsed' : ''}`}>
                
                <div className="bd-mesh-bg-container fi">
                    <div className="bd-mesh-gradient"></div>

                    <div className="bd-premium-hero">
                        <button 
                            className="bd-edit-profile-btn glass"
                            onClick={() => setIsEditOpen(true)}
                            aria-label="Modifica Profilo"
                            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                            <Edit2 size={16} color="var(--midnight)" />
                        </button>
                        <div className="bd-hero-top">
                            <div className="bd-hc-eyebrow">
                                {isBorn ? 'Il tuo neonato' : `Settimana ${currentWeek}`}
                            </div>
                            <h1 className="bd-hc-title">
                                {pregnancy.babyNickname} 
                                <span className="bd-hc-sex">
                                    {(babySex || pregnancy.sex) === 'M' ? '♂' : ((babySex || pregnancy.sex) === 'F' ? '♀' : '')}
                                </span>
                            </h1>
                            <div className="bd-hc-pill-container">
                                <div className="bd-hc-pill glass">
                                    <span>{phaseDev?.sizeEmoji || '✨'} {isBorn ? (phaseDev?.sizeLabel || 'Neonato') : `Grande come ${phaseDev?.sizeLabel?.toLowerCase() || '...'}`}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bd-hero-center">
                            <div className="bd-fetus-container">
                                <div className="bd-fetus-glow"></div>
                                <img 
                                    src={isBorn ? "/baby-newborn.png" : "/baby-24w-alpha.png"} 
                                    alt="Baby" 
                                    className="bd-fetus-img animated-float"
                                />
                            </div>
                            
                            <div className="bd-stats-floating">
                                <div className="bd-stat-item glass">
                                    <span className="bd-stat-val">{phaseDev?.length || '--'}</span>
                                    <span className="bd-stat-lbl">CM</span>
                                </div>
                                <div className="bd-stat-item glass">
                                    <span className="bd-stat-val">{phaseDev?.weight || '--'}</span>
                                    <span className="bd-stat-lbl">GRAMMI</span>
                                </div>
                            </div>
                        </div>

                        {/* REFINED TIMELINE V2 */}
                        <div className="bd-premium-timeline glass">
                            <div className="bd-ptl-bar">
                                <div className="bd-ptl-fill" style={{ width: `${percent}%` }}>
                                    <div className="bd-ptl-marker">
                                        <div className="bd-ptl-week-label">{isBorn ? 'Nato' : `Sett. ${currentWeek}`}</div>
                                        <div className="bd-ptl-percent">{percent}%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bd-ptl-labels">
                                <div className="bd-ptl-date-box">
                                    <span className="bd-ptl-date-lbl">Concepimento</span>
                                    <span className="bd-ptl-date-val">{conceptionStr}</span>
                                </div>
                                <div className="bd-ptl-date-box align-right">
                                    <span className="bd-ptl-date-lbl">Nascita (Prevista)</span>
                                    <span className="bd-ptl-date-val">{dueDateStr}</span>
                                </div>
                            </div>
                        </div>
                    </div> {/* End Hero */}

                    {/* SECTION 2: INSIGHTS CARD (GLASSMORPHISM) */}
                    <div className="bd-section-v4 ru d2">
                        <div className="bd-insight-card glass">
                            <div className="bd-insight-header">
                                <div className="bd-insight-icon-box">
                                    <Sparkles size={20} className="sparkle-anim" />
                                </div>
                                <div className="bd-insight-title-box">
                                    <span className="bd-insight-eyebrow">{phaseDev.developmentDetails?.title || 'Lo sviluppo di questa settimana'}</span>
                                    <h3 className="bd-insight-title">{phaseDev.developmentDetails?.fact || 'Crescita costante'}</h3>
                                </div>
                            </div>
                            <p className="bd-insight-text">{phaseDev.developmentDetails?.longDesc}</p>
                        </div>
                    </div>
                </div> {/* End Mesh Container */}

                {/* SECTION 3: CONSIGLI & ESAMI */}
                <div className="bd-section-v4 ru d3">
                    <h2 className="bd-v4-section-title">
                        Consigli e Visite <span className="bd-v4-title-tag">(per questa settimana)</span>
                    </h2>
                    
                    {/* Personalized Tip Card */}
                    <div className="bd-v4-tip-card personalized glass-accent" style={{ marginBottom: '16px' }}>
                        <div className="bd-v4-tip-icon-special">
                            <Heart size={20} />
                        </div>
                        <div className="bd-v4-tip-content">
                            <span className="bd-v4-tip-eyebrow">Consiglio per te ({userRole === 'mamma' ? 'Mamma' : 'Papà'})</span>
                            <p className="bd-v4-tip-text-special">{userRole === 'mamma' ? phaseDev.mamaTip : phaseDev.papaTip}</p>
                        </div>
                    </div>

                    <div className="bd-tips-stack">
                        {(phaseDev.essentialTips || weekData.essentialTips || []).map(tip => (
                            <div key={tip.id} className="bd-v4-tip-card">
                                <div className={`bd-v4-tip-icon ${tip.type || 'health'}`}>
                                    {tip.type === 'visit' && <Stethoscope size={18} />}
                                    {tip.type === 'health' && <Plus size={18} />}
                                    {tip.type === 'prep' && <ShoppingBag size={18} />}
                                    {tip.type === 'tip' && <Heart size={18} />}
                                    {tip.type === 'curiosity' && <Lightbulb size={18} />}
                                    {!['visit', 'health', 'prep', 'tip', 'curiosity'].includes(tip.type) && <Check size={18} />}
                                </div>
                                <div className="bd-v4-tip-content">
                                    <span className="bd-v4-tip-label">{tip.title}</span>
                                    <p className="bd-v4-tip-desc">{tip.desc}</p>
                                </div>
                                <ChevronRight size={16} className="bd-v4-tip-arrow" />
                            </div>
                        ))}
                    </div>

                    {/* NEW SECTION: CURIOSITIES */}
                    {(phaseDev.curiosities || weekData.curiosities) && (
                        <div className="bd-v4-curiosities ru d4">
                            <h2 className="bd-v4-section-title" style={{ marginTop: '32px' }}>
                                Curiosità <span className="bd-v4-title-tag">(per questa settimana)</span>
                            </h2>
                            <div className="bd-curiosity-row">
                                {(phaseDev.curiosities || weekData.curiosities || []).map((c, i) => (
                                    <div key={i} className="bd-curiosity-card glass">
                                        <div className="bd-curiosity-icon">
                                            <Lightbulb size={20} />
                                        </div>
                                        <p className="bd-curiosity-text">{c}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SMART PATH 3.0: SYNTHETIC ROW */}
                    <div className="bd-smart-path-3" style={{ marginTop: '16px' }}>
                        <div className="bd-smart-path-card">
                            <div className="bd-smart-path-header-v3">
                                <h3 className="bd-sp-h-title">Il suo percorso</h3>
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
                                            <div className="bd-sp-mini-icon">
                                                <div className="bd-sp-icon-wrapper">
                                                    {getMilestoneIcon(m.id, 24)}
                                                </div>
                                            </div>
                                            <div className="bd-sp-mini-lbl">{m.title}</div>
                                            <div className="bd-sp-mini-meta">{`Sett. ${m.week}`}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEXT PHASES ROADMAP */}
                <div className="bd-section-v4 roadmap ru d4">
                    <h2 className="bd-v4-section-title">Prossime fasi</h2>
                    <div className="bd-roadmap-grid">
                        <div className="bd-roadmap-card locked">
                            <div className="bd-rm-icon glass">👶</div>
                            <div className="bd-rm-info">
                                <span className="bd-rm-label">Primi Mesi</span>
                                <span className="bd-rm-period">0–6 MESI</span>
                            </div>
                            <div className="bd-rm-lock"><Lock size={14} /></div>
                        </div>
                        <div className="bd-roadmap-card locked">
                            <div className="bd-rm-icon glass">👣</div>
                            <div className="bd-rm-info">
                                <span className="bd-rm-label">Primi Passi</span>
                                <span className="bd-rm-period">1–3 ANNI</span>
                            </div>
                            <div className="bd-rm-lock"><Lock size={14} /></div>
                        </div>
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

            {/* WORK IN PROGRESS POPUP (Refactored Born Modal) */}
            {showBornModal && (
                <div className="bd-modal-overlay popup-view" onClick={() => setShowBornModal(false)}>
                    <div className="bd-popup-card wip-card" onClick={e => e.stopPropagation()}>
                        <div className="bd-popup-icon-ring wip">
                            <Hammer size={32} />
                        </div>
                        <h3 className="bd-popup-title">Work in Progress</h3>
                        <div className="bd-popup-week">
                            SEZIONE "PRIMI MESI" - Prossimamente
                        </div>
                        <p className="bd-popup-desc">
                            Stiamo lavorando per offrirti la migliore esperienza post-parto.
                            Presto potrai tracciare pappe, nanna e tutti i primi progressi del tuo piccolo!
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', color: 'var(--stone)', fontSize: '13px', fontWeight: 600 }}>
                            <Timer size={14} /> Solo un altro po' di attesa...
                        </div>
                        <button className="bd-popup-btn" onClick={() => setShowBornModal(false)}>
                            Ho capito
                        </button>
                    </div>
                </div>
            )}

            {/* FULL JOURNEY MODAL */}
            {isFullJourneyOpen && (
                <div className="bd-modal-overlay full-view" onClick={() => setIsFullJourneyOpen(false)}>
                    <div 
                        className={`bd-modal-content journey-modal ${isSwiping ? 'swiping' : ''}`}
                        ref={sheetRef}
                        onClick={e => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="bd-bottom-sheet-handle" />
                        <div className="bd-modal-header-nav">
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>Tutto il percorso</div>
                            <button className="bd-close-btn" onClick={() => setIsFullJourneyOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="bd-journey-grid-v4">
                            {milestones.map((m, idx) => {
                                const isCurrent = milestones.indexOf(m) === actualCurrentIndex;
                                const isPast = milestones.indexOf(m) < actualCurrentIndex;
                                
                                return (
                                    <div 
                                        key={m.id} 
                                        className={`bd-journey-item-v4 ${isPast ? 'is-past' : isCurrent ? 'is-current' : 'is-lock'}`}
                                        onClick={() => setSelectedMilestone(m)}
                                    >
                                        <div className="bd-journey-icon-v4">
                                            {getMilestoneIcon(m.id, 18)}
                                        </div>
                                        <div className="bd-journey-info-v4">
                                            <span className="bd-journey-title-v4">{m.title}</span>
                                            <span className="bd-journey-week-v4">{m.week || m.month ? `Sett. ${m.week || m.month}` : ''}</span>
                                        </div>
                                        {isPast && (
                                            <div className="bd-journey-status-minimal">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                        {isCurrent && <div className="bd-current-dot-v4" />}
                                        {!isPast && !isCurrent && <Lock size={12} className="bd-journey-lock-minimal" />}
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
                            {getMilestoneIcon(selectedMilestone.id, 32)}
                        </div>
                        <h3 className="bd-popup-title">{selectedMilestone.title}</h3>
                        <div className="bd-popup-week">
                            {selectedMilestone.month ? `Mese ${selectedMilestone.month}` : `Settimana ${selectedMilestone.week}`}
                        </div>
                        <p className="bd-popup-desc">
                            {selectedMilestone.desc || "Scopri di più su questa importante tappa dello sviluppo del tuo bambino nel percorso di crescita."}
                        </p>
                        <button className="bd-popup-btn" onClick={() => setSelectedMilestone(null)}>Ho capito</button>
                    </div>
                </div>
            )}

            {/* EDIT PROFILE MODAL */}
            <EditProfileModal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
            />
        </div>
    );
}
