import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import './AddAppointmentModal.css';

export default function AddAppointmentModal({ 
    isOpen, 
    onClose, 
    initialName = '', 
    initialNotes = '', 
    weekNumber,
    onSuccess
}) {
    const { addAppointment, appointments } = useUser();
    const { showToast } = useToast();
    const [name, setName] = useState(initialName);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState(initialNotes);
    const [isSaving, setIsSaving] = useState(false);

    const [isSwiping, setIsSwiping] = useState(false);
    const modalRef = useRef(null);
    const modalStartY = useRef(0);
    const modalDragY = useRef(0);

    // Sync initial values when they change (e.g. user selects a different visit)
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setNotes(initialNotes);
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
        }
    }, [isOpen, initialName, initialNotes]);

    const handleTouchStart = (e) => {
        modalStartY.current = e.touches[0].clientY;
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if (!isSwiping) return;
        const deltaY = e.touches[0].clientY - modalStartY.current;
        if (deltaY > 0) {
            modalDragY.current = deltaY;
            if (modalRef.current) modalRef.current.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        if (modalDragY.current > 100) {
            onClose();
        }
        if (modalRef.current) modalRef.current.style.transform = '';
        modalDragY.current = 0;
    };

    const handleConfirm = async () => {
        if (!name.trim() || isSaving) return;
        setIsSaving(true);
        const isFirst = !appointments || appointments.length === 0;
        addAppointment({
            name: name.trim(),
            date: date,
            time: time,
            location: location.trim(),
            notes: notes.trim(),
            weekNumber: weekNumber
        });
        await new Promise(r => setTimeout(r, 350));
        showToast({
            title: isFirst ? 'Prima visita aggiunta!' : 'Visita salvata',
            subtitle: isFirst ? 'Tieni traccia di ogni appuntamento.' : `"${name.trim()}" nell'agenda`,
            type: 'visit',
        });
        setIsSaving(false);
        onClose();
        if (onSuccess) onSuccess();
    };

    if (!isOpen) return null;

    return (
        <div className="appt-modal-overlay" onClick={onClose}>
            <div 
                className={`appt-modal ${isSwiping ? 'swiping' : ''}`}
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="appt-modal-handle" />
                <div className="appt-modal-header">
                    <h3>Aggiungi Visita</h3>
                    <button className="appt-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="appt-modal-body">
                    <div className="appt-input-group">
                        <label>NOME VISITA</label>
                        <textarea
                            className="appt-textarea"
                            placeholder="Es. Ecografia morfologica"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            rows={2}
                            autoFocus
                        />
                    </div>
                    
                    <div className="appt-row">
                        <div className="appt-input-group">
                            <label><Calendar size={14} /> DATA</label>
                            <input
                                className="appt-input"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div className="appt-input-group">
                            <label><Clock size={14} /> ORARIO</label>
                            <input
                                className="appt-input"
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="appt-input-group">
                        <label><MapPin size={14} /> LUOGO</label>
                        <input
                            className="appt-input"
                            type="text"
                            placeholder="es. Ospedale o Studio Medico"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="appt-input-group">
                        <label>NOTE (OPZIONALE)</label>
                        <textarea
                            className="appt-textarea small"
                            placeholder="Aggiungi dettagli..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>
                <button
                    className="appt-modal-cta"
                    onClick={handleConfirm}
                    disabled={!name.trim() || isSaving}
                >
                    {isSaving ? <span className="appt-cta-spinner" /> : 'Conferma'}
                </button>
            </div>
        </div>
    );
}
