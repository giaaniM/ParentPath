// Questo file è ora solo lo splash screen (step 0).
// Flusso: Splash → /register → /onboarding → /home
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './AnimatedOnboarding.css';

export default function AnimatedOnboarding() {
    const navigate = useNavigate();
    const { devLogin } = useUser();

    return (
        <div className="aonb">
            <div className="aonb__step--splash">
                <div className="bd-mesh-gradient" />
                <div className="aonb__splash-content">
                    <div className="aonb__splash-logo-wrap">
                        <img src="/logo_premium.png" alt="ParentPath" />
                    </div>
                    <h1 className="aonb__splash-title">ParentPath</h1>
                    <p className="aonb__splash-subtitle">Ogni passo del tuo viaggio, guidato con amore e supportato dalla scienza.</p>
                </div>
                <div className="aonb__splash-bottom">
                    <button className="aonb__btn-primary" onClick={() => navigate('/register')}>
                        Inizia il tuo percorso
                    </button>
                    <button className="aonb__btn-login" onClick={() => navigate('/login')}>
                        Hai già un account? <strong>Accedi</strong>
                    </button>
                    {import.meta.env.DEV && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: 8 }}>
                            <button className="aonb__btn-dev" onClick={() => { devLogin('papa'); navigate('/home'); }}>⚡ Demo Papà</button>
                            <button className="aonb__btn-dev" onClick={() => { devLogin('mamma'); navigate('/home'); }}>⚡ Demo Mamma</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
