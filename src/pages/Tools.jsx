import { useNavigate } from 'react-router-dom';
import { toolsData, pregnancy } from '../data/mockData';
import { Activity, Clock, Weight, Calendar } from 'lucide-react';
import './Tools.css';

export default function Tools() {
    const navigate = useNavigate();

    return (
        <div className="page page-enter tools-page">
            <h1 className="page-title">Strumenti</h1>
            <p className="page-subtitle">Tracker e attività</p>

            {/* Tools grid */}
            <div className="tools-grid">
                <div className="tool-card tool-card--primary">
                    <div className="tool-card__header">
                        <Activity className="tool-card__icon" size={20} />
                        <h3 className="tool-card__title">Calcetti</h3>
                    </div>
                    <div className="tool-card__body">
                        <div className="tool-card__score">
                            <span className="tool-card__value">{toolsData.kicks.todayScore}</span>
                            <span className="tool-card__target">/ {toolsData.kicks.target}</span>
                        </div>
                        <p className="tool-card__meta">Ultimo alle {toolsData.kicks.lastRecorded}</p>
                    </div>
                    <button className="tool-card__btn">Registra</button>
                </div>

                <div className="tool-card">
                    <div className="tool-card__header">
                        <Clock className="tool-card__icon" size={20} />
                        <h3 className="tool-card__title">Contrazioni</h3>
                    </div>
                    <div className="tool-card__body">
                        <div className="tool-card__timer">
                            <span className="tool-card__value">00:00</span>
                        </div>
                        <p className="tool-card__meta">Pronto per iniziare</p>
                    </div>
                    <button className="tool-card__btn tool-card__btn--outline">Avvia</button>
                </div>

                <div className="tool-card">
                    <div className="tool-card__header">
                        <Weight className="tool-card__icon" size={20} />
                        <h3 className="tool-card__title">Peso</h3>
                    </div>
                    <div className="tool-card__body">
                        <div className="tool-card__score">
                            <span className="tool-card__value">{toolsData.weight.current}</span>
                            <span className="tool-card__unit">kg</span>
                        </div>
                        <p className="tool-card__meta">Target: {toolsData.weight.targetMin} - {toolsData.weight.targetMax} kg</p>
                    </div>
                    <button className="tool-card__btn tool-card__btn--outline">Aggiorna</button>
                </div>
            </div>

            {/* Appointments */}
            <section className="tools-section">
                <div className="tools-section__header">
                    <h2 className="tools-section__title">
                        <Calendar size={18} />
                        Appuntamenti
                    </h2>
                </div>
                <div className="tools-list">
                    {toolsData.appointments.map(app => (
                        <div key={app.id} className="tools-list-item">
                            <div className="tools-list-item__date">
                                <strong>{app.date}</strong>
                                <span>{app.time}</span>
                            </div>
                            <div className="tools-list-item__info">
                                <h4>{app.title}</h4>
                                <p>{app.doctor}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
