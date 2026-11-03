// src/components/admin/ui/AdminBadge.tsx
// Reusable colored badge for status, plan, role

import React from 'react';

type BadgeVariant = 'status' | 'plan' | 'scan';

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
  deleted:   'bg-red-50 text-red-600 border-red-200',
  trial:     'bg-blue-50 text-blue-700 border-blue-200',
  expired:   'bg-[#f5f4ed] text-[#87867f] border-[#e8e6dc]',
};

const PLAN_STYLES: Record<string, string> = {
  free:  'bg-[#f5f4ed] text-[#5e5d59] border-[#e8e6dc]',
  pro:   'bg-[#c96442]/10 text-[#c96442] border-[#c96442]/25',
  scale: 'bg-purple-50 text-purple-700 border-purple-200',
};

const SCAN_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-blue-50 text-blue-700 border-blue-200',
  running:   'bg-amber-50 text-amber-700 border-amber-200',
  failed:    'bg-red-50 text-red-600 border-red-200',
};

interface AdminBadgeProps {
  value: string;
  variant?: BadgeVariant;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ value, variant = 'status', className = '' }) => {
  const map = variant === 'plan' ? PLAN_STYLES : variant === 'scan' ? SCAN_STYLES : STATUS_STYLES;
  const style = map[value?.toLowerCase()] ?? 'bg-[#f5f4ed] text-[#87867f] border-[#e8e6dc]';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold capitalize ${style} ${className}`}
    >
      {value}
    </span>
  );
};
