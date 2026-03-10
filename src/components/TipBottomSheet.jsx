import { useEffect, useState } from 'react';
import { Bookmark, Share2, X } from 'lucide-react';
import { getCategoryConfig } from '../utils/CategoryColors';
import './TipBottomSheet.css';

export default function TipBottomSheet({ tip, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    // Swipe to close state
    const [isDragging, setIsDragging] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchY, setTouchY] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Trigger slide up after mount
        const timer = setTimeout(() => setIsMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Block background scroll when open
    useEffect(() => {
        if (tip) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [tip]);

    if (!tip) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientY);
        setTouchY(0);
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging || touchStart === null) return;

        const currentY = e.targetTouches[0].clientY;
        const diff = currentY - touchStart;

        // Only allow dragging downwards
        if (diff > 0) {
            setTouchY(diff);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (touchY > 120) {
            handleClose();
        } else {
            setTouchY(0);
            setTouchStart(null);
        }
    };

    const style = getCategoryConfig(tip.category);

    // Calculate dynamic transform
    let currentTransform = 'translateY(100%)';
    if (isClosing) {
        currentTransform = 'translateY(100%)';
    } else if (isDragging) {
        currentTransform = `translateY(${touchY}px)`;
    } else if (isMounted) {
        currentTransform = 'translateY(0)';
    }

    const transitionStyle = isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

    return (
        <div
            className={`tip-bs-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleClose}
        >
            <div
                className="tip-bs-sheet"
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: currentTransform,
                    transition: transitionStyle,
                    animation: 'none' // We handle it via JS 'isMounted' for stability
                }}
            >
                {/* Draggable Handle Area */}
                <div
                    className="tip-bs-drag-zone"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="tip-bs-handle" />
                </div>

                <button className="tip-bs-close" onClick={handleClose}>
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="tip-bs-content">
                    <div className="tip-bs-pill" style={{ color: style.color, background: style.bg }}>
                        <div className="tip-bs-pill-dot" style={{ background: style.dot }} />
                        {tip.category}
                    </div>

                    <h2 className="tip-bs-title">{tip.title}</h2>

                    <div className="tip-bs-meta">
                        <span className="tip-bs-meta-icon">⏱</span> 2 min
                        <span>·</span>
                        Oggi
                        <span>·</span>
                        Settimana 24
                    </div>

                    <div className="tip-bs-valid">
                        <div className="tip-bs-valid-icon">✓</div>
                        <div className="tip-bs-valid-labels">
                            <span className="tip-bs-valid-eyebrow">Validato da</span>
                            <span className="tip-bs-valid-name">Team ParentPath</span>
                            <span className="tip-bs-valid-spec">Redazione Ospedaliera · Revisione Medico Scientifica</span>
                        </div>
                    </div>

                    {tip.body?.map((p, i) => {
                        // Highlight logic for the specific photo1 example
                        if (p.includes('papille gustative formate')) {
                            const parts = p.split('papille gustative formate');
                            return (
                                <p key={i} className="tip-bs-text">
                                    {parts[0]}
                                    <span className="tip-bs-text-highlight">papille gustative formate</span>
                                    {parts[1]}
                                </p>
                            );
                        }
                        return <p key={i} className="tip-bs-text">{p}</p>;
                    })}

                    {tip.tip && (
                        <div className="tip-bs-callout">
                            <div className="tip-bs-callout-head">
                                💡 Consiglio della settimana
                            </div>
                            <p className="tip-bs-callout-text">{tip.tip}</p>
                        </div>
                    )}
                </div>

                <div className="tip-bs-actions">
                    <button className="tip-bs-btn secondary">
                        <Bookmark size={18} /> Salva
                    </button>
                    <button className="tip-bs-btn primary">
                        <Share2 size={18} /> Condividi
                    </button>
                </div>
            </div>
        </div>
    );
}
