import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import './AnimatedOnboarding.css';

export default function AnimatedOnboarding() {
    const navigate = useNavigate();
    const { completeOnboarding, devLogin } = useUser();
    const [step, setStep] = useState(0);
    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [babySex, setBabySex] = useState(null);
    const [status, setStatus] = useState('gravidanza');
    const [dateInput, setDateInput] = useState('');
    const [invitePartner, setInvitePartner] = useState(null);

    const [loadingProgress, setLoadingProgress] = useState(0);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const canProceed = () => {
        if (step === 1) return !!role && name.trim().length > 0;
        if (step === 3) return !!dateInput;
        if (step === 4) return !!invitePartner;
        return true;
    };

    useEffect(() => {
        if (step === 5) {
            const timer = setInterval(() => {
                setLoadingProgress(p => {
                    if (p >= 100) {
                        clearInterval(timer);
                        completeOnboarding({
                            role: role === 'entrambi' ? 'mamma' : (role || 'mamma'),
                            name: name || (role === 'papa' ? 'Marco' : 'Sara'),
                            baby: babyNameInput,
                            sex: babySex,
                            conception: dateInput ? new Date(dateInput) : new Date('2025-08-10'),
                        });
                        navigate('/home');
                        return 100;
                    }
                    return p + 2;
                });
            }, 60);
            return () => clearInterval(timer);
        }
    }, [step, completeOnboarding, navigate, name, role, babyNameInput, babySex, dateInput]);

    return (
        <div className="aonb">
            {/* STEP 0: SPLASH SCREEN */}
            {step === 0 && (
                <div className="aonb__step--splash">
                    <div className="aonb__splash-bg-shapes">
                        <div className="aonb__splash-shape1"></div>
                        <div className="aonb__splash-shape2"></div>
                    </div>

                    <div className="aonb__splash-content">
                        <div className="aonb__splash-logo-wrap">
                            <img src="/logo.png" alt="ParentPath Logo" />
                        </div>
                        <h1 className="aonb__splash-title">ParentPath</h1>
                        <p className="aonb__splash-subtitle">Il compagno digitale premium per la tua genitorialità. Costruito con amore e scienza.</p>
                    </div>

                    <div className="aonb__splash-bottom">
                        <button className="aonb__btn-primary" onClick={handleNext}>Inizia ora</button>
                        <button className="aonb__btn-secondary" onClick={() => { devLogin('mamma'); navigate('/home'); }}>
                            Entra nella Demo
                        </button>
                    </div>
                </div>
            )}

            {/* STEPS 1-4: STANDARD FLOW */}
            {step > 0 && step < 5 && (
                <div className="aonb__step--standard">
                    <div className="aonb__progress-header">
                        <div className="aonb__back-icon" onClick={handleBack}><ArrowLeft size={20} /></div>
                        <div className="aonb__progress-dots">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`aonb__pdot ${step >= i ? 'active' : ''}`} />
                            ))}
                        </div>
                    </div>

                    <div className="aonb__content-inner" key={`step-${step}`}>
                        {step === 1 && (
                            <div className="ru d1">
                                <div className="aonb__step-eyebrow">IL TUO PROFILO</div>
                                <h1 className="aonb__title">Come ti chiameremo?</h1>
                                <p className="aonb__subtitle">Scegli il tuo ruolo per le info più adatte a te.</p>

                                <div className="aonb__role-cards">
                                    <div className={`aonb__role-card ${role === 'mamma' ? 'aonb__role-card--selected' : ''}`} onClick={() => setRole('mamma')}>
                                        <div className="aonb__role-icon">🤰</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">Futura Mamma</div>
                                            <div className="aonb__role-desc">Percorso personalizzato mamma</div>
                                        </div>
                                        {role === 'mamma' && <CheckCircle2 size={24} color="var(--aqua)" />}
                                    </div>
                                    <div className={`aonb__role-card ${role === 'papa' ? 'aonb__role-card--selected' : ''}`} onClick={() => setRole('papa')}>
                                        <div className="aonb__role-icon">👨</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">Futuro Papà</div>
                                            <div className="aonb__role-desc">Consigli mirati per papà</div>
                                        </div>
                                        {role === 'papa' && <CheckCircle2 size={24} color="var(--aqua)" />}
                                    </div>
                                    <div className={`aonb__role-card ${role === 'entrambi' ? 'aonb__role-card--selected' : ''}`} onClick={() => setRole('entrambi')}>
                                        <div className="aonb__role-icon">👫</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">Lo usiamo insieme</div>
                                            <div className="aonb__role-desc">Account condiviso di coppia</div>
                                        </div>
                                        {role === 'entrambi' && <CheckCircle2 size={24} color="var(--aqua)" />}
                                    </div>
                                </div>

                                {role && (
                                    <div className="aonb__input-group ru d1">
                                        <label className="aonb__label">Il tuo nome</label>
                                        <input className="aonb__input" type="text" placeholder={role === 'papa' ? 'Es. Marco' : 'Es. Sara'} value={name} onChange={e => setName(e.target.value)} autoFocus />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="ru d1">
                                <div className="aonb__step-eyebrow">IL BEBÈ</div>
                                <h1 className="aonb__title">C'è un nuovo arrivo</h1>
                                <p className="aonb__subtitle">Se hai già scelto un nome o un soprannome, inseriscilo qui. Altrimenti, puoi saltare!</p>

                                <div className="aonb__input-group">
                                    <label className="aonb__label">Nome o soprannome (facoltativo)</label>
                                    <input className="aonb__input" type="text" placeholder="Es. Lenticchia" value={babyNameInput} onChange={e => setBabyNameInput(e.target.value)} autoFocus />
                                </div>

                                <div className="aonb__input-group" style={{ marginTop: 24 }}>
                                    <label className="aonb__label">Sesso</label>
                                    <div className="aonb__sex-pills">
                                        <div className={`aonb__sex-pill ${babySex === 'M' ? 'aonb__sex-pill--selected' : ''}`} onClick={() => setBabySex('M')}>
                                            Maschietto 👦
                                        </div>
                                        <div className={`aonb__sex-pill ${babySex === 'F' ? 'aonb__sex-pill--selected' : ''}`} onClick={() => setBabySex('F')}>
                                            Femminuccia 👧
                                        </div>
                                        <div className={`aonb__sex-pill ${babySex === 'surprise' ? 'aonb__sex-pill--selected' : ''}`} onClick={() => setBabySex('surprise')}>
                                            Sorpresa 🎁
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="ru d1">
                                <div className="aonb__step-eyebrow">LA FASE</div>
                                <h1 className="aonb__title">A che punto siete?</h1>
                                <p className="aonb__subtitle">Ci adatteremo perfettamente al momento esatto  in cui vi trovate.</p>

                                <div className="aonb__role-cards" style={{ marginBottom: 24 }}>
                                    <div className={`aonb__role-card ${status === 'gravidanza' ? 'aonb__role-card--selected' : ''}`} onClick={() => setStatus('gravidanza')}>
                                        <div className="aonb__role-icon">🤰</div>
                                        <div className="aonb__role-text"><div className="aonb__role-label">Siamo in gravidanza</div></div>
                                        {status === 'gravidanza' && <CheckCircle2 size={24} color="var(--aqua)" />}
                                    </div>
                                    <div className={`aonb__role-card ${status === 'nato' ? 'aonb__role-card--selected' : ''}`} onClick={() => setStatus('nato')}>
                                        <div className="aonb__role-icon">🍼</div>
                                        <div className="aonb__role-text"><div className="aonb__role-label">Il bimbo è già nato</div></div>
                                        {status === 'nato' && <CheckCircle2 size={24} color="var(--aqua)" />}
                                    </div>
                                </div>

                                <div className="aonb__input-group">
                                    <label className="aonb__label">{status === 'gravidanza' ? 'Data presunta del parto' : 'Data di nascita'}</label>
                                    <input className="aonb__input" type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="ru d1">
                                <div className="aonb__step-eyebrow">CONDIVIDI</div>
                                <h1 className="aonb__title">Cresciamo insieme</h1>
                                <p className="aonb__subtitle">ParentPath è progettato per condividere insieme info e progressi della gravidanza.</p>

                                <div className="aonb__role-cards">
                                    <div className={`aonb__role-card ${invitePartner === 'si' ? 'aonb__role-card--selected' : ''}`} onClick={() => setInvitePartner('si')}>
                                        <div className="aonb__role-icon" style={{ background: 'var(--aqua2)' }}>💌</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">Voglio invitarlo ora</div>
                                            <div className="aonb__role-desc">Invia link di affiliazione</div>
                                        </div>
                                    </div>
                                    <div className={`aonb__role-card ${invitePartner === 'no' ? 'aonb__role-card--selected' : ''}`} onClick={() => setInvitePartner('no')}>
                                        <div className="aonb__role-icon" style={{ background: 'var(--border)' }}>👤</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">Lo farò più tardi</div>
                                            <div className="aonb__role-desc">Continua in solitaria</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="aonb__actions-bottom">
                        <button className="aonb__btn-next" onClick={handleNext} disabled={!canProceed()}>{step === 4 ? 'Completa Configurazione' : 'Avanti'}</button>
                    </div>
                </div>
            )}

            {/* STEP 5: LOADING */}
            {step === 5 && (
                <div className="aonb__step--loading">
                    <div className="ru d1" style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--aqua2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <CheckCircle2 size={40} color="var(--aqua)" />
                    </div>
                    <h1 className="aonb__title ru d2">Tutto pronto!</h1>
                    <p className="aonb__subtitle ru d3">Sto preparando il percorso personalizzato...</p>

                    <div className="aonb__loading-bar ru d4">
                        <div className="aonb__loading-fill" style={{ width: `${loadingProgress}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
