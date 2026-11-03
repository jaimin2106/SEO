// src/pages/admin/AdminAI.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Globe, Bot } from 'lucide-react';
import { useAdminAIFeed } from '@/hooks/admin/useAdminAI';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const PAGE_SIZE = 20;

const AdminAI: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data: prompts, isLoading } = useAdminAIFeed(page, PAGE_SIZE);

  const hasMore = prompts && prompts.length === PAGE_SIZE;

  return (
    <div className="space-y-6 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 className="text-[28px] text-[#141413] tracking-tight" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
          AI Intelligence Center
        </h1>
        <p className="text-[13px] text-[#87867f] mt-1">
          Monitor AI generations, prompt usage, and inspect model outputs.
        </p>
      </div>

      {/* Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#e8e6dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#f5f4ed]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Report Domain</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Issue / Model</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Content</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f]">Generated On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-[#f0eee6] animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : prompts?.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState icon={Sparkles} title="No AI Generations" description="No AI prompts have been processed yet." />
                  </td>
                </tr>
              ) : (
                prompts?.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-[#f5f4ed] transition-colors group">
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#87867f]" />
                        <Link to={`/admin/reports/${prompt.report_id}`} className="font-medium text-[#141413] hover:text-[#c96442] hover:underline">
                          {prompt.domain}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <Link to={`/admin/users/${prompt.user_id}`} className="text-[12px] text-[#5e5d59] hover:underline">
                        {prompt.user_email}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] text-[#141413]">{prompt.issue_id}</span>
                        <span className="inline-flex items-center gap-1 w-fit text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                          <Bot className="h-3 w-3" /> {prompt.model_used || 'GPT-4'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="space-y-2">
                        <div>
                          <p className="text-[11px] font-semibold text-[#87867f] uppercase tracking-wider mb-1">Prompt Summary</p>
                          <p className="text-[12px] text-[#5e5d59] line-clamp-2">{prompt.prompt}</p>
                        </div>
                        <div className="bg-white border border-[#e8e6dc] rounded-lg p-2 max-h-32 overflow-y-auto">
                          <p className="text-[11px] font-semibold text-[#87867f] uppercase tracking-wider mb-1">Response</p>
                          {prompt.response ? (
                            <p className="text-[12px] text-[#141413] whitespace-pre-wrap">{prompt.response}</p>
                          ) : (
                            <p className="text-[12px] text-red-500 italic">No response received</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#5e5d59] text-[12px] align-top">
                      {new Date(prompt.created_at).toLocaleString()}
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

export default AdminAI;
