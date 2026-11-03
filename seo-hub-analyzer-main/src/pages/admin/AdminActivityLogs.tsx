// src/pages/admin/AdminActivityLogs.tsx
// Detailed, searchable, and exportable table for activity logs

import React, { useState } from 'react';
import { Activity, Search, Download, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminActivityFeed } from '@/hooks/admin/useAdminActivity';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const PAGE_SIZE = 20;

const AdminActivityLogs: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchAction, setSearchAction] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  const { data: logs, isLoading } = useAdminActivityFeed(page, PAGE_SIZE, userIdFilter || undefined, searchAction || undefined);

  // We don't have total count in this RPC currently, so we just use next/prev based on array length.
  const hasMore = logs && logs.length === PAGE_SIZE;

  const handleExportCsv = () => {
    if (!logs?.length) return;
    
    const headers = ['ID', 'User Email', 'Action', 'Resource Type', 'Resource ID', 'Success', 'Created At', 'Metadata'];
    const rows = logs.map(l => [
      l.id,
      l.user_email,
      l.action,
      l.resource_type || '',
      l.resource_id || '',
      l.success ? 'TRUE' : 'FALSE',
      new Date(l.created_at).toISOString(),
      l.metadata ? JSON.stringify(l.metadata).replace(/"/g, '""') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => `"${r.join('","')}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `activity_logs_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] text-[#141413] tracking-tight" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
            Activity Logs
          </h1>
          <p className="text-[13px] text-[#87867f] mt-1">
            Comprehensive audit trail of all system activity.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={!logs?.length}
          className="flex items-center gap-2 px-4 py-2 bg-[#141413] text-white text-[13px] font-medium rounded-lg hover:bg-[#1f1e1a] transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2 flex-1 min-w-[240px] max-w-[300px]">
          <Filter className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={searchAction}
            onChange={(e) => { setSearchAction(e.target.value); setPage(0); }}
            placeholder="Filter by action (e.g. LOGIN)..."
            className="flex-1 bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none"
          />
          {searchAction && (
            <button onClick={() => { setSearchAction(''); setPage(0); }} className="text-[#87867f] hover:text-[#141413]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2 flex-1 min-w-[240px] max-w-[300px]">
          <Search className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); setPage(0); }}
            placeholder="Filter by specific User ID..."
            className="flex-1 bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none"
          />
          {userIdFilter && (
            <button onClick={() => { setUserIdFilter(''); setPage(0); }} className="text-[#87867f] hover:text-[#141413]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#f5f4ed]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Time</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Action</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Resource</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-[#f0eee6] animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs?.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState icon={Activity} title="No logs found" description="Try adjusting your filters." />
                  </td>
                </tr>
              ) : (
                logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f5f4ed] transition-colors">
                    <td className="px-5 py-3.5 text-[#87867f] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/users/${log.user_id}`} className="font-medium text-[#141413] hover:text-[#c96442] hover:underline">
                        {log.user_email}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[#141413] capitalize">{log.action.toLowerCase().replace(/_/g, ' ')}</span>
                      {!log.success && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded">FAILED</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[#5e5d59] font-mono text-[12px]">
                      {log.resource_type ? `${log.resource_type}: ${log.resource_id?.substring(0,8)}` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <div className="text-[11px] text-[#87867f] font-mono truncate max-w-[250px]">
                          {JSON.stringify(log.metadata)}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e6dc]">
          <p className="text-[12px] text-[#87867f]">
            Page {page + 1}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-[12px] border border-[#e8e6dc] rounded-lg disabled:opacity-40 hover:border-[#c96442] transition-colors"
            >
              Previous
            </button>
            <button
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-[12px] border border-[#e8e6dc] rounded-lg disabled:opacity-40 hover:border-[#c96442] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
