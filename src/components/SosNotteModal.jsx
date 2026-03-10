import { useState, useEffect } from 'react';
import { X, Heart, Wind, Waves, Play, Square } from 'lucide-react';
import './SosNotteModal.css';

export default function SosNotteModal({ isOpen, onClose }) {
    const [activeSound, setActiveSound] = useState(null);

    // Block background scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Pre-load logic for sounds if we had real audio files
        } else {
            document.body.style.overflow = 'auto';
            setActiveSound(null);
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleSound = (soundId) => {
        if (activeSound === soundId) {
            setActiveSound(null);
        } else {
            setActiveSound(soundId);
        }
    };

    return (
        <div className="sos-overlay">
            <div className="sos-modal">
                <button className="sos-close" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="sos-header">
                    <h2>SOS Notte</h2>
                    <p>Rumori bianchi e guida rapida per calmare il pianto alle 3 di notte.</p>
                </div>

                <div className="sos-sounds-grid">
                    <button className={`sos-sound-btn ${activeSound === 'white' ? 'active' : ''}`} onClick={() => toggleSound('white')}>
                        <div className="sos-icon"><Wind size={24} strokeWidth={1.5} /></div>
                        <span>Rumore Bianco (Phon)</span>
                        <div className="sos-play-indicator">
                            {activeSound === 'white' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </div>
                    </button>
                    <button className={`sos-sound-btn ${activeSound === 'heart' ? 'active' : ''}`} onClick={() => toggleSound('heart')}>
                        <div className="sos-icon"><Heart size={24} strokeWidth={1.5} /></div>
                        <span>Battito Mamma</span>
                        <div className="sos-play-indicator">
                            {activeSound === 'heart' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </div>
                    </button>
                    <button className={`sos-sound-btn ${activeSound === 'shush' ? 'active' : ''}`} onClick={() => toggleSound('shush')}>
                        <div className="sos-icon"><Waves size={24} strokeWidth={1.5} /></div>
                        <span>Shhh... Continuo</span>
                        <div className="sos-play-indicator">
                            {activeSound === 'shush' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </div>
                    </button>
                </div>

                <div className="sos-guide">
                    <h3>Emergenza Coliche</h3>
                    <div className="sos-guide-scroll">
                        <div className="sos-guide-item">
                            <div className="sos-guide-num">1</div>
                            <p><strong>Presa della Tigre:</strong> A pancia in giù sul tuo avambraccio. Sostieni la testa col palmo della mano e dondola dolcemente.</p>
                        </div>
                        <div className="sos-guide-item">
                            <div className="sos-guide-num">2</div>
                            <p><strong>Ginocchia al petto:</strong> Bimbo a pancia in su, porta delicatamente le sue ginocchia verso il pancino per favorire il rilascio di gas.</p>
                        </div>
                        <div className="sos-guide-item">
                            <div className="sos-guide-num">3</div>
                            <p><strong>Massaggio Circolare:</strong> Sul pancino in senso orario intorno all'ombelico, accompagnato da lievissima pressione.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
