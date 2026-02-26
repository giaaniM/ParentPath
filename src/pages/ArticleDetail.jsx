import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, Send } from 'lucide-react';
import { articles } from '../data/mockData';
import './ArticleDetail.css';

export default function ArticleDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Find the right article or default to first
    const article = articles.find(a => a.id === id) || articles[0];

    return (
        <div className="page page-enter article-page">
            {/* Back Bar */}
            <header className="article-topbar">
                <span className="article-topbar__category">{article.category}</span>
            </header>

            {/* Article Header */}
            <div className="article-header">
                <h1 className="article-header__title">{article.title}</h1>
                <div className="article-header__meta">
                    <span className="article-header__time">📖 {article.readingTime}</span>
                    <span className="article-header__date">{article.publishedDate}</span>
                </div>
            </div>

            {/* Validated Badge */}
            <div className="article-validation">
                <div className="article-validation__badge">
                    <span className="article-validation__check">✓</span>
                    <span className="article-validation__label">VALIDATO DA</span>
                </div>
                <div className="article-validation__info">
                    <span className="article-validation__name">{article.validatedBy.name}</span>
                    <span className="article-validation__specialty">{article.validatedBy.specialty}</span>
                    <span className="article-validation__institution">{article.validatedBy.institution}</span>
                </div>
            </div>

            {/* Content */}
            <div className="article-body">
                {article.content.map((block, index) => {
                    switch (block.type) {
                        case 'heading':
                            return <h2 key={index} className="article-body__heading">{block.text}</h2>;
                        case 'paragraph':
                            return <p key={index} className="article-body__paragraph">{block.text}</p>;
                        case 'list':
                            return (
                                <ul key={index} className="article-body__list">
                                    {block.items.map((item, i) => (
                                        <li key={i} className="article-body__list-item">
                                            <span className="article-body__bullet">·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            );
                        case 'tip':
                            return (
                                <div key={index} className="article-body__tip">
                                    <span className="article-body__tip-icon">💡</span>
                                    <p>{block.text}</p>
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </div>

            {/* Action Bar */}
            <div className="article-actions">
                <button className="article-action">
                    <Bookmark size={18} />
                    <span>Salva</span>
                </button>
                <button className="article-action">
                    <Share2 size={18} />
                    <span>Condividi</span>
                </button>
                <button className="article-action article-action--primary">
                    <Send size={18} />
                    <span>Invia a Marco</span>
                </button>
            </div>
        </div>
    );
}
