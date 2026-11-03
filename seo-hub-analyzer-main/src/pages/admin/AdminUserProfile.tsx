// src/pages/admin/AdminUserProfile.tsx
// Full single-user profile with tabbed layout: Overview, Reports, Scans, Credits, Features, Activity

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, FileText, ScanSearch, Coins,
  Sliders, Activity, Calendar, Mail, CreditCard,
  ShieldOff, ShieldCheck, Trash2, ExternalLink,
  Clock, Globe, TrendingUp, Download, Zap,
} from 'lucide-react';
import { useAdminUser } from '@/hooks/admin/useAdminUser';
import { useAdminUserReports } from '@/hooks/admin/useAdminUserReports';
import { useAdminUserScans } from '@/hooks/admin/useAdminUserScans';
import { useAdminActivityFeed } from '@/hooks/admin/useAdminActivity';
import { useAdminCreditHistory } from '@/hooks/admin/useAdminCredits';
import { useAdminFeatureOverrides, useAdminFeatureMutation, FEATURE_DEFINITIONS } from '@/hooks/admin/useAdminFeatures';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { UserAvatar } from '@/components/admin/ui/UserAvatar';
import { CreditModal } from '@/components/admin/ui/CreditModal';
import { DeleteUserModal } from '@/components/admin/ui/DeleteUserModal';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type Tab = 'overview' | 'reports' | 'scans' | 'credits' | 'features' | 'activity';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Overview',  icon: User },
  { id: 'reports',   label: 'Reports',   icon: FileText },
  { id: 'scans',     label: 'Scans',     icon: ScanSearch },
  { id: 'credits',   label: 'Credits',   icon: Coins },
  { id: 'features',  label: 'Features',  icon: Sliders },
  { id: 'activity',  label: 'Activity',  icon: Activity },
];

const AdminUserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: user, isLoading, isError, invalidate } = useAdminUser(userId);
  const qc = useQueryClient();

  const handleStatusToggle = async () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.rpc('admin_set_user_status', { p_user_id: user.id, p_status: newStatus });
    if (error) { toast.error(error.message); return; }
    logAdminAction({ action: `USER_${newStatus.toUpperCase()}`, resourceType: 'user', resourceId: user.id });
    toast.success(`User ${newStatus}`);
    invalidate();
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !user) return (
    <div className="space-y-4">
      <BackLink />
      <AdminEmptyState icon={User} title="User not found" description="This user may have been deleted or does not exist." />
    </div>
  );

  return (
    <div className="space-y-5 max-w-6xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <BackLink />

      {/* Profile header card */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <UserAvatar name={user.full_name} email={user.email} avatarUrl={user.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-[22px] font-semibold text-[#141413]">
                  {user.full_name ?? user.email}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[13px] text-[#87867f]">
                    <Mail className="h-3.5 w-3.5" /> {user.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] text-[#87867f]">
                    <Calendar className="h-3.5 w-3.5" /> Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <AdminBadge value={user.status} variant="status" />
                  <AdminBadge value={user.tier} variant="plan" />
                  <span className="text-[11px] font-mono text-[#87867f] bg-[#f5f4ed] border border-[#e8e6dc] px-2 py-0.5 rounded">
                    {user.id}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowCreditModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e8e6dc] text-[13px] font-medium text-[#141413] hover:border-[#c96442] hover:text-[#c96442] transition-colors"
                >
                  <Coins className="h-3.5 w-3.5" /> Credits
                </button>
                <button
                  onClick={handleStatusToggle}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-medium transition-colors ${
                    user.status === 'active'
                      ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {user.status === 'active' ? <><ShieldOff className="h-3.5 w-3.5" /> Suspend</> : <><ShieldCheck className="h-3.5 w-3.5" /> Reactivate</>}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AdminStatCard icon={FileText} label="Reports" value={user.report_count} />
        <AdminStatCard icon={ScanSearch} label="Scans" value={user.scan_count} />
        <AdminStatCard icon={Coins} label="Credits Left" value={user.credits_remaining} accent />
        <AdminStatCard icon={TrendingUp} label="Credits Used" value={user.total_credits_used ?? 0} />
      </div>

      {/* Tabs */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-[#e8e6dc] overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === id
                  ? 'border-[#c96442] text-[#c96442]'
                  : 'border-transparent text-[#87867f] hover:text-[#141413]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'overview'  && <OverviewTab user={user} />}
          {activeTab === 'reports'   && <ReportsTab userId={user.id} />}
          {activeTab === 'scans'     && <ScansTab userId={user.id} />}
          {activeTab === 'credits'   && <CreditsTab userId={user.id} currentCredits={user.credits_remaining} onManage={() => setShowCreditModal(true)} />}
          {activeTab === 'features'  && <FeaturesTab userId={user.id} />}
          {activeTab === 'activity'  && <ActivityTab userId={user.id} />}
        </div>
      </div>

      {/* Modals */}
      {showCreditModal && (
        <CreditModal
          userId={user.id}
          userEmail={user.email}
          currentCredits={user.credits_remaining}
          onClose={() => { setShowCreditModal(false); invalidate(); }}
        />
      )}
      {showDeleteModal && (
        <DeleteUserModal
          user={{ id: user.id, email: user.email, full_name: user.full_name, credits_remaining: user.credits_remaining, report_count: Number(user.report_count) }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

// ── Tab: Overview ───────────────────────────────────────────────
const OverviewTab: React.FC<{ user: ReturnType<typeof useAdminUser>['data'] }> = ({ user }) => {
  if (!user) return null;
  const rows = [
    { label: 'User ID',         value: user.id },
    { label: 'Email',           value: user.email },
    { label: 'Display name',    value: user.full_name ?? '—' },
    { label: 'Plan / Tier',     value: user.tier },
    { label: 'Account status',  value: user.status },
    { label: 'Credits remaining', value: String(user.credits_remaining) },
    { label: 'Credits used',    value: String(user.total_credits_used ?? 0) },
    { label: 'Member since',    value: new Date(user.created_at).toLocaleString() },
    { label: 'Last refill',     value: user.last_credit_refill_at ? new Date(user.last_credit_refill_at).toLocaleString() : '—' },
  ];
  return (
    <div className="divide-y divide-[#f0eee6]">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between py-3">
          <span className="text-[13px] text-[#87867f]">{label}</span>
          <span className="text-[13px] font-medium text-[#141413] text-right max-w-[280px] truncate font-mono">{value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tab: Reports ────────────────────────────────────────────────
const ReportsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: reports, isLoading } = useAdminUserReports(userId);
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (!reports?.length) return <AdminEmptyState icon={FileText} title="No reports yet" description="This user hasn't generated any reports." />;
  return (
    <div className="divide-y divide-[#f0eee6]">
      {reports.map((r) => (
        <div key={r.id} className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#f5f4ed] flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4 text-[#87867f]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#141413]">{r.domain ?? 'Unknown domain'}</p>
              <p className="text-[11px] text-[#87867f]">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {r.overall_score !== null && (
              <span className={`text-[13px] font-bold ${r.overall_score >= 70 ? 'text-emerald-600' : r.overall_score >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                {r.overall_score}/100
              </span>
            )}
            {r.pdf_url && (
              <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#e8e6dc] text-[#87867f] transition-colors">
                <Download className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Tab: Scans ──────────────────────────────────────────────────
const ScansTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: scans, isLoading } = useAdminUserScans(userId);
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (!scans?.length) return <AdminEmptyState icon={ScanSearch} title="No scans yet" description="This user hasn't run any scans." />;
  return (
    <div className="divide-y divide-[#f0eee6]">
      {scans.map((s) => (
        <div key={s.id} className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#f5f4ed] flex items-center justify-center shrink-0">
              <ScanSearch className="h-4 w-4 text-[#87867f]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#141413]">{s.domain ?? s.url}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="h-3 w-3 text-[#87867f]" />
                <p className="text-[11px] text-[#87867f]">{new Date(s.created_at).toLocaleString()}</p>
                {s.duration_seconds !== null && (
                  <span className="text-[11px] text-[#87867f]">· {s.duration_seconds}s</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AdminBadge value={s.status} variant="scan" />
            {s.score !== null && <span className="text-[13px] font-bold text-[#141413]">{s.score}/100</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Tab: Credits ────────────────────────────────────────────────
const CreditsTab: React.FC<{ userId: string; currentCredits: number; onManage: () => void }> = ({ userId, currentCredits, onManage }) => {
  const { data, isLoading } = useAdminCreditHistory(userId);
  if (isLoading) return <LoadingSkeleton rows={5} />;

  const { transactions = [], adjustments = [] } = data ?? {};

  return (
    <div className="space-y-6">
      {/* Balance + action */}
      <div className="flex items-center justify-between bg-[#f5f4ed] rounded-xl px-5 py-4">
        <div>
          <p className="text-[12px] text-[#87867f] uppercase tracking-[0.1em]">Current Balance</p>
          <p className="text-[28px] font-bold text-[#141413]">{currentCredits}</p>
        </div>
        <button
          onClick={onManage}
          className="flex items-center gap-2 px-4 py-2 bg-[#141413] text-white text-[13px] font-medium rounded-lg hover:bg-[#1f1e1a] transition-colors"
        >
          <Coins className="h-3.5 w-3.5" /> Manage Credits
        </button>
      </div>

      {/* Admin adjustments */}
      {adjustments.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#87867f] mb-3">Admin Adjustments</h3>
          <div className="divide-y divide-[#f0eee6]">
            {(adjustments as Array<Record<string, unknown>>).map((a) => (
              <div key={a.id as string} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] font-medium text-[#141413] capitalize">{a.action as string}</p>
                  {a.reason && <p className="text-[11px] text-[#87867f]">{a.reason as string}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-[#141413]">{a.credits_before as number} → {a.credits_after as number}</p>
                  <p className="text-[11px] text-[#87867f]">{new Date(a.created_at as string).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System transactions */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#87867f] mb-3">Usage History</h3>
          <div className="divide-y divide-[#f0eee6]">
            {(transactions as Array<Record<string, unknown>>).map((t) => (
              <div key={t.id as string} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] font-medium text-[#141413]">{t.reason as string || 'Scan credit'}</p>
                  <p className="text-[11px] text-[#87867f]">{new Date(t.created_at as string).toLocaleDateString()}</p>
                </div>
                <span className={`text-[13px] font-bold ${(t.delta as number) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {(t.delta as number) > 0 ? '+' : ''}{t.delta as number}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {transactions.length === 0 && adjustments.length === 0 && (
        <AdminEmptyState icon={Coins} title="No credit history" description="No credit transactions found for this user." />
      )}
    </div>
  );
};

// ── Tab: Features ───────────────────────────────────────────────
const FeaturesTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: overrides = [], isLoading } = useAdminFeatureOverrides(userId);
  const mutation = useAdminFeatureMutation();

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const getOverride = (key: string) => overrides.find((o) => o.feature === key);

  return (
    <div className="divide-y divide-[#f0eee6]">
      {FEATURE_DEFINITIONS.map(({ key, label, description }) => {
        const override = getOverride(key);
        const isEnabled = override?.enabled ?? false;
        return (
          <div key={key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-[13px] font-medium text-[#141413]">{label}</p>
              <p className="text-[11px] text-[#87867f] mt-0.5">{description}</p>
              {override?.expires_at && (
                <p className="text-[11px] text-amber-600 mt-0.5">Expires {new Date(override.expires_at).toLocaleDateString()}</p>
              )}
            </div>
            <button
              onClick={() => mutation.mutate({ userId, feature: key, enabled: !isEnabled })}
              disabled={mutation.isPending}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none ${
                isEnabled ? 'bg-[#c96442]' : 'bg-[#e8e6dc]'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ── Tab: Activity ─────────────────────────────────────
const ActivityTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: feed, isLoading } = useAdminActivityFeed(0, 50, userId);

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (!feed?.length) return <AdminEmptyState icon={Activity} title="No activity yet" description="This user hasn't performed any logged actions." />;

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#e8e6dc]" />
      <div className="space-y-0">
        {feed.map((item) => {
          const style = getActionStyle(item.action);
          return (
            <div key={item.id} className="flex items-start gap-4 pb-5 relative">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 border-[#faf9f5] ${style.bg}`}>
                <Activity className={`h-4 w-4 ${style.text}`} strokeWidth={1.75} />
              </div>
              <div className="flex-1 pt-1.5">
                <p className="text-[13px] font-medium text-[#141413] capitalize">{item.action.toLowerCase().replace(/_/g, ' ')}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.resource_type && (
                    <span className="text-[11px] font-mono text-[#87867f] bg-[#e8e6dc]/50 px-1.5 py-0.5 rounded">
                      {item.resource_type}
                    </span>
                  )}
                  {!item.success && (
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                      FAILED
                    </span>
                  )}
                  <span className="text-[11px] text-[#87867f]">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="mt-1.5 p-2 rounded-lg bg-[#f5f4ed] text-[11px] text-[#87867f] font-mono break-all max-w-[500px]">
                    {JSON.stringify(item.metadata)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Helpers ─────────────────────────────────────────────────────
const BackLink = () => (
  <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-[13px] text-[#87867f] hover:text-[#141413] transition-colors">
    <ArrowLeft className="h-4 w-4" /> Back to Users
  </Link>
);

const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between py-3">
        <div className="space-y-1.5">
          <div className="h-3.5 rounded bg-[#f0eee6] animate-pulse w-40" />
          <div className="h-3 rounded bg-[#f0eee6] animate-pulse w-24" />
        </div>
        <div className="h-3.5 rounded bg-[#f0eee6] animate-pulse w-20" />
      </div>
    ))}
  </div>
);

const ProfileSkeleton = () => (
  <div className="space-y-5 max-w-6xl animate-pulse">
    <div className="h-5 w-24 bg-[#f0eee6] rounded" />
    <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6 h-28" />
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-[#f0eee6] rounded-2xl" />)}
    </div>
    <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] h-64" />
  </div>
);

function getActionStyle(action: string) {
  const a = action.toUpperCase();
  if (a.includes('LOGIN') || a.includes('SIGNUP')) return { bg: 'bg-blue-50', text: 'text-blue-600' };
  if (a.includes('SCAN') || a.includes('REPORT')) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  if (a.includes('CREDIT') || a.includes('UPGRADE')) return { bg: 'bg-amber-50', text: 'text-amber-600' };
  if (a.includes('FAIL') || a.includes('DELETE')) return { bg: 'bg-red-50', text: 'text-red-500' };
  return { bg: 'bg-[#f5f4ed]', text: 'text-[#87867f]' };
}

export default AdminUserProfile;
