import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, CheckCircle2, UserRound, Users, Baby, Heart, User, CalendarDays, Sparkles } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { supabase } from '../lib/supabase';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import './AnimatedOnboarding.css';

function OnboardingLoader({ onDone, userName, role }) {
    const [phase, setPhase] = useState('loading'); // 'loading' | 'done'
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setProgress(25), 200);
        const t2 = setTimeout(() => setProgress(55), 900);
        const t3 = setTimeout(() => setProgress(85), 1800);
        const t4 = setTimeout(() => setProgress(100), 2600);
        const t5 = setTimeout(() => setPhase('done'), 2900);
        const t6 = setTimeout(() => { if (onDone) onDone(); }, 4400);
        return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={`aonb-loader ${phase === 'done' ? 'aonb-loader--done' : ''}`}>
            {phase === 'loading' ? (
                <div className="aonb-loader__inner">
                    <div className="aonb-loader__rings">
                        <div className="aonb-loader__ring aonb-loader__ring--1" />
                        <div className="aonb-loader__ring aonb-loader__ring--2" />
                        <div className="aonb-loader__icon">
                            <svg viewBox="0 0 44 44" fill="none" width="32" height="32">
                                <ellipse cx="22" cy="16" rx="9" ry="10" stroke="var(--aqua)" strokeWidth="2.5"/>
                                <path d="M6 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="var(--aqua)" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="aonb-loader__name">ParentPath</div>
                    <div className="aonb-loader__label">Stiamo preparando il tuo percorso…</div>
                    <div className="aonb-loader__track">
                        <div className="aonb-loader__fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            ) : (
                <div className="aonb-loader__done">
                    <div className="aonb-loader__check">
                        <svg viewBox="0 0 52 52" fill="none" width="52" height="52">
                            <circle cx="26" cy="26" r="26" fill="rgba(61,191,184,0.12)"/>
                            <path d="M14 26l9 9 15-16" stroke="var(--aqua)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="aonb-loader__welcome">
                        {role === 'mamma' ? 'Benvenuta' : 'Benvenuto'}
                    </div>
                    <div className="aonb-loader__welcome-name">{userName || 'su ParentPath'}</div>
                    <div className="aonb-loader__welcome-sub">Il tuo percorso inizia adesso</div>
                </div>
            )}
        </div>
    );
}

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
    const { completeOnboarding, joinPregnancy, previewJoin, addWeightLog } = useUser();
    const keyboardHeight = useKeyboardHeight();
    const [step, setStep] = useState(1);
    const [joinPreview, setJoinPreview] = useState(null); // dati trovati prima di confermare

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
    const [initialWeight, setInitialWeight] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [babySex, setBabySex] = useState(null);
    const [status, setStatus] = useState('gravidanza');
    const [dateInput, setDateInput] = useState('');

    const haptic = async (style = ImpactStyle.Light) => {
        try { await Haptics.impact({ style }); } catch (e) { }
    };

    // Step 3 join: cerca preview senza committare
    const handlePreviewJoin = async () => {
        setJoinError('');
        const res = await previewJoin(joinCode.trim());
        if (res.success) {
            setJoinPreview(res.preview);
            setStep(3.5);
        } else {
            setJoinError(res.error || 'Codice non valido o scaduto.');
        }
    };

    // Step 3.5 join: conferma e completa l'account + collegamento
    const handleConfirmJoin = async () => {
        if (credentials?.email && credentials?.password) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
            });
            if (signUpError) {
                setJoinError(signUpError.message.includes('already registered')
                    ? 'Email già registrata. Torna indietro e usa Accedi.'
                    : 'Errore creazione account. Riprova.');
                setStep(3);
                return;
            }
            if (signUpData.user?.id) {
                await supabase.from('profiles').upsert({ id: signUpData.user.id, name, role, birth_date: birthDate || null });
            }
        }

        const res = await joinPregnancy(joinCode, name, role);
        if (res.success) {
            await haptic(ImpactStyle.Heavy);
            setStep('welcome');
        } else {
            setJoinError(res.error || 'Codice non valido o scaduto.');
            setStep(3);
        }
    };

    const handleNext = async () => {
        await haptic();
        if (step === 3 && onboardingType === 'join') {
            await handlePreviewJoin();
            return;
        }
        // Nel flusso 'new', dopo lo step 4 salta direttamente al salvataggio (step 6)
        // Lo step 5 (codice partner opzionale) è rimosso — si può collegare da Profilo dopo
        if (step === 4 && onboardingType === 'new') {
            setStep(6);
            return;
        }
        setStep(s => s + 1);
    };

    const handleBack = async () => {
        await haptic();
        if (step === 'welcome') return;
        if (step === 3.5) { setStep(3); setJoinPreview(null); return; }
        if (step === 1) navigate('/register');
        else setStep(s => s - 1);
    };

    const canProceed = () => {
        if (step === 1) return !!role && name.trim().length > 0;
        if (step === 2) return !!onboardingType;
        if (step === 3 && onboardingType === 'join') return joinCode.trim().length >= 6;
        if (step === 4) return !!dateInput;
        if (step === 5) return true;
        return true;
    };

    // Step 6 new: salva tutto e vai alla welcome screen
    useEffect(() => {
        if (step !== 6 || onboardingType === 'join') return;
        let cancelled = false;

        const save = async () => {
            // fallback: gravidanza demo a ~20 settimane
            const fallbackDue = new Date();
            fallbackDue.setDate(fallbackDue.getDate() + 140);
            let conceptionTime = dateInput ? new Date(dateInput) : fallbackDue;
            if (dateInput && status === 'gravidanza') conceptionTime.setDate(conceptionTime.getDate() - 280);
            if (!dateInput) conceptionTime.setDate(conceptionTime.getDate() - 280);

            let userId = null;
            if (credentials?.email && credentials?.password) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: credentials.email,
                    password: credentials.password,
                });
                if (signUpError) { if (!cancelled) navigate('/login'); return; }
                userId = data.user?.id;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                userId = user?.id;
            }

            if (userId) {
                await supabase.from('profiles').upsert({ id: userId, name, role, birth_date: birthDate || null });
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
            if (role === 'mamma' && initialWeight && !isNaN(parseFloat(initialWeight))) {
                addWeightLog(parseFloat(initialWeight));
            }
            setStep('welcome');
        };

        save();
        return () => { cancelled = true; };
    }, [step, onboardingType]); // eslint-disable-line react-hooks/exhaustive-deps

    if (step === 6) {
        return <OnboardingLoader onDone={() => navigate('/home')} userName={name} role={role} />;
    }

    if (step === 'loading') {
        return <OnboardingLoader onDone={() => navigate('/home')} userName={name} role={role} />;
    }

    if (step === 'welcome') {
        const babyLabel = (onboardingType === 'join' ? joinPreview?.babyName : babyNameInput) || null;
        const babySexVal = onboardingType === 'join' ? joinPreview?.babySex : babySex;

        return (
            <div className="aonb aonb--welcome">
                <div className="aonb__welcome-inner ru d1">
                    <div className="aonb__welcome-avatar">
                        <svg viewBox="0 0 80 80" fill="none" width="64" height="64">
                            <circle cx="40" cy="40" r="40" fill="rgba(61,191,184,0.1)"/>
                            <ellipse cx="40" cy="32" rx="14" ry="15" stroke="var(--aqua)" strokeWidth="2.5"/>
                            <path d="M14 72c0-14.359 11.641-26 26-26s26 11.641 26 26" stroke="var(--aqua)" strokeWidth="2.5" strokeLinecap="round"/>
                            {babySexVal === 'M' && <path d="M40 17 C40 17 46 12 52 15" stroke="var(--aqua)" strokeWidth="2" strokeLinecap="round"/>}
                        </svg>
                    </div>
                    <div className="aonb__welcome-eyebrow">BENVENUTO SU PARENTPATH</div>
                    <h1 className="aonb__welcome-title">
                        Ciao {name}!{'\n'}Sei {role === 'mamma' ? 'pronta' : 'pronto'} per questo viaggio?
                    </h1>
                    {babyLabel && (
                        <div className="aonb__welcome-baby">
                            Il vostro piccolo <strong>{babyLabel}</strong> vi aspetta.
                        </div>
                    )}
                    <div className="aonb__welcome-features">
                        {[
                            { icon: <CalendarDays size={18} strokeWidth={1.8} />, text: 'Agenda e visite sempre sott\'occhio' },
                            { icon: <Baby size={18} strokeWidth={1.8} />, text: 'Crescita e sviluppo settimana per settimana' },
                            { icon: <Users size={18} strokeWidth={1.8} />, text: 'Sincronizzato col tuo partner' },
                            { icon: <Sparkles size={18} strokeWidth={1.8} />, text: 'Consigli personalizzati per te' },
                        ].map((f, i) => (
                            <div key={i} className="aonb__welcome-feat-row">
                                <span className="aonb__welcome-feat-ic">{f.icon}</span>
                                <span className="aonb__welcome-feat-text">{f.text}</span>
                            </div>
                        ))}
                    </div>
                    <button className="aonb__btn-next aonb__btn-welcome" onClick={() => setStep('loading')}>
                        Inizia il percorso
                    </button>
                </div>
            </div>
        );
    }

    const totalDots = onboardingType === 'join' ? 4 : 4;
    const currentDot = step === 3.5 ? 4 : step;

    return (
        <div className="aonb">
            <div className="aonb__step--standard">
                <div className="aonb__progress-header">
                    <div className="aonb__back-icon" onClick={handleBack}><ArrowLeft size={20} /></div>
                    <div className="aonb__progress-dots">
                        {Array.from({ length: totalDots }).map((_, i) => (
                            <div key={i} className={`aonb__pdot ${currentDot >= i + 1 ? 'active' : ''}`} />
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
                                    {role === 'mamma' && (
                                        <>
                                            <label className="aonb__label" style={{ marginTop: 20 }}>Il tuo peso attuale <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(facoltativo)</span></label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <input className="aonb__input" type="number" inputMode="decimal"
                                                    placeholder="Es. 62.5"
                                                    min="30" max="200" step="0.1"
                                                    value={initialWeight}
                                                    onChange={e => setInitialWeight(e.target.value)}
                                                    style={{ flex: 1 }} />
                                                <span style={{ color: 'var(--stone)', fontSize: 14, whiteSpace: 'nowrap' }}>kg</span>
                                            </div>
                                        </>
                                    )}
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
                                        { id: 'surprise', icon: <Baby strokeWidth={1.5} size={20} />, label: 'Non ancora definito' },
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
                                    onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
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

                    {/* STEP 3.5: RIEPILOGO + CONFERMA collegamento */}
                    {step === 3.5 && onboardingType === 'join' && joinPreview && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">LA TUA FAMIGLIA</div>
                            <h1 className="aonb__title">Eccoli!</h1>
                            <p className="aonb__subtitle">Conferma per iniziare il percorso insieme.</p>

                            <div className="aonb__family-card ru d2">
                                {/* Avatars row */}
                                <div className="aonb__family-avatars">
                                    <div className="aonb__family-av-wrap">
                                        <div className="aonb__family-av aonb__family-av--partner">
                                            <svg viewBox="0 0 44 44" fill="none" width="32" height="32">
                                                <circle cx="22" cy="15" r="8" stroke="var(--aqua)" strokeWidth="2.2"/>
                                                <path d="M6 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="var(--aqua)" strokeWidth="2.2" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                        <div className="aonb__family-av-name">{joinPreview.creator?.name || 'Partner'}</div>
                                        <div className="aonb__family-av-role">{joinPreview.creator?.role === 'mamma' ? 'Mamma' : 'Papà'}</div>
                                    </div>

                                    <div className="aonb__family-av-wrap">
                                        <div className="aonb__family-av aonb__family-av--me">
                                            <svg viewBox="0 0 44 44" fill="none" width="32" height="32">
                                                <circle cx="22" cy="15" r="8" stroke="var(--midnight)" strokeWidth="2.2"/>
                                                <path d="M6 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="var(--midnight)" strokeWidth="2.2" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                        <div className="aonb__family-av-name">{name || 'Tu'}</div>
                                        <div className="aonb__family-av-role">{role === 'mamma' ? 'Mamma' : 'Papà'}</div>
                                    </div>

                                    <div className="aonb__family-av-wrap">
                                        <div className="aonb__family-av aonb__family-av--baby">
                                            <Heart size={22} strokeWidth={1.8} color="#E8A0A0" fill="rgba(232,160,160,0.3)" />
                                        </div>
                                        <div className="aonb__family-av-name">
                                            {joinPreview.babyName || (joinPreview.babySex === 'M' ? 'Maschietto' : joinPreview.babySex === 'F' ? 'Femminuccia' : 'Non ancora definito')}
                                        </div>
                                        <div className="aonb__family-av-role">{joinPreview.weekInfo}</div>
                                    </div>
                                </div>

                                <div className="aonb__family-divider" />

                                <div className="aonb__family-sync-row">
                                    <Users size={14} strokeWidth={2} color="var(--aqua)" />
                                    <span>Agenda, note e visite condivise</span>
                                </div>
                            </div>

                            {joinError && <p className="aonb__error-message">{joinError}</p>}
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
                                    { id: 'gravidanza', icon: <Heart strokeWidth={1.5} size={28} />, label: 'Siamo in gravidanza', desc: null, wip: false },
                                    { id: 'nato', icon: <Baby strokeWidth={1.5} size={28} />, label: 'Il bimbo è già nato', desc: 'Primi mesi di vita', wip: true },
                                ].map(s => (
                                    <div key={s.id}
                                        className={`aonb__role-card ${status === s.id ? 'aonb__role-card--selected' : ''} ${s.wip ? 'aonb__role-card--wip' : ''}`}
                                        onClick={async () => { if (s.wip) return; await haptic(ImpactStyle.Medium); setStatus(s.id); }}>
                                        <div className="aonb__role-icon">{s.icon}</div>
                                        <div className="aonb__role-text">
                                            <div className="aonb__role-label">{s.label}</div>
                                            {s.desc && <div className="aonb__role-desc">{s.desc}</div>}
                                            {s.wip && <div className="aonb__role-wip">Prossimamente</div>}
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
                    <button
                        className="aonb__btn-next"
                        onClick={step === 3.5 ? handleConfirmJoin : handleNext}
                        disabled={!canProceed()}
                    >
                        {step === 3 && onboardingType === 'join' ? 'Cerca partner' :
                         step === 3.5 ? 'Conferma e collegati' :
                         step === 4 && onboardingType === 'new' ? 'Completa la configurazione' : 'Avanti'}
                    </button>
                </div>
            </div>
        </div>
    );
}
