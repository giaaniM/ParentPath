import { useLocation } from 'react-router-dom';
import { Home, Baby, Calendar, Compass, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TabBar.css';

const tabs = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/baby', icon: Baby, label: 'Bimbo' },
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: '/profile', icon: User, label: 'Profilo' },
];

export default function TabBar() {
    const location = useLocation();
    const navigate = useNavigate();

    if (location.pathname === '/' || location.pathname === '/onboarding') {
        return null;
    }

    const activeIndex = tabs.findIndex(t => location.pathname.startsWith(t.path));

    return (
        <nav className="tabbar">
            <div className="tabbar__inner">
                {/* Sliding pill background */}
                {activeIndex >= 0 && (
                    <div
                        className="tabbar__pill"
                        style={{ 
                            transform: `translateX(${activeIndex * 100}%)`,
                            width: `calc(${100 / tabs.length}% - 4px)`
                        }}
                    />
                )}
                {tabs.map((tab, i) => {
                    const isActive = i === activeIndex;
                    return (
                        <button
                            key={tab.path}
                            className={`tabbar__tab ${isActive ? 'tabbar__tab--active' : ''}`}
                            onClick={() => navigate(tab.path)}
                        >
                            <tab.icon
                                size={isActive ? 20 : 22}
                                strokeWidth={isActive ? 2.2 : 1.6}
                                className="tabbar__icon"
                            />
                            <span className="tabbar__label">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
