import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const PARTNER_STATUS_KEY = 'partner-status';

/**
 * Fetcha lo stato del partner: se è collegato, il suo profilo, e l'invite code.
 */
async function fetchPartnerStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const userId = session.user.id;

    const { data: preg, error } = await supabase
        .from('pregnancies')
        .select('id, creator_id, partner_id, invite_code')
        .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    if (!preg) return null;

    const isCreator = preg.creator_id === userId;
    const partnerId = isCreator ? preg.partner_id : preg.creator_id;

    let partnerProfile = null;
    if (partnerId) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, role, birth_date')
            .eq('id', partnerId)
            .maybeSingle();
        partnerProfile = profile ?? null;
    }

    return {
        pregnancyId: preg.id,
        partnerId: partnerId ?? null,
        inviteCode: preg.invite_code ?? null,
        isCreator,
        partnerProfile,
    };
}

export function usePartnerStatusQuery(enabled = true) {
    return useQuery({
        queryKey: [PARTNER_STATUS_KEY],
        queryFn: fetchPartnerStatus,
        enabled,
        // Infinity = nessun refetch automatico su tab switch
        // Cambia solo quando invalidateQueries è chiamato (join, unlink, realtime)
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

export function useInvalidatePartnerStatus() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: [PARTNER_STATUS_KEY] });
}
