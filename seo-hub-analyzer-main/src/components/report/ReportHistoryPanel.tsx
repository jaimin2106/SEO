import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { History, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanRecord {
  id: string;
  url: string;
  score: number | null;
  created_at: string;
}

export function ReportHistoryPanel({ domain, currentJobId }: { domain: string, currentJobId?: string }) {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domain) return;
    const fetchHistory = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('scan_jobs')
        .select('id, url, score, created_at')
        .eq('domain', domain)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [domain]);

  if (loading) return null;
  if (history.length <= 1) return null; // Only show if there's history beyond the current one

  return (
    <div className="bg-white border border-[#e8e6dc] rounded-[24px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-5 w-5 text-[#87867f]" />
        <h2 className="text-[18px] font-serif font-semibold text-[#141413]">Historical Scans for {domain}</h2>
      </div>

      <div className="space-y-4">
        {history.map((scan, i) => {
          const isCurrent = scan.id === currentJobId;
          const scoreDiff = i < history.length - 1 ? (scan.score ?? 0) - (history[i + 1].score ?? 0) : 0;
          
          return (
            <div key={scan.id} className={`flex items-center justify-between p-4 rounded-[16px] border ${isCurrent ? 'border-[#141413] bg-[#faf9f5]' : 'border-[#e8e6dc] hover:bg-[#faf9f5]'} transition-colors`}>
              <div>
                <p className="text-[14px] font-medium text-[#141413] flex items-center gap-2">
                  {new Date(scan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {isCurrent && <span className="text-[10px] uppercase tracking-wider bg-[#141413] text-white px-2 py-0.5 rounded-full">Current</span>}
                </p>
                <div className="flex items-center gap-1.5 text-[12px] text-[#87867f] mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(scan.created_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="flex items-center gap-6">
                {scan.score !== null && (
                  <div className="flex items-center gap-2">
                    {scoreDiff > 0 ? (
                      <span className="text-[12px] text-[#166534] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{scoreDiff}</span>
                    ) : scoreDiff < 0 ? (
                      <span className="text-[12px] text-[#b53333] flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> {scoreDiff}</span>
                    ) : null}
                    <span className="text-[18px] font-bold font-serif">{scan.score}</span>
                  </div>
                )}
                
                {!isCurrent && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.location.href = `/report?jobId=${scan.id}`}
                    className="text-[12px] h-8 rounded-full"
                  >
                    View <ArrowRight className="ml-1 w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
