import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Dati considerati freschi per 30 secondi — dopo Supabase viene ri-interrogato in background
            staleTime: 30 * 1000,
            // Mantieni i dati in cache per 5 minuti anche se il componente smonta
            gcTime: 5 * 60 * 1000,
            // Ricarica automaticamente quando l'utente torna in foreground o riconnette
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            // Non riprovare in loop su errori auth (401)
            retry: (failureCount, error) => {
                if (error?.code === 'PGRST301' || error?.status === 401) return false;
                return failureCount < 2;
            },
        },
        mutations: {
            // Non riprovare automaticamente le mutazioni fallite
            retry: false,
        },
    },
});
