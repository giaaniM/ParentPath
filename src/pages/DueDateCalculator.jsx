import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Baby, HelpCircle } from 'lucide-react';
import { format, addDays, isValid } from 'date-fns';
import { it } from 'date-fns/locale';
import './DueDateCalculator.css';

export default function DueDateCalculator() {
    const navigate = useNavigate();
    const [calcMethod, setCalcMethod] = useState('lmp'); // 'lmp' or 'conception'
    const [inputDate, setInputDate] = useState('');
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        if (!inputDate) return;
        const dateObj = new Date(inputDate);
        if (!isValid(dateObj)) return;

        let dueDate, conceptionDate;

        if (calcMethod === 'lmp') {
            // LMP rule: + 280 days
            dueDate = addDays(dateObj, 280);
            conceptionDate = addDays(dateObj, 14);
        } else {
            // Conception rule: + 266 days
            dueDate = addDays(dateObj, 266);
            conceptionDate = dateObj;
        }

        const today = new Date();
        const diffMs = today - conceptionDate;
        const weeksFromConcept = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        const daysFromConcept = Math.floor(diffMs / (24 * 60 * 60 * 1000)) % 7;

        // Gestational age is usually +2 weeks from conception
        const gestWeeks = weeksFromConcept + 2;

        setResult({
            dueDate: format(dueDate, 'dd MMMM yyyy', { locale: it }),
            weeks: gestWeeks > 0 ? gestWeeks : 0,
            days: daysFromConcept > 0 ? daysFromConcept : 0
        });
    };

    return (
        <div className="page due-date-page page-enter">
            <header className="dd-header">
                <div className="dd-spacer" />
                <h1 className="dd-title">Data Parto</h1>
                <div className="dd-spacer" />
            </header>

            <div className="dd-content">
                <div className="dd-card">
                    <p className="dd-desc">
                        Calcola la tua <strong>Data Presunta del Parto</strong> e scopri in che settimana ti trovi,
                        perché il corpo inizia a prepararsi fin dal primo giorno!
                    </p>

                    <div className="dd-tabs">
                        <button
                            className={`dd-tab ${calcMethod === 'lmp' ? 'active' : ''}`}
                            onClick={() => setCalcMethod('lmp')}
                        >
                            Ultimo Ciclo (LMP)
                        </button>
                        <button
                            className={`dd-tab ${calcMethod === 'conception' ? 'active' : ''}`}
                            onClick={() => setCalcMethod('conception')}
                        >
                            Concepimento
                        </button>
                    </div>

                    <div className="dd-form">
                        <label className="dd-label">
                            {calcMethod === 'lmp' ? 'Data inizio ultima mestruazione:' : 'Data di concepimento presunta:'}
                        </label>
                        <input
                            type="date"
                            className="dd-input"
                            value={inputDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                setInputDate(e.target.value);
                                setResult(null); // reset old result
                            }}
                        />

                        <button
                            className="dd-calc-btn"
                            onClick={handleCalculate}
                            disabled={!inputDate}
                        >
                            Calcola la Data
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="dd-result-card popIn">
                        <div className="dd-result-ic"><Baby size={32} /></div>
                        <h3>La tua data presunta è il:</h3>
                        <div className="dd-result-date">{result.dueDate}</div>

                        <div className="dd-result-stats">
                            <div className="dd-stat">
                                <span className="dd-stat-val">{result.weeks}</span>
                                <span className="dd-stat-lbl">Settimane</span>
                            </div>
                            <div className="dd-stat-sep">+</div>
                            <div className="dd-stat">
                                <span className="dd-stat-val">{result.days}</span>
                                <span className="dd-stat-lbl">Giorni</span>
                            </div>
                        </div>

                        <div className="dd-result-hint">
                            <HelpCircle size={16} />
                            <span>Solo il 5% dei bimbi nasce esattamente nella DDP. Preparati a una sorpresa nel range di ± 2 settimane!</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
