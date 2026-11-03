// src/hooks/admin/useAdminDeletions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useAdminDeletions() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const deleteReport = useMutation({
    mutationFn: async ({ reportId, pdfUrl }: { reportId: string; pdfUrl: string | null }) => {
      // 1. If there's a PDF, delete it from storage first
      if (pdfUrl) {
        try {
          const urlObj = new URL(pdfUrl);
          const pathParts = urlObj.pathname.split('/pdf-exports/');
          if (pathParts.length === 2) {
            const filePath = pathParts[1];
            await supabase.storage.from('pdf-exports').remove([filePath]);
          }
        } catch (e) {
          console.warn('Failed to parse or delete PDF storage file:', e);
          // Proceed with report deletion even if PDF cleanup fails
        }
      }

      // 2. Delete the report via RPC
      const { error } = await supabase.rpc('admin_delete_report', { p_report_id: reportId });
      if (error) throw new Error(error.message);

      logAdminAction({
        action: 'DELETE_REPORT',
        resourceType: 'report',
        resourceId: reportId,
      });
    },
    onSuccess: () => {
      toast.success('Report deleted successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      qc.invalidateQueries({ queryKey: ['admin', 'pdfs'] });
      navigate('/admin/reports');
    },
    onError: (err) => toast.error(`Failed to delete report: ${err.message}`)
  });

  const cancelScan = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase.rpc('admin_cancel_scan', { p_scan_id: scanId });
      if (error) throw new Error(error.message);

      logAdminAction({
        action: 'CANCEL_SCAN',
        resourceType: 'scan',
        resourceId: scanId,
      });
    },
    onSuccess: () => {
      toast.success('Scan cancelled successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'scans'] });
    },
    onError: (err) => toast.error(`Failed to cancel scan: ${err.message}`)
  });

  return { deleteReport, cancelScan };
}
