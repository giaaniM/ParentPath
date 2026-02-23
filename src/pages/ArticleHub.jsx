import { useNavigate } from 'react-router-dom';
import { articles } from '../data/mockData';
import { Search, ChevronRight } from 'lucide-react';
import './ArticleHub.css';

export default function ArticleHub() {
    const navigate = useNavigate();

    const categories = [...new Set(articles.map(a => a.category))];

    return (
        <div className="page page-enter hub-page">
            <h1 className="page-title">Esplora</h1>
            <p className="page-subtitle">Articoli e guide per la tua famiglia</p>

            <div className="hub-search">
                <Search size={18} className="hub-search__icon" />
                <input type="text" placeholder="Cerca argomenti, sintomi..." className="hub-search__input" />
            </div>

            <div className="hub-categories">
                <button className="hub-category hub-category--active">Tutti</button>
                {categories.map((cat, i) => (
                    <button key={i} className="hub-category">{cat}</button>
                ))}
            </div>

            <div className="hub-list">
                {articles.map((article) => (
                    <article
                        key={article.id}
                        className="hub-card"
                        onClick={() => navigate(`/article/${article.id}`)}
                    >
                        <div className="hub-card__content">
                            <div className="hub-card__meta">
                                <span className="hub-card__category">{article.category}</span>
                                <span className="hub-card__time">· {article.readingTime}</span>
                            </div>
                            <h3 className="hub-card__title">{article.title}</h3>
                            <div className="hub-card__footer">
                                <div className="hub-card__author">
                                    <span className="hub-card__check">✓</span>
                                    {article.validatedBy.name}
                                </div>
                                <ChevronRight size={16} className="hub-card__chevron" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div >
    );
}
