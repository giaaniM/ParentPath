import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    Check, Users, Baby, FileText, Calendar, CheckSquare, Cake,
    Info, Star, X,
} from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

const TYPE_META = {
    success:     { Icon: Check,        color: 'var(--aqua)' },
    milestone:   { Icon: Star,         color: 'var(--aqua)' },
    achievement: { Icon: Star,         color: 'var(--aqua)' },
    partner:     { Icon: Users,        color: 'white' },
    baby:        { Icon: Baby,         color: 'white' },
    note:        { Icon: FileText,     color: '#F6AD55' },
    visit:       { Icon: Calendar,     color: 'var(--aqua)' },
    task:        { Icon: CheckSquare,  color: '#68D391' },
    birthdate:   { Icon: Cake,         color: 'var(--aqua)' },
    info:        { Icon: Info,         color: 'rgba(255,255,255,0.6)' },
};

function ToastItem({ id, title, subtitle, type, onDismiss }) {
    const [leaving, setLeaving] = useState(false);
    const meta = TYPE_META[type] || TYPE_META.success;
    const { Icon, color } = meta;

    const handleDismiss = () => {
        setLeaving(true);
        setTimeout(() => onDismiss(id), 280);
    };

    return (
        <div
            className={`toast toast--${type}${leaving ? ' toast--leaving' : ''}`}
            onClick={handleDismiss}
        >
            <div className="toast-icon">
                <Icon size={17} strokeWidth={2.5} color={color} />
            </div>
            <div className="toast-body">
                <span className="toast-title">{title}</span>
                {subtitle && <span className="toast-sub">{subtitle}</span>}
            </div>
            <div className="toast-dismiss">
                <X size={12} strokeWidth={3} color="white" />
            </div>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback(({ message, title, subtitle, type = 'success', duration = 3500 }) => {
        const id = Date.now() + Math.random();
        // title/subtitle API nuova; retrocompatibile con message (vecchia API)
        const resolvedTitle = title || message || '';
        setToasts(prev => [{ id, title: resolvedTitle, subtitle, type }, ...prev].slice(0, 3));

        timers.current[id] = setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
                delete timers.current[id];
            }, 300);
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <ToastItem
                        key={t.id}
                        id={t.id}
                        title={t.title}
                        subtitle={t.subtitle}
                        type={t.type}
                        onDismiss={dismiss}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
