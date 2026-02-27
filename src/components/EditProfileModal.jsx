import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { X } from 'lucide-react';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose }) {
    const { userRole, setUserRole, userName, setUserName, babyName, setBabyName, conceptionDate, setConceptionDate } = useUser();

    // Local state for editing form
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('mamma');
    const [editLmp, setEditLmp] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditName(userName || '');
            setEditRole(userRole || 'mamma');
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
    }, [isOpen, userName, userRole, conceptionDate]);

    if (!isOpen) return null;

    const handleSave = (e) => {
        e.preventDefault();
        setUserName(editName);
        setUserRole(editRole);
        if (editLmp) {
            setConceptionDate(new Date(editLmp));
        }
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
                        <div className="ep-role-grid">
                            <button
                                type="button"
                                className={`ep-role-btn ${editRole === 'mamma' ? 'active' : ''}`}
                                onClick={() => setEditRole('mamma')}
                            >
                                Mamma
                            </button>
                            <button
                                type="button"
                                className={`ep-role-btn ${editRole === 'papa' ? 'active' : ''}`}
                                onClick={() => setEditRole('papa')}
                            >
                                Papà
                            </button>
                            <button
                                type="button"
                                className={`ep-role-btn ${editRole === 'partner' ? 'active' : ''}`}
                                onClick={() => setEditRole('partner')}
                            >
                                Partner
                            </button>
                        </div>
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

                    <button type="submit" className="ep-save-btn">Salva Modifiche</button>
                </form>
            </div>
        </div>
    );
}
