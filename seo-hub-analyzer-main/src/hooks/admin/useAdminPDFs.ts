// src/hooks/admin/useAdminPDFs.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminPDFItem {
  id: string;
  website_id: string;
  domain: string;
  user_id: string;
  user_email: string;
  pdf_url: string;
  pdf_size_bytes: number;
  created_at: string;
}

export function useAdminPDFsFeed(page = 0, pageSize = 50) {
  return useQuery({
    queryKey: ['admin', 'pdfs', 'feed', { page, pageSize }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_pdfs', {
        p_limit: pageSize,
        p_offset: page * pageSize,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminPDFItem[];
    },
  });
}
