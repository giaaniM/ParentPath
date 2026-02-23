import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { dailyFacts } from '../data/discoveryData';
import './DailyDiscovery.css';

export default function DailyDiscovery({ week = 24, onShare }) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const fact = dailyFacts[week] || dailyFacts[24];

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    if (dismissed) return null;

    return (
        <div
            className={`ddisco ${visible ? 'ddisco--visible' : ''}`}
            style={{
                background: `linear-gradient(135deg, ${fact.bgGradient[0]}, ${fact.bgGradient[1]})`,
            }}
        >
            {/* Floating decorative particles */}
            <div className="ddisco__particles">
                <span className="ddisco__particle ddisco__particle--1">✦</span>
                <span className="ddisco__particle ddisco__particle--2">·</span>
                <span className="ddisco__particle ddisco__particle--3">✧</span>
                <span className="ddisco__particle ddisco__particle--4">·</span>
                <span className="ddisco__particle ddisco__particle--5">✦</span>
            </div>

            {/* Share icon (top-right, secondary) */}
            <button
                className="ddisco__share-icon"
                onClick={(e) => { e.stopPropagation(); onShare?.(fact.shareText); }}
                aria-label="Condividi"
            >
                <Share2 size={18} />
            </button>

            <div className="ddisco__badge">✨ Scoperta del giorno</div>

            <div className="ddisco__emoji">{fact.emoji}</div>
            <h3 className="ddisco__title">{fact.title}</h3>
            <p className="ddisco__text">{fact.text}</p>

            <div className="ddisco__actions">
                <button
                    className="ddisco__dismiss-btn ddisco__dismiss-btn--primary"
                    onClick={() => setDismissed(true)}
                >
                    Ho capito ✓
                </button>
            </div>
        </div>
    );
}
