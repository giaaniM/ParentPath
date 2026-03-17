import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Settings, Shield, LogOut, Bell, Baby } from 'lucide-react';
import './TopBar.css';

export default function TopBar() {
    const { isMamma, userName } = useUser();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Mock logout action
        setMenuOpen(false);
        navigate('/');
    };

    return (
        <div className="topbar">
            {/* Left side: Premium Logo */}
            <div className="topbar__logo">
                <img src="/logo_premium.png" alt="ParentPath" className="topbar__logo-img" />
                <div className="topbar__logo-text">ParentPath</div>
            </div>

            {/* Right side: Bell + Profile */}
            <div className="topbar__actions">
                <button
                    className="topbar__bell"
                    onClick={() => navigate('/notifications')}
                    aria-label="Notifiche"
                >
                    <Bell size={22} strokeWidth={1.8} />
                    <span className="topbar__bell-badge">3</span>
                </button>

                <div className="topbar__profile" ref={menuRef}>
                    <button
                        className={`topbar__avatar ${menuOpen ? 'topbar__avatar--active' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu profilo"
                    >
                        {isMamma ? (userName === 'Sara' ? '🤰' : '👩') : (userName === 'Valerio' ? '👨' : '👤')}
                    </button>

                    {menuOpen && (
                        <div className="topbar__menu">
                            <div className="topbar__menu-header">
                                <span className="topbar__menu-name">{userName || (isMamma ? 'Mamma' : 'Papà')}</span>
                                <span className="topbar__menu-role">{isMamma ? 'Account Mamma' : 'Account Papà'}</span>
                            </div>

                            <div className="topbar__menu-items">
                                <button className="topbar__menu-item" onClick={() => setMenuOpen(false)}>
                                    <User size={18} className="topbar__menu-icon" />
                                    <span>Il mio account</span>
                                </button>
                                <button className="topbar__menu-item" onClick={() => setMenuOpen(false)}>
                                    <Settings size={18} className="topbar__menu-icon" />
                                    <span>Impostazioni</span>
                                </button>
                                <button className="topbar__menu-item" onClick={() => setMenuOpen(false)}>
                                    <Shield size={18} className="topbar__menu-icon" />
                                    <span>Privacy Policy</span>
                                </button>
                                <div className="topbar__menu-divider"></div>
                                <button className="topbar__menu-item topbar__menu-item--danger" onClick={handleLogout}>
                                    <LogOut size={18} className="topbar__menu-icon" />
                                    <span>Esci</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
