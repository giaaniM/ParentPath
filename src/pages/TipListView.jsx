import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ChevronRight } from 'lucide-react';
import { pregnancy, pregnancyArticles, newbornArticles, articles } from '../data/mockData';
import { getCategoryConfig } from '../utils/CategoryColors';
import StickyBackButton from '../components/StickyBackButton';
import TipBottomSheet from '../components/TipBottomSheet';
import './TipListView.css';

export default function TipListView() {
    const navigate = useNavigate();
    const { isMamma, babyStatus } = useUser();

    // Aggregation of tips based on phase and role
    const allTips = useMemo(() => {
        const isBorn = babyStatus === 'nato';
        const baseArticles = isBorn ? newbornArticles : pregnancyArticles;
        return baseArticles.map(a => {
            const fullArticle = (articles || []).find(art => art.id === a.id) || {};
            return {
                ...a,
                ...fullArticle,
                readingTime: a.duration || fullArticle.readingTime || a.readingTime || '3 min'
            };
        });
    }, [isMamma, babyStatus]);

    const [activeFilter, setActiveFilter] = useState('Tutti');
    const [selectedTip, setSelectedTip] = useState(null);

    // Categories to show in the filter
    const filterOptions = ['Tutti', 'Sviluppo', 'Supporto', 'Benessere', 'Da fare', 'Da avere'];

    const filteredTips = useMemo(() => {
        if (activeFilter === 'Tutti') return allTips;
        return allTips.filter(t => {
            if (activeFilter === 'Benessere') {
                return t.category.includes('Salute') || t.category.includes('Benessere');
            }
            return t.category.includes(activeFilter);
        });
    }, [activeFilter, allTips]);

    return (
        <div className="page tiplist-page">
            <StickyBackButton />

            <div className="tiplist-header">
                <h1 className="tiplist-main-title">Articoli e Strumenti</h1>
                <div className="tiplist-label">FILTRA PER TIPO</div>
            </div>

            <div className="tiplist-filters">
                {filterOptions.map(f => {
                    const isAll = f === 'Tutti';
                    const active = activeFilter === f;
                    const cConfig = getCategoryConfig(f);

                    if (isAll) {
                        return (
                            <div
                                key={f}
                                className={`tl-filter ${active ? 'active-all' : 'inactive-all'}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                Tutti
                            </div>
                        );
                    }

                    return (
                        <div
                            key={f}
                            className="tl-filter"
                            style={{
                                background: active ? cConfig.bg : 'var(--white)',
                                color: active ? cConfig.color : 'var(--stone)',
                                border: active ? '1px solid transparent' : '1px solid var(--border)',
                                boxShadow: active ? 'inset 0 0 0 1px ' + cConfig.color + '25' : 'none'
                            }}
                            onClick={() => setActiveFilter(f)}
                        >
                            <span className="tl-filter-dot" style={{ background: active ? cConfig.dot : 'var(--stone2)' }} />
                            {cConfig.name}
                        </div>
                    );
                })}
            </div>

            <div className="tiplist-content">
                {filteredTips.map((tip) => {
                    const conf = getCategoryConfig(tip.category);
                    return (
                        <div key={tip.id} className="tl-card" onClick={() => setSelectedTip(tip)}>
                            <div
                                className="tl-card-imgbox"
                                style={{
                                    backgroundImage: `linear-gradient(to top, ${conf.color}B3 0%, ${conf.color}66 100%), url('/${conf.cardBgImage}')`,
                                    color: 'var(--white)'
                                }}
                            >
                                {conf.icon}
                            </div>

                            <div className="tl-card-body">
                                <div className="tl-card-cat" style={{ color: conf.color }}>
                                    <span className="tl-card-cat-dot" style={{ background: conf.dot }} />
                                    {conf.name}
                                </div>
                                <h3 className="tl-card-title">{tip.title}</h3>
                                <div className="tl-card-subtitle">
                                    2 min · Validato da medici
                                </div>
                            </div>

                            <div className="tl-card-arrow">
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <TipBottomSheet tip={selectedTip} onClose={() => setSelectedTip(null)} />
        </div>
    );
}
