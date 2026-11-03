// src/hooks/admin/useAdminUserScans.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminUserScan {
  id: string;
  url: string;
  domain: string | null;
  status: string;
  score: number | null;
  progress: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
}

export function useAdminUserScans(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'scans'],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('id, url, domain, status, score, progress, created_at, started_at, completed_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        duration_seconds:
          s.started_at && s.completed_at
            ? Math.round(
                (new Date(s.completed_at as string).getTime() -
                  new Date(s.started_at as string).getTime()) /
                  1000,
              )
            : null,
      })) as AdminUserScan[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
