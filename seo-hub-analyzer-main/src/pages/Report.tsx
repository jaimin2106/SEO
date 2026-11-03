import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronRight,
  Download,
  Gauge,
  Globe,
  Loader2,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  WandSparkles,
  X,
  MoreVertical,
  Share,
  Trash2,
  Zap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";


import Footer from "@/components/seohub/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { runForensicAnalysis } from "@/lib/forensicEngine";
import type { AuditIssue, ForensicReport, ScoreCard, ScoreStatus } from "@/lib/forensicTypes";
import { AiRemediationPanel } from "@/components/report/AiRemediationPanel";
import { PreviewEngine } from "@/components/report/PreviewEngine";
import { GlobalAuditPrompt } from "@/components/report/GlobalAuditPrompt";
import { PdfExportButton } from "@/components/report/PdfExportButton";
import { PremiumLock } from "@/components/report/PremiumLock";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/report/UpgradeModal";
import { AuthModal } from "@/components/seohub/AuthModal";
import { ReportHistoryPanel } from "@/components/report/ReportHistoryPanel";
import { ReportUserPanel } from "@/components/report/ReportUserPanel";
import { ImageIntelligenceSection } from "@/components/report/sections/ImageIntelligenceSection";
import { ContentOpportunitySection } from "@/components/report/sections/ContentOpportunitySection";
import { AiSearchReadinessSection } from "@/components/report/sections/AiSearchReadinessSection";
import { SeoRoadmapSection } from "@/components/report/sections/SeoRoadmapSection";
import { KeywordIntelligenceSection } from "@/components/report/sections/KeywordIntelligenceSection";
import { AccessibilityDeepSection } from "@/components/report/sections/AccessibilityDeepSection";
import { CompetitiveBenchmarkSection } from "@/components/report/sections/CompetitiveBenchmarkSection";
import { supabase } from "@/lib/supabase";

const SECTIONS = [
  { id: "overview",            label: "Overview" },
  { id: "seo-roadmap",         label: "SEO Roadmap" },
  { id: "keyword-intelligence",label: "Keyword Intelligence" },
  { id: "image-intelligence",  label: "Image Intelligence" },
  { id: "content-opportunities",label: "Content Opportunities" },
  { id: "ai-search",           label: "AI Search Readiness" },
  { id: "performance",         label: "Performance & Engineering" },
  { id: "technical-seo",       label: "Technical SEO" },
  { id: "accessibility",       label: "Accessibility" },
  { id: "competitive",         label: "Competitive Benchmark" },
  { id: "experience",          label: "Experience (UX)" },
  { id: "visual-intelligence", label: "Visual Intelligence" },
  { id: "action-plan",         label: "Action Plan" },
];

const loadingSteps = [
  {
    label: "Validating URL",
    detail: "Ensuring the domain is reachable and properly structured.",
  },
  {
    label: "Capturing Metadata",
    detail: "Extracting title, description, and primary content structures.",
  },
  {
    label: "Running SEO Analysis",
    detail: "Checking technical SEO, core vitals, and indexability signals.",
  },
  {
    label: "Measuring Performance",
    detail: "Analyzing load times, layout shifts, and engineering metrics.",
  },
  {
    label: "Generating Report",
    detail: "Compiling insights, prioritizing issues, and scoring enterprise readiness.",
  },
];

function scoreTone(score: number) {
  if (score >= 85) return { text: "text-[#22c55e]", bar: "bg-[#22c55e]", soft: "bg-[#f0fdf4]" };
  if (score >= 70) return { text: "text-[#5e5d59]", bar: "bg-[#87867f]", soft: "bg-[#f6f4ec]" };
  if (score >= 50) return { text: "text-[#eab308]", bar: "bg-[#eab308]", soft: "bg-[#fefce8]" };
  return { text: "text-[#c96442]", bar: "bg-[#c96442]", soft: "bg-[#fff5f2]" };
}

function severityClasses(severity: AuditIssue["severity"]) {
  if (severity === "critical") return "bg-[#fff5f2] text-[#c96442] border-[#f3d2c6]";
  if (severity === "high") return "bg-[#fef2f2] text-[#b53333] border-[#efc4c4]";
  if (severity === "medium") return "bg-[#fefce8] text-[#a16207] border-[#f1e6af]";
  return "bg-[#f0eee6] text-[#5e5d59] border-[#e2ddd0]";
}

function LoadingPanel({ progress, step, targetUrl }: { progress: number; step: number; targetUrl: string }) {
  const progressPercent = Math.min(progress, 100);
  const displayDomain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] w-full bg-[#faf9f5] font-sans flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px] flex flex-col items-center">

        {/* Site identity */}
        <div className="flex items-center gap-3.5 mb-10">
          <div className="h-10 w-10 rounded-[10px] bg-white border border-[#e8e6dc] shadow-[0_2px_8px_rgba(20,20,19,0.06)] overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${displayDomain}&sz=64`}
              alt={displayDomain}
              className="h-6 w-6 object-contain"
              loading="eager"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-[#141413] truncate">{displayDomain}</p>
            <p className="text-[11px] text-[#87867f] mt-0.5">SEO Intelligence Audit</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-8">
          <div className="h-[3px] w-full rounded-full bg-[#e8e6dc] overflow-hidden">
            <div
              className="h-full bg-[#141413] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="text-[11px] text-[#87867f] font-medium">Scanning</span>
            <span className="text-[11px] text-[#141413] font-semibold tabular-nums">{progressPercent}%</span>
          </div>
        </div>

        {/* Step checklist */}
        <div className="w-full space-y-px">
          {loadingSteps.map((s, i) => {
            const isDone = i < step;
            const isActive = i === step;
            const isPending = i > step;

            return (
              <div
                key={s.label}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-[10px] transition-all duration-300 ${
                  isActive ? "bg-white border border-[#e8e6dc] shadow-[0_1px_4px_rgba(20,20,19,0.05)]" : "bg-transparent"
                }`}
              >
                {/* State indicator */}
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-[#141413]"
                    : isActive
                    ? "border-2 border-[#141413]"
                    : "border border-[#d1cfc5]"
                }`}>
                  {isDone && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-[#141413] animate-pulse" />
                  )}
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium transition-colors duration-300 ${
                    isDone ? "text-[#87867f]" : isActive ? "text-[#141413]" : "text-[#c4c2bc]"
                  }`}>
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-[11px] text-[#87867f] mt-0.5 leading-relaxed">
                      {s.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}


function IssueCard({ issue, url }: { issue: AuditIssue; url: string }) {
  return (
    <AccordionItem value={issue.id} className="border border-[#e8e6dc] bg-white rounded-[14px] shadow-sm px-5 mb-3 overflow-hidden data-[state=closed]:border-b-[#e8e6dc]">
      <AccordionTrigger className="py-5 hover:no-underline">
        <div className="flex w-full flex-col gap-3 text-left md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em] shadow-none ${severityClasses(issue.severity)}`}>
                {issue.severity}
              </Badge>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#87867f]">{issue.pillar}</span>
            </div>
            <h3 className="mt-2 text-[18px] leading-[1.35] text-[#141413]">{issue.title}</h3>
            <p className="mt-1 text-[14px] leading-[1.7] text-[#5e5d59]">{issue.summary}</p>
          </div>

          <div className="flex shrink-0 gap-3 md:pl-6">
            <div className="rounded-[16px] border border-[#ebe6db] bg-[#faf9f5] px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#87867f]">Effort</p>
              <p className="mt-1 text-[14px] text-[#141413]">{issue.effort}</p>
            </div>
            <div className="rounded-[16px] border border-[#ebe6db] bg-[#faf9f5] px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#87867f]">Score Loss</p>
              <p className="mt-1 text-[14px] text-[#141413]">-{issue.score_loss}</p>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-5">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Why It Matters</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5e5d59]">{issue.why_it_matters}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Evidence</p>
              <ul className="mt-2 space-y-2">
                {issue.evidence.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[14px] leading-[1.7] text-[#5e5d59]">
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#c96442]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Recommended Fix</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#141413]">{issue.recommended_fix}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-[#ebe6db] bg-[#faf9f5] p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Expected Gain</p>
              <p className="mt-2 text-[16px] text-[#141413]">{issue.estimated_gain}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">After Fix</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5e5d59]">{issue.expected_after}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Developer Guide</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5e5d59]">{issue.developer_fix_guide}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Business Impact</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5e5d59]">{issue.business_impact}</p>
            </div>
          </div>
        </div>
        <PremiumLock title="AI Remediation Unlocked" description="Upgrade to Pro to get precise code snippets and developer instructions to fix this issue immediately." gate="upgrade">
          <AiRemediationPanel issue={issue} url={url} />
        </PremiumLock>
      </AccordionContent>
    </AccordionItem>
  );
}

function Report() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = searchParams.get("url");
  const targetJobId = searchParams.get("jobId");

  const targetInit = searchParams.get("init") === "true";
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [progress, setProgress] = useState(8);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Store the URL to pass to LoadingPanel if we are still fetching the job
  const [displayUrl, setDisplayUrl] = useState<string>(targetUrl || "website");

  const { profile, user, isLoading: authLoading } = useAuth();
  
  // useRef (NOT useState) to guard against React 18 Strict Mode double-firing.
  // The ref persists across the unmount/remount cycle; only the real second navigation
  // resets the component tree and thus clears the ref.
  const scanInitiatedRef = useRef(false);

  useEffect(() => {
    if (!targetUrl && !targetJobId) {
      navigate("/");
      return;
    }

    // Guard against React 18 Strict Mode double-invocation.
    // The timeout means the Strict Mode cleanup (mounted = false, clearTimeout)
    // fires before the async block even starts, giving us a clean no-op.
    if (scanInitiatedRef.current) return;
    scanInitiatedRef.current = true;

    let mounted = true;
    let stagedProgress = 8;
    let progressTimer: number;
    let stepTimer: number;
    let subscription: any;
    let initTimer: number;

    const startSimulatedProgress = () => {
      progressTimer = window.setInterval(() => {
        stagedProgress = Math.min(stagedProgress + 2, 92);
        if (mounted) setProgress(stagedProgress);
      }, 350);
      stepTimer = window.setInterval(() => {
        if (!mounted) return;
        setStep((current) => Math.min(current + 1, loadingSteps.length - 1));
      }, 1200);
    };

    const stopSimulatedProgress = () => {
      window.clearInterval(progressTimer);
      window.clearInterval(stepTimer);
    };

    const runScan = async () => {
      try {
        let runUrl = targetUrl;
        let jobId = targetJobId;
        
        // 1. If we have a jobId, fetch job details FIRST
        if (jobId) {
          const { data: job, error: jobErr } = await supabase
            .from("scan_jobs")
            .select("url, status")
            .eq("id", jobId)
            .single();
            
          if (jobErr) throw new Error("Could not find this scan job.");
          runUrl = job.url;
          if (mounted) setDisplayUrl(runUrl!);

          // 2. If it's already completed, load from report_data
          if (job.status === "completed") {
            const { data: reportRecord, error: repErr } = await supabase
              .from("reports")
              .select("id")
              .eq("job_id", jobId)
              .single();
              
            if (!repErr && reportRecord) {
              const { data: reportData } = await supabase
                .from("report_data")
                .select("full_report")
                .eq("report_id", reportRecord.id)
                .single();
                
              if (reportData && reportData.full_report && mounted) {
                setReport(reportData.full_report as ForensicReport);
                setProgress(100);
                setStep(loadingSteps.length - 1);
                setIsScanning(false);
                return; // DONE!
              }
            }
            throw new Error("Report data is missing or corrupted.");
          }
          
          // 3. If it's failed
          if (job.status === "failed") {
             throw new Error("This scan job failed.");
          }
          
          // 4. If it's NOT completed and we are NOT the initiator, just subscribe to it!
          if (!targetInit) {
            startSimulatedProgress();
            
            // Listen to changes on this scan_job row
            subscription = supabase.channel(`public:scan_jobs:id=eq.${jobId}`)
              .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scan_jobs', filter: `id=eq.${jobId}` }, async (payload) => {
                const newStatus = payload.new.status;
                if (newStatus === "completed") {
                  // Fetch the report now!
                  const { data: repData } = await supabase.from("reports").select("id").eq("job_id", jobId).single();
                  if (repData) {
                    const { data: rd } = await supabase.from("report_data").select("full_report").eq("report_id", repData.id).single();
                    if (rd && rd.full_report && mounted) {
                      stopSimulatedProgress();
                      setReport(rd.full_report as ForensicReport);
                      setProgress(100);
                      setStep(loadingSteps.length - 1);
                      setIsScanning(false);
                    }
                  }
                } else if (newStatus === "failed") {
                  if (mounted) setError("The scan failed during execution.");
                }
              }).subscribe();
              
            return; // We wait for the subscription to trigger completion.
          }
        }

        if (!runUrl) throw new Error("No URL provided for analysis.");
        if (mounted) setDisplayUrl(runUrl);

        // -----------------------------------------------------------------------
        // DOMAIN-LEVEL TTL DEDUP — Check if same URL was fully scanned within 24h
        // If yes: load instantly from DB, skip the entire forensic scan.
        // -----------------------------------------------------------------------
        if (user) {
          try {
            const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { data: recentJob } = await supabase
              .from("scan_jobs")
              .select("id")
              .eq("url", runUrl)
              .eq("user_id", user.id)
              .eq("status", "completed")
              .gte("completed_at", cutoff24h)
              .order("completed_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (recentJob?.id) {
              const { data: repRecord } = await supabase
                .from("reports")
                .select("id")
                .eq("job_id", recentJob.id)
                .maybeSingle();

              if (repRecord?.id) {
                const { data: rdCache } = await supabase
                  .from("report_data")
                  .select("full_report")
                  .eq("report_id", repRecord.id)
                  .maybeSingle();

                if (rdCache?.full_report && mounted) {
                  console.debug("[ReportCache HIT] Loaded from DB, skipping live scan:", runUrl);
                  stopSimulatedProgress();
                  setReport(rdCache.full_report as ForensicReport);
                  setProgress(100);
                  setStep(loadingSteps.length - 1);
                  setIsScanning(false);
                  return; // ✅ Cache hit — skip live scan entirely
                }
              }
            }
          } catch (cacheCheckErr) {
            // Non-fatal — fall through to live scan
            console.warn("[ReportCache] Dedup check failed, running fresh scan:", cacheCheckErr);
          }
        }

        startSimulatedProgress();

        // RUN THE SCAN (only reached on cache miss)
        const result = await runForensicAnalysis(runUrl);
        if (!mounted) return;
        setReport(result);
        setProgress(100);
        setStep(loadingSteps.length - 1);

        // SAVE TO SUPABASE
        if (jobId && user) {
          try {
            await supabase.from("scan_jobs").update({
              status: "completed",
              score: result.scores.overall,
              completed_at: new Date().toISOString()
            }).eq("id", jobId);

            const { data: rep } = await supabase.from("reports").select("id").eq("job_id", jobId).single();
            if (rep) {
              await supabase.from("report_data").insert({
                report_id: rep.id,
                full_report: result
              });
              await supabase.from("reports").update({ overall_score: result.scores.overall }).eq("id", rep.id);
            }
          } catch (e) {
            console.error("Failed to save report to DB", e);
          }
        } else if (user) {
          const domain = new URL(runUrl).hostname.replace(/^www\./, "");
          await supabase.from("scan_jobs").insert({
            user_id: user.id,
            url: runUrl,
            domain,
            score: result.scores.overall,
            status: "completed",
          });
        }
      } catch (scanError) {
        if (!mounted) return;
        const message = scanError instanceof Error ? scanError.message : "Failed to generate the forensic report.";
        setError(message);
        if (targetJobId) {
          await supabase.from("scan_jobs").update({ status: 'failed', error_log: message }).eq("id", targetJobId);
        }
      } finally {
        stopSimulatedProgress();
        window.setTimeout(() => {
          if (mounted) setIsScanning(false);
        }, 500);
      }
    };

    // Defer execution by one tick. In React 18 Strict Mode the component is
    // mounted → unmounted → remounted synchronously. The cleanup below clears
    // this timer before `runScan` ever starts, so only the REAL second mount
    // executes the scan (at which point `scanInitiatedRef.current` is true
    // for any further re-renders, preventing a third execution).
    // In production mode (single mount), the timer fires immediately.
    initTimer = window.setTimeout(() => { runScan(); }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(initTimer);
      stopSimulatedProgress();
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [navigate, targetUrl, targetJobId, user, targetInit]);

  useEffect(() => {
    if (isScanning || !report) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [isScanning, report]);

  const issueGroups = useMemo(() => {
    if (!report) return { urgent: [], quickWins: [], all: [] as AuditIssue[] };
    return {
      urgent: report.issues.filter((issue) => issue.severity === "critical" || issue.severity === "high").slice(0, 5),
      quickWins: report.quick_wins,
      all: report.issues,
    };
  }, [report]);

  if (isScanning || !report) {
    if (error) {
      return (
        <div className="min-h-screen bg-[#f5f4ed]">
          <main className="container-page py-16">
            <div className="mx-auto max-w-3xl rounded-[32px] border border-[#efd0c7] bg-[#fff5f2] p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe7df]">
                  <AlertCircle className="h-5 w-5 text-[#c96442]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#c96442]">Scan Failed</p>
                  <h1 className="mt-3 text-[34px] leading-[1.1] text-[#141413]">The forensic engine could not complete this crawl.</h1>
                  <p className="mt-4 text-[15px] leading-[1.7] text-[#5e5d59]">{error}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={() => navigate("/")} className="rounded-full bg-[#141413] text-[#faf9f5] hover:bg-[#30302e]">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to home
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="rounded-full border-[#d6c9bb] bg-[#faf9f5] text-[#141413] hover:bg-[#f0eee6]"
                    >
                      Retry scan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    return <LoadingPanel progress={progress} step={step} targetUrl={displayUrl} />;
  }

  const overallTone = scoreTone(report.scores.overall);

  const handleBeforePdfExport = (): boolean => {
    // Don't gate while auth is still resolving — prevents false guest state
    if (authLoading) return false;
    if (!user) {
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const mainElement = document.getElementById('main-scroll-area');
      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 108 : 48;
      if (mainElement) {
        mainElement.scrollTo({
          top: el.offsetTop - offset,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: el.offsetTop - offset,
          behavior: "smooth"
        });
      }
    }
    setSidebarOpen(false);
  };

  const handleDeleteReport = async () => {
    if (!targetJobId) return;
    if (!window.confirm("Are you sure you want to delete this report? This cannot be undone.")) return;
    
    try {
      const { data: rep } = await supabase.from('reports').select('id').eq('job_id', targetJobId).single();
      
      if (rep) {
        await supabase.from('report_data').delete().eq('report_id', rep.id);
        await supabase.from('reports').delete().eq('id', rep.id);
      }
      
      await supabase.from('scan_jobs').delete().eq('id', targetJobId);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f5f4ed] text-[#141413] font-sans overflow-hidden">

      {/* ── Desktop Sidebar (always hidden on mobile) ── */}
      <div className="hidden md:flex flex-col w-[260px] shrink-0 bg-[#faf9f5] border-r border-[#e8e6dc] h-full">
        <div className="p-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-[#c96442]" />
          <div>
            <div className="font-bold text-[16px] leading-none">SEO Hub</div>
            <div className="text-[10px] text-[#87867f] uppercase tracking-widest mt-1">Analyzer</div>
          </div>
        </div>
        <div className="report-sidebar-nav flex-1 min-h-0 overflow-y-hidden hover:overflow-y-auto px-4 space-y-4 transition-all" style={{ scrollbarGutter: "stable" }}>
          <ReportUserPanel />
          <nav className="space-y-0.5 pb-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-[10px] text-[12px] font-medium transition-colors ${
                  activeSection === s.id ? "bg-[#e8e6dc] text-[#141413]" : "text-[#5e5d59] hover:bg-[#f0eee6] hover:text-[#141413]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#e8e6dc]">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="btn-interactive w-full justify-start rounded-[12px] text-[#5e5d59] hover:text-[#141413] hover:bg-[#e8e6dc]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div id="main-scroll-area" data-lenis-prevent="true" className="flex-1 min-h-0 h-full overflow-y-auto scroll-smooth">

        {/* ── Unified Sticky Header: favicon + domain + actions ── */}
        <header className="report-sticky-header px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: favicon + domain + date */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(report.url).hostname; } catch { return report.url; } })()}&sz=64`}
              alt=""
              className="h-6 w-6 object-contain rounded shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#141413] truncate leading-tight">
                {(() => { try { return new URL(report.url).hostname; } catch { return report.url; } })()}
              </p>
              <p className="text-[11px] text-[#595959] truncate hidden sm:block">
                {new Date(report.report_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          {/* Right: PDF download + options */}
          <div className="flex items-center gap-2 shrink-0">
            <PdfExportButton
              report={report}
              tier={profile?.tier ?? "free"}
              onBeforeExport={handleBeforePdfExport}
              size="sm"
              jobId={targetJobId || undefined}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Report options"
                  className="btn-interactive rounded-full border-black/10 bg-white hover:bg-black/5 h-8 w-8 p-0 shadow-none"
                >
                  <MoreVertical className="h-3.5 w-3.5 text-[#595959]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-black/5 rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-1">
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="text-[13px] rounded-[10px] cursor-pointer"
                >
                  <Share className="h-4 w-4 mr-2 text-[#595959]" /> Share Report
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const fullUrl = `https://${(() => { try { return new URL(report.url).hostname; } catch { return report.url; } })()}`;
                    navigate(`/?url=${encodeURIComponent(fullUrl)}`);
                  }}
                  className="text-[13px] rounded-[10px] cursor-pointer"
                >
                  <Zap className="h-4 w-4 mr-2 text-[#595959]" /> Rescan Website
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/5" />
                <DropdownMenuItem
                  onClick={handleDeleteReport}
                  className="text-[13px] text-[#c96442] hover:bg-[#FEF2F2] rounded-[10px] cursor-pointer focus:text-[#c96442] focus:bg-[#FEF2F2]"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Mobile Pill-Tab Navigation (sticky below header, desktop hidden) ── */}
        <nav
          aria-label="Report sections"
          className="md:hidden report-tabs-scroll flex gap-2 px-4 py-2.5 border-b border-black/[0.05] sticky top-14 z-40 bg-[#FDFBF7]/90 backdrop-blur-sm"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              aria-label={`Navigate to ${s.label}`}
              className={`btn-interactive flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${
                activeSection === s.id
                  ? "bg-[#141413] text-white shadow-sm"
                  : "bg-black/[0.04] text-[#595959] hover:bg-black/[0.08] hover:text-[#141413]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="max-w-[860px] mx-auto w-full px-5 sm:px-10 py-8 flex flex-col gap-14">

          {/* Overview */}

          <div id="overview" className="scroll-mt-28 md:scroll-mt-8">

            {/* H1 — visible below the sticky header */}
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#595959] mb-2">Enterprise Forensic Report</div>
              <h1 className="text-[30px] sm:text-[36px] font-semibold leading-[1.1] text-[#141413] font-serif">
                Website Intelligence Report
              </h1>
            </div>

            {/* Warning Banner — polished, vertically-aligned icons */}
            {report.scan_confidence !== undefined && report.scan_confidence < 100 && (
              <div className="mb-6 bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-5">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="h-5 w-5 text-[#D97706] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-[#854D0E] text-[14px] leading-snug">
                      Partial Scan Completed ({report.scan_confidence}% Confidence)
                    </h3>
                    <p className="text-[13px] text-[#A16207] mt-1 leading-relaxed">
                      The site's anti-bot protection limited access. We recovered what we could using fallback rendering.
                    </p>
                  </div>
                </div>
                <ul className="text-[13px] space-y-2 text-[#854D0E] mb-3 ml-8">
                  <li className="flex items-center gap-2">
                    {report.coverage_percentage === 100 ? (
                      <svg className="h-3.5 w-3.5 text-[#059669] shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5 text-[#D97706] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                      </svg>
                    )}
                    <span>{report.coverage_percentage === 100 ? "Primary Content Retrieved" : "Partial Content Retrieved"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                    <span>Server-side Headers Unavailable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                    <span>Deep Crawl Blocked</span>
                  </li>
                </ul>
                <div className="text-[11px] text-[#A16207] font-semibold uppercase tracking-widest ml-8">
                  Coverage: {report.coverage_percentage}%
                </div>
              </div>
            )}

            {/* ── Score + Executive Summary — Unified Hero Card ── */}
            <div className="border border-black/[0.06] bg-white rounded-[20px] p-5 sm:p-6 mb-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-8 items-start">

                {/* Score column */}
                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2">
                  <div className={`text-[64px] sm:text-[80px] md:text-[88px] font-bold leading-none font-serif tabular-nums ${overallTone.text}`}
                    aria-label={`Overall SEO score: ${report.scores.overall} out of 100`}
                  >
                    {report.scores.overall}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[12px] text-[#595959]">Overall Score /100</div>
                    <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] font-semibold shadow-none w-fit ${
                      report.audit_status === "Excellent" ? "bg-[#ECFDF5] text-[#065F46]" :
                      report.audit_status === "Needs Improvement" ? "bg-[#FEFCE8] text-[#854D0E]" :
                      "bg-[#FEF2F2] text-[#991B1B]"
                    }`}>
                      {report.audit_status}
                    </Badge>
                    <div className="text-[11px] text-[#595959]">
                      {report.issues.length} issues · {report.issues.filter(i => i.severity === "critical").length} critical
                    </div>
                    <div className="text-[11px] text-[#595959]">
                      {report.scope.pages_sampled}p sampled · {report.scope.sitemap_urls_discovered} sitemap URLs
                    </div>
                  </div>
                </div>

                {/* Executive Summary column */}
                <div className="border-t md:border-t-0 md:border-l border-black/[0.06] pt-5 md:pt-0 md:pl-7">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#595959] mb-2">Executive Summary</div>
                  <div
                    className={`summary-fade-transition md:overflow-visible md:max-h-none ${summaryExpanded ? "summary-expanded" : "summary-collapsed"}`}
                  >
                    <p className="text-[#595959] leading-[1.8] text-[14px]">{report.ai_summary}</p>
                  </div>
                  <button
                    onClick={() => setSummaryExpanded(prev => !prev)}
                    aria-expanded={summaryExpanded}
                    className="md:hidden mt-2.5 text-[12px] font-semibold text-[#141413] underline underline-offset-2 hover:text-[#595959] transition-colors"
                  >
                    {summaryExpanded ? "Show less ↑" : "Show more ↓"}
                  </button>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Score Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Technical Health", score: report.scores.technical_health },
                { label: "Performance", score: report.scores.performance },
                { label: "AI Visibility", score: report.scores.ai_visibility },
                { label: "Enterprise Readiness", score: report.scores.enterprise_readiness },
                { label: "UX Quality", score: report.scores.ux_quality },
                { label: "Trust & Security", score: report.scores.trust },
                { label: "Content Authority", score: report.scores.content_authority },
                { label: "Mobile Experience", score: report.scores.mobile_experience },
                { label: "Accessibility", score: report.scores.accessibility },
              ].map(({ label, score }) => {
                const tone = scoreTone(score);
                return (
                  <div key={label} className="btn-interactive bg-white border border-black/[0.06] rounded-[14px] p-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all cursor-default">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#595959]">{label}</div>
                    <div className={`text-[24px] font-semibold mt-1.5 ${tone.text}`}>{score}</div>
                    <div className="h-1.5 bg-black/[0.06] rounded-full mt-2.5 overflow-hidden">

                      <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keyword Intelligence */}
          {report.keyword_intelligence && (
            <div id="keyword-intelligence" className="scroll-mt-8">
              <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Keyword Intelligence</h2>
              <div className="bg-white border border-[#e8e6dc] rounded-[16px] p-5 shadow-sm overflow-hidden">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[120px]">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Top Keywords</div>
                    <div className="text-[24px] font-semibold text-[#141413]">{report.keyword_intelligence.top_ranking_keywords}</div>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Traffic Value (Est.)</div>
                    <div className="text-[24px] font-semibold text-[#22c55e]">{report.keyword_intelligence.total_traffic_value}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#f0eee6]">
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f] whitespace-nowrap">Keyword</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f] whitespace-nowrap">Intent</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f] whitespace-nowrap text-right pr-4">Volume</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f] whitespace-nowrap">KD %</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87867f] whitespace-nowrap text-right">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.keyword_intelligence.opportunities.map((opp, idx) => (
                        <tr key={idx} className="border-b border-[#f0eee6] last:border-0 hover:bg-[#faf9f5]">
                          <td className="py-3 pr-4 text-[13px] font-medium text-[#141413]">{opp.keyword}</td>
                          <td className="py-3 pr-4">
                            <Badge className={`rounded-full px-2 py-0.5 text-[10px] uppercase shadow-none ${
                              opp.intent === "Informational" ? "bg-[#eff6ff] text-[#1d4ed8]" :
                              opp.intent === "Commercial" ? "bg-[#fefce8] text-[#a16207]" :
                              opp.intent === "Transactional" ? "bg-[#f0fdf4] text-[#166534]" :
                              "bg-[#f3e8ff] text-[#6b21a8]"
                            }`}>
                              {opp.intent}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-[13px] text-[#5e5d59] text-right">{opp.search_volume.toLocaleString()}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] text-[#5e5d59] w-6">{opp.difficulty}</span>
                              <div className="w-16 h-1.5 bg-[#ede7db] rounded-full overflow-hidden hidden sm:block">
                                <div className={`h-full ${opp.difficulty > 60 ? 'bg-[#c96442]' : opp.difficulty > 40 ? 'bg-[#eab308]' : 'bg-[#22c55e]'}`} style={{ width: `${opp.difficulty}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-[13px] text-[#141413] font-medium text-right">{opp.current_rank ? `#${opp.current_rank}` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Performance & Engineering */}
          <div id="performance" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Performance & Engineering</h2>
            <PremiumLock title="Frontend Engineering & Infrastructure" description="Upgrade to Pro to unlock server caching strategies, unused CSS/JS cost analysis, and HTTP/3 support checks." gate="upgrade">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Mobile (Score: {report.performance.mobile.score}/100)</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  {[
                    { m: "LCP", v: report.performance.mobile.lcp, s: report.performance.mobile.lcp_status },
                    { m: "CLS", v: report.performance.mobile.cls, s: report.performance.mobile.cls_status },
                    { m: "INP", v: report.performance.mobile.inp, s: report.performance.mobile.inp_status },
                    { m: "FCP", v: report.performance.mobile.fcp, s: report.performance.mobile.fcp_status },
                    { m: "TBT", v: report.performance.mobile.tbt, s: report.performance.mobile.tbt_status },
                  ].map(({ m, v, s }, i) => (
                    <div key={m} className={`flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] ${i % 2 !== 0 ? "bg-[#faf9f5]" : "bg-white"} last:border-b-0`}>
                      <span className="font-semibold text-[12px]">{m}</span>
                      <span className="text-[12px] flex items-center gap-1.5">
                        {v}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] ${s === "pass" ? "bg-[#f0fdf4] text-[#166534]" : s === "warn" ? "bg-[#fefce8] text-[#a16207]" : "bg-[#fff5f2] text-[#c96442]"}`}>
                          {s === "pass" ? "✓" : s === "warn" ? "⚠" : "✗"} {s}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Desktop (Score: {report.performance.desktop.score}/100)</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  {[
                    { m: "LCP", v: report.performance.desktop.lcp, s: report.performance.desktop.lcp_status },
                    { m: "CLS", v: report.performance.desktop.cls, s: report.performance.desktop.cls_status },
                    { m: "INP", v: report.performance.desktop.inp, s: report.performance.desktop.inp_status },
                    { m: "FCP", v: report.performance.desktop.fcp, s: report.performance.desktop.fcp_status },
                  ].map(({ m, v, s }, i) => (
                    <div key={m} className={`flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] ${i % 2 !== 0 ? "bg-[#faf9f5]" : "bg-white"} last:border-b-0`}>
                      <span className="font-semibold text-[12px]">{m}</span>
                      <span className="text-[12px] flex items-center gap-1.5">
                        {v}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] ${s === "pass" ? "bg-[#f0fdf4] text-[#166534]" : s === "warn" ? "bg-[#fefce8] text-[#a16207]" : "bg-[#fff5f2] text-[#c96442]"}`}>
                          {s === "pass" ? "✓" : s === "warn" ? "⚠" : "✗"} {s}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Frontend Engineering</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">JS Execution</span><span className="text-[12px]">{report.performance.engineering.js_execution_cost}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Unused JS</span><span className="text-[12px]">{report.performance.engineering.unused_js}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">Unused CSS</span><span className="text-[12px]">{report.performance.engineering.unused_css}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 bg-[#faf9f5]"><span className="text-[12px] font-semibold">Bundle Estimate</span><span className="text-[12px]">{report.performance.engineering.bundle_size_estimate}</span></div>
                </div>
              </div>
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Infrastructure</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">HTTP/2</span><span className="text-[12px]">{report.performance.engineering.http2_support ? "✓ Yes" : "✗ No"}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">HTTP/3</span><span className="text-[12px]">{report.performance.engineering.http3_support ? "✓ Yes" : "✗ No"}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">Compression</span><span className="text-[12px]">{report.performance.engineering.server_compression}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 bg-[#faf9f5]"><span className="text-[12px] font-semibold">Cache Strategy</span><span className="text-[12px]">{report.performance.engineering.cache_strategy}</span></div>
                </div>
              </div>
            </div>
            </PremiumLock>
          </div>

          {/* Technical SEO */}
          <div id="technical-seo" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Technical SEO</h2>
            <PremiumLock title="Crawl & Architecture Analysis" description="Upgrade to Pro to unlock deep DOM complexity analysis, crawl budget estimates, and canonical conflict detection." gate="upgrade">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Crawl & Indexation</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">XML Sitemap</span><span className="text-[12px]">{report.technical.xml_sitemap_status}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Robots.txt</span><span className="text-[12px]">{report.technical.robots_txt_status}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">Crawl Budget</span><span className="text-[12px]">{report.technical.crawl_budget_estimate}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Orphan Pages</span><span className="text-[12px]">{report.technical.orphan_page_candidates}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 bg-white"><span className="text-[12px] font-semibold">Broken Links</span><span className="text-[12px]">{report.technical.broken_internal_links}</span></div>
                </div>
              </div>
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Architecture</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">DOM Complexity</span><span className="text-[12px]">{report.technical.dom_complexity}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">URL Structure</span><span className="text-[12px]">{report.technical.url_structure_quality}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">JS Rendering Risk</span><span className="text-[12px]">{report.technical.javascript_rendering_risk}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Canonical Conflicts</span><span className="text-[12px]">{report.technical.canonical_conflicts}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 bg-white"><span className="text-[12px] font-semibold">Metadata Duplicates</span><span className="text-[12px]">{report.technical.duplicate_metadata_clusters}</span></div>
                </div>
              </div>
            </div>
            </PremiumLock>
          </div>

          {/* Experience (UX & Frontend) */}
          <div id="experience" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Experience (UX & Frontend)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">UX Psychology</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">Conversion Psychology</span><span className="text-[12px]">{report.ux.conversion_psychology}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Attention Hierarchy</span><span className="text-[12px]">{report.ux.attention_hierarchy}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">CTA Effectiveness</span><span className="text-[12px]">{report.ux.cta_effectiveness}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Trust Perception</span><span className="text-[12px]">{report.ux.trust_perception}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 bg-white"><span className="text-[12px] font-semibold">Cognitive Overload</span><span className="text-[12px]">{report.ux.cognitive_overload}</span></div>
                </div>
              </div>
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Frontend Quality</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">UI Smoothness</span><span className="text-[12px]">{report.frontend.ui_smoothness}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Mobile Optimization</span><span className="text-[12px]">{report.frontend.mobile_optimization}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">Accessibility Quality</span><span className="text-[12px]">{report.frontend.accessibility_quality}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Semantic HTML</span><span className="text-[12px]">{report.frontend.semantic_html_quality}</span></div>
                  <div className="flex justify-between items-center px-2 py-2.5 bg-white"><span className="text-[12px] font-semibold">Layout Stability</span><span className="text-[12px]">{report.frontend.layout_stability}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Intelligence (Previews) */}
          <div id="visual-intelligence" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Visual Intelligence (Previews)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">On-Page Metadata</div>
                <div className="mt-3">
                  <div className="text-[12px] font-semibold mb-1">Title ({report.on_page.title.length} chars)</div>
                  <div className="text-[12px] text-[#5e5d59] mb-3 leading-relaxed">{report.on_page.title.text}</div>
                  <div className="text-[12px] font-semibold mb-1">Description ({report.on_page.meta_desc.length} chars)</div>
                  <div className="text-[12px] text-[#5e5d59] leading-relaxed line-clamp-3">{report.on_page.meta_desc.text}</div>
                </div>
              </div>
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">AI Readiness</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-1 py-2 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">AI Readability</span><span className="text-[12px]">{report.ai_visibility.ai_readability}</span></div>
                  <div className="flex justify-between items-center px-1 py-2 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">Structured Answers</span><span className="text-[12px]">{report.ai_visibility.structured_answer_readiness}</span></div>
                  <div className="flex justify-between items-center px-1 py-2 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">Citation Potential</span><span className="text-[12px]">{report.ai_visibility.citation_potential}</span></div>
                  <div className="flex justify-between items-center px-1 py-2 bg-[#faf9f5]"><span className="text-[12px] font-semibold">Snippet Opt.</span><span className="text-[12px]">{report.ai_visibility.snippet_optimization}</span></div>
                </div>
              </div>
              <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Security & Trust</div>
                <div className="mt-3 flex flex-col border-t border-[#f0eee6]">
                  <div className="flex justify-between items-center px-1 py-2 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">HTTPS</span><span className="text-[12px]">{report.security.https_quality}</span></div>
                  <div className="flex justify-between items-center px-1 py-2 border-b border-[#f0eee6] bg-[#faf9f5]"><span className="text-[12px] font-semibold">SPF</span><span className="text-[12px]">{report.security.spf_status}</span></div>
                  <div className="flex justify-between items-center px-1 py-2 border-b border-[#f0eee6] bg-white"><span className="text-[12px] font-semibold">DMARC</span><span className="text-[12px]">{report.security.dmarc_status}</span></div>
                  <div className="flex justify-between items-center px-1 py-2 bg-[#faf9f5]"><span className="text-[12px] font-semibold">Trust Badges</span><span className="text-[12px]">{report.security.trust_badge_quality}</span></div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#e8e6dc] rounded-[16px] shadow-sm overflow-hidden p-6">
               <PreviewEngine report={report} />
            </div>
          </div>

          {/* SEO Roadmap */}
          {report.seo_roadmap && (
            <div id="seo-roadmap" className="scroll-mt-8">
              <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">SEO Growth Roadmap</h2>
              <p className="text-[13px] text-[#87867f] mb-5">Phased action plan with impact forecasts, time estimates, and business case for each optimization.</p>
              <SeoRoadmapSection data={report.seo_roadmap} />
            </div>
          )}

          {/* Image Intelligence */}
          {report.image_intelligence && (
            <div id="image-intelligence" className="scroll-mt-8">
              <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Image Intelligence</h2>
              <p className="text-[13px] text-[#87867f] mb-5">Complete image audit: alt text coverage, lazy loading, format optimization, and AI-generated alt suggestions.</p>
              <ImageIntelligenceSection data={report.image_intelligence} />
            </div>
          )}

          {/* Content Opportunities */}
          {report.content_opportunities && (
            <div id="content-opportunities" className="scroll-mt-8">
              <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Content Opportunities</h2>
              <p className="text-[13px] text-[#87867f] mb-5">Topic gaps, thin content, freshness signals, and keyword cannibalization — with traffic impact estimates.</p>
              <ContentOpportunitySection data={report.content_opportunities} />
            </div>
          )}

          {/* AI Search Readiness */}
          {report.ai_search_readiness && (
            <div id="ai-search" className="scroll-mt-8">
              <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">AI Search Readiness</h2>
              <p className="text-[13px] text-[#87867f] mb-5">Per-engine readiness scores for ChatGPT, Claude, Gemini, Perplexity, Google AIO, and Copilot.</p>
              <AiSearchReadinessSection data={report.ai_search_readiness} />
            </div>
          )}

          {/* Action Plan */}
          {(issueGroups.urgent.length > 0 || issueGroups.all.length > 0) && (
            <div id="action-plan" className="scroll-mt-8">
              <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Action Plan (Prioritized Issues)</h2>
              <Accordion type="multiple" className="w-full">
                {issueGroups.urgent.slice(0, 2).map(issue => (
                   <IssueCard key={issue.id} issue={issue} url={targetUrl} />
                ))}
                
                <PremiumLock title="Full Action Plan" description="Upgrade to Pro to unlock all remaining critical fixes, effort estimations, and business impact analyses." gate="upgrade">
                  {issueGroups.urgent.slice(2).map(issue => (
                     <IssueCard key={issue.id} issue={issue} url={targetUrl} />
                  ))}
                  {issueGroups.all.filter(i => !issueGroups.urgent.some(u => u.id === i.id)).map(issue => (
                     <IssueCard key={issue.id} issue={issue} url={targetUrl} />
                  ))}
                </PremiumLock>
              </Accordion>

              {issueGroups.quickWins.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {issueGroups.quickWins.map((win) => (
                    <div key={win.id} className="bg-white border border-[#e8e6dc] rounded-[14px] p-5 shadow-sm">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#87867f] mb-1.5">{win.pillar} (Quick Win)</div>
                      <h3 className="text-[14px] font-semibold text-[#141413] mb-1.5">{win.title}</h3>
                      <p className="text-[12px] text-[#5e5d59]">{win.estimated_gain}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accessibility Deep */}
          <div id="accessibility" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Accessibility Audit</h2>
            <p className="text-[13px] text-[#87867f] mb-5">WCAG compliance estimation, ARIA coverage, semantic HTML quality, and keyboard navigation analysis.</p>
            <AccessibilityDeepSection technical={report.technical} frontend={report.frontend} />
          </div>

          {/* Competitive Benchmark */}
          <div id="competitive" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Competitive Benchmark</h2>
            <p className="text-[13px] text-[#87867f] mb-5">How your site compares to industry standards across performance, technical health, and SEO metrics.</p>
            <CompetitiveBenchmarkSection benchmarking={report.benchmarking} scores={report.scores} />
          </div>

          {/* Keyword Intelligence */}
          <div id="keyword-intelligence" className="scroll-mt-8">
            <h2 className="text-[18px] font-semibold text-[#141413] mb-4 font-serif">Keyword Intelligence</h2>
            <p className="text-[13px] text-[#87867f] mb-5">Keyword opportunities, intent distribution, difficulty analysis, and traffic value assessment.</p>
            <KeywordIntelligenceSection data={report.keyword_intelligence} />
          </div>

          {/* Global Audit Prompt */}
          <div className="mt-4 mb-12">
            <PremiumLock title="AI Global Prompts" description="Upgrade to Pro to unlock direct AI prompts to instantly generate developer-ready fixes for your entire codebase." gate="upgrade">
              <GlobalAuditPrompt report={report} />
            </PremiumLock>
          </div>

          <div className="mt-8">
            <ReportHistoryPanel 
              domain={(() => { try { return new URL(report.url).hostname; } catch { return report.url; } })()} 
              currentJobId={targetJobId || undefined} 
            />
          </div>

        </div>
        <Footer />
        <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} title="Sign In Required" description="Create a free account to download the PDF report. 5 credits included." />

        {/* ── Mobile Bottom Action Bar — always within thumb reach ── */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-sm border-t border-black/[0.06] px-4 pb-[env(safe-area-inset-bottom)] pt-2.5 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="btn-interactive flex-1 rounded-full border-black/10 bg-white hover:bg-black/5 h-10 text-[13px] font-medium text-[#141413] shadow-none"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Dashboard
          </Button>
          <div className="flex-1">
            <PdfExportButton
              report={report}
              tier={profile?.tier ?? "free"}
              onBeforeExport={handleBeforePdfExport}
              jobId={targetJobId || undefined}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Report;
