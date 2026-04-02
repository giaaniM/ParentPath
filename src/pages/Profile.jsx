import { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { User, Settings, Shield, LogOut, ChevronRight, Bell, Calendar, Heart, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import './Profile.css';

export default function Profile() {
    const { isMamma, userName, userRole, babyName, babyStatus, logout } = useUser();

    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const sections = [
        {
            title: 'Account',
            items: [
                { id: 'personal', icon: User, label: 'Informazioni personali', action: () => setIsEditOpen(true) },
                { id: 'notifications', icon: Bell, label: 'Notifiche', action: () => navigate('/notifications') },
                { id: 'settings', icon: Settings, label: 'Impostazioni app', action: () => {} },
            ]
        },
        {
            title: 'Percorso',
            items: [
                { id: 'baby', icon: Heart, label: 'Dati del bambino', action: () => navigate('/baby') },
                { id: 'agenda', icon: Calendar, label: 'La mia Agenda', action: () => navigate('/agenda') },
            ]
        },
        {
            title: 'Supporto',
            items: [
                { id: 'privacy', icon: Shield, label: 'Privacy Policy', action: () => {} },
            ]
        }
    ];

    return (
        <div className="page profile-page">
            <div className="profile-container">
                <h1 className="profile-main-title">Profilo</h1>

                <div className="profile-user-card" onClick={() => setIsEditOpen(true)}>
                    <div className="puc-avatar">
                        {isMamma
                            ? (babyStatus === 'nato' ? '👩' : '🤰')
                            : '👨'}
                    </div>
                    <div className="puc-info">
                        <div className="puc-name">{userName || 'Genitore'}</div>
                        <div className="puc-role">
                            {userRole === 'mamma' ? 'Mamma' : 'Papà'}
                            {babyStatus === 'nato' ? '' : ' in attesa'}
                            {babyName ? ` • ${babyName}` : ''}
                        </div>
                    </div>
                    <div className="puc-edit">
                        <Edit2 size={20} color="var(--stone)" />
                    </div>
                </div>

                <div className="profile-content">
                {sections.map((section, idx) => (
                    <div key={idx} className="profile-section">
                        <h2 className="profile-section-title">{section.title}</h2>
                        <div className="profile-menu-list">
                            {section.items.map((item) => (
                                <button key={item.id} className="profile-menu-item" onClick={item.action}>
                                    <div className="profile-menu-icon-wrap">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="profile-menu-label">{item.label}</span>
                                    <ChevronRight size={18} className="profile-menu-chevron" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button className="profile-logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Esci dall'account</span>
                </button>

                <div className="profile-version">
                    ParentPath v1.2.0 • Premium
                </div>
            </div> {/* Closing profile-content */}
        </div> {/* Closing profile-container */}

        <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        
        {/* Spacer for TabBar */}
        <div style={{ height: '100px' }} />
    </div>
);
}
