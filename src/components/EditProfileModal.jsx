import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { X } from 'lucide-react';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose }) {
    const { userRole, userName, setUserName, conceptionDate, setConceptionDate, birthDate, setBirthDate } = useUser();

    // Local state for editing form
    const [editName, setEditName] = useState('');
    const [editLmp, setEditLmp] = useState('');
    const [editBirthDate, setEditBirthDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditName(userName || '');
            setEditBirthDate(birthDate || '');
            // Safely format conceptionDate to YYYY-MM-DD
            if (conceptionDate) {
                try {
                    setEditLmp(new Date(conceptionDate).toISOString().split('T')[0]);
                } catch (e) {
                    setEditLmp('');
                }
            } else {
                setEditLmp('');
            }
        }
    }, [isOpen, userName, conceptionDate, birthDate]);

    if (!isOpen) return null;

    const handleSave = (e) => {
        e.preventDefault();
        setUserName(editName);
        if (editLmp) {
            setConceptionDate(new Date(editLmp));
        }
        // Toast birthdate: gestito da ProfileCompletion per evitare duplicati
        setBirthDate(editBirthDate || null);
        onClose();
    };

    return (
        <div className="ep-overlay" onClick={onClose}>
            <div className="ep-modal" onClick={e => e.stopPropagation()}>
                <button className="ep-close" onClick={onClose}><X size={24} /></button>
                <h2 className="ep-title">Modifica Profilo</h2>

                <form className="ep-form" onSubmit={handleSave}>
                    <div className="ep-field">
                        <label>Il tuo nome</label>
                        <input
                            type="text"
                            className="ep-input"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="ep-field">
                        <label>Ruolo</label>
                        <div className="ep-role-readonly">{userRole === 'mamma' ? 'Mamma' : 'Papà'}</div>
                    </div>

                    <div className="ep-field">
                        <label>Data ultima mestruazione (LMP) o Concepimento</label>
                        <input
                            type="date"
                            className="ep-input"
                            value={editLmp}
                            onChange={e => setEditLmp(e.target.value)}
                            required
                        />
                        <span className="ep-hint">Viene utilizzata per calcolare le settimane e il percorso.</span>
                    </div>

                    <div className="ep-field">
                        <label>La tua data di nascita <span className="ep-optional">(opzionale)</span></label>
                        <input
                            type="date"
                            className="ep-input"
                            value={editBirthDate}
                            onChange={e => setEditBirthDate(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="ep-save-btn">Salva Modifiche</button>
                </form>
            </div>
        </div>
    );
}
