import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ChevronRight } from 'lucide-react';
import './HomeProfileProgress.css';

function useProgressData() {
    const { babyName, partnerId, birthDate, notes, appointments, completedTasks, sharedDataLoaded } = useUser();

    const steps = [
        { id: 'partner', label: 'Collega il partner', done: !!partnerId, route: '/profile', state: { openPartner: true } },
        { id: 'babyname', label: 'Nome del bimbo', done: !!(babyName?.trim()), route: '/baby', state: {} },
        { id: 'visit', label: 'Prima visita', done: !!(appointments?.length > 0), route: '/agenda', state: {} },
        { id: 'note', label: 'Prima nota', done: !!(notes?.length > 0), route: '/agenda', state: {} },
        { id: 'task', label: 'Primo task', done: !!(completedTasks && Object.keys(completedTasks).length > 0), route: '/agenda', state: {} },
        { id: 'birthdate', label: 'Data di nascita', done: !!birthDate, route: '/profile', state: { openEdit: true } },
    ];

    const doneCount = steps.filter(s => s.done).length;
    const nextStep = steps.find(s => !s.done);
    return { steps, doneCount, total: steps.length, nextStep, sharedDataLoaded };
}

export default function HomeProfileProgress() {
    const navigate = useNavigate();
    const { doneCount, total, nextStep, sharedDataLoaded } = useProgressData();
    const percent = Math.round((doneCount / total) * 100);

    if (!sharedDataLoaded) return null;
    if (doneCount === total) return null;

    return (
        <div
            className="hpp-wrap"
            onClick={() => navigate('/profile')}
        >
            <div className="hpp-left">
                <div className="hpp-eyebrow">Completa il profilo</div>
                <div className="hpp-next-label">{percent}% completato</div>
                <div className="hpp-bar-track">
                    <div className="hpp-bar-fill" style={{ width: `${percent}%` }} />
                </div>
            </div>
            <div className="hpp-right">
                <div className="hpp-ring">
                    <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(61,191,184,0.15)" strokeWidth="3.5" />
                        <circle
                            cx="24" cy="24" r="19"
                            fill="none"
                            stroke="var(--aqua)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 19}
                            strokeDashoffset={2 * Math.PI * 19 * (1 - percent / 100)}
                            transform="rotate(-90 24 24)"
                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                    </svg>
                    <div className="hpp-ring-label">{doneCount}/{total}</div>
                </div>
                <ChevronRight size={16} color="var(--aqua)" strokeWidth={2.5} />
            </div>
        </div>
    );
}
