import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { PREGNANCY_DATA_KEY } from '../hooks/usePregnancyDataQuery';
import { PARTNER_STATUS_KEY } from '../hooks/usePartnerStatusQuery';

const UserContext = createContext(null);

// --- localStorage helpers ---
function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}
function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export function UserProvider({ children }) {
    const queryClient = useQueryClient();

    const [userRole, setUserRole] = useState(() => loadJSON('pp_userRole', null));
    
    // Capitalize helper
    const capitalize = (str) => {
        if (!str) return '';
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    const [_userName, _setUserName] = useState(() => loadJSON('pp_userName', ''));
    const [_babyName, _setBabyName] = useState(() => loadJSON('pp_babyName', ''));
    const [_partnerName, _setPartnerName] = useState(() => loadJSON('pp_partnerName', ''));

    const setUserName = (name) => _setUserName(capitalize(name));
    const setBabyName = (name) => _setBabyName(capitalize(name));
    const setPartnerName = (name) => _setPartnerName(capitalize(name));

    const userName = _userName;
    const babyName = _babyName;
    const partnerName = _partnerName;

    const [babySex, setBabySex] = useState(() => loadJSON('pp_babySex', null)); // 'M' | 'F' | null
    const [birthDate, setBirthDate] = useState(() => loadJSON('pp_birthDate', null)); // YYYY-MM-DD
    const [conceptionDate, setConceptionDate] = useState(() => {
        const raw = loadJSON('pp_conceptionDate', null);
        return raw ? new Date(raw) : null;
    });
    const [onboardingDone, setOnboardingDone] = useState(() => loadJSON('pp_onboardingDone', false));
    const [isDevUser, setIsDevUser] = useState(false);

    // New Feature States
    // 'nato' è WIP — forziamo sempre 'gravidanza' finché non è pronto
    const [babyStatus, setBabyStatus] = useState('gravidanza');
    const [inviteCode, setInviteCode] = useState(() => loadJSON('pp_inviteCode', null));
    const [partnerId, setPartnerId] = useState(() => loadJSON('pp_partnerId', null));
    const [diaryEntries, setDiaryEntries] = useState({}); // { weekNum: [ { id, text, type } ] }
    const [hospitalBag, setHospitalBag] = useState({}); // { itemId: boolean }
    const [mockWeek, setMockWeek] = useState(null); // per debug/test

    // --- MVP Agenda / Task State (persisted) ---
    const [completedTasks, setCompletedTasks] = useState(() => loadJSON('pp_completedTasks', {}));
    
    // Support migrating old weekNotes if they exist
    const [notes, setNotes] = useState(() => {
        const existingNotes = loadJSON('pp_notes', []);
        if (existingNotes.length === 0) {
            // Migrate old weekNotes if present
            const oldNotes = loadJSON('pp_weekNotes', {});
            const migrated = Object.entries(oldNotes).map(([week, text]) => ({
                id: `migrated_${week}`,
                weekNumber: parseInt(week, 10),
                text
            })).filter(n => n.text);
            if (migrated.length > 0) return migrated;
        }
        return existingNotes;
    });

    const [appointments, setAppointments] = useState(() => loadJSON('pp_appointments', []));
    const [customTasks, setCustomTasks] = useState(() => loadJSON('pp_customTasks', []));
    const [dismissedTasks, setDismissedTasks] = useState(() => loadJSON('pp_dismissedTasks', []));

    // --- Pregnancy Tracker State ---
    const [hydration, setHydration] = useState(() => loadJSON('pp_hydration', { count: 0, target: 8 }));
    const [kicks, setKicks] = useState(() => loadJSON('pp_kicks', { count: 0, target: 10 }));

    // --- Peso madre (solo mamma) ---
    const [weightLogs, setWeightLogs] = useState(() => loadJSON('pp_weightLogs', []));
    // [{ id, date: 'YYYY-MM-DD', value: 62.5, unit: 'kg' }]

    // --- Sintomi (solo mamma) ---
    const [symptomsLog, setSymptomsLog] = useState(() => loadJSON('pp_symptomsLog', []));
    // [{ id, date: 'YYYY-MM-DD', week: 28, symptom: 'Nausea', intensity: 2, note: '' }]

    // --- Piano del Parto (localStorage only) ---
    const [birthPlan, setBirthPlan] = useState(() => loadJSON('pp_birthPlan', {}));

    // --- User Status Mapping (to demonstrate sync/UI) ---
    const [userMood, setUserMood] = useState(() => localStorage.getItem('pp_userMood') || 'good');
    const [userActivity, setUserActivity] = useState(() => localStorage.getItem('pp_userActivity') || 'Riposando');
    const [partnerStatus, setPartnerStatus] = useState(() => loadJSON('pp_partnerStatus', {
        status: 'In attesa...',
        lastUpdate: 'Poco fa',
        activity: 'Occupato'
    }));

    // Persist profile fields
    useEffect(() => { saveJSON('pp_userRole', userRole); }, [userRole]);
    useEffect(() => { saveJSON('pp_userName', userName); }, [userName]);
    useEffect(() => { saveJSON('pp_babyName', babyName); }, [babyName]);
    useEffect(() => { saveJSON('pp_babySex', babySex); }, [babySex]);
    useEffect(() => { saveJSON('pp_birthDate', birthDate); }, [birthDate]);
    useEffect(() => { saveJSON('pp_partnerName', partnerName); }, [partnerName]);
    useEffect(() => { saveJSON('pp_conceptionDate', conceptionDate ? conceptionDate.toISOString() : null); }, [conceptionDate]);
    useEffect(() => { saveJSON('pp_onboardingDone', onboardingDone); }, [onboardingDone]);
    useEffect(() => { saveJSON('pp_babyStatus', babyStatus); }, [babyStatus]);
    useEffect(() => { saveJSON('pp_inviteCode', inviteCode); }, [inviteCode]);
    useEffect(() => { saveJSON('pp_partnerId', partnerId); }, [partnerId]);

    // Ripristina sessione Supabase all'avvio e aggiorna sempre partnerId dal DB
    useEffect(() => {
        const restoreSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const userId = session.user.id;
            const alreadyDone = loadJSON('pp_onboardingDone', false);

            const { data: pregnancy } = await supabase.from('pregnancies')
                .select('*')
                .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
                .order('created_at', { ascending: false })
                .limit(1).maybeSingle();

            // Aggiorna sempre partnerId (potrebbe essere cambiato da un'altra sessione)
            if (pregnancy) {
                const pid = pregnancy.creator_id === userId ? pregnancy.partner_id : pregnancy.creator_id;
                setPartnerId(pid || null);
                setInviteCode(pregnancy.invite_code || null);
            }

            const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

            // Se il profilo è stato eliminato dal DB ma la sessione JWT è ancora attiva → logout forzato
            if (!profile && !profileError) {
                await supabase.auth.signOut();
                setOnboardingDone(false);
                ['pp_userRole','pp_userName','pp_babyName','pp_babySex','pp_partnerName',
                 'pp_conceptionDate','pp_onboardingDone','pp_babyStatus','pp_birthDate',
                 'pp_inviteCode','pp_partnerId'].forEach(k => localStorage.removeItem(k));
                return;
            }

            if (alreadyDone) {
                // Aggiorna solo i campi che potrebbero essere cambiati lato DB
                if (profile?.birth_date) setBirthDate(profile.birth_date);
                if (profile?.weight_logs?.length > 0) setWeightLogs(profile.weight_logs);
                if (profile?.symptoms_log?.length > 0) setSymptomsLog(profile.symptoms_log);
                return;
            }

            if (profile) {
                let conceptionTime = null;
                if (pregnancy?.conception_date) conceptionTime = new Date(pregnancy.conception_date);
                setUserRole(profile.role || 'papa');
                setUserName(profile.name || '');
                if (profile.birth_date) setBirthDate(profile.birth_date);
                setBabyName(pregnancy?.baby_name || '');
                setBabySex(pregnancy?.baby_sex || null);
                setBabyStatus(pregnancy?.status || 'gravidanza');
                setConceptionDate(conceptionTime);
                setOnboardingDone(true);
            }
        };
        restoreSession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Helper: ottieni pregnancy_id corrente
    const getPregnancyId = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        const { data: preg } = await supabase.from('pregnancies')
            .select('id')
            .or(`creator_id.eq.${session.user.id},partner_id.eq.${session.user.id}`)
            .order('created_at', { ascending: false })
            .limit(1).maybeSingle();
        return preg?.id || null;
    };

    const [sharedDataLoaded, setSharedDataLoaded] = useState(false);

    // refreshFromSupabase: invalida la query → React Query ricarica dal DB → useEffect sotto sincronizza lo stato
    const refreshFromSupabase = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [PREGNANCY_DATA_KEY] });
        queryClient.invalidateQueries({ queryKey: [PARTNER_STATUS_KEY] });
    }, [queryClient]);

    // Bridge: query cache → UserContext state
    // React Query fetcha i dati; questo effect li copia nello stato locale (usato da getters, Home, ecc.)
    useEffect(() => {
        if (!onboardingDone) return;
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (
                event.type === 'updated' &&
                event.query.queryKey[0] === PREGNANCY_DATA_KEY &&
                event.query.state.status === 'success'
            ) {
                const preg = event.query.state.data;
                if (!preg) return;
                if (preg.shared_notes?.length > 0) setNotes(preg.shared_notes);
                if (preg.shared_appointments?.length > 0) setAppointments(preg.shared_appointments);
                if (preg.shared_custom_tasks?.length > 0) setCustomTasks(preg.shared_custom_tasks);
                if (preg.shared_completed_tasks && Object.keys(preg.shared_completed_tasks).length > 0)
                    setCompletedTasks(preg.shared_completed_tasks);
                if (preg.partner_id !== undefined || preg.creator_id !== undefined) {
                    // Aggiorna anche partnerId e inviteCode
                    supabase.auth.getSession().then(({ data: { session } }) => {
                        if (!session) return;
                        const uid = session.user.id;
                        const pid = preg.creator_id === uid ? preg.partner_id : preg.creator_id;
                        setPartnerId(pid || null);
                        setInviteCode(preg.invite_code || null);
                    });
                }
                setSharedDataLoaded(true);
            }
        });
        // Triggera il primo fetch subito
        queryClient.prefetchQuery({ queryKey: [PREGNANCY_DATA_KEY], queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            const { data } = await supabase
                .from('pregnancies')
                .select('id, creator_id, partner_id, invite_code, shared_notes, shared_appointments, shared_custom_tasks, shared_completed_tasks')
                .or(`creator_id.eq.${session.user.id},partner_id.eq.${session.user.id}`)
                .order('created_at', { ascending: false })
                .limit(1).maybeSingle();
            return data ?? null;
        }});
        return unsubscribe;
    }, [onboardingDone, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync verso Supabase quando cambiano i dati condivisi
    const syncToSupabase = useCallback(async (field, value) => {
        const pregId = await getPregnancyId();
        if (!pregId) return;
        await supabase.from('pregnancies').update({ [field]: value }).eq('id', pregId);
        // Invalida la query per confermare i dati scritti con il DB
        queryClient.invalidateQueries({ queryKey: [PREGNANCY_DATA_KEY] });
    }, [queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

    // Realtime: ascolta cambiamenti su pregnancies dal partner e aggiorna stato locale
    const [realtimeNotifications, setRealtimeNotifications] = useState([]);

    // refreshPartnerStatus: invalida entrambe le query → refetch automatico
    const refreshPartnerStatus = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: [PARTNER_STATUS_KEY] });
        queryClient.invalidateQueries({ queryKey: [PREGNANCY_DATA_KEY] });
    }, [queryClient]);

    useEffect(() => {
        if (!onboardingDone) return;

        // Usa una ref per gestire correttamente la cleanup anche se l'effect è async
        let cancelled = false;
        let pregChannel = null;

        const attachPregListener = async () => {
            const pregId = await getPregnancyId();
            if (!pregId || cancelled) return;

            pregChannel = supabase.channel(`preg_sync_${pregId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'pregnancies',
                    filter: `id=eq.${pregId}`
                }, () => {
                    // Invalida le query → React Query ricarica dal DB → bridge sync aggiorna lo stato
                    queryClient.invalidateQueries({ queryKey: [PREGNANCY_DATA_KEY] });
                    queryClient.invalidateQueries({ queryKey: [PARTNER_STATUS_KEY] });
                });

            pregChannel.subscribe();
        };

        attachPregListener();
        return () => {
            cancelled = true;
            if (pregChannel) supabase.removeChannel(pregChannel);
        };
    }, [onboardingDone, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

    // Assegna il listener in realtime a Supabase per le notifiche
    useEffect(() => {
        let channel;
        const attachListener = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const userId = session.user.id;
            
            // Creiamo il canale e definiamo i listener PRIMA di chiamare subscribe()
            channel = supabase.channel(`notifs_${userId}_${Date.now()}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'notifications', 
                    filter: `user_id=eq.${userId}` 
                }, (payload) => {
                    const newNotif = payload.new;
                    setRealtimeNotifications(prev => [newNotif, ...prev]);
                });
            
            channel.subscribe();
        };

        if (onboardingDone) {
            attachListener();
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [onboardingDone]);

    // Persist on change
    useEffect(() => { saveJSON('pp_completedTasks', completedTasks); }, [completedTasks]);
    useEffect(() => { saveJSON('pp_notes', notes); }, [notes]);
    useEffect(() => { saveJSON('pp_appointments', appointments); }, [appointments]);
    useEffect(() => { saveJSON('pp_customTasks', customTasks); }, [customTasks]);
    useEffect(() => { saveJSON('pp_dismissedTasks', dismissedTasks); }, [dismissedTasks]);
    useEffect(() => { saveJSON('pp_hydration', hydration); }, [hydration]);
    useEffect(() => { saveJSON('pp_kicks', kicks); }, [kicks]);
    useEffect(() => { localStorage.setItem('pp_userMood', userMood); }, [userMood]);
    useEffect(() => { localStorage.setItem('pp_userActivity', userActivity); }, [userActivity]);
    useEffect(() => { saveJSON('pp_partnerStatus', partnerStatus); }, [partnerStatus]);
    useEffect(() => { saveJSON('pp_weightLogs', weightLogs); }, [weightLogs]);
    useEffect(() => { saveJSON('pp_symptomsLog', symptomsLog); }, [symptomsLog]);
    useEffect(() => { saveJSON('pp_birthPlan', birthPlan); }, [birthPlan]);

    // --- Tracker Helpers ---
    const addHydration = useCallback(() => {
        setHydration(prev => ({ ...prev, count: Math.min(prev.count + 1, 20) }));
    }, []);

    const removeHydration = useCallback(() => {
        setHydration(prev => ({ ...prev, count: Math.max(prev.count - 1, 0) }));
    }, []);

    const addKick = useCallback(() => {
        setKicks(prev => ({ ...prev, count: prev.count + 1 }));
    }, []);

    const removeKick = useCallback(() => {
        setKicks(prev => ({ ...prev, count: Math.max(prev.count - 1, 0) }));
    }, []);

    const addFeeding = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            feeding: { ...prev.feeding, count: prev.feeding.count + 1, last: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
        }));
    }, []);

    const removeFeeding = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            feeding: { ...prev.feeding, count: Math.max((prev.feeding?.count || 0) - 1, 0) }
        }));
    }, []);

    const addDiaper = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            diapers: { ...prev.diapers, count: (prev.diapers?.count || 0) + 1, last: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
        }));
    }, []);

    const removeDiaper = useCallback(() => {
        setTrackers(prev => ({
            ...prev,
            diapers: { ...prev.diapers, count: Math.max((prev.diapers?.count || 0) - 1, 0) }
        }));
    }, []);

    // --- Weight helpers ---
    const addWeightLog = useCallback((value, unit = 'kg', date = null) => {
        const dateStr = date || new Date().toISOString().split('T')[0];
        const entry = { id: Date.now().toString(), date: dateStr, value: parseFloat(value), unit };
        setWeightLogs(prev => {
            const updated = [...prev, entry].sort((a, b) => a.date.localeCompare(b.date));
            // Sync to Supabase profiles
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) supabase.from('profiles').update({ weight_logs: updated }).eq('id', session.user.id);
            });
            return updated;
        });
    }, []);

    const removeWeightLog = useCallback((id) => {
        setWeightLogs(prev => {
            const updated = prev.filter(w => w.id !== id);
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) supabase.from('profiles').update({ weight_logs: updated }).eq('id', session.user.id);
            });
            return updated;
        });
    }, []);

    // --- Symptoms helpers ---
    const addSymptomLog = useCallback((symptom, intensity = 1, note = '', date = null, week = null) => {
        const dateStr = date || new Date().toISOString().split('T')[0];
        const entry = { id: Date.now().toString(), date: dateStr, week, symptom, intensity, note };
        setSymptomsLog(prev => {
            const updated = [entry, ...prev];
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) supabase.from('profiles').update({ symptoms_log: updated }).eq('id', session.user.id);
            });
            return updated;
        });
    }, []);

    const removeSymptomLog = useCallback((id) => {
        setSymptomsLog(prev => {
            const updated = prev.filter(s => s.id !== id);
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) supabase.from('profiles').update({ symptoms_log: updated }).eq('id', session.user.id);
            });
            return updated;
        });
    }, []);

    const getTodaySymptoms = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return symptomsLog.filter(s => s.date === today);
    }, [symptomsLog]);

    // --- Birth Plan helpers ---
    const updateBirthPlan = useCallback((section, value) => {
        setBirthPlan(prev => ({ ...prev, [section]: value }));
    }, []);

    // --- Task helpers ---
    const toggleTaskCompleted = useCallback((weekKey, taskId) => {
        const key = `${weekKey}_${taskId}`;
        setCompletedTasks(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            syncToSupabase('shared_completed_tasks', updated);
            return updated;
        });
    }, [syncToSupabase]);

    const isTaskCompleted = useCallback((weekKey, taskId) => {
        return !!completedTasks[`${weekKey}_${taskId}`];
    }, [completedTasks]);

    // Helper per notificare il partner di un'azione
    const notifyPartner = useCallback(async (type, title, message) => {
        if (!partnerId) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('notifications').insert({
            user_id: partnerId,
            sender_id: session.user.id,
            type,
            title,
            message
        });
    }, [partnerId]);

    // --- Notes helpers ---
    const addNote = useCallback((note) => {
        setNotes(prev => {
            const updated = [...prev, { id: Date.now().toString(), ...note }];
            syncToSupabase('shared_notes', updated);
            return updated;
        });
        notifyPartner('partner_note', userName || 'Partner', `ha aggiunto una nota`);
    }, [syncToSupabase, notifyPartner, userName]);

    const removeNote = useCallback((id) => {
        setNotes(prev => {
            const updated = prev.filter(n => n.id !== id);
            syncToSupabase('shared_notes', updated);
            return updated;
        });
    }, [syncToSupabase]);

    const updateNote = useCallback((id, updates) => {
        setNotes(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, ...updates } : n);
            syncToSupabase('shared_notes', updated);
            return updated;
        });
    }, [syncToSupabase]);

    const getNotesForWeek = useCallback((week) => {
        return notes.filter(n => n.weekNumber === week);
    }, [notes]);

    // --- Appointment helpers ---
    const addAppointment = useCallback((appt) => {
        setAppointments(prev => {
            const updated = [...prev, { id: Date.now().toString(), ...appt }];
            syncToSupabase('shared_appointments', updated);
            return updated;
        });
        notifyPartner('partner_visit', userName || 'Partner', `ha aggiunto la visita "${appt.title || 'Nuova visita'}"`);
    }, [syncToSupabase, notifyPartner, userName]);

    const removeAppointment = useCallback((id) => {
        setAppointments(prev => {
            const updated = prev.filter(a => a.id !== id);
            syncToSupabase('shared_appointments', updated);
            return updated;
        });
    }, [syncToSupabase]);

    const updateAppointment = useCallback((id, updates) => {
        setAppointments(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
            syncToSupabase('shared_appointments', updated);
            return updated;
        });
    }, [syncToSupabase]);

    // --- Custom task helpers ---
    const addCustomTask = useCallback((task) => {
        setCustomTasks(prev => {
            const updated = [...prev, { id: Date.now().toString(), suggested: false, ...task }];
            syncToSupabase('shared_custom_tasks', updated);
            return updated;
        });
        notifyPartner('partner_task', userName || 'Partner', `ha aggiunto il task "${task.text || 'Nuovo task'}"`);
    }, [syncToSupabase, notifyPartner, userName]);

    const removeCustomTask = useCallback((id) => {
        setCustomTasks(prev => {
            const updated = prev.filter(t => t.id !== id);
            syncToSupabase('shared_custom_tasks', updated);
            return updated;
        });
    }, [syncToSupabase]);

    const updateCustomTask = useCallback((id, updates) => {
        setCustomTasks(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
            syncToSupabase('shared_custom_tasks', updated);
            return updated;
        });
    }, [syncToSupabase]);

    const dismissTask = useCallback((id) => {
        setDismissedTasks(prev => [...prev, id]);
    }, []);

    const isTaskDismissed = useCallback((id) => {
        return dismissedTasks.includes(id);
    }, [dismissedTasks]);

    const getCustomTasksForWeek = useCallback((week) => {
        return customTasks.filter(t => t.weekNumber === week);
    }, [customTasks]);

    const getAppointmentsForWeek = useCallback((week) => {
        return appointments.filter(a => a.weekNumber === week);
    }, [appointments]);

    // Newborn Trackers
    const [trackers, setTrackers] = useState({
        feeding: [],
        sleep: [],
        diapers: []
    });

    const [activeFeedTimer, setActiveFeedTimer] = useState(null);
    const [lastBreastSide, setLastBreastSide] = useState('left');
    const [activeSleepTimer, setActiveSleepTimer] = useState(null);

    const completeOnboarding = ({ role, name, baby, status, conception, sex, partner, inviteCode: code, partnerId: pid, birthDate: bd }) => {
        setUserRole(role);
        setUserName(name);
        setBabyName(baby || '');
        setConceptionDate(conception);
        if (status) setBabyStatus(status);
        if (sex) setBabySex(sex);
        if (partner) setPartnerName(partner);
        if (code) setInviteCode(code);
        if (pid) setPartnerId(pid);
        if (bd) setBirthDate(bd);
        setOnboardingDone(true);
        setIsDevUser(false);
    };

    // Main login helper (usato internamente dopo signIn Supabase)
    const login = (role, name) => {
        setUserRole(role);
        setUserName(name);
        setBabyStatus('gravidanza');
        setOnboardingDone(true);
    };

    // Logout reale: termina sessione Supabase e pulisce lo stato locale
    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUserRole(null);
        setUserName('');
        setBabyName('');
        setBabySex(null);
        setConceptionDate(null);
        setBabyStatus('gravidanza');
        setOnboardingDone(false);
        setIsDevUser(false);
        // Pulizia localStorage profilo
        setBirthDate(null);
        ['pp_userRole','pp_userName','pp_babyName','pp_babySex','pp_partnerName',
         'pp_conceptionDate','pp_onboardingDone','pp_babyStatus','pp_birthDate',
         'pp_inviteCode','pp_partnerId'].forEach(k => localStorage.removeItem(k));
    }, []);

    // Ripristina sessione Supabase al riavvio dell'app
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Se l'utente era loggato su Supabase ma non in React state, non forziamo nulla:
            // il flusso login/onboarding chiama già completeOnboarding().
            // Questo listener serve principalmente per gestire il logout da altri tab.
            if (!session && onboardingDone) {
                setUserRole(null);
                setUserName('');
                setOnboardingDone(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [onboardingDone]);

    // PREVIEW JOIN — cerca il codice e restituisce i dati senza committare nulla
    const previewJoin = async (code) => {
        // Usa RPC con SECURITY DEFINER — funziona anche per utenti anonimi (pre-registrazione)
        const { data, error } = await supabase.rpc('preview_invite_code', { code: code.trim().toUpperCase() });

        if (error || !data) return { success: false, error: 'Codice non valido o scaduto.' };
        if (!data.success) return { success: false, error: data.error || 'Codice non valido o scaduto.' };

        // Controlla se l'utente sta cercando di collegarsi alla propria gravidanza
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId && data.creatorId === userId) return { success: false, error: 'Non puoi collegarti alla tua stessa gravidanza.' };
        if (data.partnerId && data.partnerId !== userId) return { success: false, error: 'Questa gravidanza ha già un partner collegato.' };

        return {
            success: true,
            preview: {
                pregnancyId: data.pregnancyId,
                babyName: data.babyName,
                babySex: data.babySex,
                status: data.status,
                weekInfo: data.weekInfo,
                creator: data.creator,
            }
        };
    };

    // JOIN PREGNANCY (Partner link flow)
    const joinPregnancy = async (code, userName, userRole) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, error: 'Non connesso' };
        
        const userId = session.user.id;
        
        // Prima verifichiamo se il codice esiste
        const { data: pregnancy, error: fetchError } = await supabase
            .from('pregnancies')
            .select('*')
            .eq('invite_code', code.toUpperCase())
            .maybeSingle();

        if (!pregnancy || fetchError) {
            return { success: false, error: 'Codice non valido o scaduto.' };
        }

        if (pregnancy.creator_id === userId) {
            return { success: false, error: 'Non puoi collegarti alla tua stessa gravidanza.' };
        }

        if (pregnancy.partner_id && pregnancy.partner_id !== userId) {
            return { success: false, error: 'Questa gravidanza ha già un partner collegato.' };
        }

        // Aggiorniamo la gravidanza con il partner_id
        const { data, error } = await supabase
            .from('pregnancies')
            .update({ partner_id: userId })
            .eq('id', pregnancy.id)
            .select()
            .single();
            
        if (data && !error) {
            const resolvedRole = userRole === 'entrambi' ? 'papa' : (userRole || 'papa');

            await supabase.from('profiles').upsert({ id: userId, name: userName, role: resolvedRole });

            // Imposta tutti i dati in stato
            setUserName(userName || '');
            setUserRole(resolvedRole);
            setBabyName(data.baby_name || '');
            setBabySex(data.baby_sex || null);
            setConceptionDate(data.conception_date ? new Date(data.conception_date) : null);
            setBabyStatus(data.status || 'gravidanza');
            setInviteCode(data.invite_code);
            setPartnerId(data.creator_id);
            setOnboardingDone(true);

            return { success: true };
        }
        return { success: false, error: 'Errore durante il collegamento.' };
    };

    // UNLINK PARTNER
    const unlinkPartner = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false };
        const userId = session.user.id;

        // Prova prima come creatore, poi come partner
        const { error: e1 } = await supabase.from('pregnancies')
            .update({ partner_id: null })
            .eq('creator_id', userId);

        if (!e1) {
            setPartnerId(null);
            return { success: true };
        }

        const { error: e2 } = await supabase.from('pregnancies')
            .update({ partner_id: null })
            .eq('partner_id', userId);

        if (!e2) {
            setPartnerId(null);
            return { success: true };
        }

        return { success: false, error: 'Errore durante lo scollegamento.' };
    }, []);

    // GENERATE INVITE CODE
    const generateInviteCode = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error("GenerateInviteCode: No session found");
                return null;
            }
            const userId = session.user.id;

            // Cerca la gravidanza dove l'utente è creatore
            const { data: pregnancy, error: fetchError } = await supabase.from('pregnancies')
                .select('id, invite_code')
                .eq('creator_id', userId)
                .maybeSingle();

            if (fetchError) {
                console.error("GenerateInviteCode: Fetch error", fetchError);
                return null;
            }

            if (!pregnancy) {
                console.error("GenerateInviteCode: No pregnancy found for creator_id", userId);
                // Prova a cercarla come partner se non la trova come creatore? 
                // In teoria solo il creatore genera il codice per invitare il partner.
                return null;
            }

            if (pregnancy.invite_code) {
                setInviteCode(pregnancy.invite_code);
                return pregnancy.invite_code;
            }

            const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const { data: updated, error: updateError } = await supabase.from('pregnancies')
                .update({ invite_code: newCode })
                .eq('id', pregnancy.id)
                .select()
                .single();

            if (updateError) {
                console.error("GenerateInviteCode: Update error", updateError);
                return null;
            }

            if (updated) {
                setInviteCode(updated.invite_code);
                return updated.invite_code;
            }
        } catch (err) {
            console.error("GenerateInviteCode: Unexpected error", err);
        }
        return null;
    };

    // INVIA NOTIFICA AL PARTNER
    const sendNotificationToPartner = async (type, title, message) => {
        if (!partnerId) return false;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;

        const { error } = await supabase.from('notifications').insert({
            user_id: partnerId,
            sender_id: session.user.id,
            type,
            title,
            message
        });

        return !error;
    };

    // Quick login for dev
    const devLogin = (role, status = 'gravidanza') => {
        setUserRole(role);
        setUserName(role === 'mamma' ? 'Sara' : 'Valerio');
        setBabyName('Giacomo');
        setBabySex('M');
        setPartnerName(role === 'mamma' ? 'Valerio' : 'Sara');
        setConceptionDate(new Date('2025-08-10'));
        setBabyStatus('gravidanza'); // Force pregnancy
        setInviteCode('DEV123'); // Fake invite code for testing UI
        setOnboardingDone(true);
        setIsDevUser(true);
    };

    // Compute weeks from conception
    const getWeeksPregnant = () => {
        if (mockWeek !== null) return mockWeek;
        if (!conceptionDate) return 31; // fallback to demo week
        const now = new Date();
        const diffMs = now - new Date(conceptionDate);
        const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        // Per bimbi nati non applichiamo il cap a 42 così getBabyAgeWeeks() funziona correttamente
        if (babyStatus === 'nato') return Math.max(weeks, 40);
        return Math.min(Math.max(weeks, 1), 42);
    };

    const getWeeksRemaining = () => {
        return Math.max(0, 40 - getWeeksPregnant());
    };

    // calculate newborn age in weeks
    const getBabyAgeWeeks = () => {
        return Math.max(0, getWeeksPregnant() - 40);
    };

    // calculate newborn age in months (approx 4.33 weeks per month)
    const getBabyAgeMonths = () => {
        const weeks = getBabyAgeWeeks();
        if (babyStatus === 'nato' && weeks < 4.33) return 1;
        return Math.floor(weeks / 4.33) + 1;
    };

    const getBabyPreciseAgeString = () => {
        if (babyStatus !== 'nato') return '';
        const due = getDueDate();
        if (!due) return '1 mese';

        const now = new Date();
        const diffTime = now - due;
        if (diffTime < 0) return 'Appena nato';

        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Appena nato';

        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;

        let res = [];
        if (months === 1) res.push('1 mese');
        else if (months > 1) res.push(`${months} mesi`);

        if (days === 1) res.push('1 giorno');
        else if (days > 1) res.push(`${days} giorni`);

        return res.join(' e ') || 'Appena nato';
    };

    // --- SWEETSPOT ALGORITHM ---
    const getSweetSpot = () => {
        if (!trackers.sleep || trackers.sleep.length === 0) return null;

        const completedSleeps = trackers.sleep.filter(s => s.endTime).sort((a, b) => b.endTime - a.endTime);
        if (completedSleeps.length === 0) return null;

        const lastSleep = completedSleeps[0];
        const ageWeeks = getBabyAgeWeeks();

        let wakeWindowMins = 60;
        if (ageWeeks >= 4 && ageWeeks < 12) wakeWindowMins = 90;
        else if (ageWeeks >= 12 && ageWeeks < 24) wakeWindowMins = 120;
        else if (ageWeeks >= 24) wakeWindowMins = 180;

        const nextNapTime = new Date(lastSleep.endTime.getTime() + wakeWindowMins * 60000);
        return { lastSleepEnd: lastSleep.endTime, wakeWindowMins, nextNapTime };
    };

    // Derived phase
    const getAppPhase = () => {
        if (babyStatus === 'nato') return 'NEWBORN';
        return 'PREGNANCY';
    };

    const getDueDate = () => {
        if (!conceptionDate) return null;
        const due = new Date(conceptionDate);
        due.setDate(due.getDate() + 280);
        return due;
    };

    const addDiaryEntry = (weekNum, text, type = 'note') => {
        setDiaryEntries(prev => ({
            ...prev,
            [weekNum]: [...(prev[weekNum] || []), { id: Date.now().toString(), text, type }]
        }));
    };

    const removeDiaryEntry = (weekNum, entryId) => {
        setDiaryEntries(prev => ({
            ...prev,
            [weekNum]: (prev[weekNum] || []).filter(e => e.id !== entryId)
        }));
    };

    // Tracker Functions
    const addTrackerEntry = (category, data) => {
        setTrackers(prev => ({
            ...prev,
            [category]: [{ id: Date.now().toString(), ...data }, ...prev[category]]
        }));
    };

    const removeTrackerEntry = (category, id) => {
        setTrackers(prev => ({
            ...prev,
            [category]: prev[category].filter(entry => entry.id !== id)
        }));
    };

    const toggleBagItem = (itemId) => {
        setHospitalBag(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const isMamma = userRole === 'mamma';
    const isPapa = userRole === 'papa';

    return (
        <UserContext.Provider value={{
            userRole, setUserRole, userName, setUserName, babyName, setBabyName,
            babySex, setBabySex, partnerName, setPartnerName,
            conceptionDate, setConceptionDate,
            onboardingDone, babyStatus, setBabyStatus,
            diaryEntries, addDiaryEntry, removeDiaryEntry,
            hospitalBag, toggleBagItem,
            trackers, addTrackerEntry, removeTrackerEntry,
            activeFeedTimer, setActiveFeedTimer, lastBreastSide, setLastBreastSide,
            activeSleepTimer, setActiveSleepTimer,
            // MVP Agenda state
            completedTasks, toggleTaskCompleted, isTaskCompleted,
            notes, addNote, removeNote, updateNote, getNotesForWeek,
            appointments, addAppointment, removeAppointment, updateAppointment, getAppointmentsForWeek,
            customTasks, addCustomTask, removeCustomTask, updateCustomTask, getCustomTasksForWeek,
            dismissedTasks, dismissTask, isTaskDismissed,
            // Pregnancy Tracker
            hydration, setHydration, addHydration, removeHydration,
            kicks, setKicks, addKick, removeKick,
            // Status states
            userMood, setUserMood, userActivity, setUserActivity, partnerStatus, setPartnerStatus,
            // Newborn Tracker
            setTrackers, addFeeding, removeFeeding, addDiaper, removeDiaper,
            isMamma, isPapa, isDevUser, birthDate, setBirthDate,
            inviteCode, partnerId, realtimeNotifications,
            joinPregnancy, generateInviteCode, unlinkPartner, sendNotificationToPartner, refreshPartnerStatus,
            previewJoin,
            completeOnboarding, devLogin, login, logout,
            getWeeksPregnant, getWeeksRemaining, getDueDate, getBabyAgeWeeks, getBabyAgeMonths, getBabyPreciseAgeString, getSweetSpot,
            getAppPhase,
            mockWeek, setMockWeek,
            sharedDataLoaded, refreshFromSupabase,
            // Weight tracking
            weightLogs, addWeightLog, removeWeightLog,
            // Symptoms tracking
            symptomsLog, addSymptomLog, removeSymptomLog, getTodaySymptoms,
            // Birth plan
            birthPlan, updateBirthPlan,
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
