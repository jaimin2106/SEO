// src/pages/admin/AdminUsers.tsx
// Full user directory — searchable, filterable, paginated table

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Filter, ExternalLink, Coins,
  ShieldOff, ShieldCheck, Trash2, X,
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { UserAvatar } from '@/components/admin/ui/UserAvatar';
import { CreditModal } from '@/components/admin/ui/CreditModal';
import { DeleteUserModal } from '@/components/admin/ui/DeleteUserModal';
import { useAdminCreditMutation } from '@/hooks/admin/useAdminCredits';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 20;

const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [plan, setPlan]     = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(0);

  const [creditUser, setCreditUser] = useState<{ id: string; email: string; credits: number } | null>(null);
  const [deleteUser, setDeleteUser] = useState<{
    id: string; email: string; full_name: string | null; credits_remaining: number; report_count: number;
  } | null>(null);

  const { users, total, isLoading, isError } = useAdminUsers({ search, plan, status, page, pageSize: PAGE_SIZE });
  const qc = useQueryClient();

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.rpc('admin_set_user_status', {
      p_user_id: userId,
      p_status: newStatus,
    });
    if (error) { toast.error(error.message); return; }
    logAdminAction({ action: `USER_${newStatus.toUpperCase()}`, resourceType: 'user', resourceId: userId });
    toast.success(`User ${newStatus}`);
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const hasFilters = plan || status;

  return (
    <div className="space-y-5 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] text-[#141413] tracking-tight" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
            Users
          </h1>
          <p className="text-[13px] text-[#87867f] mt-0.5">
            {isLoading ? 'Loading…' : `${total} total users`}
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2 flex-1 min-w-[240px] max-w-[380px]">
          <Search className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by email, name, or ID…"
            className="flex-1 bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#87867f] hover:text-[#141413]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Plan filter */}
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2">
          <Filter className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <select
            value={plan}
            onChange={(e) => { setPlan(e.target.value); setPage(0); }}
            className="bg-transparent text-[13px] text-[#141413] outline-none cursor-pointer"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="scale">Scale</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="bg-transparent text-[13px] text-[#141413] outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
            <option value="trial">Trial</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setPlan(''); setStatus(''); setPage(0); }}
            className="text-[12px] text-[#c96442] font-medium hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#f5f4ed]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Plan</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Credits</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Reports</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Scans</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Joined</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {[1,2,3,4,5,6,7,8].map((j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded bg-[#f0eee6] animate-pulse" style={{ width: `${60 + j * 8}px` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : isError
                  ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <AdminEmptyState icon={Users} title="Failed to load users" description="There was an error fetching users. Check your admin permissions." />
                      </td>
                    </tr>
                  )
                  : users.length === 0
                    ? (
                      <tr>
                        <td colSpan={8}>
                          <AdminEmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
                        </td>
                      </tr>
                    )
                    : users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#f5f4ed] transition-colors group">
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 group-hover:text-[#c96442] transition-colors">
                            <UserAvatar name={user.full_name} email={user.email} avatarUrl={user.avatar_url} size="sm" />
                            <div className="min-w-0">
                              <p className="font-medium text-[#141413] truncate max-w-[180px]">
                                {user.full_name ?? user.email}
                              </p>
                              <p className="text-[11px] text-[#87867f] truncate max-w-[180px]">{user.email}</p>
                            </div>
                          </Link>
                        </td>
                        {/* Plan */}
                        <td className="px-4 py-3.5">
                          <AdminBadge value={user.tier} variant="plan" />
                        </td>
                        {/* Credits */}
                        <td className="px-4 py-3.5 font-medium text-[#141413]">{user.credits_remaining}</td>
                        {/* Reports */}
                        <td className="px-4 py-3.5 text-[#5e5d59]">{user.report_count}</td>
                        {/* Scans */}
                        <td className="px-4 py-3.5 text-[#5e5d59]">{user.scan_count}</td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <AdminBadge value={user.status} variant="status" />
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-3.5 text-[#87867f]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#e8e6dc] text-[#87867f] hover:text-[#141413] transition-colors"
                              title="View Profile"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => setCreditUser({ id: user.id, email: user.email, credits: user.credits_remaining })}
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#e8e6dc] text-[#87867f] hover:text-[#141413] transition-colors"
                              title="Manage Credits"
                            >
                              <Coins className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(user.id, user.status)}
                              className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors ${
                                user.status === 'active'
                                  ? 'hover:bg-amber-50 text-[#87867f] hover:text-amber-600'
                                  : 'hover:bg-emerald-50 text-[#87867f] hover:text-emerald-600'
                              }`}
                              title={user.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                            >
                              {user.status === 'active' ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeleteUser({ id: user.id, email: user.email, full_name: user.full_name, credits_remaining: user.credits_remaining, report_count: Number(user.report_count) })}
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#87867f] hover:text-red-500 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </div>

      {/* Modals */}
      {creditUser && (
        <CreditModal
          userId={creditUser.id}
          userEmail={creditUser.email}
          currentCredits={creditUser.credits}
          onClose={() => setCreditUser(null)}
        />
      )}
      {deleteUser && (
        <DeleteUserModal user={deleteUser} onClose={() => setDeleteUser(null)} />
      )}
    </div>
  );
};

export default AdminUsers;
