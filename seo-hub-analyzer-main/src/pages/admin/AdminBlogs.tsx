// src/pages/admin/AdminBlogs.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, PenSquare, MoreVertical, Archive, Globe, Clock, CheckSquare, Trash2, X, Loader2 } from 'lucide-react';
import { useAdminBlogsFeed, BlogStatus, useAdminBlogMutations, useAdminBlogDetails } from '@/hooks/admin/useAdminBlogs';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { BlogRenderer } from '@/components/blog/BlogRenderer';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

// Inner component for Preview Modal to isolate the detail query
const PreviewModal = ({ blogId, onClose }: { blogId: string, onClose: () => void }) => {
  const { data: blog, isLoading } = useAdminBlogDetails(blogId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="absolute inset-0 bg-[#141413]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[900px] h-full max-h-[90vh] bg-[#faf9f5] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="h-14 border-b border-[#e8e6dc] bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-[#141413]">
            <Eye className="h-4 w-4" />
            <span className="text-[13px] font-bold uppercase tracking-wider">Quick Preview</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : !blog ? (
            <div className="text-center text-gray-500 py-12 text-[14px]">Failed to load preview.</div>
          ) : (
            <div className="max-w-[720px] mx-auto">
              {blog.cover_image && (
                <div className="w-full aspect-[21/9] rounded-xl overflow-hidden mb-8 border border-[#e8e6dc]">
                  <img src={blog.cover_image} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="text-[32px] sm:text-[40px] font-serif font-medium leading-[1.1] text-[#141413] tracking-tight mb-6">
                {blog.title}
              </h1>
              {blog.excerpt && (
                <p className="text-[18px] text-[#4d4c48] leading-relaxed mb-8 border-l-2 border-[#c96442] pl-4 italic">
                  {blog.excerpt}
                </p>
              )}
              <div className="font-serif text-[18px] leading-relaxed text-[#4d4c48]">
                {blog.content ? <BlogRenderer blocks={blog.content} /> : <p className="text-gray-400 italic">No content blocks found.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminBlogs: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BlogStatus | 'all'>('all');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: blogs, isLoading } = useAdminBlogsFeed(page, PAGE_SIZE, statusFilter === 'all' ? undefined : statusFilter);
  const { bulkDeleteBlogs } = useAdminBlogMutations();
  const hasMore = blogs && blogs.length === PAGE_SIZE;

  const STATUS_COLORS: Record<BlogStatus, string> = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    review: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-red-50 text-red-700 border-red-200'
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!blogs) return;
    if (e.target.checked) {
      setSelectedIds(new Set(blogs.map(b => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected articles? This action cannot be undone.`)) return;
    
    try {
      await bulkDeleteBlogs.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl relative pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
          <div className="bg-[#141413] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold">
                 {selectedIds.size}
               </span>
               <span className="text-[13px] font-medium">Selected</span>
             </div>
             <div className="w-[1px] h-4 bg-white/20" />
             <button 
               onClick={handleBulkDelete}
               disabled={bulkDeleteBlogs.isPending}
               className="flex items-center gap-1.5 text-[12px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
             >
               <Trash2 className="h-3.5 w-3.5" />
               {bulkDeleteBlogs.isPending ? 'Deleting...' : 'Delete All'}
             </button>
             <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 text-white/50 hover:text-white transition-colors">
               <X className="h-4 w-4" />
             </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewId && <PreviewModal blogId={previewId} onClose={() => setPreviewId(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] text-[#141413] tracking-tight" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
            Blog Operations
          </h1>
          <p className="text-[13px] text-[#87867f] mt-1">
            Manage your editorial content, bulk actions, and previews.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blogs/editor/new')}
          className="inline-flex items-center gap-2 bg-[#141413] hover:bg-black text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Article
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'published', 'draft', 'scheduled', 'review', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status as any);
              setPage(0);
              setSelectedIds(new Set()); // Clear selection on filter change
            }}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize whitespace-nowrap transition-colors ${
              statusFilter === status 
                ? 'bg-[#141413] text-white shadow-sm' 
                : 'bg-white border border-[#e8e6dc] text-gray-500 hover:bg-[#f5f4ed] hover:text-[#141413]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e6dc] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8e6dc] bg-[#faf9f5]">
                <th className="px-5 py-4 w-[40px]">
                  <input 
                    type="checkbox" 
                    checked={blogs && blogs.length > 0 && selectedIds.size === blogs.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#d6d4ca] text-[#141413] focus:ring-[#141413] cursor-pointer"
                  />
                </th>
                <th className="text-left px-2 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Article</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Author</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Category</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Views</th>
                <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6dc]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5"><div className="h-4 w-4 bg-gray-100 rounded animate-pulse" /></td>
                    {[1,2,3,4,5,6].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-gray-100 animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : blogs?.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <AdminEmptyState icon={FileText} title="No articles found" description="Create a new article to get started." />
                  </td>
                </tr>
              ) : (
                blogs?.map((blog) => (
                  <tr key={blog.id} className={`transition-colors ${selectedIds.has(blog.id) ? 'bg-[#f5f4ed]' : 'hover:bg-[#faf9f5]'}`}>
                    <td className="px-5 py-3.5">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(blog.id)}
                        onChange={(e) => handleSelectRow(blog.id, e.target.checked)}
                        className="rounded border-[#d6d4ca] text-[#141413] focus:ring-[#141413] cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-3.5 max-w-[200px] lg:max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[#141413] truncate" title={blog.title}>{blog.title}</span>
                        <span className="text-[11px] font-mono text-gray-400 truncate">/{blog.slug}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wider ${STATUS_COLORS[blog.status]}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-medium">
                      {blog.author_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-medium">
                      {blog.category_name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-mono font-medium text-gray-500 bg-[#f5f4ed] border border-[#e8e6dc] px-2 py-0.5 rounded">
                        {blog.views_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      
                      <button
                        onClick={() => setPreviewId(blog.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:bg-[#f5f4ed] hover:text-[#141413] transition-colors"
                        title="Quick Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/admin/blogs/editor/${blog.id}`)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:bg-[#f5f4ed] hover:text-[#c96442] transition-colors"
                        title="Edit Article"
                      >
                        <PenSquare className="h-4 w-4" />
                      </button>
                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8e6dc] bg-[#faf9f5]">
          <p className="text-[12px] font-medium text-gray-500">Page {page + 1}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-[12px] font-medium bg-white border border-[#e8e6dc] rounded-md shadow-sm disabled:opacity-40 hover:bg-[#f5f4ed] transition-colors text-[#141413]"
            >
              Previous
            </button>
            <button
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-[12px] font-medium bg-white border border-[#e8e6dc] rounded-md shadow-sm disabled:opacity-40 hover:bg-[#f5f4ed] transition-colors text-[#141413]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;
