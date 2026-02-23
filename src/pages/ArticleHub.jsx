import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ChevronRight } from 'lucide-react';
import './ArticleHub.css';

export default function ArticleHub() {
    const navigate = useNavigate();
    const { getWeeksPregnant } = useUser();
    const currentWeek = getWeeksPregnant();

    return (
        <div className="page page-enter hub-page">
            <div className="esplora-section">
                <div style={{ padding: '8px 4px 0', fontFamily: "'Fraunces', serif", fontSize: '24px', color: 'var(--color-text-primary)', marginBottom: '16px', fontWeight: '600' }}>
                    Esplora
                </div>

                <div className="esplora-title">Guide settimana {currentWeek}</div>
                <div className="esplora-cards">
                    <div className="esplora-card" onClick={() => navigate('/article/1')}>
                        <div className="ec-icon ec-bg-blue">📖</div>
                        <div className="ec-text">
                            <div className="ec-title">Cosa succede nel corpo questa settimana</div>
                            <div className="ec-sub">5 min di lettura</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" />
                    </div>
                    <div className="esplora-card" onClick={() => navigate('/article/2')}>
                        <div className="ec-icon ec-bg-coral">🍎</div>
                        <div className="ec-text">
                            <div className="ec-title">Nutrizione nel 3° trimestre</div>
                            <div className="ec-sub">Cosa mangiare e cosa evitare</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" />
                    </div>
                    <div className="esplora-card" onClick={() => navigate('/article/3')}>
                        <div className="ec-icon ec-bg-green">💤</div>
                        <div className="ec-text">
                            <div className="ec-title">Come dormire bene</div>
                            <div className="ec-sub">Posizioni e consigli pratici</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" />
                    </div>
                </div>

                <div className="esplora-title">Strumenti</div>
                <div className="esplora-cards">
                    <div className="esplora-card" onClick={() => navigate('/tools')}>
                        <div className="ec-icon ec-bg-gold">📋</div>
                        <div className="ec-text">
                            <div className="ec-title">Checklist esami gravidanza</div>
                            <div className="ec-sub">3 esami in sospeso</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" />
                    </div>
                    <div className="esplora-card" onClick={() => navigate('/tools')}>
                        <div className="ec-icon ec-bg-blue">🧮</div>
                        <div className="ec-text">
                            <div className="ec-title">Calcola data del parto</div>
                            <div className="ec-sub">Stima basata sull'ultima mestruazione</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" />
                    </div>
                </div>

                <div className="esplora-title">Quiz & Apprendimento</div>
                <div className="esplora-cards">
                    <div className="esplora-card" style={{ border: '1.5px solid #F48C95', background: 'rgba(244, 140, 149, 0.08)' }}>
                        <div className="ec-icon ec-bg-coral">🧠</div>
                        <div className="ec-text">
                            <div className="ec-title" style={{ color: '#E8457E' }}>Quiz settimana {currentWeek}</div>
                            <div className="ec-sub">3 domande · Non ancora completato</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" style={{ color: '#E8457E' }} />
                    </div>
                    <div className="esplora-card">
                        <div className="ec-icon ec-bg-green">🏆</div>
                        <div className="ec-text">
                            <div className="ec-title">I tuoi risultati</div>
                            <div className="ec-sub">12 quiz completati · 8 streak</div>
                        </div>
                        <ChevronRight size={18} className="ec-arrow" />
                    </div>
                </div>

            </div>
        </div>
    );
}
