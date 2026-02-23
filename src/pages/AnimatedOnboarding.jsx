import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { onboardingSlides } from '../data/discoveryData';
import ParticleBackground from '../components/ParticleBackground';
import './AnimatedOnboarding.css';

export default function AnimatedOnboarding() {
    const navigate = useNavigate();
    const { completeOnboarding, devLogin } = useUser();
    const [step, setStep] = useState(0);
    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [babySex, setBabySex] = useState(null);
    const [status, setStatus] = useState('gravidanza'); // 'gravidanza' or 'nato'
    const [dateInput, setDateInput] = useState('');
    const [invitePartner, setInvitePartner] = useState(null); // 'si' or 'no'
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
    const [showConfetti, setShowConfetti] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const contentRef = useRef(null);

    const totalSteps = onboardingSlides.length;
    const currentSlide = onboardingSlides[step];

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setDirection(1);
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const canProceed = () => {
        if (step === 1) return !!role && name.trim().length > 0;
        if (step === 2) return true; // Baby info is optional
        if (step === 3) return !!dateInput;
        if (step === 4) return !!invitePartner;
        return true;
    };

    // Auto-advance on loading step
    useEffect(() => {
        if (step === 5) { // Loading step
            setShowConfetti(true);

            const stages = [
                { p: 20, text: 'Carico le milestone della gravidanza...', time: 200 },
                { p: 60, text: 'Preparo i contenuti personalizzati...', time: 1000 },
                { p: 100, text: 'Tutto pronto! 🎉', time: 2000 }
            ];

            stages.forEach(({ p, text, time }) => {
                setTimeout(() => {
                    setLoadingProgress(p);
                    setLoadingText(text);
                }, time);
            });

            setTimeout(() => {
                completeOnboarding({
                    role: role === 'entrambi' ? 'mamma' : (role || 'mamma'),
                    name: name || (role === 'papa' ? 'Marco' : 'Sara'),
                    baby: babyNameInput,
                    sex: babySex,
                    conception: dateInput ? new Date(dateInput) : new Date('2025-08-10'),
                });
                navigate('/home');
            }, 3000);
        } else {
            setShowConfetti(false);
            setLoadingProgress(0);
        }
    }, [step, completeOnboarding, navigate, name, role, babyNameInput, babySex, dateInput]);

    return (
        <div className="aonb">
            {/* Animated Background */}
            <ParticleBackground
                type={currentSlide.particles}
                gradient={currentSlide.bgGradient}
                className="aonb__bg"
            />

            {/* Confetti Overlay */}
            {showConfetti && (
                <div className="aonb__confetti">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="aonb__confetti-piece"
                            style={{
                                '--x': `${Math.random() * 100}%`,
                                '--delay': `${Math.random() * 2}s`,
                                '--duration': `${1.5 + Math.random() * 2}s`,
                                '--color': ['#FF6B8A', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8B3D', '#C77DFF'][i % 6],
                                '--rotation': `${Math.random() * 720}deg`,
                                '--size': `${6 + Math.random() * 8}px`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Progress Timeline (Hidden on Welcome and Loading) */}
            {step > 0 && step < 5 && (
                <div className="aonb__progress">
                    <div className="aonb__progress-bar">
                        <div
                            className="aonb__progress-fill"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div
                className={`aonb__content aonb__content--${direction > 0 ? 'forward' : 'backward'}`}
                key={step}
                ref={contentRef}
            >
                {/* Step 0: Welcome */}
                {step === 0 && (
                    <div className="aonb__step aonb__step--center">
                        <div className="aonb__welcome-icon">
                            <span className="aonb__welcome-emoji">{currentSlide.emoji}</span>
                            <div className="aonb__welcome-pulse" />
                            <div className="aonb__welcome-pulse aonb__welcome-pulse--delayed" />
                        </div>
                        <h1 className="aonb__title aonb__title--large">{currentSlide.title}</h1>
                        <p className="aonb__subtitle">{currentSlide.subtitle}</p>

                        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="aonb__next-btn"
                                onClick={handleNext}
                            >
                                Inizia
                            </button>
                            <button
                                className="aonb__back-btn"
                                style={{ border: 'none', background: 'transparent' }}
                                onClick={() => { devLogin('mamma'); navigate('/home'); }}
                            >
                                Entra come Sara (demo)
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Role & Name */}
                {step === 1 && (
                    <div className="aonb__step">
                        <div className="aonb__step-emoji" style={{ textAlign: 'center' }}>{currentSlide.emoji}</div>
                        <h1 className="aonb__title" style={{ textAlign: 'center' }}>{currentSlide.title}</h1>
                        <p className="aonb__subtitle" style={{ textAlign: 'center', margin: '0 auto 24px' }}>{currentSlide.subtitle}</p>

                        <div className="aonb__role-cards" style={{ flexDirection: 'column', gap: '8px' }}>
                            <button
                                className={`aonb__role-card ${role === 'mamma' ? 'aonb__role-card--selected' : ''}`}
                                style={{ flexDirection: 'row', padding: '16px', justifyContent: 'flex-start' }}
                                onClick={() => setRole('mamma')}
                            >
                                <span className="aonb__role-emoji" style={{ fontSize: '2rem' }}>🤰</span>
                                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                                    <div className="aonb__role-label">Futura Mamma</div>
                                </div>
                                {role === 'mamma' && <div className="aonb__role-check">✓</div>}
                            </button>
                            <button
                                className={`aonb__role-card ${role === 'papa' ? 'aonb__role-card--selected' : ''}`}
                                style={{ flexDirection: 'row', padding: '16px', justifyContent: 'flex-start' }}
                                onClick={() => setRole('papa')}
                            >
                                <span className="aonb__role-emoji" style={{ fontSize: '2rem' }}>👨</span>
                                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                                    <div className="aonb__role-label">Futuro Papà</div>
                                </div>
                                {role === 'papa' && <div className="aonb__role-check">✓</div>}
                            </button>
                            <button
                                className={`aonb__role-card ${role === 'entrambi' ? 'aonb__role-card--selected' : ''}`}
                                style={{ flexDirection: 'row', padding: '16px', justifyContent: 'flex-start' }}
                                onClick={() => setRole('entrambi')}
                            >
                                <span className="aonb__role-emoji" style={{ fontSize: '2rem' }}>👫</span>
                                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                                    <div className="aonb__role-label">Lo usiamo insieme</div>
                                </div>
                                {role === 'entrambi' && <div className="aonb__role-check">✓</div>}
                            </button>
                        </div>

                        {role && (
                            <div className="aonb__input-group" style={{ marginTop: '24px', animation: 'slideInRight 0.3s forwards' }}>
                                <label className="aonb__label">Il tuo nome</label>
                                <input
                                    className="aonb__input"
                                    type="text"
                                    placeholder={role === 'papa' ? 'Es. Marco' : 'Es. Sara'}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Baby Info */}
                {step === 2 && (
                    <div className="aonb__step">
                        <div className="aonb__step-emoji" style={{ textAlign: 'center' }}>{currentSlide.emoji}</div>
                        <h1 className="aonb__title" style={{ textAlign: 'center' }}>{currentSlide.title}</h1>
                        <p className="aonb__subtitle" style={{ textAlign: 'center', margin: '0 auto 24px' }}>{currentSlide.subtitle}</p>

                        <div className="aonb__input-group">
                            <label className="aonb__label">Nome o soprannome (facoltativo)</label>
                            <input
                                className="aonb__input"
                                type="text"
                                placeholder="Non ancora scelto..."
                                value={babyNameInput}
                                onChange={(e) => setBabyNameInput(e.target.value)}
                            />
                        </div>

                        <div className="aonb__input-group" style={{ marginTop: '16px' }}>
                            <label className="aonb__label">Sesso della creatura</label>
                            <div className="aonb__sex-pills">
                                <button
                                    className={`aonb__sex-pill ${babySex === 'M' ? 'aonb__sex-pill--selected' : ''}`}
                                    onClick={() => setBabySex('M')}
                                >
                                    ♂️ Maschio
                                </button>
                                <button
                                    className={`aonb__sex-pill ${babySex === 'F' ? 'aonb__sex-pill--selected' : ''}`}
                                    onClick={() => setBabySex('F')}
                                >
                                    ♀️ Femmina
                                </button>
                                <button
                                    className={`aonb__sex-pill ${babySex === 'unknown' ? 'aonb__sex-pill--selected' : ''}`}
                                    onClick={() => setBabySex('unknown')}
                                >
                                    🎁 Sorpresa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Phase & Date */}
                {step === 3 && (
                    <div className="aonb__step">
                        <div className="aonb__step-emoji" style={{ textAlign: 'center' }}>{currentSlide.emoji}</div>
                        <h1 className="aonb__title" style={{ textAlign: 'center' }}>{currentSlide.title}</h1>
                        <p className="aonb__subtitle" style={{ textAlign: 'center', margin: '0 auto 24px' }}>{currentSlide.subtitle}</p>

                        <div className="aonb__sex-pills" style={{ marginBottom: '24px' }}>
                            <button
                                className={`aonb__sex-pill ${status === 'gravidanza' ? 'aonb__sex-pill--selected' : ''}`}
                                onClick={() => setStatus('gravidanza')}
                            >
                                🤰 Sono in gravidanza
                            </button>
                            <button
                                className={`aonb__sex-pill ${status === 'nato' ? 'aonb__sex-pill--selected' : ''}`}
                                onClick={() => setStatus('nato')}
                            >
                                👶 Il bimbo è già nato
                            </button>
                        </div>

                        <div className="aonb__input-group">
                            <label className="aonb__label">
                                {status === 'gravidanza' ? 'Data presunta del parto (o ultima mestruazione)' : 'Data di nascita'}
                            </label>
                            <input
                                className="aonb__input"
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Partner */}
                {step === 4 && (
                    <div className="aonb__step">
                        <div className="aonb__step-emoji" style={{ textAlign: 'center' }}>{currentSlide.emoji}</div>
                        <h1 className="aonb__title" style={{ textAlign: 'center' }}>{currentSlide.title}</h1>
                        <p className="aonb__subtitle" style={{ textAlign: 'center', margin: '0 auto 24px' }}>{currentSlide.subtitle}</p>

                        <div className="aonb__role-cards" style={{ flexDirection: 'column', gap: '12px' }}>
                            <button
                                className={`aonb__role-card ${invitePartner === 'si' ? 'aonb__role-card--selected' : ''}`}
                                style={{ flexDirection: 'row', padding: '16px', justifyContent: 'flex-start' }}
                                onClick={() => setInvitePartner('si')}
                            >
                                <span className="aonb__role-emoji" style={{ fontSize: '2rem' }}>💌</span>
                                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                                    <div className="aonb__role-label" style={{ fontSize: '1rem' }}>Voglio invitare il partner ora</div>
                                    <span className="aonb__role-desc" style={{ textAlign: 'left' }}>Condividi l'app tramite link</span>
                                </div>
                                {invitePartner === 'si' && <div className="aonb__role-check">✓</div>}
                            </button>
                            <button
                                className={`aonb__role-card ${invitePartner === 'no' ? 'aonb__role-card--selected' : ''}`}
                                style={{ flexDirection: 'row', padding: '16px', justifyContent: 'flex-start' }}
                                onClick={() => setInvitePartner('no')}
                            >
                                <span className="aonb__role-emoji" style={{ fontSize: '2rem' }}>👤</span>
                                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                                    <div className="aonb__role-label" style={{ fontSize: '1rem' }}>Lo farò più tardi</div>
                                    <span className="aonb__role-desc" style={{ textAlign: 'left' }}>O continuo da solo/a</span>
                                </div>
                                {invitePartner === 'no' && <div className="aonb__role-check">✓</div>}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Loading! */}
                {step === 5 && (
                    <div className="aonb__step aonb__step--center">
                        <div className="aonb__ready-icon" style={{ animation: 'none', transform: 'scale(1)', opacity: 1 }}>
                            <span className="aonb__ready-emoji">{currentSlide.emoji}</span>
                        </div>
                        <h1 className="aonb__title" style={{ textAlign: 'center' }}>{currentSlide.title}</h1>
                        <p className="aonb__subtitle" style={{ textAlign: 'center', marginBottom: '32px' }}>{currentSlide.subtitle}</p>

                        <div style={{ width: '100%', maxWidth: '280px', background: 'rgba(255,255,255,0.5)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #F48C95, #D4725B)', width: `${loadingProgress}%`, transition: 'width 0.4s ease' }} />
                        </div>
                        <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>{loadingText}</p>
                    </div>
                )}
            </div>

            {/* Bottom Actions (Hidden on Welcome and Loading) */}
            {step > 0 && step < 5 && (
                <div className="aonb__actions">
                    <button className="aonb__back-btn" onClick={handleBack}>
                        Indietro
                    </button>
                    <button
                        className={`aonb__next-btn`}
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        {step === 4 ? 'Completa' : 'Avanti'}
                    </button>
                </div>
            )}
        </div>
    );
}
