import { useState, useRef } from 'react';
import { didYouKnow } from '../data/discoveryData';
import './DidYouKnow.css';

const getTrimester = (w) => {
    if (w <= 13) return 1;
    if (w <= 27) return 2;
    return 3;
};

export default function DidYouKnow({ week = 24 }) {
    const trimester = getTrimester(week);
    const cards = didYouKnow[trimester] || didYouKnow[2];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [liked, setLiked] = useState({});
    const [swipeDir, setSwipeDir] = useState(null);
    const touchStartRef = useRef(null);
    const touchDeltaRef = useRef(0);
    const cardRef = useRef(null);

    const handleTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientX;
        touchDeltaRef.current = 0;
    };

    const handleTouchMove = (e) => {
        if (!touchStartRef.current) return;
        const delta = e.touches[0].clientX - touchStartRef.current;
        touchDeltaRef.current = delta;
        if (cardRef.current) {
            cardRef.current.style.transform = `translateX(${delta * 0.5}px) rotate(${delta * 0.05}deg)`;
            cardRef.current.style.transition = 'none';
        }
    };

    const handleTouchEnd = () => {
        const delta = touchDeltaRef.current;
        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
            cardRef.current.style.transform = '';
        }

        if (Math.abs(delta) > 60) {
            const dir = delta > 0 ? 'right' : 'left';
            setSwipeDir(dir);
            setTimeout(() => {
                setSwipeDir(null);
                if (dir === 'left' && currentIndex < cards.length - 1) {
                    setCurrentIndex(i => i + 1);
                } else if (dir === 'right' && currentIndex > 0) {
                    setCurrentIndex(i => i - 1);
                }
            }, 300);
        }
        touchStartRef.current = null;
    };

    const toggleLike = (id) => {
        setLiked(l => ({ ...l, [id]: !l[id] }));
    };

    const card = cards[currentIndex];
    if (!card) return null;

    return (
        <div className="dyk">
            <div className="dyk__header">
                <h3 className="dyk__section-title">💡 Lo sapevi che...?</h3>
                <span className="dyk__counter">{currentIndex + 1}/{cards.length}</span>
            </div>

            <div
                className={`dyk__card ${swipeDir ? `dyk__card--swipe-${swipeDir}` : ''}`}
                style={{ background: card.bgColor }}
                ref={cardRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                key={card.id}
            >
                <div className="dyk__card-shimmer" />
                <span className="dyk__card-emoji">{card.emoji}</span>
                <p className="dyk__card-text">{card.text}</p>

                <div className="dyk__card-actions">
                    <button
                        className={`dyk__like-btn ${liked[card.id] ? 'dyk__like-btn--liked' : ''}`}
                        onClick={() => toggleLike(card.id)}
                    >
                        {liked[card.id] ? '❤️' : '🤍'}
                    </button>
                    <button className="dyk__share-btn">↗ Condividi</button>
                </div>
            </div>

            {/* Dots */}
            <div className="dyk__dots">
                {cards.map((_, i) => (
                    <button
                        key={i}
                        className={`dyk__dot ${i === currentIndex ? 'dyk__dot--active' : ''}`}
                        onClick={() => setCurrentIndex(i)}
                    />
                ))}
            </div>

            <p className="dyk__hint">← Swipe per scoprire →</p>
        </div>
    );
}
