import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Plus, Calendar, X, StickyNote } from 'lucide-react';
import './Diary.css';

export default function Diary() {
    const navigate = useNavigate();
    const { getWeeksPregnant, diaryEntries, addDiaryEntry, removeDiaryEntry } = useUser();
    const currentWeek = getWeeksPregnant();

    const [expandedWeek, setExpandedWeek] = useState(currentWeek);
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteText, setNewNoteText] = useState('');
    const [newNoteType, setNewNoteType] = useState('note'); // 'note' | 'appointment'
    const [newNoteDate, setNewNoteDate] = useState('');
    const [newNoteTime, setNewNoteTime] = useState('');

    const containerRef = useRef(null);
    const currentWeekRef = useRef(null);

    // Auto-scroll to current week on mount
    useEffect(() => {
        if (currentWeekRef.current) {
            currentWeekRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!newNoteText.trim()) return;

        let extraData = {};
        if (newNoteType === 'appointment') {
            extraData = { date: newNoteDate, time: newNoteTime };
        }

        // Pass everything as text for now, or update the context to handle objects.
        // Wait, UserContext.jsx saves an object with { id, text, type }, I can also pass extra info!
        const payload = {
            text: newNoteText,
            type: newNoteType,
            ...(newNoteType === 'appointment' && { date: newNoteDate, time: newNoteTime })
        };

        // Assuming addDiaryEntry is defined as (week, text, type) in Context... 
        // Wait, I should alter how I call it, or I can stringify the extra info into the text.
        // Or better yet, maybe UserContext just accepts the text, so let's check its definition soon.
        // Actually, if I just pass a custom object maybe it's not supported by context directly?
        // Let's pass the object directly assuming `addDiaryEntry(week, param2, param3)` doesn't strictly typecheck.
        // Wait, UserContext has `addDiaryEntry(weekNum, text, type)`. It hardcodes { id: Date.now(), text, type }. 
        // So I will just format the text string directly!
        let finalText = newNoteText;
        if (newNoteType === 'appointment') {
            const dateStr = newNoteDate ? `Data: ${newNoteDate}` : '';
            const timeStr = newNoteTime ? `Ore: ${newNoteTime}` : '';
            const meta = [dateStr, timeStr].filter(Boolean).join(' - ');
            if (meta) finalText = `[${meta}]\n${newNoteText}`;
        }

        addDiaryEntry(expandedWeek, finalText, newNoteType);

        setNewNoteText('');
        setNewNoteDate('');
        setNewNoteTime('');
        setIsAdding(false);
    };

    const toggleWeek = (week) => {
        if (expandedWeek === week) {
            setExpandedWeek(null);
            setIsAdding(false);
        } else {
            setExpandedWeek(week);
            setNewNoteType('note');
            setIsAdding(false);
        }
    };

    // Generate 40 weeks
    const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

    return (
        <div className="page diary-page page-enter" ref={containerRef}>
            {/* Header */}
            <header className="diary-header">
                <h1 className="diary-title">Il tuo Diario</h1>
            </header>

            <p className="diary-subtitle">
                Appunta i tuoi ricordi, pensieri e appuntamenti settimana per settimana.
            </p>

            {/* Weeks List */}
            <div className="diary-timeline">
                <div className="diary-line" />

                {weeks.map(week => {
                    const isCurrent = week === currentWeek;
                    const isExpanded = expandedWeek === week;
                    const entries = diaryEntries[week] || [];
                    const isPast = week < currentWeek;

                    return (
                        <div
                            key={week}
                            className={`diary-card-wrap ${isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''}`}
                            ref={isCurrent ? currentWeekRef : null}
                        >
                            <div className="diary-dot" />
                            <div
                                className={`diary-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleWeek(week)}
                            >
                                <div className="diary-card-header">
                                    <div className="diary-card-wk">Settimana {week} {isCurrent && <span className="current-badge">Attuale</span>}</div>
                                    <div className="diary-card-count">
                                        {entries.length > 0 && <span className="entry-badge">{entries.length} 📝</span>}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="diary-card-content" onClick={e => e.stopPropagation()}>
                                        {entries.length === 0 && !isAdding && (
                                            <div className="diary-empty">
                                                Nessuna nota per questa settimana.
                                            </div>
                                        )}

                                        {entries.map(entry => (
                                            <div key={entry.id} className={`diary-entry ${entry.type}`}>
                                                <div className="diary-entry-icon">
                                                    {entry.type === 'appointment' ? <Calendar size={16} /> : <StickyNote size={16} />}
                                                </div>
                                                <div className="diary-entry-text">{entry.text}</div>
                                                <button className="diary-entry-del" onClick={() => removeDiaryEntry(week, entry.id)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        {isAdding ? (
                                            <form className="diary-add-form" onSubmit={handleAddSubmit}>
                                                <div className="diary-type-toggles">
                                                    <button
                                                        type="button"
                                                        className={`type-btn ${newNoteType === 'note' ? 'active' : ''}`}
                                                        onClick={() => setNewNoteType('note')}
                                                    >Nota</button>
                                                    <button
                                                        type="button"
                                                        className={`type-btn ${newNoteType === 'appointment' ? 'active' : ''}`}
                                                        onClick={() => setNewNoteType('appointment')}
                                                    >Appunt.</button>
                                                </div>

                                                {newNoteType === 'appointment' && (
                                                    <div className="diary-appointment-fields">
                                                        <input
                                                            type="date"
                                                            className="diary-input-date"
                                                            value={newNoteDate}
                                                            onChange={e => setNewNoteDate(e.target.value)}
                                                        />
                                                        <input
                                                            type="time"
                                                            className="diary-input-time"
                                                            value={newNoteTime}
                                                            onChange={e => setNewNoteTime(e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <textarea
                                                    autoFocus
                                                    placeholder={newNoteType === 'appointment' ? "Dettagli dell'appuntamento (es. visita ginecologica)..." : "Scrivi una nota..."}
                                                    value={newNoteText}
                                                    onChange={e => setNewNoteText(e.target.value)}
                                                    rows={3}
                                                />
                                                <div className="diary-form-actions">
                                                    <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>Annulla</button>
                                                    <button type="submit" className="btn-save" disabled={!newNoteText.trim()}>Salva</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button className="diary-add-btn" onClick={() => setIsAdding(true)}>
                                                <Plus size={18} /> Aggiungi nota
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Bottom Padding for scroll room */}
            <div style={{ height: '40px' }} />
        </div>
    );
}
