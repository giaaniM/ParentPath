import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Onboarding.css';

const STEPS = ['role', 'parent', 'baby'];

export default function Onboarding() {
    const navigate = useNavigate();
    const { completeOnboarding, devLogin } = useUser();
    const [step, setStep] = useState(0);
    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [conceptionInput, setConceptionInput] = useState('');

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            // Complete
            completeOnboarding({
                role,
                name: name || (role === 'mamma' ? 'Sara' : 'Marco'),
                baby: babyNameInput,
                conception: conceptionInput ? new Date(conceptionInput) : new Date('2025-08-10'),
            });
            navigate('/home');
        }
    };

    const canProceed = () => {
        if (step === 0) return !!role;
        if (step === 1) return true; // name is optional with placeholder
        if (step === 2) return true; // baby name optional, date has default
        return true;
    };

    return (
        <div className="onboarding">
            {/* Progress dots */}
            <div className="onboarding__progress">
                {STEPS.map((_, i) => (
                    <div key={i} className={`onboarding__dot ${i === step ? 'onboarding__dot--active' : ''} ${i < step ? 'onboarding__dot--done' : ''}`} />
                ))}
            </div>

            <div className="onboarding__content">
                {step === 0 && (
                    <div className="onboarding__step">
                        <h1 className="onboarding__title">Chi sei?</h1>
                        <p className="onboarding__desc">ParentPath si personalizza in base al tuo ruolo.</p>
                        <div className="onboarding__role-cards">
                            <button
                                className={`onboarding__role ${role === 'mamma' ? 'onboarding__role--selected' : ''}`}
                                onClick={() => setRole('mamma')}
                            >
                                <span className="onboarding__role-emoji">🤰</span>
                                <span className="onboarding__role-label">Mamma</span>
                            </button>
                            <button
                                className={`onboarding__role ${role === 'papa' ? 'onboarding__role--selected' : ''}`}
                                onClick={() => setRole('papa')}
                            >
                                <span className="onboarding__role-emoji">👨</span>
                                <span className="onboarding__role-label">Papà</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="onboarding__step">
                        <h1 className="onboarding__title">Come ti chiami?</h1>
                        <p className="onboarding__desc">Il tuo nome apparirà nella dashboard.</p>
                        <input
                            className="onboarding__input"
                            type="text"
                            placeholder={role === 'mamma' ? 'Es. Sara' : 'Es. Marco'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="onboarding__step">
                        <h1 className="onboarding__title">Il tuo bambino</h1>
                        <p className="onboarding__desc">Puoi aggiungere le info ora o più tardi.</p>

                        <label className="onboarding__label">Nome (facoltativo)</label>
                        <input
                            className="onboarding__input"
                            type="text"
                            placeholder="Non ancora scelto..."
                            value={babyNameInput}
                            onChange={(e) => setBabyNameInput(e.target.value)}
                        />

                        <label className="onboarding__label">Data di concepimento</label>
                        <input
                            className="onboarding__input"
                            type="date"
                            value={conceptionInput}
                            onChange={(e) => setConceptionInput(e.target.value)}
                        />

                        <div className="onboarding__invite-card">
                            <span className="onboarding__invite-icon">🔗</span>
                            <div>
                                <strong>Hai ricevuto un invito?</strong>
                                <p>Se l'altro genitore ha già configurato, inserisci il codice invito per sincronizzarti.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="onboarding__actions">
                <button
                    className="onboarding__btn"
                    onClick={handleNext}
                    disabled={!canProceed()}
                >
                    {step === STEPS.length - 1 ? 'Inizia' : 'Avanti'}
                </button>

                {step === 0 && (
                    <button
                        className="onboarding__skip"
                        onClick={() => { devLogin('mamma'); navigate('/home'); }}
                    >
                        ⚡ Salta (dev)
                    </button>
                )}
            </div>
        </div>
    );
}
