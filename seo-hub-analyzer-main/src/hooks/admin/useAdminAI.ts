// src/hooks/admin/useAdminAI.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminAIPromptItem {
  id: string;
  user_id: string;
  user_email: string;
  report_id: string;
  domain: string;
  issue_id: string;
  prompt: string;
  response: string;
  model_used: string;
  created_at: string;
}

export function useAdminAIFeed(page = 0, pageSize = 50) {
  return useQuery({
    queryKey: ['admin', 'ai', 'feed', { page, pageSize }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_ai_prompts', {
        p_limit: pageSize,
        p_offset: page * pageSize,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminAIPromptItem[];
    },
  });
}
