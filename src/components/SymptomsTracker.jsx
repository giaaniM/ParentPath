import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import './SymptomsTracker.css';

const SYMPTOMS = [
    { id: 'nausea', label: 'Nausea', emoji: '🤢' },
    { id: 'stanchezza', label: 'Stanchezza', emoji: '😴' },
    { id: 'gonfiore', label: 'Gonfiore', emoji: '🫧' },
    { id: 'acidita', label: 'Acidità', emoji: '🔥' },
    { id: 'mal_testa', label: 'Mal di testa', emoji: '🤕' },
    { id: 'schiena', label: 'Schiena', emoji: '😬' },
    { id: 'braxton', label: 'Braxton-Hicks', emoji: '💙' },
    { id: 'insonnia', label: 'Insonnia', emoji: '🌙' },
    { id: 'altro', label: 'Altro', emoji: '➕' },
];

export default function SymptomsTracker({ currentWeek }) {
    const { addSymptomLog, getTodaySymptoms, removeSymptomLog } = useUser();
    const [activeSymptom, setActiveSymptom] = useState(null); // { id, label } quando selezione intensità
    const [showHistory, setShowHistory] = useState(false);
    const todaySymptoms = getTodaySymptoms();

    const handleSymptomTap = (s) => {
        // Se già loggato oggi, non fare nulla (mostra badge)
        const alreadyLogged = todaySymptoms.find(t => t.symptom === s.id);
        if (alreadyLogged) return;
        setActiveSymptom(s);
    };

    const handleIntensity = (intensity) => {
        if (!activeSymptom) return;
        addSymptomLog(activeSymptom.id, intensity, '', null, currentWeek);
        setActiveSymptom(null);
    };

    return (
        <div className="st-wrap">
            <div className="st-header">
                <span className="st-title">Sintomi di oggi</span>
                {todaySymptoms.length > 0 && (
                    <button className="st-history-btn" onClick={() => setShowHistory(v => !v)}>
                        {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {todaySymptoms.length}
                    </button>
                )}
            </div>

            <div className="st-chips">
                {SYMPTOMS.map(s => {
                    const logged = todaySymptoms.find(t => t.symptom === s.id);
                    return (
                        <button
                            key={s.id}
                            className={`st-chip ${logged ? 'st-chip--logged' : ''}`}
                            onClick={() => handleSymptomTap(s)}
                        >
                            <span className="st-chip-emoji">{s.emoji}</span>
                            <span className="st-chip-label">{s.label}</span>
                            {logged && (
                                <span
                                    className="st-chip-remove"
                                    onClick={(e) => { e.stopPropagation(); removeSymptomLog(logged.id); }}
                                >
                                    <X size={10} />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Modal intensità */}
            {activeSymptom && (
                <div className="st-intensity-overlay" onClick={() => setActiveSymptom(null)}>
                    <div className="st-intensity-card" onClick={e => e.stopPropagation()}>
                        <div className="st-intensity-title">
                            {activeSymptom.emoji} {activeSymptom.label}
                        </div>
                        <div className="st-intensity-subtitle">Quanto è intenso?</div>
                        <div className="st-intensity-btns">
                            {[
                                { v: 1, label: 'Lieve', color: '#4CAF80' },
                                { v: 2, label: 'Moderato', color: '#F5A623' },
                                { v: 3, label: 'Forte', color: '#E05252' },
                            ].map(({ v, label, color }) => (
                                <button
                                    key={v}
                                    className="st-intensity-btn"
                                    style={{ '--intensity-color': color }}
                                    onClick={() => handleIntensity(v)}
                                >
                                    <span className="st-intensity-dots">
                                        {Array.from({ length: v }).map((_, i) => (
                                            <span key={i} className="st-intensity-dot" style={{ background: color }} />
                                        ))}
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button className="st-intensity-cancel" onClick={() => setActiveSymptom(null)}>Annulla</button>
                    </div>
                </div>
            )}

            {/* Storico oggi */}
            {showHistory && todaySymptoms.length > 0 && (
                <div className="st-history">
                    {todaySymptoms.map(s => {
                        const sym = SYMPTOMS.find(x => x.id === s.symptom);
                        const intensityLabels = ['', 'Lieve', 'Moderato', 'Forte'];
                        return (
                            <div key={s.id} className="st-history-row">
                                <span>{sym?.emoji || '•'} {sym?.label || s.symptom}</span>
                                <span className="st-history-intensity">{intensityLabels[s.intensity] || ''}</span>
                                <button className="st-history-del" onClick={() => removeSymptomLog(s.id)}>
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
