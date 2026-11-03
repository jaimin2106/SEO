// src/components/admin/ui/AdminPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  page, pageSize, total, onPageChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e6dc]">
      <p className="text-[12px] text-[#87867f]">
        Showing <span className="font-medium text-[#141413]">{start}–{end}</span> of{' '}
        <span className="font-medium text-[#141413]">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8e6dc] text-[#87867f] hover:border-[#c96442] hover:text-[#c96442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 flex items-center justify-center rounded-lg border text-[12px] font-medium transition-colors ${
                p === page
                  ? 'bg-[#141413] text-white border-[#141413]'
                  : 'border-[#e8e6dc] text-[#87867f] hover:border-[#c96442] hover:text-[#c96442]'
              }`}
            >
              {p + 1}
            </button>
          );
        })}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#e8e6dc] text-[#87867f] hover:border-[#c96442] hover:text-[#c96442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
