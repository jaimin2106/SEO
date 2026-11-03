// src/pages/admin/AdminScans.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ScanSearch, Search, Filter, AlertTriangle, 
  Clock, PlayCircle, CheckCircle2, RotateCcw, X 
} from 'lucide-react';
import { useAdminScansFeed, useAdminScansStats, useAdminScanMutations } from '@/hooks/admin/useAdminScans';
import { useAdminDeletions } from '@/hooks/admin/useAdminDeletions';
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const PAGE_SIZE = 20;

const AdminScans: React.FC = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchUrl, setSearchUrl] = useState('');

  const { data: stats, isLoading: statsLoading } = useAdminScansStats();
  const { data: scans, isLoading: scansLoading } = useAdminScansFeed(page, PAGE_SIZE, statusFilter, undefined, searchUrl);
  const { retryScan } = useAdminScanMutations();
  const { cancelScan } = useAdminDeletions();

  const hasMore = scans && scans.length === PAGE_SIZE;

  return (
    <div className="space-y-6 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 className="text-[28px] text-[#141413] tracking-tight flex items-center gap-2" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
          Scan Operations
          {stats?.running ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full relative top-0.5 tracking-normal">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {stats.running} RUNNING
            </span>
          ) : null}
        </h1>
        <p className="text-[13px] text-[#87867f] mt-1">
          Mission control for the crawling and analysis engine.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <AdminStatCard icon={ScanSearch} label="Total Scans" value={stats?.total ?? 0} />
            <AdminStatCard icon={Clock} label="Queued" value={stats?.queued ?? 0} />
            <AdminStatCard icon={PlayCircle} label="Running" value={stats?.running ?? 0} accent />
            <AdminStatCard icon={AlertTriangle} label="Failed" value={stats?.failed ?? 0} />
            <AdminStatCard 
              icon={CheckCircle2} 
              label="Avg Duration" 
              value={stats?.avg_duration_sec ? `${Math.round(stats.avg_duration_sec)}s` : '0s'} 
            />
          </>
        )}
      </div>

      {/* Failed Scans Quick Panel */}
      {stats?.failed ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-red-900">{stats.failed} Scans Failed</h3>
              <p className="text-[12px] text-red-700">These jobs encountered errors during crawling or analysis.</p>
            </div>
          </div>
          <button
            onClick={() => { setStatusFilter('failed'); setPage(0); }}
            className="px-4 py-2 bg-red-600 text-white text-[13px] font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Investigate
          </button>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2">
          <Filter className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-transparent text-[13px] text-[#141413] outline-none pr-4 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2 flex-1 min-w-[240px] max-w-[400px]">
          <Search className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={searchUrl}
            onChange={(e) => { setSearchUrl(e.target.value); setPage(0); }}
            placeholder="Search by URL..."
            className="flex-1 bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none"
          />
          {searchUrl && (
            <button onClick={() => { setSearchUrl(''); setPage(0); }} className="text-[#87867f] hover:text-[#141413]">
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
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Target URL</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Timing</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">User</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {scansLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-[#f0eee6] animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : scans?.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState icon={ScanSearch} title="No scans found" description="Adjust filters to see results." />
                  </td>
                </tr>
              ) : (
                scans?.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#f5f4ed] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/scans/${scan.id}`} className="font-medium text-[#141413] hover:text-[#c96442] hover:underline">
                        {scan.url}
                      </Link>
                      {scan.error_log && (
                        <p className="text-[11px] text-red-600 mt-1 truncate max-w-[300px]">
                          {scan.error_log}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <AdminBadge value={scan.status} variant="scan" />
                        {scan.status === 'running' && (
                          <span className="text-[11px] text-[#87867f]">{scan.progress}%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[12px] text-[#5e5d59]">
                        {new Date(scan.created_at).toLocaleString()}
                      </div>
                      {scan.duration_sec !== null && (
                        <div className="text-[11px] text-[#87867f] mt-0.5">
                          {Math.round(scan.duration_sec)}s duration
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/users/${scan.user_id}`} className="text-[12px] text-[#5e5d59] hover:underline">
                        {scan.user_email}
                      </Link>
                    </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {(scan.status === 'failed' || scan.status === 'completed') && (
                          <button
                            onClick={() => retryScan.mutate(scan.id)}
                            disabled={retryScan.isPending}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e8e6dc] bg-white text-[11px] font-medium text-[#141413] hover:border-[#c96442] hover:text-[#c96442] transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3" /> Retry
                          </button>
                        )}
                        {(scan.status === 'queued' || scan.status === 'running') && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this scan?')) {
                                cancelScan.mutate(scan.id);
                              }
                            }}
                            disabled={cancelScan.isPending}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-red-200 bg-red-50 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <X className="h-3 w-3" /> Cancel
                          </button>
                        )}
                        <Link
                          to={`/admin/scans/${scan.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e8e6dc] bg-[#f5f4ed] text-[11px] font-medium text-[#141413] hover:bg-[#e8e6dc] transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e6dc]">
          <p className="text-[12px] text-[#87867f]">Page {page + 1}</p>
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

export default AdminScans;
