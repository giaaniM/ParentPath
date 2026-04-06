import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { User, Settings, Shield, LogOut, ChevronRight, Bell, Calendar, Heart, Edit2, Users, Copy, Check, Share2, Unlink, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EditProfileModal from '../components/EditProfileModal';
import ProfileCompletion from '../components/ProfileCompletion';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const getAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const today = new Date();
    const birth = new Date(birthDateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? age : null;
};

export default function Profile() {
    const {
        isMamma, userName, userRole, babyName, babyStatus, logout,
        inviteCode, partnerId, generateInviteCode, unlinkPartner, birthDate, joinPregnancy, previewJoin,
    } = useUser();

    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [livePartnerId, setLivePartnerId] = useState(partnerId);
    const [isCreator, setIsCreator] = useState(true);
    const [unlinkConfirm, setUnlinkConfirm] = useState(false);
    const [unlinkLoading, setUnlinkLoading] = useState(false);
    const [liveInviteCode, setLiveInviteCode] = useState(inviteCode);
    const [partnerInfo, setPartnerInfo] = useState(null); // { name, role, birth_date }
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinPreview, setJoinPreview] = useState(null); // dati trovati prima di confermare

    // Sincronizza livePartnerId col context (che carica da DB async all'avvio)
    // Non sovrascrive se il modal è aperto (ha già dati freschi dal DB)
    useEffect(() => {
        if (!isPartnerModalOpen) setLivePartnerId(partnerId);
    }, [partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Carica email utente dalla sessione Supabase
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email) setUserEmail(session.user.email);
        });
    }, []);

    // Auto-apri il modal se arrivi da Home con openPartner/openEdit: true
    useEffect(() => {
        if (location.state?.openPartner) {
            openPartnerModal();
            navigate(location.pathname, { replace: true, state: {} });
        } else if (location.state?.openEdit) {
            setIsEditOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const openPartnerModal = async () => {
        setUnlinkConfirm(false);
        setIsPartnerModalOpen(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = session.user.id;
        const { data: preg } = await supabase
            .from('pregnancies')
            .select('creator_id, partner_id, invite_code')
            .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
            .maybeSingle();
        if (preg) {
            const isCreatorUser = preg.creator_id === userId;
            // Bug fix: se sono il partner (non creatore), il mio "partner" è il creatore
            const pid = isCreatorUser ? preg.partner_id : preg.creator_id;
            setLivePartnerId(pid || null);
            setIsCreator(isCreatorUser);
            setLiveInviteCode(preg.invite_code || null);

            // Carica info partner dal DB
            if (pid) {
                const { data: pProfile } = await supabase
                    .from('profiles')
                    .select('name, role, birth_date')
                    .eq('id', pid)
                    .maybeSingle();
                setPartnerInfo(pProfile || null);
            } else {
                setPartnerInfo(null);
            }
        }
    };

    const handleUnlink = async () => {
        setUnlinkLoading(true);
        const res = await unlinkPartner();
        setUnlinkLoading(false);
        if (res.success) {
            setLivePartnerId(null);
            setUnlinkConfirm(false);
        }
    };

    const handleGenerateCode = async () => {
        const code = await generateInviteCode();
        if (code) setLiveInviteCode(code);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Step 1: cerca il codice e mostra preview
    const handlePreviewJoin = async () => {
        if (joinCode.trim().length < 6) return;
        setJoinError('');
        setJoinLoading(true);
        const res = await previewJoin(joinCode.trim());
        setJoinLoading(false);
        if (res.success) {
            setJoinPreview(res.preview);
        } else {
            setJoinError(res.error || 'Codice non valido o scaduto.');
        }
    };

    // Step 2: conferma e completa il collegamento
    const handleConfirmJoin = async () => {
        setJoinLoading(true);
        const res = await joinPregnancy(joinCode.trim(), userName, userRole);
        setJoinLoading(false);
        if (res.success) {
            setJoinPreview(null);
            setJoinCode('');
            showToast({ title: 'Partner collegato!', subtitle: 'Siete sincronizzati in tempo reale.', type: 'partner', duration: 4000 });
            openPartnerModal();
        } else {
            setJoinError(res.error || 'Errore durante il collegamento.');
            setJoinPreview(null);
        }
    };

    const sections = [
        {
            title: 'Account',
            items: [
                { id: 'personal', icon: User, label: 'Informazioni personali', action: () => setIsEditOpen(true) },
                {
                    id: 'partner',
                    icon: Users,
                    label: livePartnerId ? 'Partner Collegato' : 'Invita Partner',
                    action: openPartnerModal,
                },
                { id: 'notifications', icon: Bell, label: 'Notifiche', action: () => navigate('/notifications') },
                { id: 'settings', icon: Settings, label: 'Impostazioni app', action: () => {} },
            ]
        },
        {
            title: 'Percorso',
            items: [
                { id: 'baby', icon: Heart, label: 'Dati del bambino', action: () => navigate('/baby') },
                { id: 'agenda', icon: Calendar, label: 'La mia Agenda', action: () => navigate('/agenda') },
            ]
        },
        {
            title: 'Supporto',
            items: [
                { id: 'privacy', icon: Shield, label: 'Privacy Policy', action: () => {} },
            ]
        }
    ];

    return (
        <div className="page profile-page">
            <div className="profile-container">
                <h1 className="profile-main-title">Profilo</h1>

                <div className="profile-user-card" onClick={() => setIsEditOpen(true)}>
                    <div className="puc-avatar" style={{ background: isMamma ? 'rgba(61,191,184,0.1)' : 'rgba(15,32,53,0.06)' }}>
                        {isMamma ? (
                            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                                <circle cx="22" cy="15" r="8" stroke="var(--aqua)" strokeWidth="2.2"/>
                                <path d="M6 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="var(--aqua)" strokeWidth="2.2" strokeLinecap="round"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                                <circle cx="22" cy="15" r="8" stroke="var(--midnight)" strokeWidth="2.2"/>
                                <path d="M6 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="var(--midnight)" strokeWidth="2.2" strokeLinecap="round"/>
                            </svg>
                        )}
                    </div>
                    <div className="puc-info">
                        <div className="puc-name">{userName || 'Genitore'}</div>
                        <div className="puc-role">
                            {userRole === 'mamma' ? 'Mamma' : 'Papà'}
                            {babyStatus === 'nato' ? '' : ' in attesa'}
                            {babyName ? ` • ${babyName}` : ''}
                        </div>
                        {userEmail && (
                            <div className="puc-email">{userEmail}</div>
                        )}
                        {birthDate && (
                            <div className="puc-birthdate">
                                {getAge(birthDate) ? `${getAge(birthDate)} anni` : new Date(birthDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        )}
                        {/* Badge partner collegato */}
                        {livePartnerId && (
                            <div className="puc-partner-badge">
                                <Users size={11} strokeWidth={2.5} />
                                <span>Connesso con {partnerInfo?.name || 'Partner'}</span>
                            </div>
                        )}
                    </div>
                    <div className="puc-edit">
                        <Edit2 size={20} color="var(--stone)" />
                    </div>
                </div>

                {/* COMPLETION CARD — sparisce al 100% */}
                <ProfileCompletion />

                <div className="profile-content">
                {sections.map((section, idx) => (
                    <div key={idx} className="profile-section">
                        <h2 className="profile-section-title">{section.title}</h2>
                        <div className="profile-menu-list">
                            {section.items.map((item) => (
                                <button key={item.id} className="profile-menu-item" onClick={item.action}>
                                    <div className="profile-menu-icon-wrap">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="profile-menu-label">{item.label}</span>
                                    <ChevronRight size={18} className="profile-menu-chevron" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button className="profile-logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Esci dall'account</span>
                </button>

                <div className="profile-version">
                    ParentPath v1.2.0 • Premium
                </div>
            </div> {/* Closing profile-content */}
        </div> {/* Closing profile-container */}

        <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        
        {/* Modal Partner */}
        {isPartnerModalOpen && (
            <div className="profile-modal-overlay" onClick={() => setIsPartnerModalOpen(false)}>
                <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                    {livePartnerId ? (
                        /* ── HEADER SPECIALE: PARTNER COLLEGATO ── */
                        <div className="pmc-linked-header">
                            <div className="pmc-linked-avatars">
                                <div className="pmc-linked-av pmc-linked-av--me">
                                    <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                                        <circle cx="20" cy="14" r="7" stroke="var(--aqua)" strokeWidth="2"/>
                                        <path d="M5 36c0-8.284 6.716-15 15-15s15 6.716 15 15" stroke="var(--aqua)" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <div className="pmc-linked-heart">
                                    <Heart size={14} fill="var(--aqua)" color="var(--aqua)" />
                                </div>
                                <div className="pmc-linked-av pmc-linked-av--partner">
                                    <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                                        <circle cx="20" cy="14" r="7" stroke="var(--midnight)" strokeWidth="2"/>
                                        <path d="M5 36c0-8.284 6.716-15 15-15s15 6.716 15 15" stroke="var(--midnight)" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="pmc-linked-title">Siete connessi</h3>
                            <div className="pmc-linked-names">{userName || 'Tu'} & {partnerInfo?.name || 'Partner'}</div>
                        </div>
                    ) : (
                        <div className="pmc-header">
                            <div className="pmc-icon-circle">
                                <Users size={22} strokeWidth={2} />
                            </div>
                            <h3 className="pmc-title">Invita il Partner</h3>
                        </div>
                    )}

                    <div className="pmc-body">
                        {livePartnerId ? (
                            /* ── STATO: PARTNER COLLEGATO ── */
                            <div className="pmc-status-linked">
                                <div className="pmc-partner-info-row">
                                    <div className="pmc-pi-block">
                                        <div className="pmc-pi-role">{partnerInfo?.role === 'mamma' ? 'Mamma' : 'Papà'}</div>
                                        {getAge(partnerInfo?.birth_date) && (
                                            <div className="pmc-pi-age">{getAge(partnerInfo.birth_date)} anni</div>
                                        )}
                                    </div>
                                    <div className="pmc-pi-divider" />
                                    <div className="pmc-pi-block">
                                        <div className="pmc-pi-role">Agenda</div>
                                        <div className="pmc-pi-age">Condivisa</div>
                                    </div>
                                    <div className="pmc-pi-divider" />
                                    <div className="pmc-pi-block">
                                        <div className="pmc-pi-role">Percorso</div>
                                        <div className="pmc-pi-age">Sincronizzato</div>
                                    </div>
                                </div>

                                {!unlinkConfirm ? (
                                    <button className="pmc-unlink-btn" onClick={() => setUnlinkConfirm(true)}>
                                        <Unlink size={15} style={{ marginRight: 6 }} />
                                        Scollega partner
                                    </button>
                                ) : (
                                    <div className="pmc-unlink-confirm">
                                        <AlertTriangle size={20} color="var(--color-error)" />
                                        <p className="pmc-unlink-warn">Sei sicuro? Perderete la sincronizzazione condivisa.</p>
                                        <div className="pmc-unlink-actions">
                                            <button className="pmc-unlink-cancel" onClick={() => setUnlinkConfirm(false)}>Annulla</button>
                                            <button className="pmc-unlink-confirm-btn" onClick={handleUnlink} disabled={unlinkLoading}>
                                                {unlinkLoading ? '...' : 'Scollega'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : isCreator ? (
                            /* ── STATO: CREATORE SENZA PARTNER — mostra codice da condividere ── */
                            <>
                                <p>Genera un codice e condividilo con il tuo partner. Lo inserirà durante la registrazione su ParentPath.</p>
                                {liveInviteCode ? (
                                    <div className="pmc-code-wrap">
                                        <div className="pmc-code" data-testid="invite-code">{liveInviteCode}</div>
                                        <button className="pmc-copy-btn" onClick={() => {
                                            navigator.clipboard.writeText(liveInviteCode);
                                            setCopySuccess(true);
                                            setTimeout(() => setCopySuccess(false), 2000);
                                        }}>
                                            {copySuccess ? <Check size={20} color="var(--aqua)" /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                ) : (
                                    <button className="pmc-generate-btn" onClick={handleGenerateCode}>
                                        Genera Codice Invito
                                    </button>
                                )}
                                <p className="pmc-hint">Il codice non scade — il partner lo inserisce nella schermata "Ho già un codice" durante l'onboarding.</p>
                                {liveInviteCode && (
                                    <button className="pmc-share-btn" onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'ParentPath – Unisciti a me!',
                                                text: `Scarica ParentPath e inserisci il codice ${liveInviteCode} durante la registrazione per seguire insieme la gravidanza!`,
                                            }).catch(() => {});
                                        }
                                    }}>
                                        <Share2 size={18} style={{ marginRight: 8 }} />
                                        Condividi con il partner
                                    </button>
                                )}
                            </>
                        ) : joinPreview ? (
                            /* ── STEP 2: PREVIEW — Conferma collegamento ── */
                            <div className="pmc-preview-wrap">
                                <div className="pmc-preview-found">
                                    <div className="pmc-preview-check">✓</div>
                                    <div className="pmc-preview-found-label">Trovato!</div>
                                </div>

                                {/* Partner trovato */}
                                <div className="pmc-preview-card">
                                    <div className="pmc-preview-row">
                                        <div className="pmc-preview-role-icon">
                                            {joinPreview.creator?.role === 'mamma' ? '👩' : '👨'}
                                        </div>
                                        <div className="pmc-preview-info">
                                            <div className="pmc-preview-label-sm">Il tuo partner</div>
                                            <div className="pmc-preview-name">{joinPreview.creator?.name || 'Partner'}</div>
                                            <div className="pmc-preview-sub">{joinPreview.creator?.role === 'mamma' ? 'Mamma' : 'Papà'}{getAge(joinPreview.creator?.birth_date) ? ` · ${getAge(joinPreview.creator.birth_date)} anni` : ''}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bambino */}
                                <div className="pmc-preview-card">
                                    <div className="pmc-preview-row">
                                        <div className="pmc-preview-role-icon">
                                            {joinPreview.babySex === 'M' ? '👦' : joinPreview.babySex === 'F' ? '👧' : '👶'}
                                        </div>
                                        <div className="pmc-preview-info">
                                            <div className="pmc-preview-label-sm">{joinPreview.status === 'nato' ? 'Il bambino' : 'In arrivo'}</div>
                                            <div className="pmc-preview-name">{joinPreview.babyName || (joinPreview.babySex === 'M' ? 'Maschietto' : joinPreview.babySex === 'F' ? 'Femminuccia' : 'Sorpresa 🎁')}</div>
                                            <div className="pmc-preview-sub">{joinPreview.weekInfo}</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="pmc-preview-disclaimer">Condividerete agenda, progressi e notifiche.</p>

                                {joinError && <p className="pmc-join-error">{joinError}</p>}

                                <button className="pmc-confirm-join-btn" onClick={handleConfirmJoin} disabled={joinLoading}>
                                    {joinLoading ? 'Collegamento...' : '🔗 Confermo, collegaci!'}
                                </button>
                                <button className="pmc-back-btn" onClick={() => { setJoinPreview(null); setJoinError(''); }}>
                                    Torna indietro
                                </button>
                            </div>
                        ) : (
                            /* ── STEP 1: INSERISCI CODICE ── */
                            <div className="pmc-join-wrap">
                                <p>Il tuo partner ha già un account? Inserisci il suo codice invito per collegarvi.</p>
                                <div className="pmc-join-input-row">
                                    <input
                                        className="pmc-join-input"
                                        type="text"
                                        placeholder="Es. A8B2CH"
                                        maxLength={10}
                                        value={joinCode}
                                        onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                                        autoCapitalize="characters"
                                    />
                                    <button
                                        className="pmc-join-btn"
                                        onClick={handlePreviewJoin}
                                        disabled={joinLoading || joinCode.trim().length < 6}
                                    >
                                        {joinLoading ? '...' : <ArrowRight size={20} />}
                                    </button>
                                </div>
                                {joinError && <p className="pmc-join-error">{joinError}</p>}
                                <p className="pmc-hint">Trovi il codice nella sezione Profilo → Partner dell'app del tuo partner.</p>
                            </div>
                        )}
                    </div>

                    <button className="pmc-close-btn" onClick={() => setIsPartnerModalOpen(false)}>
                        Chiudi
                    </button>
                </div>
            </div>
        )}
        
        {/* Spacer for TabBar */}
        <div style={{ height: '100px' }} />
    </div>
);
}
