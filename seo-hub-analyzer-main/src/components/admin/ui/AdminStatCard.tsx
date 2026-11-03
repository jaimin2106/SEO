// src/components/admin/ui/AdminStatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon: Icon, iconColor = 'text-[#c96442]', label, value, sub, accent,
}) => (
  <div className={`rounded-2xl border p-5 ${accent ? 'bg-[#c96442]/5 border-[#c96442]/20' : 'bg-[#faf9f5] border-[#e8e6dc]'}`}>
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.75} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#87867f]">{label}</span>
    </div>
    <p className="text-[22px] font-semibold text-[#141413] leading-tight">{value}</p>
    {sub && <p className="text-[11px] text-[#87867f] mt-0.5">{sub}</p>}
  </div>
);
