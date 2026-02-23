import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Settings, Shield, LogOut } from 'lucide-react';
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
            {/* Left side could hold a logo or remain empty */}
            <div className="topbar__logo">
                <span className="topbar__logo-text">ParentPath</span>
            </div>

            {/* Right side: Profile Bubble + Dropdown */}
            <div className="topbar__profile" ref={menuRef}>
                <button
                    className={`topbar__avatar ${menuOpen ? 'topbar__avatar--active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu profilo"
                >
                    {isMamma ? '🤰' : '👨'}
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
    );
}
