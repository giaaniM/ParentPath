import { useUser } from '../context/UserContext';
import { FileHeart, Share2, Users, MapPin, Syringe, Baby, Heart, PhoneCall, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useState } from 'react';
import './BirthPlan.css';

const SECTIONS = [
    {
        id: 'accompagnatore',
        icon: <Users size={20} />,
        title: 'Chi mi accompagna',
        fields: [
            { key: 'accompagnatore_nome', label: 'Nome accompagnatore principale', placeholder: 'Es. Marco', type: 'text' },
            { key: 'accompagnatore_backup', label: 'Sostituto (se necessario)', placeholder: 'Es. Mia madre', type: 'text' },
        ]
    },
    {
        id: 'ospedale',
        icon: <MapPin size={20} />,
        title: 'Dove partorisco',
        fields: [
            { key: 'ospedale_nome', label: 'Nome ospedale / clinica', placeholder: 'Es. Ospedale Civile di Milano', type: 'text' },
            { key: 'ospedale_reparto', label: 'Reparto / piano', placeholder: 'Es. Reparto Maternità - Piano 3', type: 'text' },
        ]
    },
    {
        id: 'anestesia',
        icon: <Syringe size={20} />,
        title: 'Anestesia',
        fields: [
            {
                key: 'anestesia_scelta',
                label: 'La mia preferenza',
                type: 'select',
                options: [
                    { value: 'si', label: 'Sì, voglio l\'epidurale' },
                    { value: 'no', label: 'No, preferisco senza farmaci' },
                    { value: 'aperto', label: 'Decido sul momento' },
                    { value: 'parziale', label: 'Analgesici leggeri (no epidurale)' },
                ]
            },
            { key: 'anestesia_note', label: 'Note aggiuntive', placeholder: 'Eventuali allergie, preferenze...', type: 'textarea' },
        ]
    },
    {
        id: 'parto',
        icon: <Heart size={20} />,
        title: 'Il parto',
        fields: [
            {
                key: 'posizione_parto',
                label: 'Posizione preferita',
                type: 'select',
                options: [
                    { value: 'libera', label: 'Posizione libera' },
                    { value: 'lettino', label: 'Lettino da parto standard' },
                    { value: 'acqua', label: 'Parto in acqua (se disponibile)' },
                    { value: 'verticale', label: 'Posizione verticale / accovacciata' },
                ]
            },
            {
                key: 'monitoraggio',
                label: 'Monitoraggio durante il travaglio',
                type: 'select',
                options: [
                    { value: 'intermittente', label: 'Intermittente (più libertà di movimento)' },
                    { value: 'continuo', label: 'Continuo (CTG sempre attivo)' },
                    { value: 'medico', label: 'Decida il medico' },
                ]
            },
        ]
    },
    {
        id: 'neonato',
        icon: <Baby size={20} />,
        title: 'Dopo la nascita',
        checkboxes: [
            { key: 'skin_to_skin', label: 'Skin-to-skin immediato (bimbo sul petto subito dopo la nascita)' },
            { key: 'allattamento_immediato', label: 'Allattamento al seno entro la prima ora' },
            { key: 'cord_delay', label: 'Taglio del cordone ritardato (delayed cord clamping)' },
            { key: 'partner_cord', label: 'Il partner taglia il cordone ombelicale' },
            { key: 'no_biberon', label: 'Nessun biberon o ciuccio senza mio consenso' },
        ]
    },
    {
        id: 'note',
        icon: <FileHeart size={20} />,
        title: 'Note per il personale',
        fields: [
            { key: 'note_personale', label: 'Desideri, preferenze o informazioni importanti', placeholder: 'Es. preferisco essere informata di ogni procedura prima che venga eseguita...', type: 'textarea' },
        ]
    },
    {
        id: 'emergenza',
        icon: <PhoneCall size={20} />,
        title: 'Contatti di emergenza',
        fields: [
            { key: 'emerg_nome', label: 'Nome da chiamare', placeholder: 'Es. Mia madre', type: 'text' },
            { key: 'emerg_tel', label: 'Numero di telefono', placeholder: 'Es. +39 333 1234567', type: 'tel' },
        ]
    },
];

export default function BirthPlan() {
    const { birthPlan, updateBirthPlan } = useUser();
    const [expandedSections, setExpandedSections] = useState(
        Object.fromEntries(SECTIONS.map(s => [s.id, true]))
    );

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleShare = async () => {
        const lines = ['🌸 Il mio Piano del Parto\n'];
        SECTIONS.forEach(sec => {
            lines.push(`\n--- ${sec.title.toUpperCase()} ---`);
            sec.fields?.forEach(f => {
                const val = birthPlan[f.key];
                if (val) {
                    if (f.type === 'select') {
                        const opt = f.options?.find(o => o.value === val);
                        lines.push(`${f.label}: ${opt?.label || val}`);
                    } else {
                        lines.push(`${f.label}: ${val}`);
                    }
                }
            });
            sec.checkboxes?.forEach(c => {
                if (birthPlan[c.key]) lines.push(`✓ ${c.label}`);
            });
        });

        const text = lines.join('\n');
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Piano del Parto', text });
            } catch (e) { /* dismissed */ }
        } else {
            navigator.clipboard?.writeText(text);
        }
    };

    // Conta quanti campi compilati
    const totalFields = SECTIONS.reduce((acc, s) => acc + (s.fields?.length || 0) + (s.checkboxes?.length || 0), 0);
    const filledFields = SECTIONS.reduce((acc, s) => {
        const f = s.fields?.filter(f => !!birthPlan[f.key]).length || 0;
        const c = s.checkboxes?.filter(c => !!birthPlan[c.key]).length || 0;
        return acc + f + c;
    }, 0);
    const progress = Math.round((filledFields / totalFields) * 100);

    return (
        <div className="page bp-page page-enter">
            <header className="bp-header">
                <div className="bp-spacer" />
                <h1 className="bp-title">Piano del Parto</h1>
                <button className="bp-share-btn" onClick={handleShare} aria-label="Condividi">
                    <Share2 size={20} />
                </button>
            </header>

            <div className="bp-progress-wrap">
                <div className="bp-progress-info">
                    <strong>{progress}% compilato</strong>
                    <span>{filledFields} di {totalFields} campi</span>
                </div>
                <div className="bp-progress-bar">
                    <div className="bp-progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <p className="bp-subtitle">
                Il tuo piano del parto aiuta il personale ospedaliero a rispettare i tuoi desideri. Compilalo verso la settimana 28-32 e portalo con te in ospedale.
            </p>

            <div className="bp-sections">
                {SECTIONS.map(sec => (
                    <div key={sec.id} className="bp-section">
                        <div className="bp-section-head" onClick={() => toggleSection(sec.id)}>
                            <div className="bp-section-icon">{sec.icon}</div>
                            <div className="bp-section-title">{sec.title}</div>
                            {expandedSections[sec.id] ? <ChevronUp size={18} color="var(--stone)" /> : <ChevronDown size={18} color="var(--stone)" />}
                        </div>

                        {expandedSections[sec.id] && (
                            <div className="bp-section-body">
                                {sec.fields?.map(field => (
                                    <div key={field.key} className="bp-field">
                                        <label className="bp-field-label">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                className="bp-field-input bp-field-textarea"
                                                placeholder={field.placeholder}
                                                value={birthPlan[field.key] || ''}
                                                onChange={e => updateBirthPlan(field.key, e.target.value)}
                                                rows={3}
                                            />
                                        ) : field.type === 'select' ? (
                                            <div className="bp-select-options">
                                                {field.options.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        className={`bp-option-btn ${birthPlan[field.key] === opt.value ? 'bp-option-btn--selected' : ''}`}
                                                        onClick={() => updateBirthPlan(field.key, opt.value)}
                                                    >
                                                        {birthPlan[field.key] === opt.value && <Check size={14} />}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <input
                                                className="bp-field-input"
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={birthPlan[field.key] || ''}
                                                onChange={e => updateBirthPlan(field.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}

                                {sec.checkboxes?.map(cb => (
                                    <div
                                        key={cb.key}
                                        className={`bp-checkbox-item ${birthPlan[cb.key] ? 'bp-checkbox-item--checked' : ''}`}
                                        onClick={() => updateBirthPlan(cb.key, !birthPlan[cb.key])}
                                    >
                                        <div className={`bp-checkbox-box ${birthPlan[cb.key] ? 'bp-checkbox-box--checked' : ''}`}>
                                            {birthPlan[cb.key] && <Check size={13} color="white" strokeWidth={3} />}
                                        </div>
                                        <span className="bp-checkbox-label">{cb.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ height: '40px' }} />
        </div>
    );
}
