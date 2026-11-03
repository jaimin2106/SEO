// src/hooks/admin/useAdminUsers.ts
// Paginated user list with search + filters via React Query

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';

export interface AdminUserRow {
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
}

export interface UseAdminUsersOptions {
  search?: string;
  plan?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useAdminUsers(opts: UseAdminUsersOptions = {}) {
  const { search = '', plan, status, page = 0, pageSize = 20 } = opts;
  const debouncedSearch = useDebounce(search, 300);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', debouncedSearch, plan, status, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_all_users', {
        p_search: debouncedSearch || null,
        p_plan: plan || null,
        p_status: status || null,
        p_limit: pageSize,
        p_offset: page * pageSize,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminUserRow[];
    },
    staleTime: 30_000,
  });

  const countQuery = useQuery({
    queryKey: ['admin', 'users', 'count', debouncedSearch, plan, status],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_count_users', {
        p_search: debouncedSearch || null,
        p_plan: plan || null,
        p_status: status || null,
      });
      if (error) throw new Error(error.message);
      return (data as number) ?? 0;
    },
    staleTime: 30_000,
  });

  return {
    users: usersQuery.data ?? [],
    total: countQuery.data ?? 0,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
  };
}
