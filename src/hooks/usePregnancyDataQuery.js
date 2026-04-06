import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const PREGNANCY_DATA_KEY = 'pregnancy-data';

/**
 * Fetcha le colonne condivise della gravidanza (note, visite, task, completedTasks).
 * Restituisce anche id, creator_id, partner_id per uso interno.
 */
async function fetchPregnancyData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
        .from('pregnancies')
        .select('id, creator_id, partner_id, invite_code, shared_notes, shared_appointments, shared_custom_tasks, shared_completed_tasks')
        .or(`creator_id.eq.${session.user.id},partner_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data ?? null;
}

/**
 * Hook per leggere i dati condivisi della gravidanza con caching e auto-refresh.
 * @param {boolean} enabled - attiva la query (di default true se l'utente è loggato)
 */
export function usePregnancyDataQuery(enabled = true) {
    return useQuery({
        queryKey: [PREGNANCY_DATA_KEY],
        queryFn: fetchPregnancyData,
        enabled,
        // Infinity = il dato non è mai "stale" → nessun refetch automatico su tab switch
        // L'unico trigger di refetch è invalidateQueries() chiamato da realtime o pull-to-refresh
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

/**
 * Invalida la pregnancy-data query costringendo un refetch.
 * Usato da pull-to-refresh, dopo mutazioni e dalla subscription realtime.
 */
export function useInvalidatePregnancyData() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: [PREGNANCY_DATA_KEY] });
}
