// src/hooks/admin/useAdminScans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';

export interface AdminScanStats {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  avg_duration_sec: number;
}

export interface AdminScanFeedItem {
  id: string;
  url: string;
  user_id: string;
  user_email: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  error_log: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  duration_sec: number | null;
}

export function useAdminScansStats() {
  return useQuery({
    queryKey: ['admin', 'scans', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_scan_stats');
      if (error) throw new Error(error.message);
      return data as AdminScanStats;
    },
    refetchInterval: 15_000,
  });
}

export function useAdminScansFeed(page = 0, pageSize = 50, status?: string, userId?: string, url?: string) {
  return useQuery({
    queryKey: ['admin', 'scans', 'feed', { page, pageSize, status, userId, url }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_scans', {
        p_limit: pageSize,
        p_offset: page * pageSize,
        p_status: status || null,
        p_user_id: userId || null,
        p_url: url || null,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminScanFeedItem[];
    },
    refetchInterval: 15_000,
  });
}

export function useAdminScanDetails(scanId: string) {
  return useQuery({
    queryKey: ['admin', 'scans', scanId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_scan_details', { p_scan_id: scanId });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!scanId,
  });
}

export function useAdminScanMutations() {
  const qc = useQueryClient();

  const retryScan = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase.rpc('admin_retry_scan', { p_scan_id: scanId });
      if (error) throw new Error(error.message);
      logAdminAction({ action: 'RETRY_SCAN', resourceType: 'scan', resourceId: scanId });
    },
    onSuccess: () => {
      toast.success('Scan queued for retry');
      qc.invalidateQueries({ queryKey: ['admin', 'scans'] });
    },
    onError: (err) => toast.error(`Failed to retry scan: ${err.message}`)
  });

  return { retryScan };
}
