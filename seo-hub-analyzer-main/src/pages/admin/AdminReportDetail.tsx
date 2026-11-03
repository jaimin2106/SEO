// src/pages/admin/AdminReportDetail.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, FileText, Share2, Download, Code, ShieldOff, ExternalLink, Trash2 } from 'lucide-react';
import { useAdminReportDetails, useAdminReportMutations } from '@/hooks/admin/useAdminReports';
import { useAdminDeletions } from '@/hooks/admin/useAdminDeletions';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const AdminReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useAdminReportDetails(id!);
  const { expireShareLink } = useAdminReportMutations();
  const { deleteReport } = useAdminDeletions();

  if (isLoading) {
    return <div className="space-y-4 animate-pulse max-w-5xl">
      <div className="h-6 w-32 bg-[#f0eee6] rounded" />
      <div className="h-40 bg-[#f0eee6] rounded-2xl" />
      <div className="h-96 bg-[#f0eee6] rounded-2xl" />
    </div>;
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <Link to="/admin/reports" className="inline-flex items-center gap-1.5 text-[13px] text-[#87867f] hover:text-[#141413] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Link>
        <AdminEmptyState icon={FileText} title="Report Not Found" description="The requested report does not exist or has been deleted." />
      </div>
    );
  }

  // Calculate size of JSON payload payload
  const rawDataStr = JSON.stringify(report.data, null, 2);
  const dataSizeKb = (new Blob([rawDataStr]).size / 1024).toFixed(2);

  return (
    <div className="space-y-6 max-w-5xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Link to="/admin/reports" className="inline-flex items-center gap-1.5 text-[13px] text-[#87867f] hover:text-[#141413] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </Link>

      {/* Header Card */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-[#e8e6dc] flex items-center justify-center shrink-0">
              <Globe className="h-6 w-6 text-[#87867f]" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-[#141413]">{report.domain}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[13px] text-[#87867f]">Report ID: <span className="font-mono text-[12px]">{report.id}</span></span>
                <span className="text-[13px] text-[#87867f]">·</span>
                <span className="text-[13px] text-[#87867f]">{new Date(report.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {report.overall_score !== null && (
              <div className={`text-[24px] font-bold ${report.overall_score >= 70 ? 'text-emerald-600' : report.overall_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {report.overall_score} / 100
              </div>
            )}
            <Link to={`/admin/users/${report.user_id}`} className="text-[13px] text-[#c96442] hover:underline font-medium">
              View User: {report.user_email}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-[#e8e6dc] flex-wrap">
          {report.is_public && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[12px] font-semibold border border-blue-200">
                <Share2 className="h-3.5 w-3.5" /> Publicly Shared
              </span>
              <button
                onClick={() => expireShareLink.mutate(report.id)}
                disabled={expireShareLink.isPending}
                className="text-[12px] text-[#87867f] hover:text-amber-600 hover:underline transition-colors flex items-center gap-1"
              >
                <ShieldOff className="h-3 w-3" /> Expire Link
              </button>
            </div>
          )}
          {report.pdf_url && (
            <a href={report.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors">
              <Download className="h-3.5 w-3.5" /> View PDF ({(report.pdf_size_bytes / 1024 / 1024).toFixed(2)} MB)
            </a>
          )}
          {report.job_id && (
            <Link to={`/admin/scans/${report.job_id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-[12px] font-semibold border border-gray-200 hover:bg-gray-200 transition-colors ml-auto">
              Inspect Scan Job <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete this report and clean up its storage?')) {
                deleteReport.mutate({ reportId: report.id, pdfUrl: report.pdf_url });
              }
            }}
            disabled={deleteReport.isPending}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-[12px] font-semibold border border-red-200 hover:bg-red-100 transition-colors ml-2"
          >
            <Trash2 className="h-3.5 w-3.5" /> {deleteReport.isPending ? 'Deleting...' : 'Delete Report'}
          </button>
        </div>
      </div>

      {/* Raw Payload Inspector */}
      <div className="bg-white rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e6dc] bg-[#faf9f5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-[#87867f]" />
            <h2 className="text-[14px] font-semibold text-[#141413]">Raw Analysis Payload</h2>
          </div>
          <span className="text-[12px] text-[#87867f] font-mono bg-[#e8e6dc]/50 px-2 py-0.5 rounded">
            {dataSizeKb} KB
          </span>
        </div>
        <div className="p-4 overflow-x-auto bg-[#141413]">
          <pre className="text-[12px] font-mono text-[#e8e6dc] leading-relaxed">
            {rawDataStr}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdminReportDetail;
