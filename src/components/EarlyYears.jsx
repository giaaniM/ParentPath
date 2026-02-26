import { Baby, Star } from 'lucide-react';
import './EarlyYears.css';

export default function EarlyYears() {
    return (
        <div className="ey-container">
            <div className="ey-icon-wrap">
                <Baby size={48} className="ey-icon" />
            </div>
            <h2 className="ey-title">Benvenuto al mondo!</h2>
            <p className="ey-subtitle">
                La sezione "Primi Anni" è attualmente in lavorazione.<br />
                Presto troverai consigli, tappe di sviluppo e strumenti dedicati ai primi mesi del tuo bimbo.
            </p>
            <div className="ey-badge">
                <Star size={16} /> Coming Soon
            </div>
        </div>
    );
}
