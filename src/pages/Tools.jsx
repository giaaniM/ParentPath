import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toolsData } from '../data/mockData';
import { Calendar, Clock, Baby, FileHeart, Calculator, BriefcaseMedical, AlertCircle } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useUser } from '../context/UserContext';
import './Tools.css';

// ── Kick Counter ──────────────────────────────
function KickCounter() {
    const [kicks, setKicks] = useState(toolsData.kicks.todayScore);
    const [ripples, setRipples] = useState([]);
    const [lastTime, setLastTime] = useState(toolsData.kicks.lastRecorded);
    const [sessionLog, setSessionLog] = useState([]);
    const target = 10;
    const done = kicks >= target;

    const handleKick = useCallback(async (e) => {
        if (done) return;

        // Haptic feedback
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) { }

        // Ripple animation
        const id = Date.now();
        setRipples(r => [...r, id]);
        setTimeout(() => setRipples(r => r.filter(x => x !== id)), 900);

        const now = new Date();
        const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        setLastTime(timeStr);
        setKicks(k => k + 1);
        setSessionLog(l => [{ id, time: timeStr }, ...l].slice(0, 10));
    }, [done]);

    const handleReset = useCallback(() => {
        setKicks(0);
        setSessionLog([]);
    }, []);

    return (
        <div className="kc-wrap">
            <div className="kc-header">
                <div className="kc-info">
                    <Baby size={20} />
                    <span>Calcetti del bimbo</span>
                </div>
                <div className="kc-count-badge">
                    <span className={`kc-count ${done ? 'done' : ''}`}>{kicks}</span>
                    <span className="kc-target">/ {target}</span>
                </div>
            </div>

            {done && (
                <div className="kc-success">
                    🎉 Raggiunti {target} movimenti! Bimbo attivo e in forma.
                </div>
            )}

            {!done && (
                <div className="kc-sub">
                    Tocca ogni volta che senti un calcetto. Obiettivo: 10 movimenti in 2 ore.
                </div>
            )}

            {/* BIG TAP BUTTON */}
            <div className={`kc-btn-wrap ${done ? 'kc-btn-wrap--done' : ''}`} onClick={handleKick}>
                <div className="kc-ripple-host">
                    {ripples.map(id => (
                        <span key={id} className="kc-ripple" />
                    ))}
                </div>
                <div className="kc-btn-inner">
                    <Baby size={44} strokeWidth={1.2} />
                    <span className="kc-btn-label">{done ? '✓ Completato' : 'Tocca'}</span>
                </div>
            </div>

            <div className="kc-footer">
                {lastTime && <span className="kc-last">Ultimo alle {lastTime}</span>}
                <button className="kc-reset" onClick={handleReset}>Azzera</button>
            </div>

            {sessionLog.length > 0 && (
                <div className="kc-log">
                    {sessionLog.map((entry, i) => (
                        <div key={entry.id} className="kc-log-row">
                            <span className="kc-log-num">#{kicks - i}</span>
                            <span className="kc-log-time">{entry.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Contraction Timer ─────────────────────────
function ContractionTimer() {
    const { partnerName, sendNotificationToPartner, partnerId } = useUser();
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [history, setHistory] = useState([]);
    const [notified, setNotified] = useState(false);
    const intervalRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        if (running) {
            startRef.current = Date.now() - elapsed * 1000;
            intervalRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
            }, 100);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

    const format = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleStart = async () => {
        try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (_) { }
        setElapsed(0);
        setRunning(true);
    };

    const handleStop = async () => {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (_) { }
        setRunning(false);
        if (elapsed > 0) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            setHistory(h => [{ duration: elapsed, time: timeStr, timestamp: now.getTime(), id: Date.now() }, ...h].slice(0, 10));
        }
        setElapsed(0);
    };

    const handleNotifyPartner = async () => {
        const avgInterval = getAvgIntervalMin();
        await sendNotificationToPartner(
            'contraction',
            '🔴 Contrazioni in corso',
            avgInterval
                ? `Le contrazioni stanno arrivando ogni ~${avgInterval} minuti`
                : 'Le contrazioni sono iniziate'
        );
        setNotified(true);
        setTimeout(() => setNotified(false), 5000);
    };

    // Calcola intervallo medio in minuti tra le ultime contrazioni
    const getAvgIntervalMin = () => {
        if (history.length < 2) return null;
        const intervals = [];
        for (let i = 0; i < Math.min(history.length - 1, 4); i++) {
            const diff = (history[i].timestamp - history[i + 1].timestamp) / 60000;
            if (diff > 0 && diff < 60) intervals.push(diff);
        }
        if (intervals.length === 0) return null;
        return Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    };

    // Regola 5-1-1: contrazioni ogni ≤5 min, durata ≥60s, per ≥3 contrazioni consecutive
    const get511Status = () => {
        if (history.length < 3) return 'grey';
        const avgInterval = getAvgIntervalMin();
        const avgDuration = history.slice(0, 3).reduce((acc, h) => acc + h.duration, 0) / 3;
        if (avgInterval !== null && avgInterval <= 5 && avgDuration >= 60) return 'red';
        if (avgInterval !== null && avgInterval <= 8 && avgDuration >= 40) return 'yellow';
        return 'green';
    };

    const status511 = get511Status();
    const avgIntervalMin = getAvgIntervalMin();

    const status511Config = {
        grey: { label: 'Inizia a registrare le contrazioni', color: 'var(--stone)', bg: 'rgba(0,0,0,0.05)' },
        green: { label: 'Contrazioni ancora irregolari — stai a casa', color: '#4CAF80', bg: 'rgba(76,175,80,0.1)' },
        yellow: { label: 'Si avvicinano — contatta l\'ostetrica', color: '#F5A623', bg: 'rgba(245,166,35,0.1)' },
        red: { label: '🔴 Regola 5-1-1: vai in ospedale!', color: '#E05252', bg: 'rgba(224,82,82,0.1)' },
    };

    return (
        <div className="ct-wrap">
            <div className="ct-header">
                <Clock size={20} />
                <span>Contrazioni</span>
                {avgIntervalMin && <span className="ct-interval">ogni ~{avgIntervalMin} min</span>}
            </div>

            {/* Indicatore 5-1-1 */}
            <div className="ct-511" style={{ background: status511Config[status511].bg }}>
                <AlertCircle size={14} color={status511Config[status511].color} />
                <span style={{ color: status511Config[status511].color }}>{status511Config[status511].label}</span>
            </div>

            <div className={`ct-display ${running ? 'running' : ''}`}>
                <span className="ct-time">{format(elapsed)}</span>
                <span className="ct-lbl">{running ? 'in corso…' : 'pronta a partire'}</span>
            </div>

            <div className="ct-btns">
                {!running ? (
                    <button className="ct-btn ct-btn--start" onClick={handleStart}>
                        AVVIA CONTRAZIONE
                    </button>
                ) : (
                    <button className="ct-btn ct-btn--stop" onClick={handleStop}>
                        FERMA
                    </button>
                )}
            </div>

            {/* Notifica partner */}
            {partnerId && history.length >= 1 && (
                <button
                    className={`ct-notify-btn ${notified ? 'ct-notify-btn--done' : ''}`}
                    onClick={handleNotifyPartner}
                    disabled={notified}
                >
                    {notified ? `✓ ${partnerName || 'Partner'} avvisato` : `Avvisa ${partnerName || 'il partner'}`}
                </button>
            )}

            {history.length > 0 && (
                <div className="ct-log">
                    {history.slice(0, 5).map(h => (
                        <div key={h.id} className="ct-log-row">
                            <span className="ct-log-dur">{format(h.duration)}</span>
                            <span className="ct-log-t">{h.time}</span>
                        </div>
                    ))}
                </div>
            )}

            {history.length > 0 && (
                <button className="ct-reset-btn" onClick={() => setHistory([])}>Azzera sessione</button>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────
export default function Tools() {
    const navigate = useNavigate();

    return (
        <div className="page page-enter tools-page">
            <h1 className="page-title">Strumenti</h1>
            <p className="page-subtitle">Tracker clinici e promemoria</p>

            <KickCounter />
            <ContractionTimer />

            {/* Link tools */}
            <section className="tools-section">
                <div className="tools-section__header">
                    <h2 className="tools-section__title">Altri strumenti</h2>
                </div>
                <div className="tools-links-grid">
                    <div className="tools-link-card" onClick={() => navigate('/tools/birth-plan')}>
                        <div className="tools-link-icon" style={{ background: 'rgba(61,191,184,0.12)', color: 'var(--aqua)' }}>
                            <FileHeart size={22} />
                        </div>
                        <div className="tools-link-info">
                            <div className="tools-link-title">Piano del Parto</div>
                            <div className="tools-link-sub">Preferenze per il parto</div>
                        </div>
                    </div>
                    <div className="tools-link-card" onClick={() => navigate('/tools/due-date')}>
                        <div className="tools-link-icon" style={{ background: 'rgba(255,183,77,0.12)', color: '#F5A623' }}>
                            <Calculator size={22} />
                        </div>
                        <div className="tools-link-info">
                            <div className="tools-link-title">Data Presunta</div>
                            <div className="tools-link-sub">Calcola la data del parto</div>
                        </div>
                    </div>
                    <div className="tools-link-card" onClick={() => navigate('/tools/hospital-bag')}>
                        <div className="tools-link-icon" style={{ background: 'rgba(156,106,222,0.12)', color: '#9C6ADE' }}>
                            <BriefcaseMedical size={22} />
                        </div>
                        <div className="tools-link-info">
                            <div className="tools-link-title">Valigia Parto</div>
                            <div className="tools-link-sub">Checklist completa</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Appointments */}
            <section className="tools-section">
                <div className="tools-section__header">
                    <h2 className="tools-section__title">
                        <Calendar size={18} />
                        Appuntamenti
                    </h2>
                </div>
                <div className="tools-list">
                    {toolsData.appointments.map(app => (
                        <div key={app.id} className="tools-list-item">
                            <div className="tools-list-item__date">
                                <strong>{app.date}</strong>
                                <span>{app.time}</span>
                            </div>
                            <div className="tools-list-item__info">
                                <h4>{app.title}</h4>
                                <p>{app.doctor}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
