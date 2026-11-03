// src/pages/admin/AdminActivity.tsx
// Global Activity Dashboard

import React from 'react';
import { Activity, Users, MousePointerClick, FileText, Wifi, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminActivityStats, useAdminActivityFeed, useAdminRealtimeActivity } from '@/hooks/admin/useAdminActivity';
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const AdminActivity: React.FC = () => {
  // Subscribe to real-time events globally on this page
  useAdminRealtimeActivity(true);

  const { data: stats, isLoading: statsLoading } = useAdminActivityStats();
  const { data: feed, isLoading: feedLoading } = useAdminActivityFeed(0, 50);

  return (
    <div className="space-y-6 max-w-6xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] text-[#141413] tracking-tight flex items-center gap-2"
            style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}
          >
            Activity Center
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full relative top-0.5 tracking-normal">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE
            </span>
          </h1>
          <p className="text-[13px] text-[#87867f] mt-1">
            Real-time monitoring of user behavior and system events.
          </p>
        </div>
        <Link
          to="/admin/activity/logs"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e8e6dc] bg-white text-[13px] font-medium text-[#141413] hover:border-[#c96442] hover:text-[#c96442] transition-colors"
        >
          View Full Logs
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <AdminStatCard icon={MousePointerClick} label="Total Actions (24h)" value={stats?.total_actions_today ?? 0} />
            <AdminStatCard icon={Users} label="Active Users (24h)" value={stats?.active_users_today ?? 0} accent />
            <AdminStatCard icon={Zap} label="Logins Today" value={stats?.logins_today ?? 0} />
            <AdminStatCard icon={FileText} label="Reports Today" value={stats?.reports_today ?? 0} />
          </>
        )}
      </div>

      {/* Live Feed */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e6dc] flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#87867f]" strokeWidth={1.75} />
          <h2 className="text-[15px] font-semibold text-[#141413]">Live Activity Feed</h2>
        </div>
        <div className="p-0">
          {feedLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#f0eee6] animate-pulse" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-48 bg-[#f0eee6] rounded animate-pulse" />
                    <div className="h-3 w-24 bg-[#f0eee6] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : feed?.length === 0 ? (
            <AdminEmptyState icon={Wifi} title="Waiting for events" description="Events will appear here as users interact with the system." />
          ) : (
            <div className="divide-y divide-[#f0eee6]">
              {feed?.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-5 hover:bg-[#f5f4ed] transition-colors">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-[#faf9f5] ${getActionStyle(item.action).bg}`}>
                    <Activity className={`h-3.5 w-3.5 ${getActionStyle(item.action).text}`} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/admin/users/${item.user_id}`} className="text-[13px] font-semibold text-[#141413] hover:text-[#c96442] hover:underline truncate max-w-[200px]">
                        {item.user_name ?? item.user_email}
                      </Link>
                      <span className="text-[13px] text-[#5e5d59]">{formatAction(item.action)}</span>
                      {item.resource_type && (
                        <span className="text-[12px] font-mono text-[#87867f] bg-[#e8e6dc]/50 px-1.5 py-0.5 rounded">
                          {item.resource_type}
                        </span>
                      )}
                      {!item.success && (
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          FAILED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#87867f]">{new Date(item.created_at).toLocaleString()}</span>
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <>
                          <span className="text-[11px] text-[#87867f]">·</span>
                          <span className="text-[11px] text-[#87867f] font-mono truncate max-w-[300px]">
                            {JSON.stringify(item.metadata)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers ─────────────────────────────────────────────────────

function formatAction(action: string) {
  return action.toLowerCase().replace(/_/g, ' ');
}

function getActionStyle(action: string) {
  const a = action.toUpperCase();
  if (a.includes('LOGIN') || a.includes('SIGNUP')) return { bg: 'bg-blue-50', text: 'text-blue-600' };
  if (a.includes('SCAN') || a.includes('REPORT')) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  if (a.includes('CREDIT') || a.includes('UPGRADE')) return { bg: 'bg-amber-50', text: 'text-amber-600' };
  if (a.includes('FAIL') || a.includes('DELETE')) return { bg: 'bg-red-50', text: 'text-red-500' };
  return { bg: 'bg-[#f5f4ed]', text: 'text-[#87867f]' };
}

export default AdminActivity;
