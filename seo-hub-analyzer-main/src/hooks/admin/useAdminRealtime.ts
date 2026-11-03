// src/hooks/admin/useAdminRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminRealtime() {
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // We use a single channel for all admin realtime updates to conserve connections
    const channel = supabase.channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scan_jobs' },
        () => qc.invalidateQueries({ queryKey: ['admin', 'scans'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
          qc.invalidateQueries({ queryKey: ['admin', 'pdfs'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credit_transactions' },
        () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin realtime sync active');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);
}
