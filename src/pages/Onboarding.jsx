import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, CheckCircle2, UserRound, Users, Baby, Gift, Heart, Mail, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { supabase } from '../lib/supabase';
import HomeSkeletonScreen from '../components/HomeSkeletonScreen';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import './AnimatedOnboarding.css';

/**
 * Onboarding personalizzazione — eseguito dopo la registrazione.
 * Step 1: Ruolo + nome
 * Step 2: Scelta (Nuovo vs Unisciti)
 * Step 3 (Branch New): Bebè (nome + sesso)
 * Step 3 (Branch Join): Inserimento Codice
 * Step 4+: Fase, Partner, Save...
 */
export default function Onboarding() {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeOnboarding, joinPregnancy } = useUser();
    const keyboardHeight = useKeyboardHeight();
    const [step, setStep] = useState(1);
    const [joinLoading, setJoinLoading] = useState(false);

    // Credenziali passate da Register — se mancano, l'utente è arrivato direttamente (es. login senza profilo)
    const credentials = location.state; // { email, password } oppure null

    // Guardia: se non ci sono né credenziali né sessione, rimanda a /register
    useEffect(() => {
        if (credentials?.email) return; // viene da Register, ok
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate('/register', { replace: true });
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Step 2 choice
    const [onboardingType, setOnboardingType] = useState(null); // 'new' | 'join'
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');

    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [babySex, setBabySex] = useState(null);
    const [status, setStatus] = useState('gravidanza');
    const [dateInput, setDateInput] = useState('');
    const [invitePartner, setInvitePartner] = useState(null);

    const haptic = async (style = ImpactStyle.Light) => {
        try { await Haptics.impact({ style }); } catch (e) { }
    };

    const handleJoin = async () => {
        if (joinCode.trim().length < 6) return;
        setJoinError('');
        setJoinLoading(true);

        // Il branch join richiede sessione attiva.
        // Se l'utente viene da Register, signUp non è ancora avvenuto → lo facciamo ora.
        if (credentials?.email && credentials?.password) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
            });
            if (signUpError) {
                setJoinLoading(false);
                setJoinError(signUpError.message.includes('already registered')
                    ? 'Email già registrata. Torna indietro e usa Accedi.'
                    : 'Errore creazione account. Riprova.');
                return;
            }
            if (signUpData.user?.id) {
                await supabase.from('profiles').upsert({ id: signUpData.user.id, name, role, birth_date: birthDate || null });
            }
        }

        const res = await joinPregnancy(joinCode, name, role);
        setJoinLoading(false);
        if (res.success) {
            await haptic(ImpactStyle.Heavy);
            navigate('/home');
        } else {
            setJoinError(res.error || 'Codice non valido o scaduto.');
        }
    };

    const handleNext = async () => {
        await haptic();
        if (step === 3 && onboardingType === 'join') {
            await handleJoin();
            return;
        }
        setStep(s => s + 1);
    };

    const handleBack = async () => {
        await haptic();
        if (step === 1) navigate('/register');
        else setStep(s => s - 1);
    };

    const canProceed = () => {
        if (step === 1) return !!role && name.trim().length > 0;
        if (step === 2) return !!onboardingType;
        if (step === 3 && onboardingType === 'join') return joinCode.trim().length >= 6;
        if (step === 4) return !!dateInput;
        if (step === 5) return !!invitePartner;
        return true;
    };

    // Step 6: signUp (se viene da Register) + salva profilo/gravidanza su DB → home
    useEffect(() => {
        if (step !== 6 || onboardingType === 'join') return;
        let cancelled = false;

        const save = async () => {
            let conceptionTime = dateInput ? new Date(dateInput) : new Date('2025-08-10');
            if (dateInput && status === 'gravidanza') conceptionTime.setDate(conceptionTime.getDate() - 280);

            let userId = null;

            if (credentials?.email && credentials?.password) {
                // Nuovo utente: creiamo l'account auth solo ora, alla fine dell'onboarding
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: credentials.email,
                    password: credentials.password,
                });
                if (signUpError) {
                    if (cancelled) return;
                    // Email già registrata → manda al login
                    navigate('/login');
                    return;
                }
                userId = data.user?.id;
            } else {
                // Utente già autenticato (es. login senza profilo → onboarding)
                const { data: { user } } = await supabase.auth.getUser();
                userId = user?.id;
            }

            if (userId) {
                await supabase.from('profiles').upsert({
                    id: userId, name, role,
                    birth_date: birthDate || null,
                });

                const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                await supabase.from('pregnancies').insert({
                    creator_id: userId,
                    baby_name: babyNameInput || null,
                    baby_sex: babySex,
                    conception_date: conceptionTime.toISOString().split('T')[0],
                    status,
                    invite_code: generatedCode,
                });
            }

            if (cancelled) return;

            completeOnboarding({ role, name, birthDate, baby: babyNameInput, sex: babySex, status, conception: conceptionTime });
            navigate('/home');
        };

        save();
        return () => { cancelled = true; };
    }, [step, onboardingType]); // eslint-disable-line react-hooks/exhaustive-deps

    if ((step === 6 && onboardingType === 'new') || joinLoading) return <HomeSkeletonScreen />;

    const totalDots = onboardingType === 'join' ? 3 : 5;

    return (
        <div className="aonb">
            <div className="aonb__step--standard">
                <div className="aonb__progress-header">
                    <div className="aonb__back-icon" onClick={handleBack}><ArrowLeft size={20} /></div>
                    <div className="aonb__progress-dots">
                        {Array.from({ length: totalDots }).map((_, i) => (
                            <div key={i} className={`aonb__pdot ${step >= i + 1 ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="aonb__content-inner" key={`step-${step}`}>

                    {/* STEP 1: PROFILO */}
                    {step === 1 && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">IL TUO PROFILO</div>
                            <h1 className="aonb__title">Come ti chiameremo?</h1>
                            <p className="aonb__subtitle">Scegli il tuo ruolo per le info più adatte a te.</p>
                            <div className="aonb__role-cards">
                                {[
                                    { id: 'mamma', icon: <UserRound strokeWidth={1.5} size={28} />, label: 'Mamma', desc: 'Percorso personalizzato mamma' },
                                    { id: 'papa', icon: <User strokeWidth={1.5} size={28} />, label: 'Papà', desc: 'Consigli mirati per papà' },
                                ].map(r => (
                                    <div key={r.id}
                                        className={`aonb__role-card ${role === r.id ? 'aonb__role-card--selected' : ''}`}
                                        onClick={async () => { await haptic(ImpactStyle.Medium); setRole(r.id); }}>
                                        <div className="aonb__role-icon">{r.icon}</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">{r.label}</div>
                                            <div className="aonb__role-desc">{r.desc}</div>
                                        </div>
                                        {role === r.id && <CheckCircle2 size={24} color="var(--midnight)" />}
                                    </div>
                                ))}
                            </div>
                            {role && (
                                <div className="aonb__input-group ru d1">
                                    <label className="aonb__label">Il tuo nome</label>
                                    <input className="aonb__input" type="text"
                                        placeholder={role === 'papa' ? 'Es. Marco' : 'Es. Sara'}
                                        value={name} onChange={e => setName(e.target.value)}
                                        onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                                        autoFocus />
                                    <label className="aonb__label" style={{ marginTop: 20 }}>Data di nascita <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(facoltativa)</span></label>
                                    <input className="aonb__input" type="date"
                                        value={birthDate}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={e => setBirthDate(e.target.value)} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: SCELTA (NUOVO VS UNISCITI) */}
                    {step === 2 && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">IL TUO VIAGGIO</div>
                            <h1 className="aonb__title">Cosa facciamo oggi?</h1>
                            <p className="aonb__subtitle">Puoi iniziare un nuovo percorso o unirti a quello del tuo partner.</p>
                            
                            <div className="aonb__role-cards">
                                <div 
                                    className={`aonb__role-card ${onboardingType === 'new' ? 'aonb__role-card--selected' : ''}`}
                                    onClick={() => { haptic(); setOnboardingType('new'); }}
                                >
                                    <div className="aonb__role-icon"><Heart size={28} color="var(--aqua)" /></div>
                                    <div className="aonb__role-text">
                                        <div className="aonb__role-label">Inizia un nuovo percorso</div>
                                        <div className="aonb__role-desc">Configura la tua gravidanza</div>
                                    </div>
                                    {onboardingType === 'new' && <CheckCircle2 size={24} color="var(--midnight)" />}
                                </div>

                                <div 
                                    className={`aonb__role-card ${onboardingType === 'join' ? 'aonb__role-card--selected' : ''}`}
                                    onClick={() => { haptic(); setOnboardingType('join'); }}
                                >
                                    <div className="aonb__role-icon"><Users size={28} color="var(--aqua)" /></div>
                                    <div className="aonb__role-text">
                                        <div className="aonb__role-label">Ho già un codice partner</div>
                                        <div className="aonb__role-desc">Unisciti a una gravidanza esistente</div>
                                    </div>
                                    {onboardingType === 'join' && <CheckCircle2 size={24} color="var(--midnight)" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: BEBE (NEW) O CODICE (JOIN) */}
                    {step === 3 && onboardingType === 'new' && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">IL BEBÈ</div>
                            <h1 className="aonb__title">C'è un nuovo arrivo</h1>
                            <p className="aonb__subtitle">Se hai già scelto un nome o soprannome inseriscilo, altrimenti puoi saltare!</p>
                            <div className="aonb__input-group">
                                <label className="aonb__label">Nome o soprannome (facoltativo)</label>
                                <input className="aonb__input" type="text" placeholder="Es. Lenticchia"
                                    value={babyNameInput} onChange={e => setBabyNameInput(e.target.value)}
                                    onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                                    autoFocus />
                            </div>
                            <div className="aonb__input-group" style={{ marginTop: 24 }}>
                                <label className="aonb__label">Sesso</label>
                                <div className="aonb__sex-pills">
                                    {[
                                        { id: 'M', icon: <Baby strokeWidth={1.5} size={20} />, label: 'Maschietto' },
                                        { id: 'F', icon: <Baby strokeWidth={1.5} size={20} />, label: 'Femminuccia' },
                                        { id: 'surprise', icon: <Gift strokeWidth={1.5} size={20} />, label: 'Sorpresa' },
                                    ].map(s => (
                                        <div key={s.id}
                                            className={`aonb__sex-pill ${babySex === s.id ? 'aonb__sex-pill--selected' : ''}`}
                                            onClick={async () => { await haptic(ImpactStyle.Medium); setBabySex(s.id); }}>
                                            {s.icon} {s.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && onboardingType === 'join' && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">COLLEGAMENTO</div>
                            <h1 className="aonb__title">Inserisci il codice</h1>
                            <p className="aonb__subtitle">Chiedi al tuo partner il codice che trova nella sezione Profilo della sua app.</p>
                            
                            <div className="aonb__input-group ru d1" style={{ marginTop: 24 }}>
                                <label className="aonb__label">Codice Invito</label>
                                <input
                                    className="aonb__input aonb__input--code"
                                    type="text"
                                    placeholder="ES: A8B2CH"
                                    maxLength={10}
                                    value={joinCode}
                                    onChange={e => {
                                        setJoinCode(e.target.value.toUpperCase());
                                        setJoinError('');
                                    }}
                                    onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300)}
                                    autoComplete="off"
                                    autoFocus
                                />
                                {joinError && <p className="aonb__error-message">{joinError}</p>}
                                <p className="aonb__info-text">
                                    Collegandoti condividerai i dati della gravidanza, l'agenda e le notifiche con il tuo partner.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: FASE + DATA */}
                    {step === 4 && onboardingType === 'new' && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">LA FASE</div>
                            <h1 className="aonb__title">A che punto siete?</h1>
                            <p className="aonb__subtitle">Ci adatteremo perfettamente al momento in cui vi trovate.</p>
                            <div className="aonb__role-cards" style={{ marginBottom: 24 }}>
                                {[
                                    { id: 'gravidanza', icon: <Heart strokeWidth={1.5} size={28} />, label: 'Siamo in gravidanza', desc: null },
                                    { id: 'nato', icon: <Baby strokeWidth={1.5} size={28} />, label: 'Il bimbo è già nato', desc: 'Primi mesi di vita' },
                                ].map(s => (
                                    <div key={s.id}
                                        className={`aonb__role-card ${status === s.id ? 'aonb__role-card--selected' : ''}`}
                                        onClick={async () => { await haptic(ImpactStyle.Medium); setStatus(s.id); }}>
                                        <div className="aonb__role-icon">{s.icon}</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">{s.label}</div>
                                            {s.desc && <div className="aonb__role-desc">{s.desc}</div>}
                                        </div>
                                        {status === s.id && <CheckCircle2 size={24} color="var(--midnight)" />}
                                    </div>
                                ))}
                            </div>
                            <div className="aonb__input-group">
                                <label className="aonb__label">
                                    {status === 'gravidanza' ? 'Data presunta del parto' : 'Data di nascita'}
                                </label>
                                <input className="aonb__input" type="date" value={dateInput}
                                    min={status === 'gravidanza' ? new Date().toISOString().split('T')[0] : undefined}
                                    max={status === 'nato' ? new Date().toISOString().split('T')[0] : undefined}
                                    onChange={e => setDateInput(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* STEP 5: PARTNER */}
                    {step === 5 && onboardingType === 'new' && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">CONDIVIDI</div>
                            <h1 className="aonb__title">Cresciamo insieme</h1>
                            <p className="aonb__subtitle">ParentPath è progettato per condividere info e progressi in coppia.</p>
                            <div className="aonb__role-cards">
                                {[
                                    { id: 'si', bg: 'var(--aqua2)', icon: <Mail color="var(--aqua)" strokeWidth={2} size={22} />, label: 'Voglio invitarlo ora', desc: 'Invia link di affiliazione' },
                                    { id: 'no', bg: 'var(--border)', icon: <User color="var(--stone)" strokeWidth={2} size={22} />, label: 'Lo farò più tardi', desc: 'Continua in solitaria' },
                                ].map(p => (
                                    <div key={p.id}
                                        className={`aonb__role-card ${invitePartner === p.id ? 'aonb__role-card--selected' : ''}`}
                                        onClick={async () => { await haptic(ImpactStyle.Medium); setInvitePartner(p.id); }}>
                                        <div className="aonb__role-icon" style={{ background: p.bg, borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {p.icon}
                                        </div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">{p.label}</div>
                                            <div className="aonb__role-desc">{p.desc}</div>
                                        </div>
                                        {invitePartner === p.id && <CheckCircle2 size={24} color="var(--midnight)" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="aonb__actions-bottom"
                    style={keyboardHeight > 0 ? {
                        position: 'sticky',
                        bottom: 0,
                        background: 'var(--page-bg)',
                        paddingBottom: keyboardHeight + 8,
                        marginTop: 8,
                        zIndex: 10,
                    } : {}}
                >
                    <button className="aonb__btn-next" onClick={handleNext} disabled={!canProceed()}>
                        {step === 3 && onboardingType === 'join' ? 'Unisciti al partner' : (step === 5 ? 'Completa configurazione' : 'Avanti')}
                    </button>
                </div>
            </div>
        </div>
    );
}
