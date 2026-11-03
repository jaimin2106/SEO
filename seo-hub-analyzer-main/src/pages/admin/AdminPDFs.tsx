// src/pages/admin/AdminPDFs.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, Download, HardDrive, FileText, Globe } from 'lucide-react';
import { useAdminPDFsFeed } from '@/hooks/admin/useAdminPDFs';
import { useAdminReportsStats } from '@/hooks/admin/useAdminReports';
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const PAGE_SIZE = 20;

const AdminPDFs: React.FC = () => {
  const [page, setPage] = useState(0);

  const { data: stats, isLoading: statsLoading } = useAdminReportsStats();
  const { data: pdfs, isLoading: pdfsLoading } = useAdminPDFsFeed(page, PAGE_SIZE);

  const hasMore = pdfs && pdfs.length === PAGE_SIZE;

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 className="text-[28px] text-[#141413] tracking-tight" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
          PDF Intelligence
        </h1>
        <p className="text-[13px] text-[#87867f] mt-1">
          Monitor generated PDF reports and storage usage.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {statsLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <AdminStatCard icon={FileDown} label="Generated PDFs" value={stats?.with_pdf ?? 0} accent />
            <AdminStatCard icon={HardDrive} label="Total PDF Storage" value={formatBytes(stats?.total_pdf_storage_bytes ?? 0)} />
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#f5f4ed]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Report Domain</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Size</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Generated On</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {pdfsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-[#f0eee6] animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pdfs?.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState icon={FileDown} title="No PDFs found" description="No PDFs have been generated yet." />
                  </td>
                </tr>
              ) : (
                pdfs?.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-[#f5f4ed] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#87867f]" />
                        <Link to={`/admin/reports/${pdf.id}`} className="font-medium text-[#141413] hover:text-[#c96442] hover:underline">
                          {pdf.domain}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/users/${pdf.user_id}`} className="text-[12px] text-[#5e5d59] hover:underline">
                        {pdf.user_email}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-mono text-[#87867f] bg-[#e8e6dc]/50 px-2 py-0.5 rounded">
                        {formatBytes(pdf.pdf_size_bytes)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#5e5d59] text-[12px]">
                      {new Date(pdf.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <a
                        href={pdf.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e8e6dc] bg-white text-[11px] font-medium text-[#141413] hover:border-[#c96442] hover:text-[#c96442] transition-colors"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                      <Link
                        to={`/admin/reports/${pdf.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e8e6dc] bg-[#f5f4ed] text-[11px] font-medium text-[#141413] hover:bg-[#e8e6dc] transition-colors"
                      >
                        <FileText className="h-3 w-3" /> Report
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

export default AdminPDFs;
