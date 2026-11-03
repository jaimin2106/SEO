import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Loader2, Sparkles, TrendingUp, Search, History, ArrowRight,
  Settings, Zap, BarChart2, Globe, Clock, MoreVertical, FileText, Share, Trash2, Pin, PinOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/seohub/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UpgradeModal } from "@/components/report/UpgradeModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScanRecord {
  id: string;
  url: string;
  domain: string | null;
  score: number | null;
  created_at: string;
  completed_at: string | null;
  status: string;
  reports?: { is_pinned: boolean }[];
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[11px] text-[#595959]">—</span>;
  const color = score >= 85 ? "bg-[#ECFDF5] text-[#065F46]" : score >= 65 ? "bg-[#FEFCE8] text-[#854D0E]" : "bg-[#FEF2F2] text-[#991B1B]";
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-semibold ${color}`}>
      {score}
    </span>
  );
}

type TabType = 'all' | 'recent' | 'pinned' | 'in_progress' | 'failed';

const Dashboard = () => {
  const { user, profile, isLoading, upgradeTier } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scanUrl, setScanUrl] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  
  // Existing Report Modal State
  const [existingScanId, setExistingScanId] = useState<string | null>(null);
  const [existingScanDate, setExistingScanDate] = useState<string | null>(null);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [normalizedUrlForScan, setNormalizedUrlForScan] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate("/");
  }, [user, isLoading, navigate]);

  const { data: scanHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['scanHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("scan_jobs")
        .select("id, url, domain, score, created_at, completed_at, status, reports(is_pinned)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as ScanRecord[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Real-time subscription to update the cache instantly
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`dashboard_scans_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_jobs', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['scanHistory', user.id] });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports', filter: `user_id=eq.${user.id}` }, () => {
        // Only invalidate when THIS user's reports change (e.g. pin/unpin or pdf)
        queryClient.invalidateQueries({ queryKey: ['scanHistory', user.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const filteredHistory = useMemo(() => {
    let filtered = scanHistory;

    // Apply Tabs
    if (activeTab === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(item => new Date(item.created_at).getTime() > oneWeekAgo && item.status === 'completed');
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(item => item.reports?.[0]?.is_pinned);
    } else if (activeTab === 'in_progress') {
      filtered = filtered.filter(item => item.status === 'queued' || item.status === 'fetching' || item.status === 'rendering' || item.status === 'analyzing');
    } else if (activeTab === 'failed') {
      filtered = filtered.filter(item => item.status === 'failed');
    } else {
      // all
      filtered = filtered.filter(item => item.status === 'completed');
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.domain && item.domain.toLowerCase().includes(q)) || 
        item.url.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [scanHistory, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#141413] font-sans pt-24 pb-20">
        <div className="container-page">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-pulse">
            <div className="w-full">
              <div className="h-10 bg-black/[0.04] rounded-lg w-64 mb-4" />
              <div className="h-4 bg-black/[0.04] rounded w-96" />
            </div>
            <div className="h-12 bg-black/[0.04] rounded-full w-full md:w-[400px]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 h-[400px] bg-white border border-black/5 rounded-[24px]" />
            <div className="space-y-6">
              <div className="h-48 bg-white border border-black/5 rounded-[24px]" />
              <div className="h-48 bg-[#FDFBF7] border border-black/5 rounded-[24px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const maxCredits = profile.tier === "scale" ? 100 : profile.tier === "pro" ? 50 : 5;
  const creditsUsed = maxCredits - profile.credits_remaining;
  const usagePercentage = Math.min(100, (creditsUsed / maxCredits) * 100);

  const initiateNewScan = async (normalized: string) => {
    setIsScanning(true);
    try {
      const fullUrl = `https://${normalized}`;
      const { data, error } = await supabase.rpc('start_scan_job', { 
        p_url: fullUrl, 
        p_domain: normalized 
      });

      if (error) throw error;
      if (!data.success) {
        console.error("Scan error:", data.error);
        if (data.error === 'Insufficient credits') {
          setShowUpgrade(true);
        }
        setIsScanning(false);
        return;
      }

      navigate(`/report?jobId=${data.job_id}&init=true`);
    } catch (err) {
      console.error("Failed to start scan:", err);
      setIsScanning(false);
    }
  };

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) return;
    if (!scanUrl.trim()) return;
    const normalized = scanUrl.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").replace(/\s+/g, "");
    if (!normalized) return;

    if (profile && profile.credits_remaining <= 0) {
      setShowUpgrade(true);
      return;
    }

    setIsScanning(true);
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentScans, error: recentErr } = await supabase
        .from('scan_jobs')
        .select('id, created_at')
        .eq('domain', normalized)
        .eq('status', 'completed')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentErr && recentScans && recentScans.length > 0) {
        setExistingScanId(recentScans[0].id);
        setExistingScanDate(recentScans[0].created_at);
        setNormalizedUrlForScan(normalized);
        setShowExistingModal(true);
        setIsScanning(false);
        return;
      }
    } catch (err) {
      console.error("Check existing scans failed", err);
    }

    await initiateNewScan(normalized);
  };

  const executeDelete = async (jobIds: string[]) => {
    try {
      for (const jobId of jobIds) {
        const { data: rep } = await supabase.from('reports').select('id, pdf_url').eq('job_id', jobId).single();
        if (rep) {
          if (rep.pdf_url) {
            const urlParts = rep.pdf_url.split('/');
            const filename = urlParts[urlParts.length - 1];
            await supabase.storage.from('report_exports').remove([filename]);
          }
          await supabase.from('report_data').delete().eq('report_id', rep.id);
          await supabase.from('reports').delete().eq('id', rep.id);
        }
        await supabase.from('scan_jobs').delete().eq('id', jobId);
      }
      queryClient.setQueryData(['scanHistory', user?.id], (old: ScanRecord[] | undefined) => {
        if (!old) return [];
        return old.filter(item => !jobIds.includes(item.id));
      });
      setSelectedJobs(prev => prev.filter(id => !jobIds.includes(id)));
    } catch (err) {
      console.error("Failed to delete report(s):", err);
    }
  };

  const confirmDelete = async () => {
    if (jobToDelete) {
      await executeDelete([jobToDelete]);
    } else if (selectedJobs.length > 0) {
      await executeDelete(selectedJobs);
    }
    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  const handleTogglePin = async (jobId: string, currentPinned: boolean) => {
    try {
      const { data: rep } = await supabase.from('reports').select('id').eq('job_id', jobId).single();
      if (rep) {
        await supabase.from('reports').update({ is_pinned: !currentPinned }).eq('id', rep.id);
        // Optimistic update
        queryClient.setQueryData(['scanHistory', user?.id], (old: ScanRecord[] | undefined) => {
          if (!old) return [];
          return old.map(item => {
            if (item.id === jobId) {
              return { ...item, reports: [{ is_pinned: !currentPinned }] };
            }
            return item;
          });
        });
      }
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#141413] font-sans pt-24">
      <main className="container-page pb-20">

        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-[36px] font-serif font-semibold leading-tight text-[#141413]">
              Your Workspace
            </h1>
            <p className="text-[15px] text-[#595959] mt-2 max-w-xl">
              Access your SEO intelligence reports, monitor ongoing scans, and manage your analysis history.
            </p>
          </div>
          <form onSubmit={handleQuickScan} className="w-full md:w-auto">
            <div className="relative flex items-center w-full md:w-[400px]">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <input
                type="text"
                value={scanUrl}
                disabled={isScanning}
                onChange={e => setScanUrl(e.target.value)}
                placeholder="Scan a website..."
                className="w-full h-12 pl-10 pr-[120px] rounded-full border border-black/5 bg-white text-[14px] text-[#141413] placeholder:text-[#595959] focus:outline-none focus:border-[#141413] focus:ring-1 focus:ring-[#141413] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <div className="absolute right-1.5 flex items-center gap-1.5">
                <span className="hidden sm:flex items-center justify-center px-1.5 h-5 bg-[#FDFBF7] border border-black/5 rounded text-[10px] font-medium text-[#595959]">
                  ⌘K
                </span>
                <Button type="submit" disabled={isScanning} className="rounded-full h-9 bg-[#141413] text-[#faf9f5] hover:bg-[#30302e] px-4 shadow-sm text-[13px] disabled:opacity-70 disabled:cursor-not-allowed">
                  {isScanning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />} 
                  {isScanning ? "Scanning" : "Scan"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">

          {/* Left/Main: history + tabs */}
          <div className="lg:col-span-3 space-y-6">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex bg-black/[0.04] p-1 rounded-full overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Reports' },
                  { id: 'recent', label: 'Recent' },
                  { id: 'pinned', label: 'Pinned' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'failed', label: 'Failed' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id ? 'bg-white text-[#141413] shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-[#595959] hover:text-[#141413]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
                <input
                  type="text"
                  placeholder="Filter reports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-full border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-[13px] text-[#141413] placeholder:text-[#595959] focus:outline-none focus:border-[#141413] transition-colors"
                />
              </div>
            </div>

            {selectedJobs.length > 0 && (
              <div className="bg-[#141413] text-[#faf9f5] rounded-[16px] px-4 py-3 flex items-center justify-between mb-0 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <span className="text-[13px] font-medium">{selectedJobs.length} report{selectedJobs.length > 1 ? 's' : ''} selected</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedJobs([])} className="text-[#87867f] hover:text-white hover:bg-[#30302e] h-8 text-[12px] rounded-full">Cancel</Button>
                  <Button size="sm" onClick={() => { setJobToDelete(null); setDeleteDialogOpen(true); }} className="bg-[#c96442] hover:bg-[#a54c30] text-white h-8 text-[12px] rounded-full"><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Selected</Button>
                </div>
              </div>
            )}

            <div className="bg-white border border-black/5 rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-h-[400px]">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center h-[400px] w-full px-6 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-12 bg-black/[0.04] animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-[#f0eee6] flex items-center justify-center mb-4">
                    <History className="w-5 h-5 text-[#595959]" />
                  </div>
                  <p className="text-[15px] font-medium text-[#141413] mb-1">No reports found</p>
                  <p className="text-[13px] text-[#595959] max-w-xs">
                    {searchQuery ? "No reports match your filter criteria." : activeTab === 'all' ? "Scan your first website to populate this list." : `You don't have any ${activeTab.replace('_', ' ')} reports.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#f0eee6]">
                        <th className="px-6 py-3 w-12">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-[#d1cfc5] text-[#141413] focus:ring-[#141413] cursor-pointer"
                            checked={filteredHistory.length > 0 && selectedJobs.length === filteredHistory.length}
                            onChange={(e) => setSelectedJobs(e.target.checked ? filteredHistory.map(h => h.id) : [])}
                          />
                        </th>
                        <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#595959] w-1/2">Project</th>
                        <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#595959]">Scan Time</th>
                        <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#595959]">Status</th>
                        <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#595959] text-right">Score</th>
                        <th className="px-6 py-3 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(item => {
                        const isPinned = item.reports?.[0]?.is_pinned ?? false;
                        const durationMs = item.completed_at ? new Date(item.completed_at).getTime() - new Date(item.created_at).getTime() : 0;
                        const durationSecs = Math.max(1, Math.floor(durationMs / 1000));
                        
                        return (
                          <tr key={item.id} className={`border-b border-[#f0eee6] last:border-0 hover:bg-black/[0.02] transition-colors group cursor-pointer ${selectedJobs.includes(item.id) ? 'bg-black/[0.02]' : ''}`} onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="menuitem"]') || (e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                            navigate(`/report?jobId=${item.id}`);
                          }}>
                            <td className="px-6 py-3">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-[#d1cfc5] text-[#141413] focus:ring-[#141413] cursor-pointer"
                                checked={selectedJobs.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedJobs(prev => [...prev, item.id]);
                                  else setSelectedJobs(prev => prev.filter(id => id !== item.id));
                                }}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-black/5 bg-white shadow-sm shrink-0">
                                  {item.domain ? (
                                    <img src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`} alt="" className="w-4 h-4 object-contain" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                  ) : (
                                    <Globe className="w-4 h-4 text-[#595959]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-[14px] text-[#141413] truncate max-w-[200px]">
                                      {item.domain ?? new URL(item.url).hostname}
                                    </p>
                                    {isPinned && <Pin className="w-3 h-3 text-[#c96442]" />}
                                  </div>
                                  <p className="text-[11px] font-mono font-medium text-[#595959] truncate max-w-[200px] mt-0.5">{item.url}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex flex-col text-[13px] text-[#595959]">
                                <span>{timeAgo(item.created_at)}</span>
                                {item.completed_at && <span className="text-[11px] mt-0.5">{durationSecs}s duration</span>}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              {item.status === 'completed' ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-medium text-[#065F46] border border-[#A7F3D0]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                                  Completed
                                </span>
                              ) : item.status === 'failed' ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-medium text-[#991B1B] border border-[#FECACA]">
                                  Failed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#1E40AF] border border-[#BFDBFE]">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {item.status}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right">
                              {item.status === 'completed' ? <ScoreBadge score={item.score} /> : <span className="text-[11px] text-[#595959]">—</span>}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100">
                                    <MoreVertical className="h-4 w-4 text-[#595959]" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border-black/5 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-1">
                                  <DropdownMenuItem 
                                    onClick={() => navigate(`/report?jobId=${item.id}`)}
                                    className="text-[13px] rounded-[10px] cursor-pointer"
                                  >
                                    <FileText className="h-4 w-4 mr-2 text-[#595959]" />
                                    View Report
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleTogglePin(item.id, isPinned)}
                                    className="text-[13px] rounded-[10px] cursor-pointer"
                                    disabled={item.status !== 'completed'}
                                  >
                                    {isPinned ? <PinOff className="h-4 w-4 mr-2 text-[#595959]" /> : <Pin className="h-4 w-4 mr-2 text-[#595959]" />}
                                    {isPinned ? 'Unpin Report' : 'Pin Report'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/report?jobId=${item.id}`)}
                                    className="text-[13px] rounded-[10px] cursor-pointer"
                                    disabled={item.status !== 'completed'}
                                  >
                                    <Share className="h-4 w-4 mr-2 text-[#595959]" />
                                    Share Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      const normalized = item.domain ?? new URL(item.url).hostname;
                                      initiateNewScan(normalized);
                                    }}
                                    className="text-[13px] rounded-[10px] cursor-pointer"
                                  >
                                    <Zap className="h-4 w-4 mr-2 text-[#595959]" />
                                    Rescan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-black/5" />
                                  <DropdownMenuItem 
                                    onClick={() => { setJobToDelete(item.id); setDeleteDialogOpen(true); }}
                                    className="text-[13px] text-[#c96442] hover:bg-[#fff5f2] rounded-[10px] cursor-pointer focus:text-[#c96442] focus:bg-[#fff5f2]"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Plan + Usage Info (Linear Style sidebar) */}
          <div className="space-y-6">

            <div className="bg-white border border-black/5 rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="text-[12px] font-semibold text-[#595959] uppercase tracking-wide mb-4">Credit Usage</h2>
              
              <div className="flex items-end gap-2 mb-2">
                <span className="text-[36px] font-bold leading-none text-[#141413]">{profile.credits_remaining}</span>
                <span className="text-[13px] text-[#595959] pb-1">/ {maxCredits} left</span>
              </div>
              
              <div className="h-1.5 w-full bg-black/[0.04] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercentage > 90 ? "bg-[#c96442]" : usagePercentage > 75 ? "bg-[#eab308]" : "bg-[#141413]"
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              
              <p className="text-[12px] text-[#595959] mb-6">{creditsUsed} reports generated this period.</p>

              {profile.tier === "free" ? (
                <div className="p-4 bg-[#FDFBF7] border border-black/5 rounded-[16px]">
                  <h3 className="text-[13px] font-semibold text-[#141413] flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#c96442]" /> Unlock Pro
                  </h3>
                  <p className="text-[12px] text-[#595959] mb-4 leading-relaxed">
                    50 monthly credits, PDF exports, and AI remediation code snippets.
                  </p>
                  <Button
                    onClick={() => upgradeTier("pro")}
                    className="w-full bg-[#141413] hover:bg-[#30302e] text-[#faf9f5] rounded-[10px] text-[12px] h-9"
                  >
                    Upgrade for $29/mo
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full bg-white hover:bg-[#FDFBF7] rounded-[10px] border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-[#141413] text-[12px] h-9 transition-colors">
                  <Settings className="w-3.5 h-3.5 mr-2" /> Manage Billing
                </Button>
              )}
            </div>

            <div className="bg-[#FDFBF7] border border-black/5 rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="text-[12px] font-semibold text-[#595959] uppercase tracking-wide mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[20px] font-bold text-[#141413]">{scanHistory.length}</p>
                  <p className="text-[11px] text-[#595959] uppercase tracking-wider mt-0.5">Total Scans</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#141413]">
                    {scanHistory.filter(s => s.score).length > 0 
                      ? Math.round(scanHistory.filter(s => s.score).reduce((acc, curr) => acc + (curr.score ?? 0), 0) / scanHistory.filter(s => s.score).length)
                      : "—"}
                  </p>
                  <p className="text-[11px] text-[#595959] uppercase tracking-wider mt-0.5">Avg Score</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#141413]">{scanHistory.filter(s => s.status === 'failed').length}</p>
                  <p className="text-[11px] text-[#595959] uppercase tracking-wider mt-0.5">Failed</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#141413]">{scanHistory.filter(s => s.reports?.[0]?.is_pinned).length}</p>
                  <p className="text-[11px] text-[#595959] uppercase tracking-wider mt-0.5">Pinned</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />

      {/* Existing Scan Modal */}
      <Dialog open={showExistingModal} onOpenChange={setShowExistingModal}>
        <DialogContent className="sm:max-w-[425px] bg-[#FDFBF7] border border-black/5 rounded-[16px] shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                <Globe className="h-5 w-5 text-[#059669]" />
              </div>
              <DialogTitle className="text-[18px] font-serif text-[#141413]">Existing Report Found</DialogTitle>
            </div>
            <DialogDescription className="text-[14px] text-[#595959]">
              We found a recent report for <strong className="text-[#141413]">{normalizedUrlForScan}</strong> scanned{" "}
              <strong className="text-[#141413]">
                {existingScanDate ? new Date(existingScanDate).toLocaleString() : 'recently'}
              </strong>.
              <br/><br/>
              Viewing the existing report is completely free. Rescanning will use 1 credit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowExistingModal(false);
                initiateNewScan(normalizedUrlForScan);
              }}
              className="rounded-full border-black/10 text-[#141413] hover:bg-black/5 w-full sm:w-auto"
            >
              Rescan (1 Credit)
            </Button>
            <Button
              onClick={() => {
                setShowExistingModal(false);
                navigate(`/report?jobId=${existingScanId}`);
              }}
              className="rounded-full bg-[#141413] text-[#faf9f5] hover:bg-[#30302e] w-full sm:w-auto shadow-sm"
            >
              View Existing (Free)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) setJobToDelete(null);
      }}>
        <AlertDialogContent className="bg-white border border-black/5 rounded-[24px] sm:rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-md w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] text-[#141413] font-semibold">
              Delete Report{(!jobToDelete && selectedJobs.length > 1) ? 's' : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#595959] text-[15px] mt-2">
              Are you sure you want to delete {jobToDelete ? "this report" : `${selectedJobs.length} reports`}? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:mt-8 gap-3">
            <AlertDialogCancel className="h-11 rounded-full border border-[#e8e6dc] bg-white text-[#141413] hover:bg-[#f0eee6] font-medium w-full sm:w-auto mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="h-11 rounded-full bg-[#c96442] hover:bg-[#b55839] text-white font-medium w-full sm:w-auto"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default Dashboard;
