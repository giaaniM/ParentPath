import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Calendar, X, StickyNote } from 'lucide-react';
import './Diary.css';

export default function Diary() {
    const {
        getWeeksPregnant, diaryEntries, addDiaryEntry, removeDiaryEntry,
        babyStatus, getBabyAgeMonths
    } = useUser();
    const currentWeek = getWeeksPregnant();
    const currentMonth = getBabyAgeMonths();
    const isNato = babyStatus === 'nato';

    // Depending on phase, expanded timeline item is week or month
    const [expandedItem, setExpandedItem] = useState(isNato ? `m${currentMonth}` : `w${currentWeek}`);
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteText, setNewNoteText] = useState('');
    const [newNoteType, setNewNoteType] = useState('note'); // 'note' | 'appointment'
    const [newNoteDate, setNewNoteDate] = useState('');
    const [newNoteTime, setNewNoteTime] = useState('');

    const containerRef = useRef(null);
    const currentWeekRef = useRef(null);

    // Auto-scroll to current week/month on mount
    useEffect(() => {
        if (currentWeekRef.current) {
            currentWeekRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isNato]);

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!newNoteText.trim()) return;

        let finalText = newNoteText;
        if (newNoteType === 'appointment') {
            const dateStr = newNoteDate ? `Data: ${newNoteDate}` : '';
            const timeStr = newNoteTime ? `Ore: ${newNoteTime}` : '';
            const meta = [dateStr, timeStr].filter(Boolean).join(' - ');
            if (meta) finalText = `[${meta}]\n${newNoteText}`;
        }

        addDiaryEntry(expandedItem, finalText, newNoteType);

        setNewNoteText('');
        setNewNoteDate('');
        setNewNoteTime('');
        setIsAdding(false);
    };

    const toggleItem = (itemKey) => {
        if (expandedItem === itemKey) {
            setExpandedItem(null);
            setIsAdding(false);
        } else {
            setExpandedItem(itemKey);
            setNewNoteType('note');
            setIsAdding(false);
        }
    };

    // Generate timeline (40 weeks for pregnancy, 12 months for newborn)
    const timelineItems = isNato
        ? Array.from({ length: 12 }, (_, i) => ({ key: `m${i + 1}`, label: `Mese ${i + 1}`, num: i + 1, isCurrent: (i + 1) === currentMonth }))
        : Array.from({ length: 40 }, (_, i) => ({ key: `w${i + 1}`, label: `Settimana ${i + 1}`, num: i + 1, isCurrent: (i + 1) === currentWeek }));

    return (
        <div className="page diary-page page-enter" ref={containerRef}>
            {/* Header */}
            <header className="diary-header">
                <h1 className="diary-title">Il tuo Diario</h1>
            </header>

            <p className="diary-subtitle" style={{ marginBottom: isNato ? '16px' : '32px' }}>
                Appunta i tuoi ricordi, pensieri e appuntamenti {isNato ? 'mese per mese' : 'settimana per settimana'}.
            </p>

            {/* Timeline List */}
            <div className="diary-timeline">
                <div className="diary-line" />

                {timelineItems.map(item => {
                    const isExpanded = expandedItem === item.key;
                    const entries = diaryEntries[item.key] || [];
                    const isPast = isNato ? item.num < currentMonth : item.num < currentWeek;

                    return (
                        <div
                            key={item.key}
                            className={`diary-card-wrap ${item.isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''}`}
                            ref={item.isCurrent ? currentWeekRef : null}
                        >
                            <div className="diary-dot" />
                            <div
                                className={`diary-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleItem(item.key)}
                            >
                                <div className="diary-card-header">
                                    <div className="diary-card-wk">{item.label} {item.isCurrent && <span className="current-badge">Attuale</span>}</div>
                                    <div className="diary-card-count">
                                        {entries.length > 0 && <span className="entry-badge">{entries.length} 📝</span>}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="diary-card-content" onClick={e => e.stopPropagation()}>
                                        {entries.length === 0 && !isAdding && (
                                            <div className="diary-empty">
                                                Nessuna nota per {isNato ? 'questo mese' : 'questa settimana'}.
                                            </div>
                                        )}

                                        {entries.map(entry => (
                                            <div key={entry.id} className={`diary-entry ${entry.type}`}>
                                                <div className="diary-entry-icon">
                                                    {entry.type === 'appointment' ? <Calendar size={16} /> : <StickyNote size={16} />}
                                                </div>
                                                <div className="diary-entry-text">{entry.text}</div>
                                                <button className="diary-entry-del" onClick={() => removeDiaryEntry(item.key, entry.id)}>
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
                                                Aggiungi nota
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
