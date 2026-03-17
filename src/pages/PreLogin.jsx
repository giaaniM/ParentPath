import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './PreLogin.css';

export default function PreLogin() {
    const navigate = useNavigate();
    const { login } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (role) => {
        setIsLoading(true);
        const name = role === 'mamma' ? 'Sara' : 'Valerio';
        login(role, name);
        setTimeout(() => {
            navigate('/home');
        }, 600);
    };

    return (
        <div className="prelogin">
            <div className="prelogin__content">
                <div className="prelogin__logo-area">
                    <div className="prelogin__icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M24 4C18 4 14 8 14 14C14 18 16 21 19 23C12 25 8 31 8 38C8 40 9.5 42 12 42H36C38.5 42 40 40 40 38C40 31 36 25 29 23C32 21 34 18 34 14C34 8 30 4 24 4Z"
                                fill="url(#logoGrad)" fillOpacity="0.15" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 30C20 30 22 34 24 34C26 34 28 30 28 30" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="20" cy="16" r="1.5" fill="var(--color-primary)" />
                            <circle cx="28" cy="16" r="1.5" fill="var(--color-primary)" />
                            <defs>
                                <linearGradient id="logoGrad" x1="8" y1="4" x2="40" y2="42">
                                    <stop stopColor="var(--color-primary)" />
                                    <stop offset="1" stopColor="var(--color-accent-papa)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="prelogin__title">ParentPath</h1>
                    <p className="prelogin__subtitle">Il percorso della tua famiglia</p>
                </div>

                <div className="prelogin__role-section">
                    <p className="prelogin__role-label">Chi sei?</p>
                    <div className="prelogin__role-cards">
                        <button
                            className={`prelogin__role-card ${isLoading ? 'prelogin__role-card--disabled' : ''}`}
                            onClick={() => handleLogin('mamma')}
                            disabled={isLoading}
                        >
                            <span className="prelogin__role-emoji">🤰</span>
                            <span className="prelogin__role-name">Mamma</span>
                            <span className="prelogin__role-desc">Sara</span>
                        </button>
                        <button
                            className={`prelogin__role-card ${isLoading ? 'prelogin__role-card--disabled' : ''}`}
                            onClick={() => handleLogin('papa')}
                            disabled={isLoading}
                        >
                            <span className="prelogin__role-emoji">👨</span>
                            <span className="prelogin__role-name">Papà</span>
                            <span className="prelogin__role-desc">Valerio</span>
                        </button>
                    </div>
                </div>

                <div className="prelogin__actions">
                    {isLoading && <span className="prelogin__spinner" />}
                    <p className="prelogin__hint">Demo · Scegli il tuo ruolo per iniziare</p>
                    <button
                        className="prelogin__dev-skip"
                        onClick={() => { login('papa', 'Valerio'); navigate('/home'); }}
                    >
                        ⚡ Salta al Dashboard (dev)
                    </button>
                </div>
            </div>
        </div>
    );
}
