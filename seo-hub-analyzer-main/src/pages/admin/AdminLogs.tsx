// src/pages/admin/AdminLogs.tsx
// Audit log viewer — paginated, filterable by action.

import React, { useEffect, useState } from 'react';
import { Activity, Clock, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LogRow {
  id: string;
  admin_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter.trim()) {
      query = query.ilike('action', `%${filter.trim()}%`);
    }

    query.then(({ data, count, error }) => {
      if (cancelled || error) return;
      setLogs(data ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [page, filter]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] text-[#141413] tracking-tight"
            style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}
          >
            Audit Logs
          </h1>
          <p className="text-[13px] text-[#87867f] mt-1">
            {total} total events recorded
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-[#faf9f5] border border-[#e8e6dc] rounded-lg px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-[#87867f]" strokeWidth={1.75} />
          <input
            type="text"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(0); }}
            placeholder="Filter by action…"
            className="bg-transparent text-[13px] text-[#141413] placeholder:text-[#87867f] outline-none w-44"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#f5f4ed]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Action</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Resource</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Resource ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4].map((j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded bg-[#f0eee6] animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Activity className="h-8 w-8 text-[#87867f]" strokeWidth={1.5} />
                          <p className="text-[13px] text-[#87867f]">No audit logs found</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f5f4ed] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#c96442]/10 flex items-center justify-center shrink-0">
                            <Activity className="h-3 w-3 text-[#c96442]" />
                          </div>
                          <span className="font-medium text-[#141413]">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#5e5d59]">{log.resource_type ?? '—'}</td>
                      <td className="px-5 py-3.5 text-[#87867f] font-mono text-[12px]">
                        {log.resource_id ? log.resource_id.substring(0, 12) + '…' : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[#87867f]">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e6dc]">
            <p className="text-[12px] text-[#87867f]">
              Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-[12px] border border-[#e8e6dc] rounded-lg disabled:opacity-40 hover:border-[#c96442] transition-colors"
              >
                Previous
              </button>
              <button
                disabled={(page + 1) * PAGE_SIZE >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-[12px] border border-[#e8e6dc] rounded-lg disabled:opacity-40 hover:border-[#c96442] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
