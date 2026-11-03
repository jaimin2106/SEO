// src/pages/admin/AdminScanDetail.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ScanSearch, Clock, RotateCcw, AlertTriangle, FileText, Globe } from 'lucide-react';
import { useAdminScanDetails, useAdminScanMutations } from '@/hooks/admin/useAdminScans';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';

const AdminScanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: scan, isLoading } = useAdminScanDetails(id!);
  const { retryScan } = useAdminScanMutations();

  if (isLoading) {
    return <div className="space-y-4 animate-pulse max-w-5xl">
      <div className="h-6 w-32 bg-[#f0eee6] rounded" />
      <div className="h-40 bg-[#f0eee6] rounded-2xl" />
      <div className="h-64 bg-[#f0eee6] rounded-2xl" />
    </div>;
  }

  if (!scan) {
    return (
      <div className="space-y-4">
        <Link to="/admin/scans" className="inline-flex items-center gap-1.5 text-[13px] text-[#87867f] hover:text-[#141413] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Scans
        </Link>
        <AdminEmptyState icon={ScanSearch} title="Scan Not Found" description="The requested scan job does not exist." />
      </div>
    );
  }

  const startedAt = scan.started_at ? new Date(scan.started_at).getTime() : null;
  const completedAt = scan.completed_at ? new Date(scan.completed_at).getTime() : null;
  const durationSec = startedAt && completedAt ? (completedAt - startedAt) / 1000 : null;

  return (
    <div className="space-y-6 max-w-5xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Link to="/admin/scans" className="inline-flex items-center gap-1.5 text-[13px] text-[#87867f] hover:text-[#141413] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Scans
      </Link>

      {/* Header Card */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-[#e8e6dc] flex items-center justify-center shrink-0">
              <Globe className="h-6 w-6 text-[#87867f]" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-[#141413]">{scan.url}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[13px] text-[#87867f]">Scan ID: <span className="font-mono text-[12px]">{scan.id}</span></span>
                <span className="text-[13px] text-[#87867f]">·</span>
                <span className="text-[13px] text-[#87867f]">{new Date(scan.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <AdminBadge value={scan.status} variant="scan" />
            <Link to={`/admin/users/${scan.user_id}`} className="text-[13px] text-[#c96442] hover:underline font-medium">
              View User: {scan.user_email}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#e8e6dc] flex-wrap">
          {(scan.status === 'failed' || scan.status === 'completed') && (
            <button
              onClick={() => retryScan.mutate(scan.id)}
              disabled={retryScan.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8e6dc] bg-white text-[13px] font-medium text-[#141413] hover:border-[#c96442] hover:text-[#c96442] transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Retry Scan
            </button>
          )}
          {scan.report_id && (
            <Link
              to={`/admin/reports/${scan.report_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[13px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors ml-auto"
            >
              <FileText className="h-4 w-4" /> View Generated Report
            </Link>
          )}
        </div>
      </div>

      {/* Grid: Details & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Timeline / Status Panel */}
        <div className="col-span-1 bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] p-6 space-y-6">
          <div>
            <h3 className="text-[14px] font-semibold text-[#141413] mb-4">Execution Timeline</h3>
            <div className="space-y-4">
              <TimelineStep 
                label="Queued" 
                time={scan.created_at} 
                active={true} 
                done={!!scan.started_at} 
              />
              <TimelineStep 
                label="Running" 
                time={scan.started_at} 
                active={scan.status === 'running'} 
                done={!!scan.completed_at || scan.status === 'failed'} 
                progress={scan.progress}
              />
              <TimelineStep 
                label={scan.status === 'failed' ? 'Failed' : 'Completed'} 
                time={scan.completed_at || (scan.status === 'failed' ? new Date().toISOString() : null)} 
                active={false} 
                done={scan.status === 'completed'}
                isError={scan.status === 'failed'}
              />
            </div>
          </div>

          <div className="border-t border-[#e8e6dc] pt-5 space-y-3">
            <h3 className="text-[12px] font-semibold text-[#87867f] uppercase tracking-[0.1em]">Metadata</h3>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#87867f]">Progress</span>
              <span className="font-medium text-[#141413]">{scan.progress}%</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#87867f]">Duration</span>
              <span className="font-medium text-[#141413]">{durationSec !== null ? `${Math.round(durationSec)}s` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Error Logs Panel */}
        <div className="col-span-1 md:col-span-2">
          {scan.error_log ? (
            <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-red-200 bg-red-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <h2 className="text-[14px] font-semibold text-red-900">Failure Logs</h2>
              </div>
              <div className="p-5 font-mono text-[12px] text-red-800 whitespace-pre-wrap">
                {scan.error_log}
              </div>
            </div>
          ) : (
            <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] flex flex-col items-center justify-center p-12 h-full text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-[14px] font-medium text-[#141413]">No Errors Logged</p>
              <p className="text-[13px] text-[#87867f] mt-1 max-w-[250px]">
                {scan.status === 'completed' ? 'This scan completed successfully.' : 'The crawler is currently executing without errors.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ── Timeline Helper ─────────────────────────────────────────────

const TimelineStep: React.FC<{
  label: string;
  time: string | null;
  active: boolean;
  done: boolean;
  progress?: number;
  isError?: boolean;
}> = ({ label, time, active, done, progress, isError }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`h-3 w-3 rounded-full mt-1.5 ${
        isError ? 'bg-red-500 ring-4 ring-red-100' :
        done ? 'bg-emerald-500' :
        active ? 'bg-[#c96442] ring-4 ring-[#c96442]/20' :
        'bg-[#e8e6dc]'
      }`} />
      <div className={`w-0.5 h-10 mt-1.5 ${done && !isError ? 'bg-emerald-500' : 'bg-[#e8e6dc]'}`} />
    </div>
    <div className="flex-1">
      <p className={`text-[13px] font-medium ${isError ? 'text-red-600' : active ? 'text-[#141413]' : done ? 'text-[#141413]' : 'text-[#87867f]'}`}>
        {label}
        {progress !== undefined && active && <span className="ml-2 font-normal text-[#87867f]">{progress}%</span>}
      </p>
      {time && (
        <p className="text-[11px] text-[#87867f] mt-0.5">{new Date(time).toLocaleTimeString()}</p>
      )}
    </div>
  </div>
);

export default AdminScanDetail;
