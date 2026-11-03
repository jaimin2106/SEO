// src/pages/admin/AdminDashboard.tsx
// Sprint 1 foundation shell — shows admin identity, role, system status, recent activity.
// NO business analytics yet — that is Sprint 2+.

import React, { useEffect, useState } from 'react';
import { Shield, User, Activity, Clock, Database, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ROLE_LABELS } from '@/lib/adminRbac';
import { supabase } from '@/lib/supabase';

interface AuditLogRow {
  id: string;
  action: string;
  resource_type: string | null;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { adminUser, can } = useAdminAuth();
  const [recentLogs, setRecentLogs] = useState<AuditLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    if (!can('audit.view')) { setLogsLoading(false); return; }
    supabase
      .from('admin_audit_logs')
      .select('id, action, resource_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRecentLogs(data ?? []);
        setLogsLoading(false);
      });
  }, [can]);

  const env = import.meta.env.MODE === 'production' ? 'Production' : 'Development';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page title */}
      <div>
        <h1
          className="text-[28px] text-[#141413] tracking-tight"
          style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}
        >
          Admin Dashboard
        </h1>
        <p className="text-[13px] text-[#87867f] mt-1">
          Welcome back, {adminUser?.email}. Here's your system overview.
        </p>
      </div>

      {/* Foundation cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current User */}
        <FoundationCard
          icon={<User className="h-5 w-5 text-[#c96442]" strokeWidth={1.75} />}
          label="Signed in as"
          value={adminUser?.email?.split('@')[0] ?? '—'}
          sub={adminUser?.email}
        />
        {/* Role */}
        <FoundationCard
          icon={<Shield className="h-5 w-5 text-[#c96442]" strokeWidth={1.75} />}
          label="Role"
          value={adminUser?.role ? ROLE_LABELS[adminUser.role] : '—'}
          sub="Access level"
          accent
        />
        {/* System Status */}
        <FoundationCard
          icon={<Activity className="h-5 w-5 text-emerald-500" strokeWidth={1.75} />}
          label="System Status"
          value="Healthy"
          sub="All services operational"
        />
        {/* Environment */}
        <FoundationCard
          icon={<Database className="h-5 w-5 text-[#87867f]" strokeWidth={1.75} />}
          label="Environment"
          value={env}
          sub="Supabase · React"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6">
        <h2 className="text-[15px] font-semibold text-[#141413] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {can('users.view') && (
            <QuickAction label="View Users" href="/admin/users" />
          )}
          {can('reports.view') && (
            <QuickAction label="View Reports" href="/admin/reports" />
          )}
          {can('audit.view') && (
            <QuickAction label="Audit Logs" href="/admin/logs" />
          )}
          {can('settings.view') && (
            <QuickAction label="Settings" href="/admin/settings" />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {can('audit.view') && (
        <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-[#141413]">Recent Activity</h2>
            <Link to="/admin/logs" className="text-[12px] text-[#c96442] font-medium hover:underline">
              View all →
            </Link>
          </div>

          {logsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-[#f5f4ed] animate-pulse" />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <CheckCircle2 className="h-8 w-8 text-[#87867f]" strokeWidth={1.5} />
              <p className="text-[13px] text-[#87867f]">No audit logs yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0eee6]">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-[#c96442]/10 flex items-center justify-center shrink-0">
                      <Activity className="h-3.5 w-3.5 text-[#c96442]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#141413]">{log.action}</p>
                      {log.resource_type && (
                        <p className="text-[11px] text-[#87867f]">{log.resource_type}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#87867f] shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────

const FoundationCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}> = ({ icon, label, value, sub, accent }) => (
  <div className={`rounded-2xl border p-5 ${accent ? 'bg-[#c96442]/5 border-[#c96442]/20' : 'bg-[#faf9f5] border-[#e8e6dc]'}`}>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#87867f]">{label}</span>
    </div>
    <p className="text-[20px] font-semibold text-[#141413] leading-tight truncate">{value}</p>
    {sub && <p className="text-[11px] text-[#87867f] mt-1 truncate">{sub}</p>}
  </div>
);

const QuickAction: React.FC<{ label: string; href: string }> = ({ label, href }) => (
  <Link
    to={href}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e8e6dc] bg-white text-[13px] font-medium text-[#141413] hover:border-[#c96442] hover:text-[#c96442] transition-colors duration-150"
  >
    {label}
  </Link>
);

export default AdminDashboard;
