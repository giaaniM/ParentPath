import { useState, useMemo, useRef, useEffect } from 'react';
import { usePregnancyDataQuery } from '../hooks/usePregnancyDataQuery';
import { useUser } from '../context/UserContext';
import { useWeekData } from '../hooks/useWeekData';
import { pregnancyTasks, newbornTasks } from '../data/mockData';
import {
    ChevronLeft, ChevronRight, Plus, Calendar, Clock,
    MapPin, Sparkles, X, Check, Info, Stethoscope
} from 'lucide-react';
import AddAppointmentModal from '../components/AddAppointmentModal';
import { useToast } from '../context/ToastContext';
import './Agenda.css';

const PRIORITY_ORDER = { critica: 0, alta: 1, media: 2, bassa: 3 };

export default function Agenda() {
    const {
        babyStatus, partnerName,
        toggleTaskCompleted, isTaskCompleted, completedTasks,
        getNotesForWeek, addNote, removeNote, updateNote, notes,
        getAppointmentsForWeek, addAppointment, removeAppointment, updateAppointment,
        getCustomTasksForWeek, addCustomTask, removeCustomTask, updateCustomTask,
        dismissTask, isTaskDismissed, getWeeksPregnant, getBabyAgeMonths, setMockWeek, mockWeek,
    } = useUser();
    const { showToast } = useToast();

    const isBorn = babyStatus === 'nato';
    // Post-birth months are stored with weekNumber offset 100 (month 1 = key 101, month 2 = 102, ...)
    const MONTH_OFFSET = 100;
    const monthToKey = (m) => MONTH_OFFSET + m;

    const currentWeek = getWeeksPregnant();
    const currentMonth = getBabyAgeMonths();
    const currentKey = isBorn ? monthToKey(currentMonth) : currentWeek;
    const [selectedKey, setSelectedKey] = useState(currentKey);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showApptModal, setShowApptModal] = useState(false);
    const [editingNote, setEditingNote] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [selectedTaskWhy, setSelectedTaskWhy] = useState(null);

    // New task modal state
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskNote, setNewTaskNote] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('entrambi');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskText, setEditingTaskText] = useState('');
    const [swipingTaskId, setSwipingTaskId] = useState(null);
    const touchStartX = useRef(null);

    // Modal swipe logic (shared with task modal)
    const taskModalRef = useRef(null);
    const apptModalRef = useRef(null);
    const modalDragY = useRef(0);
    const modalStartY = useRef(0);
    const [isModalSwiping, setIsModalSwiping] = useState(false);

    const handleModalTouchStart = (e) => {
        modalStartY.current = e.touches[0].clientY;
        setIsModalSwiping(true);
    };

    const handleModalTouchMove = (e, ref) => {
        if (!isModalSwiping) return;
        const deltaY = e.touches[0].clientY - modalStartY.current;
        if (deltaY > 0) {
            modalDragY.current = deltaY;
            if (ref.current) ref.current.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const handleModalTouchEnd = (setter, ref) => {
        setIsModalSwiping(false);
        if (modalDragY.current > 100) {
            setter(false);
        }
        if (ref.current) ref.current.style.transform = '';
        modalDragY.current = 0;
    };

    const weekData = useWeekData(isBorn ? 0 : selectedKey);
    const notesForWeek = getNotesForWeek(selectedKey);
    const customTasks = getCustomTasksForWeek(selectedKey);
    const appointments = getAppointmentsForWeek(selectedKey);

    // Combine JSON suggested tasks + user custom tasks
    const allTasks = useMemo(() => {
        const jsonTasks = isBorn ? [] : (weekData?.tasks || []);

        const combined = [...jsonTasks, ...customTasks];
        // Filter out empty tasks, dismissed tasks, and sort
        return combined
            .filter(t => t.text && t.text.trim())
            .filter(t => !isTaskDismissed(t.id))
            .sort((a, b) => {
                const aCompleted = isTaskCompleted(selectedKey, a.id) ? 1 : 0;
                const bCompleted = isTaskCompleted(selectedKey, b.id) ? 1 : 0;
                if (aCompleted !== bCompleted) return aCompleted - bCompleted;
                return (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3);
            });
    }, [weekData, customTasks, selectedKey, isTaskCompleted, isTaskDismissed, isBorn]);

    // React Query gestisce il loading/refetch automaticamente
    const { isLoading: agendaLoading, isFetching: agendaFetching } = usePregnancyDataQuery();

    // Reset swiping and editing when key changes
    useEffect(() => {
        setSwipingTaskId(null);
        setEditingTaskId(null);
    }, [selectedKey]);

    const pillsScrollRef = useRef(null);

    // Auto-scroll to current pill on mount
    useEffect(() => {
        if (pillsScrollRef.current) {
            const currentPill = pillsScrollRef.current.querySelector('.agenda-pill.current');
            if (currentPill) {
                currentPill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [currentKey]);

    // Calculate the date range for a given week
    const getWeekDateRange = (week) => {
        const diffFromCurrent = week - currentWeek;
        const now = new Date();
        const startOfCurrentWeek = new Date(now);
        startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        const startOfTargetWeek = new Date(startOfCurrentWeek);
        startOfTargetWeek.setDate(startOfTargetWeek.getDate() + diffFromCurrent * 7);
        const endOfTargetWeek = new Date(startOfTargetWeek);
        endOfTargetWeek.setDate(endOfTargetWeek.getDate() + 6);

        const fmt = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
        return `${fmt(startOfTargetWeek)} – ${fmt(endOfTargetWeek)}`;
    };

    const getWeekMonthInfo = (week) => {
        const diffFromCurrent = week - currentWeek;
        const now = new Date();
        const startOfCurrentWeek = new Date(now);
        startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        const startOfTargetWeek = new Date(startOfCurrentWeek);
        startOfTargetWeek.setDate(startOfTargetWeek.getDate() + diffFromCurrent * 7);
        return startOfTargetWeek.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        addCustomTask({
            text: newTaskText.trim(),
            note: newTaskNote.trim(),
            assignee: newTaskAssignee,
            priority: 'media',
            category: 'preparazione',
            weekNumber: selectedKey,
        });
        setNewTaskText('');
        setNewTaskNote('');
        setNewTaskAssignee('entrambi');
        setShowTaskModal(false);
    };

    const handleRemoveNote = (id, type) => {
        if (type === 'custom') {
            updateCustomTask(id, { note: '' });
        } else if (type === 'appointment') {
            updateAppointment(id, { notes: '' });
        }
        setSelectedTaskWhy(null);
    };

    const handleDeleteTask = (task) => {
        if (task.suggested) {
            dismissTask(task.id);
        } else {
            removeCustomTask(task.id);
        }
        setSwipingTaskId(null);
    };

    const handleStartEditTask = (task) => {
        if (task.suggested) return; // Suggested tasks can't be edited
        setEditingTaskId(task.id);
        setEditingTaskText(task.text);
    };

    const handleSaveTaskEdit = () => {
        if (editingTaskText.trim()) {
            updateCustomTask(editingTaskId, { text: editingTaskText.trim() });
        }
        setEditingTaskId(null);
    };

    const handleTouchStart = (e, taskId) => {
        if (selectedKey !== currentKey) return;
        if (swipingTaskId && swipingTaskId !== taskId) {
            setSwipingTaskId(null);
        }
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e, taskId) => {
        if (selectedKey !== currentKey) return;
        if (!touchStartX.current) return;
        const deltaX = touchStartX.current - e.touches[0].clientX;
        if (deltaX > 50) {
            setSwipingTaskId(taskId);
        } else if (deltaX < -50 && swipingTaskId === taskId) {
            setSwipingTaskId(null);
        }
    };

    const getAssigneeBadge = (assignee) => {
        if (assignee === 'mamma') return { label: 'MAMMA', className: 'badge-mamma' };
        if (assignee === 'partner' || assignee === 'papa') return { label: 'PAPÀ', className: 'badge-partner' };
        return { label: 'ENTRAMBI', className: 'badge-entrambi' };
    };

    const getPriorityBadge = (priority) => {
        if (priority === 'critica') return { label: '!', className: 'priority-critica' };
        if (priority === 'alta') return { label: '↑', className: 'priority-alta' };
        return null;
    };

    return (
        <div className="page agenda-page">
            {(agendaLoading || agendaFetching) && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', opacity: 0.55 }}>
                    <div className="ptr-spinner ptr-spinning" />
                </div>
            )}
            {/* ── SMART NAVIGATION ── */}
            <div className="agenda-smart-nav">
                <div className="agenda-smart-header">
                    <div className="agenda-nav-center">
                        {isBorn ? (
                            <h1 className="agenda-nav-title">Mese {selectedKey - MONTH_OFFSET}</h1>
                        ) : (
                            <>
                                <h1 className="agenda-nav-title">Settimana {selectedKey}</h1>
                                <p className="agenda-nav-dates">{getWeekDateRange(selectedKey)}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="agenda-pills-scroll" ref={pillsScrollRef}>
                    <div className="agenda-pills">
                        {isBorn ? (
                            Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                                const key = monthToKey(m);
                                const isSelected = selectedKey === key;
                                const isCurrent = currentMonth === m;
                                return (
                                    <div key={key} className="agenda-pill-item">
                                        <button
                                            className={`agenda-pill ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                                            onClick={() => setSelectedKey(key)}
                                        >
                                            <span className="agenda-pill-label">MESE</span>
                                            <span className="agenda-pill-num">{m}</span>
                                            {isCurrent && !isSelected && <div className="agenda-pill-dot" />}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            Array.from({ length: 42 }, (_, i) => i + 1).map(w => {
                                const isSelected = selectedKey === w;
                                const isCurrent = currentWeek === w;
                                const monthStr = getWeekMonthInfo(w);
                                return (
                                    <div key={w} className="agenda-pill-item">
                                        <button
                                            className={`agenda-pill ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                                            onClick={() => setSelectedKey(w)}
                                        >
                                            <span className="agenda-pill-label">SETT</span>
                                            <span className="agenda-pill-num">{w}</span>
                                            <span className="agenda-pill-month">{monthStr}</span>
                                            {isCurrent && !isSelected && <div className="agenda-pill-dot" />}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ── HERO CARD (Notes + Appointments) ── */}
            <div className="agenda-hero-card">

                <div className="agenda-section-header-inline">
                    <span className="agenda-section-title-small">NOTE</span>
                    <button className="agenda-add-inline-link" onClick={() => setEditingNote(true)}>
                        <Plus size={14} /> Aggiungi
                    </button>
                </div>

                <div className="agenda-note-section">
                    {editingNote && (
                        <div className="agenda-note-display" onClick={e => e.stopPropagation()} style={{ marginBottom: '12px' }}>
                            <div className="agenda-note-editor">
                                <textarea
                                    className="agenda-note-textarea"
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    autoFocus
                                    placeholder="Scrivi una nota per questa settimana..."
                                />
                                <div className="agenda-note-actions">
                                    <button className="agenda-btn-secondary" onClick={() => { setEditingNote(false); setNoteText(''); }}>Annulla</button>
                                    <button className="agenda-btn-primary" onClick={() => {
                                        if(noteText.trim()) {
                                            const isFirst = !notes || notes.length === 0;
                                            addNote({ weekNumber: selectedKey, text: noteText.trim() });
                                            showToast({
                                                title: isFirst ? 'Prima nota scritta!' : 'Nota salvata',
                                                subtitle: isFirst ? 'Un ricordo che rimarrà per sempre.' : undefined,
                                                type: 'note',
                                            });
                                        }
                                        setEditingNote(false);
                                        setNoteText('');
                                    }}>Salva</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="agenda-appt-list-hero" style={{ marginBottom: '24px' }}>
                        {notesForWeek.length === 0 && !editingNote ? (
                            <div className="agenda-appt-empty">{isBorn ? 'Nessuna nota per questo mese' : 'Nessuna nota per questa settimana'}</div>
                        ) : (
                            notesForWeek.map(note => (
                                <div key={note.id} className="agenda-note-display" style={{ padding: '16px', marginBottom: '8px', cursor: 'default' }}>
                                    <div className="agenda-note-header-row" style={{ alignItems: 'flex-start' }}>
                                        <p className="agenda-note-text" style={{ flex: 1, margin: 0, paddingRight: '12px', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                                        <button 
                                            className="agenda-note-clear-btn" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNote(note.id);
                                            }}
                                            style={{ padding: '4px', marginTop: '-4px' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="agenda-section-header-inline">
                    <span className="agenda-section-title-small">VISITE</span>
                    <button className="agenda-add-inline-link" onClick={() => setShowApptModal(true)}>
                        <Plus size={14} /> Aggiungi
                    </button>
                </div>

                <div className="agenda-appt-list-hero">
                    {appointments.length === 0 ? (
                        <div className="agenda-appt-empty">Nessuna visita in programma</div>
                    ) : (
                        appointments.map(appt => (
                            <div key={appt.id} className="agenda-appt-item-hero">
                                <div className="agenda-appt-icon-hero">
                                    <Stethoscope size={20} />
                                </div>
                                <div className="agenda-appt-info-hero">
                                    <div className="agenda-appt-name-row">
                                        <span className="agenda-appt-name">{appt.name}</span>
                                        <div className="agenda-appt-actions-hero">
                                            {(appt.location || appt.note) && (
                                                <button 
                                                    className="agenda-appt-info-btn-hero"
                                                    onClick={() => setSelectedTaskWhy({ 
                                                        id: appt.id,
                                                        text: appt.name, 
                                                        why: appt.note || appt.location, 
                                                        type: 'appointment' 
                                                    })}
                                                >
                                                    <Info size={14} />
                                                </button>
                                            )}
                                            <button className="agenda-appt-del-hero" onClick={() => removeAppointment(appt.id)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="agenda-appt-meta-hero">
                                        <span className="agenda-appt-time-pill">{appt.date} • {appt.time}</span>
                                    </div>
                                    {appt.location && (
                                        <div className="agenda-appt-loc-hero">
                                            <MapPin size={10} /> {appt.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── TASK LIST ── */}
            <div className="agenda-tasks-section">
                <div className="agenda-section-header">
                    <span className="agenda-section-title">{isBorn ? 'Task del Mese' : 'Task della Settimana'}</span>
                    <span className="agenda-task-ratio">
                        {allTasks.filter(t => isTaskCompleted(selectedKey, t.id)).length}/{allTasks.length}
                    </span>
                </div>

                <div className="agenda-tasks-card">
                    <div className="agenda-task-list-unified">
                        {allTasks.length === 0 ? (
                            <div className="agenda-tasks-empty">{isBorn ? 'Nessun task per questo mese' : 'Nessun task per questa settimana'}</div>
                        ) : (
                            allTasks.map(task => {
                                const completed = isTaskCompleted(selectedKey, task.id);
                                const assignee = getAssigneeBadge(task.assignee);
                                const priority = getPriorityBadge(task.priority);
                                const isEditing = editingTaskId === task.id;
                                const isSwiping = swipingTaskId && swipingTaskId === task.id && selectedKey === currentKey;

                                return (
                                    <div
                                        key={task.id}
                                        className={`agenda-task-item-container ${isSwiping ? 'swiping' : ''}`}
                                        onTouchStart={(e) => handleTouchStart(e, task.id)}
                                        onTouchMove={(e) => handleTouchMove(e, task.id)}
                                    >
                                        <div
                                            className={`agenda-task-row ${completed ? 'completed' : ''} ${task.suggested ? 'suggested' : ''} ${selectedKey !== currentKey ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (isEditing) return;
                                                if (isSwiping) {
                                                    setSwipingTaskId(null);
                                                } else {
                                                    if (selectedKey === currentKey) {
                                                        const wasCompleted = isTaskCompleted(selectedKey, task.id);
                                                        const isFirstEver = Object.keys(completedTasks || {}).length === 0;
                                                        toggleTaskCompleted(selectedKey, task.id);
                                                        if (!wasCompleted) {
                                                            showToast({
                                                                title: isFirstEver ? 'Primo task completato!' : 'Task completato',
                                                                subtitle: isFirstEver ? 'Continua così, stai andando benissimo.' : `"${task.text.slice(0, 36)}"`,
                                                                type: 'task',
                                                            });
                                                        }
                                                    }
                                                }
                                            }}
                                            style={selectedKey !== currentKey ? { opacity: 0.6 } : {}}
                                        >
                                            {task.suggested && (
                                                <div className="agenda-task-suggested-indicator">
                                                    <Sparkles size={12} />
                                                </div>
                                            )}
                                            <div className={`agenda-task-check ${completed ? 'checked' : ''}`}>
                                                {completed && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <div className="agenda-task-content" onClick={(e) => {
                                                if (!task.suggested) {
                                                    e.stopPropagation();
                                                    handleStartEditTask(task);
                                                }
                                            }}>
                                                {isEditing ? (
                                                    <input
                                                        className="agenda-task-edit-input"
                                                        value={editingTaskText}
                                                        onChange={(e) => setEditingTaskText(e.target.value)}
                                                        onBlur={handleSaveTaskEdit}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTaskEdit()}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="agenda-task-text" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <span style={{ flex: 1, paddingTop: '2px' }}>{task.text || 'Task senza descrizione'}</span>
                                                        {(task.why || task.note) && (
                                                            <div 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTaskWhy({ 
                                                                        id: task.id,
                                                                        text: task.text, 
                                                                        why: task.why || task.note,
                                                                        type: task.suggested ? 'suggested' : 'custom'
                                                                    });
                                                                }}
                                                                style={{ 
                                                                    color: 'var(--primary)', 
                                                                    cursor: 'pointer', 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    backgroundColor: 'var(--stone-light)', 
                                                                    padding: '6px', 
                                                                    borderRadius: '50%', 
                                                                    marginTop: '6px',
                                                                    marginRight: '4px' 
                                                                }}
                                                                className="agenda-info-icon"
                                                            >
                                                                <Info size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="agenda-task-badges">
                                                    <span className={`agenda-badge ${assignee.className}`}>{assignee.label}</span>
                                                    {priority && (
                                                        <span className={`agenda-badge ${priority.className}`}>{priority.label}</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Web-only delete button (hidden by default, shows on hover in CSS) */}
                                            <button className="agenda-task-delete-btn-inline" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(task);
                                            }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                        {selectedKey === currentKey && (
                                            <div className="agenda-task-delete-action" onClick={() => handleDeleteTask(task)}>
                                                <span>Elimina</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <button className="agenda-add-task-dashed-btn" onClick={() => setShowTaskModal(true)}>
                        <Plus size={16} /> Aggiungi task
                    </button>
                </div>
            </div>

            {/* ── ADD TASK MODAL ── */}
            {showTaskModal && (
                <div className="agenda-modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div 
                        className={`agenda-modal ${isModalSwiping ? 'swiping' : ''}`} 
                        ref={taskModalRef}
                        onClick={e => e.stopPropagation()}
                        onTouchStart={handleModalTouchStart}
                        onTouchMove={(e) => handleModalTouchMove(e, taskModalRef)}
                        onTouchEnd={() => handleModalTouchEnd(setShowTaskModal, taskModalRef)}
                    >
                        <div className="bd-bottom-sheet-handle" style={{ margin: '-12px auto 16px', background: 'rgba(0,0,0,0.08)' }} />
                        <div className="agenda-modal-header">
                            <h3>Nuovo Task</h3>
                            <button className="agenda-modal-close" onClick={() => setShowTaskModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="agenda-modal-body">
                            <input
                                className="agenda-input"
                                type="text"
                                placeholder="Cosa devi fare?"
                                value={newTaskText}
                                onChange={e => setNewTaskText(e.target.value)}
                                autoFocus
                            />
                            <textarea
                                className="agenda-textarea"
                                placeholder="Aggiungi una nota (opzionale)..."
                                value={newTaskNote}
                                onChange={e => setNewTaskNote(e.target.value)}
                                rows={2}
                                style={{ 
                                    marginTop: '12px', 
                                    width: '100%', 
                                    borderRadius: '12px', 
                                    padding: '12px', 
                                    border: '1px solid var(--border)', 
                                    fontFamily: 'inherit', 
                                    fontSize: '14px',
                                    background: 'rgba(0,0,0,0.02)',
                                    resize: 'none'
                                }}
                            />
                            <div className="agenda-assignee-picker">
                                <label>Assegna a:</label>
                                <div className="agenda-assignee-options">
                                    {['mamma', 'partner', 'entrambi'].map(a => (
                                        <button
                                            key={a}
                                            className={`agenda-assignee-opt ${newTaskAssignee === a ? 'active' : ''}`}
                                            onClick={() => setNewTaskAssignee(a)}
                                        >
                                            {a === 'mamma' ? 'Mamma' : a === 'partner' || a === 'papa' ? 'Papà' : 'Entrambi'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="agenda-modal-cta" onClick={handleAddTask} disabled={!newTaskText.trim()}>
                            Aggiungi
                        </button>
                    </div>
                </div>
            )}

            {/* ── TASK INFO MODAL ── */}
            {selectedTaskWhy && (
                <div className="agenda-modal-overlay" onClick={() => setSelectedTaskWhy(null)}>
                    <div className="agenda-modal" onClick={e => e.stopPropagation()}>
                        <div className="bd-bottom-sheet-handle" style={{ margin: '-12px auto 16px', background: 'rgba(0,0,0,0.08)' }} />
                        <div className="agenda-modal-header">
                            <h3>Dettaglio Task</h3>
                            <button className="agenda-modal-close" onClick={() => setSelectedTaskWhy(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="agenda-modal-body" style={{ padding: '0 20px 0px' }}>
                            <p style={{ fontWeight: 600, marginBottom: '16px', fontSize: '16px', color: 'var(--midnight)' }}>{selectedTaskWhy.text}</p>
                            <div style={{ backgroundColor: 'var(--stone-light)', padding: '16px', borderRadius: '12px', fontSize: '15px', color: 'var(--midnight)', lineHeight: 1.5 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
                                    <Info size={18} />
                                    <span style={{ fontWeight: 700 }}>
                                        {selectedTaskWhy.type === 'suggested' ? 'Perché è importante?' : 'Note:'}
                                    </span>
                                    {(selectedTaskWhy.type === 'custom' || selectedTaskWhy.type === 'appointment') && (
                                        <button 
                                            onClick={() => handleRemoveNote(selectedTaskWhy.id, selectedTaskWhy.type)}
                                            style={{ 
                                                marginLeft: 'auto', 
                                                background: 'none', 
                                                border: 'none', 
                                                color: 'var(--stone)', 
                                                opacity: 0.6,
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                {selectedTaskWhy.why}
                            </div>
                        </div>
                        <button className="agenda-modal-cta" onClick={() => setSelectedTaskWhy(null)} style={{ margin: '20px', width: 'calc(100% - 40px)' }}>
                            Ho capito
                        </button>
                    </div>
                </div>
            )}

            {/* SHARED ADD APPOINTMENT MODAL */}
            <AddAppointmentModal
                isOpen={showApptModal}
                onClose={() => setShowApptModal(false)}
                weekNumber={selectedKey}
            />
        </div>
    );
}
