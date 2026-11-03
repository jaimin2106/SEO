import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logAdminAction } from '@/lib/adminAudit';

export interface PlatformSetting {
  key: string;
  value: any;
  category: string;
  label: string;
  description: string | null;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  label: string;
  description: string | null;
  enabled: boolean;
  target_plans: string[];
  updated_at: string;
}

export function usePlatformSettings(category?: string) {
  return useQuery({
    queryKey: ['admin', 'settings', 'platform', category],
    queryFn: async () => {
      let q = supabase.from('platform_settings').select('key, value, category, label, description, updated_at').order('key');
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return data as PlatformSetting[];
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('platform_settings')
        .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
      
      logAdminAction({
        action: 'UPDATE_SETTING',
        resourceType: 'platform_setting',
        resourceId: key,
        metadata: { new_value: value }
      });
    },
    onSuccess: () => {
      toast.success('Setting saved');
      qc.invalidateQueries({ queryKey: ['admin', 'settings', 'platform'] });
    },
    onError: (e: Error) => toast.error(`Failed to save: ${e.message}`),
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['admin', 'settings', 'feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('feature_flags').select('id, name, label, description, enabled, target_plans, updated_at').order('label');
      if (error) throw error;
      return data as FeatureFlag[];
    },
  });
}

export function useUpdateFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      
      logAdminAction({
        action: 'UPDATE_FEATURE_FLAG',
        resourceType: 'feature_flag',
        resourceId: id,
        metadata: { enabled }
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings', 'feature-flags'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Helper to convert settings array to a key->value map
export function settingsToMap(settings: PlatformSetting[]): Record<string, any> {
  return Object.fromEntries(settings.map(s => [s.key, s.value]));
}
