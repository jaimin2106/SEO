// src/hooks/admin/useAdminFeatures.ts
// Feature override management per user

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';

export const FEATURE_DEFINITIONS = [
  { key: 'unlimited_credits',  label: 'Unlimited Credits',  description: 'User never runs out of credits' },
  { key: 'unlimited_reports',  label: 'Unlimited Reports',  description: 'No cap on report generation' },
  { key: 'ai_features',        label: 'AI Features',        description: 'Access to AI-powered analysis' },
  { key: 'deep_crawl',         label: 'Deep Crawl',         description: 'Full site crawl beyond 50 pages' },
  { key: 'team_features',      label: 'Team Features',      description: 'Organization and team access' },
  { key: 'white_label',        label: 'White Label',        description: 'Remove SEO Hub branding' },
  { key: 'beta_features',      label: 'Beta Features',      description: 'Early access to unreleased features' },
] as const;

export type FeatureKey = typeof FEATURE_DEFINITIONS[number]['key'];

export interface FeatureOverride {
  id: string;
  user_id: string;
  feature: string;
  enabled: boolean;
  expires_at: string | null;
  assigned_by: string | null;
  created_at: string;
}

export function useAdminFeatureOverrides(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'features'],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('admin_feature_overrides')
        .select('id, user_id, feature, enabled, expires_at, assigned_by, created_at')
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
      return (data ?? []) as FeatureOverride[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useAdminFeatureMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      feature,
      enabled,
      expiresAt,
    }: {
      userId: string;
      feature: string;
      enabled: boolean;
      expiresAt?: string | null;
    }) => {
      const { error } = await supabase
        .from('admin_feature_overrides')
        .upsert(
          { user_id: userId, feature, enabled, expires_at: expiresAt ?? null },
          { onConflict: 'user_id,feature' },
        );
      if (error) throw new Error(error.message);

      logAdminAction({
        action: enabled ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
        resourceType: 'user',
        resourceId: userId,
        metadata: { feature, enabled },
      });
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'features'] });
    },
  });
}
