import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HomeSkeletonScreen from '../components/HomeSkeletonScreen';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { devLogin, completeOnboarding } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const keyboardHeight = useKeyboardHeight();
    const isValid = email.includes('@') && password.length >= 8;

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isValid) return;
        setError('');
        setLoading(true); // → mostra skeleton subito

        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setLoading(false);
            setError(authError.message === 'Invalid login credentials'
                ? 'Email o password non corretti.'
                : authError.message);
            return;
        }

        const userId = data.user?.id;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        const { data: pregnancy } = await supabase.from('pregnancies')
            .select('*')
            .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!profile) {
            // Account esiste ma onboarding non completato
            setLoading(false);
            navigate('/onboarding');
            return;
        }

        completeOnboarding({
            role: profile.role || 'papa',
            name: profile.name || '',
            baby: pregnancy?.baby_name || '',
            sex: pregnancy?.baby_sex || null,
            status: pregnancy?.status || 'gravidanza',
            conception: pregnancy?.conception_date ? new Date(pregnancy.conception_date) : null,
            inviteCode: pregnancy?.invite_code || null,
            partnerId: pregnancy
                ? (pregnancy.creator_id === userId ? pregnancy.partner_id : pregnancy.creator_id)
                : null,
        });

        // Piccolo delay per rendere la transizione fluida, poi naviga
        setTimeout(() => navigate('/home'), 300);
    };

    // Skeleton fullscreen mentre carichiamo
    if (loading) return <HomeSkeletonScreen />;

    return (
        <div className="login" style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : {}}>
            <div className="bd-mesh-gradient" />

            <div className="login__header">
                <button className="login__back" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="login__content">
                <div className="login__logo-wrap">
                    <img src="/logo_premium.png" alt="ParentPath" className="login__logo" />
                </div>

                <h1 className="login__title">Bentornato</h1>
                <p className="login__subtitle">Accedi per ritrovare il tuo percorso.</p>

                <form className="login__form" onSubmit={handleLogin} noValidate>
                    <div className="login__field">
                        <div className="login__input-wrap">
                            <Mail size={18} className="login__input-icon" />
                            <input
                                className="login__input"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                autoComplete="email"
                                inputMode="email"
                                onFocus={e => {
                                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                }}
                            />
                        </div>
                    </div>

                    <div className="login__field">
                        <div className="login__input-wrap">
                            <Lock size={18} className="login__input-icon" />
                            <input
                                className="login__input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                autoComplete="current-password"
                                onFocus={e => {
                                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                }}
                            />
                            <button type="button" className="login__eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="login__error">{error}</p>}

                    <button
                        type="button"
                        className="login__forgot"
                        onClick={async () => {
                            if (!email.includes('@')) { setError('Inserisci prima la tua email.'); return; }
                            const { error: e } = await supabase.auth.resetPasswordForEmail(email);
                            setError(e ? e.message : 'Email di reset inviata! Controlla la posta.');
                        }}
                    >
                        Password dimenticata?
                    </button>

                    <button type="submit" className="login__btn-primary" disabled={!isValid}>
                        Accedi
                    </button>
                </form>

                {import.meta.env.DEV && (
                    <div className="login__dev-section">
                        <p className="login__dev-label">Accesso rapido (DEV)</p>
                        <div className="login__dev-grid">
                            <button className="login__dev-btn" onClick={() => { devLogin('papa'); navigate('/home'); }}>
                                ⚡ Papà demo
                            </button>
                            <button className="login__dev-btn" onClick={() => { devLogin('mamma'); navigate('/home'); }}>
                                ⚡ Mamma demo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="login__footer">
                <p className="login__footer-text">
                    Non hai un account?{' '}
                    <button className="login__register-link" onClick={() => navigate('/')}>
                        Inizia ora
                    </button>
                </p>
            </div>
        </div>
    );
}
