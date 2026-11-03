// src/hooks/admin/useAdminUser.ts
// Single user profile hook

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: string;
  status: string;
  credits_remaining: number;
  created_at: string;
  last_credit_refill_at: string | null;
  report_count: number;
  scan_count: number;
  total_credits_used: number;
}

export function useAdminUser(userId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase.rpc('admin_get_user_by_id', { p_user_id: userId });
      if (error) throw new Error(error.message);
      if (!data || (Array.isArray(data) && data.length === 0)) throw new Error('User not found');
      return (Array.isArray(data) ? data[0] : data) as AdminUserProfile;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'user', userId] });
  const invalidateList = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  return { ...query, invalidate, invalidateList };
}
