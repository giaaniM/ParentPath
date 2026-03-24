import { useState, useMemo, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useWeekData } from '../hooks/useWeekData';
import { pregnancyTasks, newbornTasks } from '../data/mockData';
import {
    ChevronLeft, ChevronRight, Plus, Calendar, Clock,
    MapPin, Sparkles, X, Check, Info, Stethoscope
} from 'lucide-react';
import AddAppointmentModal from '../components/AddAppointmentModal';
import './Agenda.css';

const PRIORITY_ORDER = { critica: 0, alta: 1, media: 2, bassa: 3 };

export default function Agenda() {
    const {
        babyStatus, partnerName,
        toggleTaskCompleted, isTaskCompleted,
        getWeekNote, setWeekNote,
        getAppointmentsForWeek, addAppointment, removeAppointment,
        getCustomTasksForWeek, addCustomTask, removeCustomTask, updateCustomTask,
        dismissTask, isTaskDismissed, getWeeksPregnant, setMockWeek, mockWeek
    } = useUser();

    const currentWeek = getWeeksPregnant();
    const [selectedWeek, setSelectedWeek] = useState(currentWeek);
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

    const weekData = useWeekData(selectedWeek);
    const weekNote = getWeekNote(selectedWeek);
    const userAppointments = getAppointmentsForWeek(selectedWeek);
    const customTasks = getCustomTasksForWeek(selectedWeek);

    const appointments = getAppointmentsForWeek(selectedWeek);

    // Combine JSON suggested tasks + user custom tasks
    const allTasks = useMemo(() => {
        const jsonTasks = weekData?.tasks || [];
        
        const combined = [...jsonTasks, ...customTasks];
        // Filter out empty tasks, dismissed tasks, and sort
        return combined
            .filter(t => t.text && t.text.trim())
            .filter(t => !isTaskDismissed(t.id))
            .sort((a, b) => {
                const aCompleted = isTaskCompleted(selectedWeek, a.id) ? 1 : 0;
                const bCompleted = isTaskCompleted(selectedWeek, b.id) ? 1 : 0;
                if (aCompleted !== bCompleted) return aCompleted - bCompleted;
                return (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3);
            });
    }, [weekData, customTasks, selectedWeek, isTaskCompleted, isTaskDismissed]);

    // Reset swiping and editing when week changes
    useEffect(() => {
        setSwipingTaskId(null);
        setEditingTaskId(null);
    }, [selectedWeek]);

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

    // Week pill strip
    const weekPills = useMemo(() => {
        const pills = [];
        const start = Math.max(1, selectedWeek - 6);
        const end = Math.min(42, selectedWeek + 6);
        for (let w = start; w <= end; w++) pills.push(w);
        return pills;
    }, [selectedWeek]);

    const handleStartEditNote = () => {
        setNoteText(weekNote);
        setEditingNote(true);
    };

    const handleSaveNote = () => {
        setWeekNote(selectedWeek, noteText);
        setEditingNote(false);
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        addCustomTask({
            text: newTaskText.trim(),
            note: newTaskNote.trim(),
            assignee: newTaskAssignee,
            priority: 'media',
            category: 'preparazione',
            weekNumber: selectedWeek,
        });
        setNewTaskText('');
        setNewTaskNote('');
        setNewTaskAssignee('entrambi');
        setShowTaskModal(false);
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
        if (selectedWeek !== currentWeek) return;
        if (swipingTaskId && swipingTaskId !== taskId) {
            setSwipingTaskId(null);
        }
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e, taskId) => {
        if (selectedWeek !== currentWeek) return;
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
            {/* ── WEEK NAVIGATION ── */}
            <div className="agenda-nav">
                <div className="agenda-nav-header">
                    <button className="agenda-nav-arrow" onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}>
                        <ChevronLeft size={22} />
                    </button>
                    <div className="agenda-nav-center">
                        <div className="agenda-nav-title">
                            {babyStatus === 'nato' ? `Mese ${selectedWeek}` : `Settimana ${selectedWeek}`}
                        </div>
                        <div className="agenda-nav-dates">{getWeekDateRange(selectedWeek)}</div>
                    </div>
                    <button className="agenda-nav-arrow" onClick={() => setSelectedWeek(w => Math.min(42, w + 1))}>
                        <ChevronRight size={22} />
                    </button>
                </div>

                {/* Pill strip */}
                <div className="agenda-pills-scroll">
                    <div className="agenda-pills">
                        {weekPills.map(w => (
                            <button
                                key={w}
                                className={`agenda-pill ${w === selectedWeek ? 'selected' : ''} ${w === currentWeek ? 'current' : ''}`}
                                onClick={() => setSelectedWeek(w)}
                            >
                                {w}
                                {w === currentWeek && <span className="agenda-pill-dot" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── HERO CARD ── */}
            <div className="agenda-hero-card">
                <div className="agenda-hero-header">
                    <span className="agenda-hero-label">
                        Settimana {selectedWeek}
                    </span>
                    {selectedWeek === currentWeek && (
                        <span className="agenda-badge-attuale">ATTUALE</span>
                    )}
                </div>

                {/* Note */}
                <div className="agenda-note-section">
                    {editingNote ? (
                        <div className="agenda-note-editor">
                            <textarea
                                className="agenda-note-textarea"
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Scrivi una nota per questa settimana..."
                                autoFocus
                                rows={3}
                            />
                            <div className="agenda-note-actions">
                                <button className="agenda-btn-secondary" onClick={() => setEditingNote(false)}>Annulla</button>
                                <button className="agenda-btn-primary" onClick={handleSaveNote}>Salva</button>
                            </div>
                        </div>
                    ) : (
                        <div className="agenda-note-display" onClick={handleStartEditNote}>
                            {weekNote
                                ? <p className="agenda-note-text">{weekNote}</p>
                                : <p className="agenda-note-placeholder">Nessuna nota per questa settimana. Aggiungi nota ✏️</p>
                            }
                        </div>
                    )}
                </div>

                {/* Appointments */}
                <div className="agenda-appt-section">
                    <div className="agenda-appt-header">
                        <span className="agenda-appt-title">Appuntamenti</span>
                        <button className="agenda-add-btn" onClick={() => setShowApptModal(true)}>
                            <Plus size={16} /> Aggiungi
                        </button>
                    </div>
                    {appointments.length === 0 ? (
                        <div className="agenda-appt-empty">Nessun appuntamento</div>
                    ) : (
                        <div className="agenda-appt-list">
                            {appointments.sort((a, b) => a.time.localeCompare(b.time)).map(appt => (
                                <div key={appt.id} className="agenda-appt-item">
                                    <div className="agenda-appt-icon">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div className="agenda-appt-info">
                                        <div className="agenda-appt-name">{appt.name}</div>
                                        <div className="agenda-appt-meta">
                                            {appt.date && (
                                                <span className="agenda-appt-meta-pill">
                                                    <Calendar size={12} strokeWidth={2.5} />
                                                    {appt.date.split('-').reverse().slice(0, 2).join('/')}
                                                </span>
                                            )}
                                            <span className="agenda-appt-meta-pill">
                                                <Clock size={12} strokeWidth={2.5} />
                                                {appt.time}
                                            </span>
                                            {appt.location && (
                                                <span className="agenda-appt-meta-text">
                                                    <MapPin size={12} strokeWidth={2.5} />
                                                    {appt.location}
                                                </span>
                                            )}
                                        </div>
                                        {appt.notes && <div className="agenda-appt-notes">{appt.notes}</div>}
                                    </div>
                                    <button className="agenda-appt-del" onClick={() => removeAppointment(appt.id)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── TASK LIST ── */}
            <div className="agenda-tasks-section">
                <div className="agenda-tasks-header">
                    <span className="agenda-tasks-title">Task della Settimana</span>
                    <span className="agenda-tasks-count">
                        {allTasks.filter(t => isTaskCompleted(selectedWeek, t.id)).length} / {allTasks.length}
                    </span>
                </div>

                <div className="agenda-task-list">
                    {allTasks.map(task => {
                        const completed = isTaskCompleted(selectedWeek, task.id);
                        const assignee = getAssigneeBadge(task.assignee);
                        const priority = getPriorityBadge(task.priority);
                        const isEditing = editingTaskId === task.id;
                        const isSwiping = swipingTaskId && swipingTaskId === task.id;

                        return (
                            <div
                                key={task.id}
                                className={`agenda-task-item-container ${isSwiping ? 'swiping' : ''}`}
                                onTouchStart={(e) => handleTouchStart(e, task.id)}
                                onTouchMove={(e) => handleTouchMove(e, task.id)}
                            >
                                <div
                                    className={`agenda-task-row ${completed ? 'completed' : ''} ${task.suggested ? 'suggested' : ''} ${selectedWeek !== currentWeek ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if (isEditing) return;
                                        if (isSwiping) {
                                            setSwipingTaskId(null);
                                        } else {
                                            if (selectedWeek === currentWeek) {
                                                toggleTaskCompleted(selectedWeek, task.id);
                                            }
                                        }
                                    }}
                                    style={selectedWeek !== currentWeek ? { opacity: 0.6 } : {}}
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
                                                                text: task.text, 
                                                                why: task.why || task.note 
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
                                                            marginTop: '6px' 
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
                                
                                <div className="agenda-task-delete-action" onClick={() => handleDeleteTask(task)}>
                                    <span>Elimina</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="agenda-add-task-btn" onClick={() => setShowTaskModal(true)}>
                    <Plus size={18} /> Aggiungi task
                </button>
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
                                    <span style={{ fontWeight: 700 }}>Perché è importante?</span>
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
                weekNumber={selectedWeek}
            />
        </div>
    );
}
