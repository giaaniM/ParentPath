import { useNavigate, useLocation } from 'react-router-dom';
import { Bookmark, Share2 } from 'lucide-react';
import './TipDetail.css';

export default function TipDetail() {
    const navigate = useNavigate();
    const { state } = useLocation();

    if (!state?.tip) {
        navigate('/home');
        return null;
    }

    const { tip } = state;

    return (
        <div className="page page-enter tip-detail-page">
            {/* Top Bar */}
            <header className="tip-topbar">
                <span className="tip-topbar__category">{tip.category}</span>
            </header>

            {/* Header */}
            <div className="tip-header">
                <h1 className="tip-header__title">{tip.title}</h1>
                <div className="tip-header__meta">
                    <span className="tip-header__time">⏱ 2 min</span>
                    <span className="tip-header__date">Oggi</span>
                </div>
            </div>

            {/* Validation - Reused from Article Detail Style */}
            <div className="tip-validation">
                <div className="tip-validation__badge">
                    <span className="tip-validation__check">✓</span>
                    <span className="tip-validation__label">VALIDATO DA</span>
                </div>
                <div className="tip-validation__info">
                    <span className="tip-validation__name">Team ParentPath</span>
                    <span className="tip-validation__specialty">Redazione Ospedaliera</span>
                    <span className="tip-validation__institution">Revisione Medico Scientifica</span>
                </div>
            </div>

            {/* Content */}
            <div className="tip-body">
                {tip.body.map((paragraph, i) => (
                    <p key={i} className="tip-body__paragraph">{paragraph}</p>
                ))}

                {tip.tip && (
                    <div className="tip-body__tip">
                        <span className="tip-body__tip-icon">💡</span>
                        <p>{tip.tip}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="tip-actions">
                <button className="tip-action">
                    <Bookmark size={18} />
                    <span>Salva</span>
                </button>
                <button className="tip-action">
                    <Share2 size={18} />
                    <span>Condividi</span>
                </button>
            </div>
        </div>
    );
}
