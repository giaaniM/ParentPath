import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Register.css';

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isValid = email.includes('@') && password.length >= 8;

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isValid) return;
        setError('');
        setLoading(true);

        const { error: authError } = await supabase.auth.signUp({ email, password });

        setLoading(false);

        if (authError) {
            if (authError.message.includes('already registered')) {
                setError('Email già registrata. Vai su Accedi.');
            } else {
                setError(authError.message);
            }
            return;
        }

        // Account creato → vai all'onboarding per la personalizzazione
        navigate('/onboarding');
    };

    return (
        <div className="reg">
            <div className="bd-mesh-gradient" />

            <div className="reg__header">
                <button className="reg__back" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="reg__content">
                <div className="reg__logo-wrap">
                    <img src="/logo_premium.png" alt="ParentPath" className="reg__logo" />
                </div>

                <h1 className="reg__title">Crea il tuo account</h1>
                <p className="reg__subtitle">Inserisci email e password per iniziare.</p>

                <form className="reg__form" onSubmit={handleRegister} noValidate>
                    <div className="reg__field">
                        <label className="reg__label">Email</label>
                        <div className="reg__input-wrap">
                            <Mail size={18} className="reg__input-icon" />
                            <input
                                className="reg__input"
                                type="email"
                                placeholder="la-tua@email.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                autoComplete="email"
                                inputMode="email"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="reg__field">
                        <label className="reg__label">
                            Password{' '}
                            <span className="reg__label-hint">(min. 8 caratteri)</span>
                        </label>
                        <div className="reg__input-wrap">
                            <Lock size={18} className="reg__input-icon" />
                            <input
                                className="reg__input reg__input--pr"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Scegli una password sicura"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                autoComplete="new-password"
                            />
                            <button type="button" className="reg__eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="reg__error">{error}</p>}

                    <p className="reg__terms">
                        Registrandoti accetti i Termini di Servizio e la Privacy Policy di ParentPath.
                    </p>

                    <button type="submit" className="reg__btn-primary" disabled={!isValid || loading}>
                        {loading ? 'Creazione account...' : 'Continua'}
                    </button>
                </form>
            </div>

            <div className="reg__footer">
                <p className="reg__footer-text">
                    Hai già un account?{' '}
                    <button className="reg__login-link" onClick={() => navigate('/login')}>
                        Accedi
                    </button>
                </p>
            </div>
        </div>
    );
}
