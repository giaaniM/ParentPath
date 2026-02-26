import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './StickyBackButton.css';

export default function StickyBackButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // List of paths where the back button should appear
    const subViews = ['/diary', '/tools', '/article/', '/notifications', '/tip'];
    const isSubView = subViews.some(path => location.pathname.startsWith(path));

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        if (isSubView) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [isSubView]);

    if (!isSubView) return null;

    return (
        <button
            className={`sticky-back-btn ${scrolled ? 'scrolled' : ''}`}
            onClick={() => navigate(-1)}
            aria-label="Torna indietro"
        >
            <ArrowLeft size={24} />
        </button>
    );
}
