// src/hooks/admin/useAdminActivity.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ActivityPayload } from '@/lib/activityTracker';

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  success: boolean;
  created_at: string;
}

export interface ActivityStats {
  total_actions_today: number;
  active_users_today: number;
  logins_today: number;
  reports_today: number;
}

/**
 * Fetch paginated activity logs (RPC)
 */
export function useAdminActivityFeed(page = 0, pageSize = 20, userId?: string, filterAction?: string) {
  return useQuery({
    queryKey: ['admin', 'activity', { page, pageSize, userId, filterAction }],
    queryFn: async () => {
      const offset = page * pageSize;
      const { data, error } = await supabase.rpc('admin_get_activity_feed', {
        p_limit: pageSize,
        p_offset: offset,
        p_user_id: userId || null,
        p_action: filterAction || null,
      });

      if (error) throw new Error(error.message);
      return (data ?? []) as ActivityFeedItem[];
    },
    staleTime: 10_000,
  });
}

/**
 * Fetch aggregated stats for the dashboard
 */
export function useAdminActivityStats() {
  return useQuery({
    queryKey: ['admin', 'activity', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_activity_stats');
      if (error) throw new Error(error.message);
      return data as ActivityStats;
    },
    refetchInterval: 30_000, // refresh stats every 30s
  });
}

/**
 * Subscribe to realtime activity stream
 */
export function useAdminRealtimeActivity(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel('admin-activity-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          // Invalidate activity feed queries to trigger refetch
          // Optionally, we could manually optimistically insert here.
          qc.invalidateQueries({ queryKey: ['admin', 'activity'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, qc]);
}
