import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
        <div className="page page-enter tip-detail">
            {/* Back header */}
            <button className="tip-detail__back" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>{tip.category}</span>
            </button>

            {/* Category badge */}
            <div className="tip-detail__badge" style={{ background: tip.bg, color: tip.color }}>
                {tip.category}
            </div>

            <h1 className="tip-detail__title">{tip.title}</h1>

            <div className="tip-detail__content">
                {tip.body.map((paragraph, i) => (
                    <p key={i} className="tip-detail__paragraph">{paragraph}</p>
                ))}

                {tip.tip && (
                    <div className="tip-detail__callout">
                        <span className="tip-detail__callout-icon">💡</span>
                        <p>{tip.tip}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
