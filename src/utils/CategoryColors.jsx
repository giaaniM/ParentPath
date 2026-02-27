import React from 'react';
import { Brain, HeartPulse, CheckCircle, ShoppingBag, Sparkles, Users } from 'lucide-react';

export const getCategoryConfig = (catName) => {
    const c = catName?.toLowerCase() || '';

    // SVILUPPO (Teal/Cyan)
    if (c.includes('sviluppo')) return {
        name: 'Sviluppo',
        color: '#2C7A7B', bg: '#E6FFFA', dot: '#38B2AC',
        cardBgImage: 'bg_superblur_dev.png',
        icon: <Brain size={28} strokeWidth={1.5} />
    };

    // SUPPORTO (Pink/Red)
    if (c.includes('supporto')) return {
        name: 'Supporto',
        color: '#9B2C2C', bg: '#FFF5F5', dot: '#F56565',
        cardBgImage: 'bg_superblur_todo.png',
        icon: <Users size={28} strokeWidth={1.5} />
    };

    // SALUTE / BENESSERE (Green)
    if (c.includes('salute') || c.includes('benessere')) return {
        name: 'Benessere',
        color: '#276749', bg: '#F0FFF4', dot: '#48BB78',
        cardBgImage: 'bg_superblur_health.png',
        icon: <HeartPulse size={28} strokeWidth={1.5} />
    };

    // DA FARE / ORGANIZZAZIONE (Purple)
    if (c.includes('fare')) return {
        name: 'Da fare',
        color: '#553C9A', bg: '#FAF5FF', dot: '#9F7AEA',
        cardBgImage: 'bg_superblur_todo.png',
        icon: <CheckCircle size={28} strokeWidth={1.5} />
    };

    // DA AVERE / SHOPPING (Orange)
    if (c.includes('avere') || c.includes('shopping')) return {
        name: 'Da avere',
        color: '#C05621', bg: '#FFFAF0', dot: '#ED8936',
        cardBgImage: 'bg_superblur_shopping.png',
        icon: <ShoppingBag size={28} strokeWidth={1.5} />
    };

    // DEFAULT
    return {
        name: catName || 'Tip',
        color: 'var(--midnight)', bg: 'var(--border)', dot: 'var(--stone)',
        cardBgImage: 'bg_superblur_todo.png',
        icon: <Sparkles size={28} strokeWidth={1.5} />
    };
};
