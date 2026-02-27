import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './StickyBackButton.css';

export default function StickyBackButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // List of paths where the back button should appear
    const subViews = ['/diary', '/tools', '/article/', '/notifications', '/tip', '/tools/due-date', '/tools/hospital-bag'];
    const isSubView = subViews.some(path => location.pathname.startsWith(path));

    useEffect(() => {
        let isMounted = true;
        // let lastScrollY = 0; // This variable is not used in the final version of handleScroll

        const handleScroll = (e) => {
            const currentScrollY = e.target.scrollTop || window.scrollY;
            if (isMounted) {
                // If scroll is more than 50px, add scrolled class, else remove it
                setScrolled(currentScrollY > 50);
                // lastScrollY = currentScrollY; // This variable is not used in the final version of handleScroll
            }
        };

        const attachScrollListener = () => {
            // Find the primary page scroll container, usually `.page` wraps the main content
            const pageContainer = document.querySelector('.page');

            if (pageContainer) {
                pageContainer.addEventListener('scroll', handleScroll, { passive: true });
                return () => pageContainer.removeEventListener('scroll', handleScroll);
            } else {
                // Fallback to window scroll if no specific container is found
                window.addEventListener('scroll', handleScroll, { passive: true });
                return () => window.removeEventListener('scroll', handleScroll);
            }
        };

        let cleanup;
        if (isSubView) {
            // Need a slight delay to ensure DOM is updated after navigation and the `.page` element is present
            const timeoutId = setTimeout(() => {
                cleanup = attachScrollListener();
            }, 100);

            return () => {
                isMounted = false;
                clearTimeout(timeoutId);
                if (cleanup) cleanup();
            };
        }
    }, [isSubView, location.pathname]);

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
