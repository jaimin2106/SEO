// src/components/admin/AdminHeader.tsx
// Top header bar for the admin shell.
// Shows: page breadcrumb, environment badge, role badge, profile menu.

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ROLE_LABELS } from '@/lib/adminRbac';

const ENV = import.meta.env.MODE === 'production' ? 'Production' : 'Development';
const ENV_COLOR = import.meta.env.MODE === 'production'
  ? 'bg-red-500/10 text-red-500 border-red-500/20'
  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

export const AdminHeader: React.FC = () => {
  const { adminUser } = useAdminAuth();

  return (
    <header className="h-14 bg-[#faf9f5] border-b border-[#e8e6dc] flex items-center justify-between px-6 shrink-0">
      {/* Left: global search */}
      <div className="flex items-center gap-2 w-64">
        <div className="flex items-center gap-2 w-full bg-[#f5f4ed] border border-[#e8e6dc] rounded-lg px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search…"
            className="flex-1 bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] text-[#87867f] bg-[#e8e6dc] px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: env badge + role badge + notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Environment badge */}
        <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.1em] border ${ENV_COLOR}`}>
          {ENV}
        </span>

        {/* Role badge */}
        {adminUser?.role && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#c96442]/10 text-[#c96442] border border-[#c96442]/20 text-[10px] font-semibold uppercase tracking-[0.12em]">
            {ROLE_LABELS[adminUser.role]}
          </span>
        )}

        {/* Notifications */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#f0eee6] transition-colors">
          <Bell className="h-4 w-4 text-[#87867f]" strokeWidth={1.75} />
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-[#c96442] flex items-center justify-center cursor-pointer">
          <span className="text-[11px] font-bold text-white">
            {adminUser?.email?.[0]?.toUpperCase() ?? 'A'}
          </span>
        </div>
      </div>
    </header>
  );
};
