// src/hooks/admin/useAdminReports.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';

export interface AdminReportStats {
  total: number;
  today: number;
  shared: number;
  with_pdf: number;
  avg_score: number;
  total_pdf_storage_bytes: number;
}

export interface AdminReportFeedItem {
  id: string;
  website_id: string;
  domain: string;
  job_id: string;
  user_id: string;
  user_email: string;
  overall_score: number | null;
  pdf_url: string | null;
  pdf_size_bytes: number;
  is_public: boolean;
  created_at: string;
}

export function useAdminReportsStats() {
  return useQuery({
    queryKey: ['admin', 'reports', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_reports_stats');
      if (error) throw new Error(error.message);
      return data as AdminReportStats;
    },
  });
}

export function useAdminReportsFeed(page = 0, pageSize = 50, userId?: string, domain?: string) {
  return useQuery({
    queryKey: ['admin', 'reports', 'feed', { page, pageSize, userId, domain }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_reports', {
        p_limit: pageSize,
        p_offset: page * pageSize,
        p_user_id: userId || null,
        p_domain: domain || null,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminReportFeedItem[];
    },
  });
}

export function useAdminReportDetails(reportId: string) {
  return useQuery({
    queryKey: ['admin', 'reports', reportId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_report_details', { p_report_id: reportId });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!reportId,
  });
}

export function useAdminReportMutations() {
  const qc = useQueryClient();

  const expireShareLink = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase.rpc('admin_expire_share_link', { p_report_id: reportId });
      if (error) throw new Error(error.message);
      logAdminAction({ action: 'EXPIRE_SHARE_LINK', resourceType: 'report', resourceId: reportId });
    },
    onSuccess: (_, reportId) => {
      toast.success('Share link expired');
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      qc.invalidateQueries({ queryKey: ['admin', 'reports', reportId] });
    },
    onError: (err) => toast.error(`Failed to expire link: ${err.message}`)
  });

  return { expireShareLink };
}
