import { useState, useRef, useEffect, useCallback } from 'react';
import { toolsData } from '../data/mockData';
import { Calendar, Clock, Baby } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [history, setHistory] = useState([]);
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
    }, [running]);

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
            const now = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            setHistory(h => [{ duration: elapsed, time: now, id: Date.now() }, ...h].slice(0, 5));
        }
        setElapsed(0);
    };

    const lastInterval = history.length >= 2
        ? Math.round((new Date(`2000-01-01T${history[0].time}`) - new Date(`2000-01-01T${history[1].time}`)) / 60000)
        : null;

    return (
        <div className="ct-wrap">
            <div className="ct-header">
                <Clock size={20} />
                <span>Contrazioni</span>
                {lastInterval && <span className="ct-interval">ogni ~{Math.abs(lastInterval)} min</span>}
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

            {history.length > 0 && (
                <div className="ct-log">
                    {history.map(h => (
                        <div key={h.id} className="ct-log-row">
                            <span className="ct-log-dur">{format(h.duration)}</span>
                            <span className="ct-log-t">{h.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────
export default function Tools() {
    return (
        <div className="page page-enter tools-page">
            <h1 className="page-title">Strumenti</h1>
            <p className="page-subtitle">Tracker clinici e promemoria</p>

            <KickCounter />
            <ContractionTimer />

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
