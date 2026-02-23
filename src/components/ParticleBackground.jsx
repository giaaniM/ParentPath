import { useEffect, useRef } from 'react';
import './ParticleBackground.css';

const PARTICLE_CONFIGS = {
    hearts: { chars: ['♥', '♡', '💕'], count: 15, speed: 0.3 },
    stars: { chars: ['✦', '✧', '⭐', '·'], count: 20, speed: 0.4 },
    bokeh: { chars: ['●', '○', '◌'], count: 12, speed: 0.2 },
    bubbles: { chars: ['○', '◯', '◌', '∘'], count: 18, speed: 0.25 },
    confetti: { chars: ['◆', '◇', '■', '▲', '●'], count: 25, speed: 0.6 },
};

export default function ParticleBackground({ type = 'hearts', gradient = ['#FFF5F0', '#FFE8E0'], className = '' }) {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);
        };
        resize();
        window.addEventListener('resize', resize);

        const config = PARTICLE_CONFIGS[type] || PARTICLE_CONFIGS.hearts;

        // Initialize particles
        particlesRef.current = Array.from({ length: config.count }, () => ({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            char: config.chars[Math.floor(Math.random() * config.chars.length)],
            size: 8 + Math.random() * 16,
            opacity: 0.1 + Math.random() * 0.3,
            vx: (Math.random() - 0.5) * config.speed,
            vy: -0.2 - Math.random() * config.speed,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.01 + Math.random() * 0.02,
        }));

        const animate = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            particlesRef.current.forEach(p => {
                p.wobble += p.wobbleSpeed;
                p.x += p.vx + Math.sin(p.wobble) * 0.3;
                p.y += p.vy;

                // Wrap around
                if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
                if (p.x < -20) p.x = w + 20;
                if (p.x > w + 20) p.x = -20;

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.font = `${p.size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(p.char, p.x, p.y);
                ctx.restore();
            });

            animRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [type]);

    const gradientStyle = {
        background: `linear-gradient(135deg, ${gradient.join(', ')})`,
    };

    return (
        <div className={`particle-bg ${className}`} style={gradientStyle}>
            <canvas ref={canvasRef} className="particle-bg__canvas" />
        </div>
    );
}
