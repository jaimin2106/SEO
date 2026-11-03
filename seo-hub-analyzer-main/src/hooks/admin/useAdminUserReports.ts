// src/hooks/admin/useAdminUserReports.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminUserReport {
  id: string;
  overall_score: number | null;
  pdf_url: string | null;
  is_public: boolean;
  created_at: string;
  domain: string | null;
}

export function useAdminUserReports(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'reports'],
    queryFn: async () => {
      if (!userId) return [];
      // Direct query — the admin RLS allows admins to read reports
      // We bypass by calling via the service role via existing RLS for admins
      const { data, error } = await supabase
        .from('reports')
        .select('id, overall_score, pdf_url, is_public, created_at, scan_jobs(domain)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);

      return (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        overall_score: r.overall_score as number | null,
        pdf_url: r.pdf_url as string | null,
        is_public: r.is_public as boolean,
        created_at: r.created_at as string,
        domain: (r.scan_jobs as { domain?: string } | null)?.domain ?? null,
      })) as AdminUserReport[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
