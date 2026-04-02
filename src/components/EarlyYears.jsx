import { useState, useEffect } from 'react';
import { Baby, Droplets, Moon, Coffee, Wind, X, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import SosNotteModal from './SosNotteModal';
import './EarlyYears.css';

const monthInsights = [
    { title: "Mese 0: Il neonato", desc: "Il tuo bambino si sta abituando al mondo. Dorme molto, inizia a riconoscere la tua voce e il tuo odore. I suoi riflessi sono innati e fondamentali." },
    { title: "Mese 1: I primi sorrisi", desc: "Inizia a mettere a fuoco i volti a breve distanza. Potresti vedere i primi sorrisi 'veri' e intenzionali. Comincia ad alzare brevemente la testa se a pancia in giù." },
    { title: "Mese 2: Scoperta delle mani", desc: "Le sue mani si aprono sempre di più e inizia a scoprirle. I movimenti diventano meno a scatti e i gorgheggi più frequenti per comunicare con te." },
    { title: "Mese 3: Inizio dell'interazione", desc: "Il tuo bimbo ora ride forte! Afferra gli oggetti che gli porgi e sostiene bene la testa. L'interazione sociale diventa il suo passatempo preferito." },
    { title: "Mese 4: Il mondo a colori", desc: "La sua vista si affina: comincia a percepire la profondità e tutti i colori. Si gira verso i suoni e potrebbe iniziare a rotolare da pancia in giù a pancia in su." },
    { title: "Mese 5: Le piccole conquiste", desc: "Riesce a stare seduto con un supporto. Passa gli oggetti da una mano all'altra e porta tutto alla bocca per esplorare il mondo." },
    { title: "Mese 6: Mezzo anno di te", desc: "Molti bimbi iniziano a stare seduti da soli. È il momento di introdurre i primi cibi solidi! Inizia a comprendere parole semplici come il suo nome." },
    { title: "Mese 7: Primi spostamenti", desc: "Potrebbe iniziare a strisciare o gattonare. Riconosce le emozioni dalle espressioni facciali e inizia a mostrare ansia da separazione." },
    { title: "Mese 8: L'esploratore", desc: "Gattona sempre più spedito e si tira su in piedi aggrappandosi ai mobili. Usa la presa a pinza per afferrare piccole cose." },
    { title: "Mese 9: Comunicazione intenzionale", desc: "Fa 'ciao ciao' con la manina e capisce bene il significato del 'no'. Inizia a combinare le sillabe in modo più strutturato." },
    { title: "Mese 10: I primi passi?", desc: "Cammina tenendosi ai mobili (cruising). Capisce concetti semplici e ama imitare le tue azioni, come fingere di parlare al telefono." },
    { title: "Mese 11: Sempre più indipendente", desc: "Riesce a stare in piedi da solo per qualche secondo. Segue istruzioni semplici e il suo vocabolario recettivo cresce ogni giorno." },
    { title: "Mese 12: Buon Compleanno!", desc: "Potrebbe fare i suoi primi passi senza sostegno! Dice le sue prime parole con significato e mostra chiaramente cosa vuole e cosa non vuole." }
];

export default function EarlyYears() {
    const {
        trackers, addTrackerEntry, removeTrackerEntry,
        activeFeedTimer, setActiveFeedTimer, lastBreastSide, setLastBreastSide,
        activeSleepTimer, setActiveSleepTimer, getSweetSpot,
        pregnancy, getBabyAgeMonths
    } = useUser();

    const [isSosOpen, setIsSosOpen] = useState(false);
    const months = getBabyAgeMonths();

    // Active Timer Tickers
    const [elapsedTime, setElapsedTime] = useState(0);
    useEffect(() => {
        let interval;
        if (activeFeedTimer) {
            const start = new Date(activeFeedTimer.startTime).getTime();
            setElapsedTime(Math.floor((Date.now() - start) / 1000));
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeFeedTimer]);

    const [sleepElapsedTime, setSleepElapsedTime] = useState(0);
    useEffect(() => {
        let interval;
        if (activeSleepTimer) {
            const start = new Date(activeSleepTimer.startTime).getTime();
            setSleepElapsedTime(Math.floor((Date.now() - start) / 1000));
            interval = setInterval(() => {
                setSleepElapsedTime(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setSleepElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeSleepTimer]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleStartFeed = (type) => {
        let side = null;
        if (type === 'breast') {
            side = lastBreastSide === 'left' ? 'right' : 'left';
        }
        setActiveFeedTimer({ type, side, startTime: new Date() });
    };

    const handleStopFeed = () => {
        if (!activeFeedTimer) return;
        const duration = Math.floor((Date.now() - new Date(activeFeedTimer.startTime).getTime()) / 1000);
        addTrackerEntry('feeding', {
            type: activeFeedTimer.type,
            side: activeFeedTimer.side,
            duration,
            timestamp: activeFeedTimer.startTime
        });
        if (activeFeedTimer.type === 'breast') {
            setLastBreastSide(activeFeedTimer.side);
        }
        setActiveFeedTimer(null);
    };

    const handleStartSleep = () => {
        setActiveSleepTimer({ startTime: new Date() });
    };

    const handleStopSleep = () => {
        if (!activeSleepTimer) return;
        const duration = Math.floor((Date.now() - new Date(activeSleepTimer.startTime).getTime()) / 1000);
        addTrackerEntry('sleep', {
            startTime: activeSleepTimer.startTime,
            endTime: new Date(),
            duration
        });
        setActiveSleepTimer(null);
    };

    // Handlers for Quick Trackers
    const handleAddTracker = (type) => {
        if (type === 'diaper_wet') addTrackerEntry('diapers', { type: 'wet', timestamp: new Date() });
        if (type === 'diaper_dirty') addTrackerEntry('diapers', { type: 'dirty', timestamp: new Date() });
    };

    // Extract and sort all recent trackers
    const recentTrackers = [];
    if (trackers.feeding) recentTrackers.push(...trackers.feeding.map(t => ({ ...t, category: 'feeding' })));
    if (trackers.sleep) recentTrackers.push(...trackers.sleep.map(t => ({ ...t, category: 'sleep' })));
    if (trackers.diapers) recentTrackers.push(...trackers.diapers.map(t => ({ ...t, category: 'diapers' })));
    recentTrackers.sort((a, b) => new Date(b.timestamp || b.startTime) - new Date(a.timestamp || a.startTime));

    const displayTrackers = recentTrackers.slice(0, 3); // Show only last 3

    return (
        <div className="ey-fade-in" style={{ paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="bd-hero ey-macro-hero fi" style={{ padding: '20px', borderRadius: '0 0 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px', margin: 0 }}>

                {/* Top Row: Avatar + Name & Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                    <div
                        className={`bd-circle ${pregnancy?.sex === 'M' ? 'bd-circle--boy' : 'bd-circle--girl'} ey-avatar-circle`}
                        style={{ width: '90px', height: '90px', marginBottom: 0, flexShrink: 0 }}
                    >
                        <span style={{ fontSize: '48px', animation: 'float 6s ease-in-out infinite' }}>👶</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, gap: '6px' }}>
                        <div className="bd-pill" style={{ margin: 0, padding: '6px 14px', alignSelf: 'flex-start' }}>
                            <span className="bd-pill-em" style={{ fontSize: '13px' }}>🎉</span>
                            <span className="bd-pill-tx" style={{ fontSize: '12px' }}>I Primi Mesi</span>
                        </div>
                        <div className="bd-name" style={{ color: pregnancy?.sex === 'M' ? 'var(--aqua)' : 'var(--midnight)', margin: 0, fontSize: '26px' }}>
                            {pregnancy?.babyNickname || 'Il tuo Bimbo'} <span style={{ fontSize: '22px' }}>{pregnancy?.sex === 'M' ? '♂' : '♀'}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Card right below */}
                <div className="bd-prog-card" style={{ padding: '16px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div className="bd-prog-head" style={{ marginBottom: '12px' }}>
                        <span>Nascita</span>
                        <span>Mese {months}</span>
                        <span>Mese 12</span>
                    </div>
                    <div className="bd-slider-wrap" style={{ marginBottom: '16px' }}>
                        <div className="bd-slider-bg"></div>
                        <div className="bd-slider-fill" style={{ width: `${Math.min(100, (months / 12) * 100)}%`, background: pregnancy?.sex === 'M' ? 'var(--aqua)' : 'var(--blush)' }}></div>
                        <div className="bd-slider-thumb" style={{ left: `${Math.min(100, (months / 12) * 100)}%`, background: pregnancy?.sex === 'M' ? 'var(--aqua)' : 'var(--blush)', borderColor: 'var(--white)', width: '22px', height: '22px', fontSize: '9px' }}>{months}</div>
                    </div>
                    <div className="bd-prog-footer" style={{ fontSize: '12px', margin: 0 }}>
                        Il tuo bimbo ha <strong>{months} mesi</strong>!
                    </div>

                    <div className="bd-insights" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--midnight)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Brain size={16} color="var(--aqua)" /> {monthInsights[months <= 12 ? months : 12].title}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--stone)', lineHeight: 1.5 }}>
                            {monthInsights[months <= 12 ? months : 12].desc}
                        </div>
                    </div>
                </div>
            </div>

            <div className="ey-control-center" style={{ width: '100%', padding: '0 20px', margin: 0 }}>
                <h3 className="trackers-heading">Azioni Rapide</h3>

                {/* Note: In standard setup either feed or sleep is active at once */}
                {activeFeedTimer ? (
                    <div className="active-timer-banner">
                        <div className="active-timer-info">
                            <div className="active-timer-icon">
                                {activeFeedTimer.type === 'breast' ? <Baby size={24} /> : <Coffee size={24} />}
                            </div>
                            <div>
                                <div className="active-timer-type">
                                    {activeFeedTimer.type === 'breast' ? 'Allattamento in corso' : 'Biberon in corso'}
                                </div>
                                {activeFeedTimer.type === 'breast' && (
                                    <div className="active-timer-controls">
                                        <span>Seno:</span>
                                        <button
                                            className={`side-btn ${activeFeedTimer.side === 'left' ? 'active' : ''}`}
                                            onClick={() => setActiveFeedTimer({ ...activeFeedTimer, side: 'left' })}
                                        >S</button>
                                        <button
                                            className={`side-btn ${activeFeedTimer.side === 'right' ? 'active' : ''}`}
                                            onClick={() => setActiveFeedTimer({ ...activeFeedTimer, side: 'right' })}
                                        >D</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="active-timer-clock">{formatTime(elapsedTime)}</div>
                        <button className="active-timer-stop" onClick={handleStopFeed}>STOP</button>
                    </div>
                ) : activeSleepTimer ? (
                    <div className="active-timer-banner sleep">
                        <div className="active-timer-info">
                            <div className="active-timer-icon">
                                <Moon size={24} />
                            </div>
                            <div>
                                <div className="active-timer-type">Nanna in corso</div>
                            </div>
                        </div>
                        <div className="active-timer-clock">{formatTime(sleepElapsedTime)}</div>
                        <button className="active-timer-stop" onClick={handleStopSleep}>SVEGLIA</button>
                    </div>
                ) : (
                    <>
                        <div className="trackers-grid">
                            <button className="tracker-btn feed" onClick={() => handleStartFeed('breast')}>
                                <Baby size={20} />
                                <div style={{ lineHeight: 1.2 }}>Allatto<br /><span style={{ fontSize: 10, opacity: 0.7 }}>(Ultimo: {lastBreastSide === 'left' ? 'S' : 'D'})</span></div>
                            </button>
                            <button className="tracker-btn feed" onClick={() => handleStartFeed('bottle')}>
                                <Coffee size={20} /> Biberon
                            </button>
                            <button className="tracker-btn diaper wet" onClick={() => handleAddTracker('diaper_wet')}>
                                <Droplets size={20} /> Pipì
                            </button>
                            <button className="tracker-btn diaper dirty" onClick={() => handleAddTracker('diaper_dirty')}>
                                <Droplets size={20} style={{ fill: 'currentColor' }} /> Pupù
                            </button>
                            <button className="tracker-btn sleep" onClick={handleStartSleep}>
                                <Moon size={20} /> Nanna
                            </button>
                            <button className="tracker-btn sos" onClick={() => setIsSosOpen(true)}>
                                <Wind size={20} /> SOS Notte
                            </button>
                        </div>

                        {getSweetSpot() && (
                            <div className="sweetspot-banner">
                                <div className="sweetspot-icon">🎯</div>
                                <div className="sweetspot-text">
                                    <strong>SweetSpot Nanna</strong>
                                    <span style={{ fontSize: 13, display: 'block', marginTop: 2, opacity: 0.9 }}>
                                        Finestra di veglia consigliata: {getSweetSpot().wakeWindowMins} min<br />
                                        Prossimo pisolino verso le <strong>{format(getSweetSpot().nextNapTime, 'HH:mm')}</strong>
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {displayTrackers.length > 0 && (
                    <div className="trackers-recent-list">
                        <h4 className="recent-heading">Oggi</h4>
                        {displayTrackers.map(t => {
                            const time = format(new Date(t.timestamp || t.startTime), 'HH:mm');
                            let icon, label, cls;
                            if (t.category === 'feeding' && t.type === 'breast') { icon = <Baby size={16} />; label = `Allattamento${t.duration ? ` (${formatTime(t.duration)})` : ''} ${t.side ? (t.side === 'left' ? 'S' : 'D') : ''}`; cls = 'feed'; }
                            else if (t.category === 'feeding' && t.type === 'bottle') { icon = <Coffee size={16} />; label = `Biberon${t.duration ? ` (${formatTime(t.duration)})` : ''}`; cls = 'feed'; }
                            else if (t.category === 'diapers' && t.type === 'wet') { icon = <Droplets size={16} />; label = 'Pannolino (Pipì)'; cls = 'diaper'; }
                            else if (t.category === 'diapers' && t.type === 'dirty') { icon = <Droplets size={16} style={{ fill: 'currentColor' }} />; label = 'Pannolino (Pupù)'; cls = 'diaper dirty'; }
                            else if (t.category === 'sleep') { icon = <Moon size={16} />; label = 'Nanna'; cls = 'sleep'; }

                            return (
                                <div key={t.id} className={`recent-tracker-item ${cls}`}>
                                    <div className="recent-icon">{icon}</div>
                                    <div className="recent-label">{label}</div>
                                    <div className="recent-time">{time}</div>
                                    <button className="recent-del" onClick={() => removeTrackerEntry(t.category, t.id)}><X size={14} /></button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* NEXT PHASES (LOCKED) */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--midnight)', margin: '8px 0', letterSpacing: '-0.3px' }}>Prossime Fasi</h3>
                <div className="nxph ru d3">
                    <div className="nxph-ic">👣</div>
                    <div className="nxph-t">
                        <div className="nxph-n">I Primi Passi (1–3 anni)</div>
                        <div className="nxph-w">Sblocca al compimento del 1° anno</div>
                    </div>
                    <span>🔒</span>
                </div>
                <div className="nxph ru d4" style={{ marginBottom: 0 }}>
                    <div className="nxph-ic">🎒</div>
                    <div className="nxph-t">
                        <div className="nxph-n">Età Prescolare (3–5 anni)</div>
                        <div className="nxph-w">Sblocca al compimento del 3° anno</div>
                    </div>
                    <span>🔒</span>
                </div>
            </div>

            <SosNotteModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
        </div>
    );
}
