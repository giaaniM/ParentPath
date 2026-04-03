import { useState, useEffect } from 'react';

/**
 * Rileva l'altezza della tastiera virtuale usando visualViewport API.
 * Funziona su iOS WebView (Capacitor) e browser moderni.
 * Restituisce 0 quando la tastiera è chiusa.
 */
export function useKeyboardHeight() {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const update = () => {
            // La differenza tra l'altezza della finestra e il viewport visuale
            // rappresenta lo spazio occupato dalla tastiera
            const diff = window.innerHeight - vv.height - vv.offsetTop;
            setKeyboardHeight(Math.max(0, diff));
        };

        vv.addEventListener('resize', update);
        vv.addEventListener('scroll', update);
        return () => {
            vv.removeEventListener('resize', update);
            vv.removeEventListener('scroll', update);
        };
    }, []);

    return keyboardHeight;
}
