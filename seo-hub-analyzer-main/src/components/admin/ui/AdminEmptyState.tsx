// src/components/admin/ui/AdminEmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon: Icon, title, description, action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="h-14 w-14 rounded-2xl bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-center">
      <Icon className="h-7 w-7 text-[#87867f]" strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-[15px] font-semibold text-[#141413]">{title}</p>
      {description && (
        <p className="text-[13px] text-[#87867f] mt-1 max-w-[280px]">{description}</p>
      )}
    </div>
    {action}
  </div>
);
