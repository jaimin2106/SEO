// src/pages/admin/AdminReports.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Search, Share2, Download, 
  ExternalLink, BarChart3, Clock, Trash2, ShieldOff 
} from 'lucide-react';
import { useAdminReportsFeed, useAdminReportsStats, useAdminReportMutations } from '@/hooks/admin/useAdminReports';
import { useAdminDeletions } from '@/hooks/admin/useAdminDeletions';
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const PAGE_SIZE = 20;

const AdminReports: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchDomain, setSearchDomain] = useState('');

  const { data: stats, isLoading: statsLoading } = useAdminReportsStats();
  const { data: reports, isLoading: reportsLoading } = useAdminReportsFeed(page, PAGE_SIZE, undefined, searchDomain);
  const { expireShareLink } = useAdminReportMutations();
  const { deleteReport } = useAdminDeletions();

  const hasMore = reports && reports.length === PAGE_SIZE;

  // Formatting bytes to MB/GB
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 className="text-[28px] text-[#141413] tracking-tight" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
          Report Management
        </h1>
        <p className="text-[13px] text-[#87867f] mt-1">
          Monitor and manage generated SEO reports across the platform.
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
            <AdminStatCard icon={FileText} label="Total Reports" value={stats?.total ?? 0} />
            <AdminStatCard icon={Clock} label="Today's Reports" value={stats?.today ?? 0} accent />
            <AdminStatCard icon={Share2} label="Shared Publicly" value={stats?.shared ?? 0} />
            <AdminStatCard icon={Download} label="With PDFs" value={stats?.with_pdf ?? 0} />
            <AdminStatCard 
              icon={BarChart3} 
              label="Avg SEO Score" 
              value={stats?.avg_score ? Math.round(stats.avg_score) : 0} 
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-3.5 py-2 flex-1 min-w-[240px] max-w-[400px]">
          <Search className="h-3.5 w-3.5 text-[#87867f] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={searchDomain}
            onChange={(e) => { setSearchDomain(e.target.value); setPage(0); }}
            placeholder="Search by domain..."
            className="flex-1 bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#f5f4ed]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Domain</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Score</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Generated</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {reportsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5,6].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-[#f0eee6] animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reports?.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState icon={FileText} title="No reports found" description="Adjust filters to see results." />
                  </td>
                </tr>
              ) : (
                reports?.map((report) => (
                  <tr key={report.id} className="hover:bg-[#f5f4ed] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/reports/${report.id}`} className="font-medium text-[#141413] hover:text-[#c96442] hover:underline">
                        {report.domain}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {report.overall_score !== null ? (
                        <span className={`font-bold ${report.overall_score >= 70 ? 'text-emerald-600' : report.overall_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                          {report.overall_score}/100
                        </span>
                      ) : (
                        <span className="text-[#87867f]">Processing</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/users/${report.user_id}`} className="text-[12px] text-[#5e5d59] hover:underline">
                        {report.user_email}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        {report.is_public && (
                          <span className="inline-flex items-center gap-1 w-fit text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                            <Share2 className="h-3 w-3" /> SHARED
                          </span>
                        )}
                        {report.pdf_url && (
                          <span className="inline-flex items-center gap-1 w-fit text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <Download className="h-3 w-3" /> PDF ({formatBytes(report.pdf_size_bytes)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[12px] text-[#5e5d59]">
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </td>
                      <td className="px-5 py-3.5 text-right space-x-2 flex items-center justify-end">
                        {report.is_public && (
                          <button
                            onClick={() => expireShareLink.mutate(report.id)}
                            disabled={expireShareLink.isPending}
                            title="Expire share link"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#87867f] hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50"
                          >
                            <ShieldOff className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e8e6dc] bg-[#f5f4ed] text-[11px] font-medium text-[#141413] hover:bg-[#e8e6dc] transition-colors"
                        >
                          Inspect
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this report?')) {
                              deleteReport.mutate({ reportId: report.id, pdfUrl: report.pdf_url });
                            }
                          }}
                          disabled={deleteReport.isPending}
                          title="Delete Report"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[#87867f] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

export default AdminReports;
