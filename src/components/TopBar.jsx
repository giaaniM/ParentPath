import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import './TopBar.css';

export default function TopBar() {
    const navigate = useNavigate();

    return (
        <div className="topbar">
            <div className="topbar__minimal-wrap">
                <button
                    className="topbar__bell topbar__bell--minimal"
                    onClick={() => navigate('/notifications')}
                    aria-label="Notifiche"
                >
                    <Bell size={24} strokeWidth={1.8} color="var(--midnight)" />
                    <span className="topbar__bell-badge">3</span>
                </button>
            </div>
        </div>
    );
}

