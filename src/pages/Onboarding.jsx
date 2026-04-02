import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, CheckCircle2, UserRound, Users, Baby, Gift, Heart, Mail, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { supabase } from '../lib/supabase';
import HomeSkeletonScreen from '../components/HomeSkeletonScreen';
import './AnimatedOnboarding.css';

/**
 * Onboarding personalizzazione — eseguito dopo la registrazione.
 * Step 1: Ruolo + nome
 * Step 2: Bebè (nome + sesso)
 * Step 3: Fase (gravidanza/nato) + data
 * Step 4: Partner invite
 * Step 5: Skeleton → salva su DB → home
 */
export default function Onboarding() {
    const navigate = useNavigate();
    const { completeOnboarding } = useUser();
    const [step, setStep] = useState(1);

    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [babyNameInput, setBabyNameInput] = useState('');
    const [babySex, setBabySex] = useState(null);
    const [status, setStatus] = useState('gravidanza');
    const [dateInput, setDateInput] = useState('');
    const [invitePartner, setInvitePartner] = useState(null);

    const haptic = async (style = ImpactStyle.Light) => {
        try { await Haptics.impact({ style }); } catch (e) { }
    };

    const handleNext = async () => { await haptic(); setStep(s => s + 1); };
    const handleBack = async () => {
        await haptic();
        if (step === 1) navigate('/register');
        else setStep(s => s - 1);
    };

    const canProceed = () => {
        if (step === 1) return !!role && name.trim().length > 0;
        if (step === 3) return !!dateInput;
        if (step === 4) return !!invitePartner;
        return true;
    };

    // Step 5: salva su DB → home
    useEffect(() => {
        if (step !== 5) return;
        let cancelled = false;

        const save = async () => {
            let conceptionTime = dateInput ? new Date(dateInput) : new Date('2025-08-10');
            if (dateInput) conceptionTime.setDate(conceptionTime.getDate() - 280);

            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            if (userId) {
                await supabase.from('profiles').upsert({
                    id: userId,
                    name: name || (role === 'mamma' ? 'Sara' : 'Marco'),
                    role: role === 'entrambi' ? 'papa' : (role || 'papa'),
                });
                await supabase.from('pregnancies').insert({
                    user_id: userId,
                    baby_name: babyNameInput || null,
                    baby_sex: babySex,
                    conception_date: conceptionTime.toISOString().split('T')[0],
                    status,
                });
            }

            if (cancelled) return;

            completeOnboarding({
                role: role === 'entrambi' ? 'papa' : (role || 'papa'),
                name: name || (role === 'mamma' ? 'Sara' : 'Marco'),
                baby: babyNameInput,
                sex: babySex,
                status,
                conception: conceptionTime,
            });
            navigate('/home');
        };

        save();
        return () => { cancelled = true; };
    }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

    if (step === 5) return <HomeSkeletonScreen />;

    return (
        <div className="aonb">
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

                    {/* STEP 1: RUOLO + NOME */}
                    {step === 1 && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">IL TUO PROFILO</div>
                            <h1 className="aonb__title">Come ti chiameremo?</h1>
                            <p className="aonb__subtitle">Scegli il tuo ruolo per le info più adatte a te.</p>
                            <div className="aonb__role-cards">
                                {[
                                    { id: 'mamma', icon: <UserRound strokeWidth={1.5} size={28} />, label: 'Mamma', desc: 'Percorso personalizzato mamma' },
                                    { id: 'papa', icon: <User strokeWidth={1.5} size={28} />, label: 'Papà', desc: 'Consigli mirati per papà' },
                                    { id: 'entrambi', icon: <Users strokeWidth={1.5} size={28} />, label: 'Lo usiamo insieme', desc: 'Account condiviso di coppia' },
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
                                        value={name} onChange={e => setName(e.target.value)} autoFocus />
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: BEBÈ */}
                    {step === 2 && (
                        <div className="ru d1">
                            <div className="aonb__step-eyebrow">IL BEBÈ</div>
                            <h1 className="aonb__title">C'è un nuovo arrivo</h1>
                            <p className="aonb__subtitle">Se hai già scelto un nome o soprannome inseriscilo, altrimenti puoi saltare!</p>
                            <div className="aonb__input-group">
                                <label className="aonb__label">Nome o soprannome (facoltativo)</label>
                                <input className="aonb__input" type="text" placeholder="Es. Lenticchia"
                                    value={babyNameInput} onChange={e => setBabyNameInput(e.target.value)} autoFocus />
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

                    {/* STEP 3: FASE + DATA */}
                    {step === 3 && (
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

                    {/* STEP 4: PARTNER */}
                    {step === 4 && (
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

                <div className="aonb__actions-bottom">
                    <button className="aonb__btn-next" onClick={handleNext} disabled={!canProceed()}>
                        {step === 4 ? 'Completa configurazione' : 'Avanti'}
                    </button>
                </div>
            </div>
        </div>
    );
}
