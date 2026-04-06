import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { Check, ChevronRight, Baby, Users, FileText, Calendar, CheckSquare, Cake } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import './ProfileCompletion.css';

const STEP_TOASTS = {
    partner:   { title: 'Partner collegato!',         subtitle: 'Siete sincronizzati in tempo reale.',       type: 'partner' },
    babyname:  { title: 'Nome scelto!',               subtitle: 'Il vostro bimbo ha un\'identità.',          type: 'baby' },
    visit:     { title: 'Prima visita aggiunta!',     subtitle: 'Tieni traccia di ogni appuntamento.',       type: 'visit' },
    note:      { title: 'Prima nota scritta!',        subtitle: 'Un ricordo che rimarrà per sempre.',        type: 'note' },
    task:      { title: 'Primo task completato!',     subtitle: 'Continua così, stai andando benissimo.',    type: 'task' },
    birthdate: { title: 'Data di nascita salvata!',   subtitle: 'Percorso ancora più personalizzato.',       type: 'milestone' },
};

function useCompletionSteps() {
    const {
        babyName, partnerId, birthDate,
        notes, appointments, completedTasks, sharedDataLoaded
    } = useUser();

    return [
        {
            id: 'partner',
            icon: Users,
            label: 'Collega il tuo partner',
            desc: 'Condividete ogni momento insieme',
            done: !!partnerId,
            route: '/profile',
            state: { openPartner: true },
        },
        {
            id: 'babyname',
            icon: Baby,
            label: 'Dai un nome al tuo bimbo',
            desc: 'Anche solo un soprannome va bene',
            done: !!(babyName && babyName.trim().length > 0),
            route: '/baby',
            state: {},
        },
        {
            id: 'visit',
            icon: Calendar,
            label: 'Aggiungi la prima visita',
            desc: 'Tieni traccia delle visite mediche',
            done: !!(appointments && appointments.length > 0),
            route: '/agenda',
            state: {},
        },
        {
            id: 'note',
            icon: FileText,
            label: 'Scrivi la prima nota',
            desc: 'Un pensiero, un momento da ricordare',
            done: !!(notes && notes.length > 0),
            route: '/agenda',
            state: {},
        },
        {
            id: 'task',
            icon: CheckSquare,
            label: 'Completa il primo task',
            desc: 'Spunta qualcosa dalla tua lista',
            done: !!(completedTasks && Object.keys(completedTasks).length > 0),
            route: '/agenda',
            state: {},
        },
        {
            id: 'birthdate',
            icon: Cake,
            label: 'La tua data di nascita',
            desc: 'Salta se preferisci tenerla privata',
            done: !!birthDate,
            route: '/profile',
            state: { openEdit: true },
        },
    ];
}

const DISMISSED_KEY = 'pp_profileCompletionDismissed';

export default function ProfileCompletion() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const steps = useCompletionSteps();
    const [editOpen, setEditOpen] = useState(false);

    const { sharedDataLoaded } = useUser();

    const doneCount = steps.filter(s => s.done).length;
    const total = steps.length;
    const percent = Math.round((doneCount / total) * 100);
    const isComplete = doneCount === total;

    // Inizializzato con lo stato attuale: evita toast al mount per step già completati
    const prevDone = useRef(
        Object.fromEntries(steps.map(s => [s.id, s.done]))
    );
    const completionToastFired = useRef(false);

    useEffect(() => {
        let newlyCompleted = null;

        steps.forEach(step => {
            const wasAlreadyDone = prevDone.current[step.id];
            if (!wasAlreadyDone && step.done) {
                newlyCompleted = step.id;
                prevDone.current[step.id] = true;
            }
        });

        const alreadyDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';

        // Se è l'ultimo step, mostra solo il toast di completamento (non quello del singolo step)
        if (newlyCompleted && !isComplete) {
            const meta = STEP_TOASTS[newlyCompleted];
            if (meta) showToast({ ...meta, duration: 4000 });
        }

        // Toast di completamento totale
        if (isComplete && !completionToastFired.current && !alreadyDismissed) {
            completionToastFired.current = true;
            localStorage.setItem(DISMISSED_KEY, 'true');
            setTimeout(() => {
                showToast({
                    title: 'Profilo completato!',
                    subtitle: 'Hai configurato tutto. Sei pronto per questo viaggio.',
                    type: 'achievement',
                    duration: 6000,
                });
            }, 400);
        }
    }, [doneCount, isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

    // Aspetta che i dati Supabase siano caricati prima di calcolare il progresso
    if (!sharedDataLoaded) return null;

    // Sparisce solo quando tutti gli step sono realmente completati
    if (isComplete) return null;

    const circumference = 2 * Math.PI * 22;
    const strokeOffset = circumference - (percent / 100) * circumference;

    return (
        <div className="pc-card">
            <div className="pc-header">
                <div className="pc-header-text">
                    <div className="pc-eyebrow">Il tuo percorso</div>
                    <div className="pc-headline">
                        {doneCount === 0
                            ? 'Inizia a esplorare'
                            : doneCount < 3
                                ? 'Ottimo inizio!'
                                : doneCount < 5
                                    ? 'Stai andando bene!'
                                    : 'Quasi al traguardo!'}
                    </div>
                </div>
                <div className="pc-ring-wrap">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="4" />
                        <circle
                            cx="28" cy="28" r="22"
                            fill="none"
                            stroke="var(--aqua)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 28 28)"
                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                    </svg>
                    <div className="pc-ring-label">{percent}%</div>
                </div>
            </div>

            <div className="pc-steps">
                {steps.map((step) => (
                    <button
                        key={step.id}
                        className={`pc-step ${step.done ? 'pc-step--done' : 'pc-step--todo'}`}
                        onClick={() => {
                            if (step.done) return;
                            if (step.id === 'birthdate') { setEditOpen(true); return; }
                            navigate(step.route, { state: step.state });
                        }}
                        disabled={step.done}
                    >
                        <div className={`pc-step-icon-wrap ${step.done ? 'done' : ''}`}>
                            {step.done
                                ? <Check size={14} strokeWidth={3} />
                                : <step.icon size={14} strokeWidth={2} />}
                        </div>
                        <div className="pc-step-text">
                            <span className="pc-step-label">{step.label}</span>
                            {!step.done && <span className="pc-step-desc">{step.desc}</span>}
                        </div>
                        {!step.done && <ChevronRight size={16} className="pc-step-arrow" strokeWidth={2.5} />}
                    </button>
                ))}
            </div>

            <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
            <div className="pc-footer">
                {doneCount}/{total} completati — {total - doneCount} {total - doneCount === 1 ? 'passo' : 'passi'} rimasti
            </div>
        </div>
    );
}
