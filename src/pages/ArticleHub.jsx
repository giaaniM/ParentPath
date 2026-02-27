import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ChevronRight, BookOpen, Apple, Moon, ShoppingBag, Calculator, Brain, Trophy } from 'lucide-react';
import './ArticleHub.css';

export default function ArticleHub() {
    const navigate = useNavigate();
    const { getWeeksPregnant } = useUser();
    const currentWeek = getWeeksPregnant();

    return (
        <div className="page hub-page">
            <div className="es-wrap">
                <div className="es-hl ru">Esplora</div>
                <div className="es-sub ru d1">Guide, strumenti e quiz per la sett. {currentWeek}</div>

                <div className="es-g ru d1">Guide questa settimana</div>
                <div className="es-card ru d2" onClick={() => navigate('/article/1')}>
                    <div className="es-ic blue"><BookOpen size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">Cosa succede nel corpo</div>
                        <div className="es-s">5 min · Sett. {currentWeek}</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>
                <div className="es-card ru d3" onClick={() => navigate('/article/2')}>
                    <div className="es-ic coral"><Apple size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">Nutrizione nel 3° trimestre</div>
                        <div className="es-s">Cosa mangiare, cosa evitare</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>
                <div className="es-card ru d4" onClick={() => navigate('/article/3')}>
                    <div className="es-ic green"><Moon size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">Dormire bene al 7° mese</div>
                        <div className="es-s">Posizioni e consigli pratici</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>

                <div className="es-g ru d2">Strumenti</div>
                <div className="es-card ru d3" onClick={() => navigate('/tools/hospital-bag')}>
                    <div className="es-ic gold"><ShoppingBag size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">Valigia Parto & Corredino</div>
                        <div className="es-s">Checklist interattiva</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>
                <div className="es-card ru d4" onClick={() => navigate('/tools/due-date')}>
                    <div className="es-ic blue"><Calculator size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">Calcola data del parto</div>
                        <div className="es-s">Basato sull'ultima mestruazione</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>

                <div className="es-g ru d3">Quiz</div>
                <div className="es-card hl ru d4">
                    <div className="es-ic coral"><Brain size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">Quiz settimana {currentWeek}</div>
                        <div className="es-s">3 domande · Non ancora completato</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>
                <div className="es-card ru d5">
                    <div className="es-ic lav"><Trophy size={24} strokeWidth={1.5} /></div>
                    <div className="es-txt">
                        <div className="es-t">I tuoi risultati</div>
                        <div className="es-s">12 quiz · 🔥 streak 8 settimane</div>
                    </div>
                    <div className="es-arr"><ChevronRight size={20} /></div>
                </div>

            </div>
        </div>
    );
}
