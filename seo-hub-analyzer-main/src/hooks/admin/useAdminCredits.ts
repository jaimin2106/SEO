// src/hooks/admin/useAdminCredits.ts
// Credit management mutations with audit logging

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';

export type CreditAction = 'grant' | 'deduct' | 'set' | 'reset';

interface CreditMutationOpts {
  userId: string;
  action: CreditAction;
  amount: number;
  reason?: string;
  currentCredits: number;
}

export function useAdminCreditHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'credits'],
    queryFn: async () => {
      if (!userId) return [];
      // Fetch from credit_transactions + admin_credit_adjustments
      const [{ data: txns }, { data: adjs }] = await Promise.all([
        supabase
          .from('credit_transactions')
          .select('id, delta, reason, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('admin_credit_adjustments')
          .select('id, action, amount, credits_before, credits_after, reason, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);
      return { transactions: txns ?? [], adjustments: adjs ?? [] };
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAdminCreditMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (opts: CreditMutationOpts) => {
      const { userId, action, amount, reason, currentCredits } = opts;

      let newCredits: number;
      switch (action) {
        case 'grant':  newCredits = currentCredits + amount; break;
        case 'deduct': newCredits = Math.max(0, currentCredits - amount); break;
        case 'set':    newCredits = amount; break;
        case 'reset':  newCredits = 0; break;
        default:       newCredits = currentCredits;
      }

      // Update credits via security-definer function
      const { error: updateErr } = await supabase.rpc('admin_set_user_credits', {
        p_user_id: userId,
        p_credits: newCredits,
      });
      if (updateErr) throw new Error(updateErr.message);

      // Log to admin_credit_adjustments
      await supabase.from('admin_credit_adjustments').insert({
        user_id: userId,
        action,
        credits_before: currentCredits,
        credits_after: newCredits,
        amount,
        reason: reason ?? null,
      });

      logAdminAction({
        action: `CREDITS_${action.toUpperCase()}`,
        resourceType: 'user',
        resourceId: userId,
        metadata: { credits_before: currentCredits, credits_after: newCredits, amount, reason },
      });

      return { newCredits };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'user', vars.userId] });
      qc.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'credits'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
