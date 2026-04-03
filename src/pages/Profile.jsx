import { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { User, Settings, Shield, LogOut, ChevronRight, Bell, Calendar, Heart, Edit2, Users, Copy, Check, Share2, Unlink, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EditProfileModal from '../components/EditProfileModal';
import './Profile.css';

export default function Profile() {
    const {
        isMamma, userName, userRole, babyName, babyStatus, logout,
        inviteCode, partnerId, generateInviteCode, unlinkPartner, birthDate,
    } = useUser();

    const navigate = useNavigate();
    const location = useLocation();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [livePartnerId, setLivePartnerId] = useState(partnerId);
    const [isCreator, setIsCreator] = useState(true);
    const [unlinkConfirm, setUnlinkConfirm] = useState(false);
    const [unlinkLoading, setUnlinkLoading] = useState(false);
    const [liveInviteCode, setLiveInviteCode] = useState(inviteCode);
    const [partnerInfo, setPartnerInfo] = useState(null); // { name, role, birth_date }

    // Auto-apri il modal se arrivi da Home con openPartner: true
    useEffect(() => {
        if (location.state?.openPartner) {
            openPartnerModal();
            // Pulisci lo state per evitare ri-apertura su back
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
            const pid = preg.creator_id === userId ? preg.partner_id : null;
            setLivePartnerId(pid || null);
            setIsCreator(preg.creator_id === userId);
            setLiveInviteCode(preg.invite_code || null);

            // Carica info partner dal DB
            const partnerId2 = preg.creator_id === userId ? preg.partner_id : preg.creator_id;
            if (partnerId2) {
                const { data: pProfile } = await supabase
                    .from('profiles')
                    .select('name, role, birth_date')
                    .eq('id', partnerId2)
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
                    <div className="puc-avatar">
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
                        {birthDate && (
                            <div className="puc-birthdate">
                                {new Date(birthDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        )}
                    </div>
                    <div className="puc-edit">
                        <Edit2 size={20} color="var(--stone)" />
                    </div>
                </div>

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
                    <div className="pmc-header">
                        <Users size={24} className="pmc-icon" />
                        <h3 className="pmc-title">{livePartnerId ? 'Partner Collegato' : 'Invita Partner'}</h3>
                    </div>

                    <div className="pmc-body">
                        {livePartnerId ? (
                            /* ── STATO: PARTNER COLLEGATO ── */
                            <div className="pmc-status-linked">
                                <div className="pmc-partner-avatar">
                                    {partnerInfo?.role === 'mamma'
                                        ? <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="14" r="7" stroke="var(--aqua)" strokeWidth="2"/><path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="var(--aqua)" strokeWidth="2" strokeLinecap="round"/></svg>
                                        : <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="14" r="7" stroke="var(--midnight)" strokeWidth="2"/><path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="var(--midnight)" strokeWidth="2" strokeLinecap="round"/></svg>
                                    }
                                </div>
                                <div className="pmc-partner-name">{partnerInfo?.name || 'Partner'}</div>
                                <div className="pmc-partner-role">{partnerInfo?.role === 'mamma' ? 'Mamma' : 'Papà'}</div>
                                {partnerInfo?.birth_date && (
                                    <div className="pmc-partner-bday">
                                        {new Date(partnerInfo.birth_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                )}
                                <p style={{ marginTop: 12 }}>Condividete la stessa agenda e i progressi del bebè.</p>

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
                            /* ── STATO: CREATORE SENZA PARTNER ── */
                            <>
                                <p>Condividi il codice con il tuo partner. Dovrà inserirlo durante la registrazione su ParentPath.</p>
                                {liveInviteCode ? (
                                    <div className="pmc-code-wrap">
                                        <div className="pmc-code">{liveInviteCode}</div>
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
                        ) : (
                            /* ── STATO: PARTNER (non creatore) SENZA COLLEGAMENTO ── */
                            <div className="pmc-status-linked">
                                <p>Chiedi al tuo partner di generare un codice invito dalla sua app, poi registrati su ParentPath e inseriscilo durante la configurazione.</p>
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
