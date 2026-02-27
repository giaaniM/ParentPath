import { useUser } from '../context/UserContext';
import { BriefcaseMedical, CheckCircle2, Circle } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './HospitalBag.css';

const BAG_CATEGORIES = [
    {
        id: 'docs',
        title: 'Documenti e Burocrazia',
        items: [
            { id: 'cd-id', label: 'Carta d\'Identità e Tessera Sanitaria' },
            { id: 'cd-cartella', label: 'Cartella Clinica / Esami Gravidanza' },
            { id: 'cd-nascita', label: 'Piano del Parto (se compilato)' }
        ]
    },
    {
        id: 'mamma',
        title: 'Per la Mamma',
        items: [
            { id: 'm-camice', label: 'Camicie da notte aperte sul davanti (3-4)' },
            { id: 'm-vest', label: 'Vestaglia e ciabatte comode' },
            { id: 'm-slip', label: 'Slip monouso o a rete' },
            { id: 'm-ass', label: 'Assorbenti post-parto (maxi)' },
            { id: 'm-beauty', label: 'Beauty case (spazzolino, dentifricio, sapone intimo ph neutro)' },
            { id: 'm-ragadi', label: 'Crema per ragadi al seno e coppette assorbilatte' },
            { id: 'm-asciug', label: 'Asciugamani in spugna morbida' }
        ]
    },
    {
        id: 'bimbo',
        title: 'Per il Bimbo / Corredino',
        items: [
            { id: 'b-body', label: 'Body in cotone mezza manica (5-6)' },
            { id: 'b-tutine', label: 'Tutine in ciniglia o caldo cotone (5-6)' },
            { id: 'b-calzini', label: 'Calzini o babbucce (3 paia)' },
            { id: 'b-cappello', label: 'Cappellino in cotone (anche se estate)' },
            { id: 'b-coperta', label: 'Copertina morbida' },
            { id: 'b-cambio', label: 'Bustine trasparenti per cambi divisi e etichettati' },
            { id: 'b-pannoli', label: 'Pannolini taglia 1 (se non forniti dall\'ospedale)' }
        ]
    },
    {
        id: 'partner',
        title: 'Per il Partner / Accompagnatore',
        items: [
            { id: 'p-snack', label: 'Snack, caramelle, acqua e monete per distributori' },
            { id: 'p-power', label: 'Caricabatterie smartphone e Powerbank' },
            { id: 'p-cambio', label: 'Cambio vestiti confortevole' }
        ]
    }
];

export default function HospitalBag() {
    const { hospitalBag, toggleBagItem } = useUser();

    const handleToggle = async (id) => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
        toggleBagItem(id);
    };

    // Calculate completion
    const totalItems = BAG_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = Object.values(hospitalBag).filter(Boolean).length;
    const progressPerc = Math.round((completedItems / totalItems) * 100) || 0;

    return (
        <div className="page bag-page page-enter">
            <header className="bag-header">
                <div className="bag-spacer" />
                <h1 className="bag-title">Valigia Parto</h1>
                <div className="bag-spacer" />
            </header>

            <div className="bag-progress-wrap">
                <div className="bag-progress-info">
                    <strong>{progressPerc}% Completata</strong>
                    <span>{completedItems} su {totalItems}</span>
                </div>
                <div className="bag-progress-bar">
                    <div className="bag-progress-fill" style={{ width: `${progressPerc}%` }} />
                </div>
            </div>

            <p className="bag-subtitle">
                Prepara la borsa verso la 34° settimana, per essere serena e pronta in caso di arrivo anticipato!
            </p>

            <div className="bag-lists">
                {BAG_CATEGORIES.map(category => {
                    const catChecked = category.items.filter(i => hospitalBag[i.id]).length;
                    const catTotal = category.items.length;
                    const catDone = catChecked === catTotal;

                    return (
                        <div key={category.id} className="bag-group">
                            <div className="bag-group-head">
                                <h3>{category.title}</h3>
                                <span>{catChecked}/{catTotal}</span>
                            </div>
                            <div className="bag-items">
                                {category.items.map(item => {
                                    const isChecked = hospitalBag[item.id];
                                    return (
                                        <div
                                            key={item.id}
                                            className={`bag-item ${isChecked ? 'done' : ''}`}
                                            onClick={() => handleToggle(item.id)}
                                        >
                                            <div className="bag-item-ck">
                                                {isChecked ? <CheckCircle2 size={24} className="bag-ck-icon" /> : <Circle size={24} className="bag-ck-icon" />}
                                            </div>
                                            <div className="bag-item-lb">{item.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
