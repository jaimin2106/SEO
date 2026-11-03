// src/lib/activityTracker.ts
// Global Activity Tracking Engine
// Used to log user actions into the activity_logs table.

import { supabase, isMockMode } from './supabase';

export type ActivityAction =
  // Auth
  | 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_RESET' | 'OAUTH_LOGIN' | 'FAILED_LOGIN'
  // Reports
  | 'REPORT_GENERATED' | 'REPORT_VIEWED' | 'REPORT_DOWNLOADED' | 'REPORT_SHARED' | 'REPORT_DELETED'
  // Scans
  | 'SCAN_STARTED' | 'SCAN_COMPLETED' | 'SCAN_FAILED' | 'SCAN_RETRIED' | 'RESCAN_TRIGGERED'
  // Credits
  | 'CREDIT_DEDUCTED' | 'CREDIT_ADDED' | 'CREDIT_REFILLED'
  // AI
  | 'PROMPT_GENERATED' | 'PROMPT_COPIED' | 'AI_ANALYSIS_REQUESTED'
  // Subscriptions
  | 'UPGRADED' | 'DOWNGRADED' | 'TRIAL_STARTED' | 'TRIAL_EXPIRED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED'
  // Admin
  | 'ADMIN_ACTION';

export interface ActivityPayload {
  userId: string;
  action: ActivityAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  success?: boolean;
}

/**
 * Basic user-agent parser
 */
function getClientDetails() {
  if (typeof window === 'undefined' || !window.navigator) return {};

  const ua = window.navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Naive browser check
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  // Naive OS check
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) { os = 'Android'; device = 'Mobile'; }
  else if (ua.includes('like Mac OS X')) { os = 'iOS'; device = 'Mobile'; }

  return { browser, operating_system: os, device };
}

/**
 * Logs an activity event to the database.
 * Non-blocking: catches its own errors so it doesn't break the main flow.
 */
export async function trackEvent({
  userId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  success = true,
}: ActivityPayload) {
  if (isMockMode) {
    console.log('[Activity Tracker Mock]', { userId, action, resourceType, resourceId, metadata, success });
    return;
  }

  try {
    const { browser, operating_system, device } = getClientDetails();

    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      browser,
      operating_system,
      device,
      success,
    });
  } catch (err) {
    console.error('[Activity Tracker] Failed to log event:', err);
  }
}
