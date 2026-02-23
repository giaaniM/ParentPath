import { NavLink, useLocation } from 'react-router-dom';
import { Home, Baby, Compass } from 'lucide-react';
import './TabBar.css';

const tabs = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/baby', icon: Baby, label: 'Bimbo' },
    { path: '/article', icon: Compass, label: 'Esplora' },
];

export default function TabBar() {
    const location = useLocation();

    if (location.pathname === '/' || location.pathname === '/onboarding') {
        return null;
    }

    return (
        <nav className="tabbar">
            <div className="tabbar__inner">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={({ isActive }) =>
                            `tabbar__tab ${isActive ? 'tabbar__tab--active' : ''}`
                        }
                    >
                        <tab.icon
                            size={22}
                            strokeWidth={1.8}
                            className="tabbar__icon"
                        />
                        <span className="tabbar__label">{tab.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
