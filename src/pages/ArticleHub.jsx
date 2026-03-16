import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useWeekData } from '../hooks/useWeekData';
import { ChevronRight, BookOpen, ShoppingBag, Calculator, Brain, Trophy } from 'lucide-react';
import './ArticleHub.css';

const CATEGORIES = ['Tutti', 'sviluppo', 'salute', 'acquisti', 'nutrizione', 'supporto'];

const CATEGORY_ICON_COLORS = {
    sviluppo: 'blue',
    salute: 'coral',
    acquisti: 'green',
    nutrizione: 'gold',
    supporto: 'lav',
    preparazione: 'blue',
};

export default function ArticleHub() {
    const navigate = useNavigate();
    const { getWeeksPregnant } = useUser();
    const currentWeek = getWeeksPregnant();
    const weekData = useWeekData(currentWeek);

    const [activeFilter, setActiveFilter] = useState('Tutti');

    // Articles from JSON
    const allArticles = weekData?.articles || [];

    const filteredArticles = useMemo(() => {
        if (activeFilter === 'Tutti') return allArticles;
        return allArticles.filter(a => a.category?.toLowerCase() === activeFilter.toLowerCase());
    }, [allArticles, activeFilter]);

    return (
        <div className="page hub-page">
            <div className="es-wrap">
                <div className="es-hl ru">Esplora</div>
                <div className="es-sub ru d1">Guide, strumenti e quiz per la sett. {currentWeek}</div>

                {/* Category filter pills */}
                <div className="es-filter-pills ru d1">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`es-filter-pill ${activeFilter === cat ? 'active' : ''}`}
                            onClick={() => setActiveFilter(cat)}
                        >
                            {cat === 'Tutti' ? 'Tutti' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="es-g ru d1">Guide questa settimana</div>

                {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => {
                        const colorClass = CATEGORY_ICON_COLORS[article.category] || 'blue';
                        return (
                            <div key={article.id} className="es-card ru d2" onClick={() => navigate(`/article/${article.id}`)}>
                                <div className={`es-ic ${colorClass}`}>
                                    <BookOpen size={24} strokeWidth={1.5} />
                                </div>
                                <div className="es-txt">
                                    <div className="es-t">{article.title}</div>
                                    <div className="es-s">{article.read_time_min} min · Sett. {currentWeek}</div>
                                </div>
                                <div className="es-arr"><ChevronRight size={20} /></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="es-empty">Nessun articolo per questa categoria</div>
                )}

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
