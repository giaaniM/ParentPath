import { useNavigate, useLocation } from 'react-router-dom';
import { BookText } from 'lucide-react';
import './DiaryFAB.css';

export default function DiaryFAB() {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide the FAB on Onboarding, Diary itself, and Tip Detail pages
    const hidePages = ['/', '/diary', '/tip'];
    if (hidePages.includes(location.pathname)) return null;

    return (
        <button
            className="diary-fab"
            onClick={() => navigate('/diary')}
            aria-label="Open Diary"
        >
            <BookText size={24} />
        </button>
    );
}
