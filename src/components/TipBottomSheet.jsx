import { useEffect, useState } from 'react';
import { Bookmark, Share2, X } from 'lucide-react';
import { getCategoryConfig } from '../utils/CategoryColors';
import './TipBottomSheet.css';

export default function TipBottomSheet({ tip, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    // Swipe to close state
    const [touchStart, setTouchStart] = useState(null);
    const [touchY, setTouchY] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

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
            setIsClosing(false);
            onClose();
            setTouchY(null);
            setTouchStart(null);
        }, 300); // match animation duration approximately
    };

    const handleTouchStart = (e) => {
        // Only initiate drag if the sheet itself is dragged, or if scroll area is at top
        const contentArea = e.target.closest('.tip-bs-content');
        if (contentArea && contentArea.scrollTop > 0) return;

        setTouchStart(e.targetTouches[0].clientY);
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

        if (touchY > 100) {
            // Dragged enough, close it
            handleClose();
        } else {
            // Snap back
            setTouchY(null);
            setTouchStart(null);
        }
    };

    const style = getCategoryConfig(tip.category);

    // Calculate dynamic transform based on drag state
    let transformStyle = '';
    if (isClosing) {
        transformStyle = 'translateY(100%)';
    } else if (touchY > 0) {
        transformStyle = `translateY(${touchY}px)`;
    }

    // Determine transition: none while dragging so it follows finger instantly
    const transitionStyle = isDragging && touchY > 0 ? 'none' : (isClosing ? 'transform 0.3s ease-out' : 'transform 0.2s ease');

    return (
        <div
            className="tip-bs-overlay"
            style={{ opacity: isClosing ? 0 : '', animation: isClosing ? 'none' : '' }}
            onClick={handleClose}
        >
            <div
                className="tip-bs-sheet"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: transformStyle,
                    transition: transitionStyle,
                    animation: (isClosing || isDragging) ? 'none' : ''
                }}
            >
                <div className="tip-bs-handle" />

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
