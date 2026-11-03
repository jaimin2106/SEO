import { ClipboardEvent, FormEvent, useEffect, useState } from "react";
import { Globe, Sparkles, AlertCircle, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/seohub/AuthModal";
import { UpgradeModal } from "@/components/report/UpgradeModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  id?: string;
  className?: string;
}

const UrlAnalyzer = ({ id, className = "" }: Props) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentlyPasted, setRecentlyPasted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Existing Report Modal State
  const [existingScanId, setExistingScanId] = useState<string | null>(null);
  const [existingScanDate, setExistingScanDate] = useState<string | null>(null);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [normalizedUrlForScan, setNormalizedUrlForScan] = useState("");
  
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const normalizeDisplayUrl = (value: string) =>
    value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").replace(/\s+/g, "");

  useEffect(() => {
    if (!recentlyPasted) return;
    const timeoutId = window.setTimeout(() => setRecentlyPasted(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [recentlyPasted]);

  const initiateNewScan = async (normalized: string) => {
    setLoading(true);
    try {
      const fullUrl = `https://${normalized}`;
      const { data, error } = await supabase.rpc('start_scan_job', { 
        p_url: fullUrl, 
        p_domain: normalized 
      });

      if (error) throw error;
      
      if (!data.success) {
        if (data.error === 'Insufficient credits') {
          setShowUpgrade(true);
        } else {
          console.error("Scan error:", data.error);
        }
        setLoading(false);
        return;
      }

      navigate(`/report?url=${encodeURIComponent(fullUrl)}&jobId=${data.job_id}&init=true`);
    } catch (err) {
      console.error("Failed to start scan:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const normalized = normalizeDisplayUrl(url);
    if (!normalized) return;
    
    if (!normalized.includes('.')) {
      setErrorMsg("Please enter a valid domain (e.g., example.com)");
      return;
    }

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (profile && profile.credits_remaining <= 0) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);

    // 1. Check for recent scan (Scan Reuse System)
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
        // Show prompt to use existing report
        setExistingScanId(recentScans[0].id);
        setExistingScanDate(recentScans[0].created_at);
        setNormalizedUrlForScan(normalized);
        setShowExistingModal(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Failed to check existing scans", err);
    }

    // 2. No recent scan found, initiate new scan
    await initiateNewScan(normalized);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    const normalized = normalizeDisplayUrl(pasted);
    setUrl(normalized);
    if (normalized) {
      setRecentlyPasted(true);
    }
  };

  const statusLabel = recentlyPasted ? "URL pasted" : url ? "Ready to scan" : "Live audit";

  return (
    <>
      <form id={id} onSubmit={handleSubmit} className={`w-full max-w-[38rem] ${className}`}>
        <div
          className={`group overflow-hidden rounded-[24px] border bg-[#ffffff] transition-all duration-250 ${
            isFocused
              ? "border-[#c96442]/50 shadow-[0_18px_45px_rgba(20,20,19,0.08),0_0_0_4px_rgba(201,100,66,0.09)]"
              : "border-[#ddd7ca] shadow-[0_14px_34px_rgba(20,20,19,0.05)] hover:border-[#d1c9ba] hover:shadow-[0_18px_42px_rgba(20,20,19,0.07)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:h-14 w-full sm:items-center">
            <div className="flex h-14 w-full items-center sm:w-auto sm:flex-1">
              <div className="flex h-full items-center pl-3">
                <span className="grid h-9 w-9 overflow-hidden place-items-center rounded-[14px] border border-[#ece8de] bg-[#faf9f5] text-[#87867f] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all">
                  {url.length > 3 && url.includes('.') ? (
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${url}&sz=64`}
                      alt="Site identity"
                      className="h-5 w-5 object-contain rounded-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </span>
              </div>

              <div className="flex h-full items-center pl-3 pr-2 text-[14px] text-[#87867f] select-none">
                <span>https://</span>
              </div>

              <div className="min-w-0 flex-1 relative flex items-center h-full">
                <input
                  type="text"
                  inputMode="url"
                  placeholder="yourdomain.com"
                  value={url}
                  onChange={(e) => { setUrl(normalizeDisplayUrl(e.target.value)); setErrorMsg(null); }}
                  onPaste={handlePaste}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="h-full w-full bg-transparent pr-8 text-[16px] sm:text-[15px] text-[#141413] outline-none placeholder:text-[#b0aea5]"
                />
                {url && !loading && (
                  <button 
                    type="button" 
                    onClick={() => { setUrl(''); setErrorMsg(null); }}
                    className="absolute right-2 text-[#b0aea5] hover:text-[#141413] p-1.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center px-2 pb-2 pt-1 sm:p-0 sm:pr-2 sm:h-full">
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 sm:h-10 w-full sm:min-w-[124px] items-center justify-center rounded-[16px] sm:rounded-[15px] bg-[#141413] px-4 text-[15px] sm:text-[14px] font-medium text-[#faf9f5] shadow-[0_0_0_1px_#141413,inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2a2927] active:translate-y-0 disabled:translate-y-0 disabled:opacity-70"
              >
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting...</> : "Run scan"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
          {errorMsg ? (
            <p className="text-[12px] font-medium text-[#c96442] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> {errorMsg}
            </p>
          ) : (
            <p className="text-[12px] leading-[1.5] text-[#87867f]">
              Paste any domain to run a live technical audit.
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-2.5 py-1 text-[11px] font-medium text-[#5e5d59] transition-colors duration-200">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  recentlyPasted ? "bg-[#c96442]" : "bg-[#141413]"
                }`}
              />
              {statusLabel}
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-2.5 py-1 text-[11px] font-medium text-[#5e5d59] sm:inline-flex">
              <Sparkles className="h-3 w-3 text-[#c96442]" />
              Report preview
            </span>
          </div>
        </div>
        
        <AuthModal open={showAuth} onOpenChange={setShowAuth} title="Create your free account" description="Sign in to save reports, access history, and get 5 free monthly credits." />
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      </form>

      {/* Existing Scan Modal */}
      <Dialog open={showExistingModal} onOpenChange={setShowExistingModal}>
        <DialogContent className="sm:max-w-[425px] bg-[#faf9f5] border border-[#e8e6dc] rounded-[16px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0fdf4] border border-[#bbf7d0]">
                <Globe className="h-5 w-5 text-[#16a34a]" />
              </div>
              <DialogTitle className="text-[18px] font-serif text-[#141413]">Existing Report Found</DialogTitle>
            </div>
            <DialogDescription className="text-[14px] text-[#5e5d59]">
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
              className="rounded-full border-[#d1cfc5] text-[#141413] hover:bg-[#e8e6dc] w-full sm:w-auto"
            >
              Rescan (1 Credit)
            </Button>
            <Button
              onClick={() => {
                setShowExistingModal(false);
                navigate(`/report?jobId=${existingScanId}`);
              }}
              className="rounded-full bg-[#141413] text-[#faf9f5] hover:bg-[#30302e] w-full sm:w-auto"
            >
              View Existing Report (Free)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UrlAnalyzer;
