import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { onboardingSlides } from '../data/discoveryData';
import ParticleBackground from '../components/ParticleBackground';
import './AnimatedOnboarding.css';

const NOTIFICATION_PREFS = [
    { id: 'weekly', emoji: '📋', label: 'Aggiornamento settimanale', desc: 'Ogni lunedì, cosa succede questa settimana' },
    { id: 'daily', emoji: '💡', label: 'Curiosità quotidiana', desc: 'Un fatto sorprendente ogni giorno' },
    { id: 'medical', emoji: '🏥', label: 'Promemoria medici', desc: 'Visite, esami e scadenze' },
    { id: 'partner', emoji: '💌', label: 'Notifiche partner', desc: 'Quando il partner condivide qualcosa' },
];

export default function AnimatedOnboarding() {
    const navigate = useNavigate();
    const { completeOnboarding, devLogin } = useUser();
    const [step, setStep] = useState(0);
    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [conceptionInput, setConceptionInput] = useState('');
    const [babySex, setBabySex] = useState(null);
    const [prefs, setPrefs] = useState({ weekly: true, daily: true, medical: true, partner: true });
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
    const [showConfetti, setShowConfetti] = useState(false);
    const contentRef = useRef(null);

    const totalSteps = onboardingSlides.length;
    const currentSlide = onboardingSlides[step];

    const togglePref = (id) => {
        setPrefs(p => ({ ...p, [id]: !p[id] }));
    };

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setDirection(1);
            setStep(s => s + 1);
        } else {
            // Complete onboarding
            completeOnboarding({
                role: role || 'mamma',
                name: name || (role === 'papa' ? 'Marco' : 'Sara'),
                baby: babyNameInput,
                sex: babySex,
                conception: conceptionInput ? new Date(conceptionInput) : new Date('2025-08-10'),
                preferences: prefs,
            });
            navigate('/home');
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const canProceed = () => {
        if (step === 1) return !!role; // Must pick role
        return true;
    };

    // Trigger confetti on last step
    useEffect(() => {
        if (step === totalSteps - 1) {
            setTimeout(() => setShowConfetti(true), 300);
        } else {
            setShowConfetti(false);
        }
    }, [step, totalSteps]);

    // Selection animation for role
    const handleRoleSelect = (r) => {
        setRole(r);
    };

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

            {/* Progress Timeline */}
            <div className="aonb__progress">
                <div className="aonb__progress-bar">
                    <div
                        className="aonb__progress-fill"
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    />
                </div>
                <span className="aonb__progress-text">{step + 1}/{totalSteps}</span>
            </div>

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
                        <div className="aonb__welcome-features">
                            <div className="aonb__feature-pill">📊 Aggiornamenti settimanali</div>
                            <div className="aonb__feature-pill">💡 Curiosità quotidiane</div>
                            <div className="aonb__feature-pill">🧸 Milestone del bambino</div>
                            <div className="aonb__feature-pill">👫 Spazio per entrambi i genitori</div>
                        </div>
                    </div>
                )}

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="aonb__step aonb__step--center">
                        <h1 className="aonb__title">{currentSlide.title}</h1>
                        <p className="aonb__subtitle">{currentSlide.subtitle}</p>
                        <div className="aonb__role-cards">
                            <button
                                className={`aonb__role-card ${role === 'mamma' ? 'aonb__role-card--selected' : ''}`}
                                onClick={() => handleRoleSelect('mamma')}
                            >
                                <span className="aonb__role-emoji">🤰</span>
                                <span className="aonb__role-label">Mamma</span>
                                <span className="aonb__role-desc">Accompagnata settimana per settimana</span>
                                {role === 'mamma' && <div className="aonb__role-check">✓</div>}
                            </button>
                            <button
                                className={`aonb__role-card ${role === 'papa' ? 'aonb__role-card--selected' : ''}`}
                                onClick={() => handleRoleSelect('papa')}
                            >
                                <span className="aonb__role-emoji">👨</span>
                                <span className="aonb__role-label">Papà</span>
                                <span className="aonb__role-desc">Consigli e supporto dedicati</span>
                                {role === 'papa' && <div className="aonb__role-check">✓</div>}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Name */}
                {step === 2 && (
                    <div className="aonb__step aonb__step--center">
                        <div className="aonb__step-emoji">{currentSlide.emoji}</div>
                        <h1 className="aonb__title">{currentSlide.title}</h1>
                        <p className="aonb__subtitle">{currentSlide.subtitle}</p>
                        <div className="aonb__input-group">
                            <input
                                className="aonb__input"
                                type="text"
                                placeholder={role === 'papa' ? 'Es. Marco' : 'Es. Sara'}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Baby Info */}
                {step === 3 && (
                    <div className="aonb__step">
                        <div className="aonb__step-emoji">{currentSlide.emoji}</div>
                        <h1 className="aonb__title">{currentSlide.title}</h1>
                        <p className="aonb__subtitle">{currentSlide.subtitle}</p>

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

                        <div className="aonb__input-group">
                            <label className="aonb__label">Sesso</label>
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
                                    🎁 Sorpresa!
                                </button>
                            </div>
                        </div>

                        <div className="aonb__input-group">
                            <label className="aonb__label">Data di concepimento (approssimativa)</label>
                            <input
                                className="aonb__input"
                                type="date"
                                value={conceptionInput}
                                onChange={(e) => setConceptionInput(e.target.value)}
                            />
                        </div>

                        <div className="aonb__invite-card">
                            <span className="aonb__invite-icon">🔗</span>
                            <div>
                                <strong>Hai ricevuto un invito?</strong>
                                <p>Se l'altro genitore ha già configurato, inserisci il codice per sincronizzarti.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Preferences */}
                {step === 4 && (
                    <div className="aonb__step">
                        <div className="aonb__step-emoji">{currentSlide.emoji}</div>
                        <h1 className="aonb__title">{currentSlide.title}</h1>
                        <p className="aonb__subtitle">{currentSlide.subtitle}</p>

                        <div className="aonb__prefs">
                            {NOTIFICATION_PREFS.map((pref) => (
                                <button
                                    key={pref.id}
                                    className={`aonb__pref-card ${prefs[pref.id] ? 'aonb__pref-card--active' : ''}`}
                                    onClick={() => togglePref(pref.id)}
                                >
                                    <span className="aonb__pref-emoji">{pref.emoji}</span>
                                    <div className="aonb__pref-body">
                                        <span className="aonb__pref-label">{pref.label}</span>
                                        <span className="aonb__pref-desc">{pref.desc}</span>
                                    </div>
                                    <div className={`aonb__pref-toggle ${prefs[pref.id] ? 'aonb__pref-toggle--on' : ''}`}>
                                        <div className="aonb__pref-toggle-knob" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Ready! */}
                {step === 5 && (
                    <div className="aonb__step aonb__step--center">
                        <div className="aonb__ready-icon">
                            <span className="aonb__ready-emoji">{currentSlide.emoji}</span>
                        </div>
                        <h1 className="aonb__title aonb__title--large">{currentSlide.title}</h1>
                        <p className="aonb__subtitle">{currentSlide.subtitle}</p>

                        <div className="aonb__ready-summary">
                            <div className="aonb__ready-item">
                                <span>{role === 'papa' ? '👨' : '🤰'}</span>
                                <span>{name || (role === 'papa' ? 'Marco' : 'Sara')}</span>
                            </div>
                            {babyNameInput && (
                                <div className="aonb__ready-item">
                                    <span>👶</span>
                                    <span>{babyNameInput}</span>
                                </div>
                            )}
                            {babySex && babySex !== 'unknown' && (
                                <div className="aonb__ready-item">
                                    <span>{babySex === 'M' ? '♂️' : '♀️'}</span>
                                    <span>{babySex === 'M' ? 'Maschio' : 'Femmina'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="aonb__actions">
                {step > 0 && (
                    <button className="aonb__back-btn" onClick={handleBack}>
                        ← Indietro
                    </button>
                )}
                <button
                    className={`aonb__next-btn ${step === totalSteps - 1 ? 'aonb__next-btn--final' : ''}`}
                    onClick={handleNext}
                    disabled={!canProceed()}
                >
                    {step === totalSteps - 1 ? '🚀 Inizia il viaggio' : 'Avanti →'}
                </button>
            </div>

            {/* Dev Skip */}
            {step === 0 && (
                <button
                    className="aonb__dev-skip"
                    onClick={() => { devLogin('mamma'); navigate('/home'); }}
                >
                    ⚡ Salta (dev)
                </button>
            )}
        </div>
    );
}
