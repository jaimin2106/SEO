// src/lib/adminAudit.ts
// Fire-and-forget audit logging service for admin actions.
// Call from any admin mutation — never awaited in UI code to keep interactions fast.

import { supabase } from '@/lib/supabase';

export interface AuditActionOpts {
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an admin action to the admin_audit_logs table.
 * Fire-and-forget: errors are silently swallowed so they never
 * block or crash the admin UI.
 */
export function logAdminAction(opts: AuditActionOpts): void {
  const { action, resourceType, resourceId, metadata = {} } = opts;

  // Intentionally NOT awaited
  supabase.auth.getUser().then(({ data }) => {
    const adminId = data?.user?.id;
    if (!adminId) return;

    supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: adminId,
        action,
        resource_type: resourceType ?? null,
        resource_id: resourceId ?? null,
        metadata,
        user_agent: navigator.userAgent,
        // ip_address is not available client-side; set server-side if needed
      })
      .then(({ error }) => {
        if (error) {
          console.warn('[AdminAudit] Failed to write log (non-fatal):', error.message);
        }
      });
  });
}
