
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  History,
  Loader2,
  Lock,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Footer from "@/components/seohub/Footer";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ScanRecord {
  id: string;
  url: string;
  domain: string | null;
  score: number | null;
  created_at: string;
  completed_at: string | null;
  status: string;
  reports?: {
    is_pinned: boolean;
    id?: string;
    pdf_url?: string | null;
  }[];
}

type TabType =
  | "all"
  | "recent"
  | "pinned"
  | "in_progress"
  | "failed";

interface ScanTarget {
  url: string;
  domain: string;
}

const TABS: {
  id: TabType;
  label: string;
}[] = [
  { id: "all", label: "Completed" },
  { id: "recent", label: "Recent" },
  { id: "pinned", label: "Pinned" },
  { id: "in_progress", label: "In progress" },
  { id: "failed", label: "Failed" },
];

const ACTIVE_STATUSES = [
  "queued",
  "fetching",
  "rendering",
  "analyzing",
];

const PLAN_CREDITS: Record<string, number> = {
  free: 5,
  pro: 50,
  scale: 100,
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDomain(value: string): string {
  try {
    return new URL(
      value.match(/^https?:\/\//i)
        ? value
        : `https://${value}`
    ).hostname;
  } catch {
    return value;
  }
}

function normalizeScanUrl(value: string): ScanTarget | null {
  const input = value.trim();

  if (!input) return null;

  try {
    const candidate = /^https?:\/\//i.test(input)
      ? input
      : `https://${input}`;

    const parsed = new URL(candidate);

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }

    return {
      url: parsed.toString(),
      domain: parsed.hostname.toLowerCase(),
    };
  } catch {
    return null;
  }
}

function formatDuration(
  createdAt: string,
  completedAt: string | null
): string | null {
  if (!completedAt) return null;

  const duration =
    new Date(completedAt).getTime() -
    new Date(createdAt).getTime();

  if (!Number.isFinite(duration) || duration < 0) {
    return null;
  }

  return `${Math.max(1, Math.floor(duration / 1000))}s`;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: "Completed",
    failed: "Failed",
    queued: "Queued",
    fetching: "Fetching",
    rendering: "Rendering",
    analyzing: "Analyzing",
  };

  return labels[status] ?? status.replace(/_/g, " ");
}

/* -------------------------------------------------------------------------- */
/* Score badge                                                                */
/* -------------------------------------------------------------------------- */

function ScoreBadge({
  score,
}: {
  score: number | null;
}) {
  if (score === null) {
    return (
      <span className="text-[12px] text-[#929087]">
        Not available
      </span>
    );
  }

  const color =
    score >= 85
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : score >= 65
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <span
      className={`inline-flex min-w-10 items-center justify-center rounded-md border px-2.5 py-1.5 text-[12px] font-bold tabular-nums ${color}`}
      aria-label={`SEO score ${score} out of 100`}
    >
      {score}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Status badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  const classes = isCompleted
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : isFailed
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : isFailed ? (
        <X className="h-3 w-3" />
      ) : (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}

      {getStatusLabel(status)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric card                                                                */
/* -------------------------------------------------------------------------- */

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Activity;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 border border-[#e9e6dd] bg-white p-5 transition-colors hover:border-[#d6d2c7] sm:p-6">

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#858279]">
          {label}
        </span>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center ${
            accent
              ? "bg-[#f5ece6] text-[#c96442]"
              : "bg-[#f3f2ed] text-[#68665e]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 text-[31px] font-semibold tracking-[-0.04em] text-[#171715] tabular-nums sm:text-[35px]">
        {value}
      </p>

      <p className="mt-1.5 text-[11px] leading-[1.6] text-[#89867d]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Report actions                                                             */
/* -------------------------------------------------------------------------- */

function ReportActions({
  item,
  isPinned,
  onView,
  onTogglePin,
  onShare,
  onRescan,
  onDelete,
}: {
  item: ScanRecord;
  isPinned: boolean;
  onView: () => void;
  onTogglePin: () => void;
  onShare: () => void;
  onRescan: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${getDomain(item.url)}`}
          className="h-9 w-9 shrink-0 rounded-md text-[#77746c] hover:bg-[#f2f0e9] hover:text-[#171715]"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 border-[#e8e6dc] bg-white p-1.5 shadow-xl"
      >
        <DropdownMenuItem
          onClick={onView}
          className="cursor-pointer text-[12px]"
        >
          <FileText className="mr-2 h-4 w-4 text-[#77746c]" />
          View report
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={item.status !== "completed"}
          onClick={onTogglePin}
          className="cursor-pointer text-[12px]"
        >
          {isPinned ? (
            <PinOff className="mr-2 h-4 w-4 text-[#77746c]" />
          ) : (
            <Pin className="mr-2 h-4 w-4 text-[#77746c]" />
          )}

          {isPinned ? "Unpin report" : "Pin report"}
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={item.status !== "completed"}
          onClick={onShare}
          className="cursor-pointer text-[12px]"
        >
          <Share2 className="mr-2 h-4 w-4 text-[#77746c]" />
          Share report
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onRescan}
          disabled={item.status !== "completed"}
          className="cursor-pointer text-[12px]"
        >
          <Zap className="mr-2 h-4 w-4 text-[#77746c]" />
          Run again
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#eeeae1]" />

        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer text-[12px] text-[#c96442] focus:bg-[#fff2ed] focus:text-[#c96442]"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Dashboard                                                             */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
  const { user, profile, isLoading, upgradeTier } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ---------------------------------------------------------------------- */
  /* State                                                                  */
  /* ---------------------------------------------------------------------- */

  const [scanUrl, setScanUrl] = useState("");
  const [scanError, setScanError] = useState("");

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const [existingScanId, setExistingScanId] = useState<string | null>(null);
  const [existingScanDate, setExistingScanDate] = useState<string | null>(null);
  const [normalizedUrlForScan, setNormalizedUrlForScan] = useState("");
  const [showExistingModal, setShowExistingModal] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Authentication                                                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  /* ---------------------------------------------------------------------- */
  /* Cleanup                                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Fetch history                                                          */
  /* ---------------------------------------------------------------------- */

  const {
    data: scanHistory = [],
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useQuery<ScanRecord[]>({
    queryKey: ["scanHistory", user?.id],

    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("scan_jobs")
        .select(
          "id, url, domain, score, created_at, completed_at, status, reports(is_pinned)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data ?? []) as ScanRecord[];
    },

    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  /* ---------------------------------------------------------------------- */
  /* Realtime updates                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`dashboard_scans_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scan_jobs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["scanHistory", user.id],
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["scanHistory", user.id],
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  /* ---------------------------------------------------------------------- */
  /* Filter history                                                         */
  /* ---------------------------------------------------------------------- */

  const filteredHistory = useMemo(() => {
    let result = [...scanHistory];

    if (activeTab === "recent") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      result = result.filter(
        (item) =>
          item.status === "completed" &&
          new Date(item.created_at).getTime() > weekAgo
      );
    } else if (activeTab === "pinned") {
      result = result.filter(
        (item) => item.reports?.[0]?.is_pinned
      );
    } else if (activeTab === "in_progress") {
      result = result.filter((item) =>
        ACTIVE_STATUSES.includes(item.status)
      );
    } else if (activeTab === "failed") {
      result = result.filter(
        (item) => item.status === "failed"
      );
    } else {
      result = result.filter(
        (item) => item.status === "completed"
      );
    }

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (item) =>
          item.domain?.toLowerCase().includes(query) ||
          item.url.toLowerCase().includes(query)
      );
    }

    return result;
  }, [scanHistory, activeTab, searchQuery]);

  /* ---------------------------------------------------------------------- */
  /* Metrics and usage                                                      */
  /* ---------------------------------------------------------------------- */

  const plan = profile?.tier?.toLowerCase() ?? "free";

  const maxCredits = PLAN_CREDITS[plan] ?? PLAN_CREDITS.free;

  const remainingCredits = Math.max(
    0,
    Number(profile?.credits_remaining ?? 0)
  );

  const creditsUsed = Math.min(
    maxCredits,
    Math.max(0, maxCredits - remainingCredits)
  );

  const usagePercentage = Math.min(
    100,
    Math.max(0, (creditsUsed / maxCredits) * 100)
  );

  const completedScans = useMemo(
    () => scanHistory.filter((item) => item.status === "completed"),
    [scanHistory]
  );

  const averageScore = useMemo(() => {
    const scored = completedScans.filter(
      (item) => item.score !== null && item.score !== undefined
    );

    return scored.length
      ? Math.round(
          scored.reduce(
            (total, item) => total + Number(item.score),
            0
          ) / scored.length
        )
      : null;
  }, [completedScans]);

  const inProgressCount = scanHistory.filter((item) =>
    ACTIVE_STATUSES.includes(item.status)
  ).length;

  const failedCount = scanHistory.filter(
    (item) => item.status === "failed"
  ).length;

  const pinnedCount = scanHistory.filter(
    (item) => item.reports?.[0]?.is_pinned
  ).length;

  const currentTab = TABS.find(
    (tab) => tab.id === activeTab
  );

  /* ---------------------------------------------------------------------- */
  /* Scan initiation                                                         */
  /* ---------------------------------------------------------------------- */

  const initiateNewScan = async (
    target: ScanTarget
  ) => {
    if (isScanning) return;

    setIsScanning(true);
    setScanError("");

    try {
      const { data, error } = await supabase.rpc(
        "start_scan_job",
        {
          p_url: target.url,
          p_domain: target.domain,
        }
      );

      if (error) throw error;

      if (!data?.success) {
        if (data?.error === "Insufficient credits") {
          setShowUpgrade(true);
        } else {
          setScanError(
            data?.error || "Unable to start the scan. Please try again."
          );
        }

        setIsScanning(false);
        return;
      }

      if (!data.job_id) {
        throw new Error("The scan service did not return a job ID.");
      }

      void queryClient.invalidateQueries({
        queryKey: ["scanHistory", user?.id],
      });

      navigate(
        `/report?jobId=${encodeURIComponent(data.job_id)}&init=true`
      );
    } catch (error) {
      console.error("Failed to start scan:", error);

      setScanError(
        error instanceof Error
          ? error.message
          : "Unable to start the scan. Please try again."
      );

      setIsScanning(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Quick scan                                                              */
  /* ---------------------------------------------------------------------- */

  const handleQuickScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isScanning) return;

    const target = normalizeScanUrl(scanUrl);

    if (!target) {
      setScanError("Enter a valid website URL or domain.");
      return;
    }

    if (remainingCredits <= 0) {
      setShowUpgrade(true);
      return;
    }

    setScanError("");
    setIsScanning(true);

    try {
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: recentScans, error: recentError } =
        await supabase
          .from("scan_jobs")
          .select("id, created_at")
          .eq("user_id", user?.id)
          .eq("domain", target.domain)
          .eq("status", "completed")
          .gte("created_at", twentyFourHoursAgo)
          .order("created_at", { ascending: false })
          .limit(1);

      if (recentError) {
        console.warn(
          "Could not check recent scans:",
          recentError.message
        );
      }

      if (!recentError && recentScans?.length) {
        setExistingScanId(recentScans[0].id);
        setExistingScanDate(recentScans[0].created_at);
        setNormalizedUrlForScan(target.url);
        setShowExistingModal(true);
        setIsScanning(false);
        return;
      }

      await initiateNewScan(target);
    } catch (error) {
      console.error("Existing scan check failed:", error);

      await initiateNewScan(target);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Delete reports                                                          */
  /* ---------------------------------------------------------------------- */

  const executeDelete = async (jobIds: string[]) => {
    if (!user || jobIds.length === 0) return;

    try {
      for (const jobId of jobIds) {
        const {
          data: report,
          error: reportError,
        } = await supabase
          .from("reports")
          .select("id, pdf_url")
          .eq("job_id", jobId)
          .maybeSingle();

        if (reportError) throw reportError;

        if (report) {
          if (report.pdf_url) {
            try {
              const pdfUrl = new URL(report.pdf_url);
              const marker = "/report_exports/";

              const markerIndex =
                pdfUrl.pathname.indexOf(marker);

              const storagePath =
                markerIndex >= 0
                  ? decodeURIComponent(
                      pdfUrl.pathname.slice(
                        markerIndex + marker.length
                      )
                    )
                  : decodeURIComponent(
                      pdfUrl.pathname.split("/").pop() ?? ""
                    );

              if (storagePath) {
                const { error: storageError } =
                  await supabase.storage
                    .from("report_exports")
                    .remove([storagePath]);

                if (storageError) {
                  console.warn(
                    "PDF cleanup failed:",
                    storageError.message
                  );
                }
              }
            } catch (error) {
              console.warn("Could not clean up PDF:", error);
            }
          }

          const { error: dataError } = await supabase
            .from("report_data")
            .delete()
            .eq("report_id", report.id);

          if (dataError) throw dataError;

          const { error: deleteReportError } = await supabase
            .from("reports")
            .delete()
            .eq("id", report.id);

          if (deleteReportError) throw deleteReportError;
        }

        const { error: deleteJobError } = await supabase
          .from("scan_jobs")
          .delete()
          .eq("id", jobId)
          .eq("user_id", user.id);

        if (deleteJobError) throw deleteJobError;
      }

      queryClient.setQueryData(
        ["scanHistory", user.id],
        (old: ScanRecord[] | undefined) =>
          old?.filter((item) => !jobIds.includes(item.id)) ?? []
      );

      setSelectedJobs((previous) =>
        previous.filter((id) => !jobIds.includes(id))
      );
    } catch (error) {
      console.error("Failed to delete reports:", error);

      void queryClient.invalidateQueries({
        queryKey: ["scanHistory", user.id],
      });
    }
  };

  const confirmDelete = async () => {
    const ids = jobToDelete
      ? [jobToDelete]
      : [...selectedJobs];

    await executeDelete(ids);

    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  /* ---------------------------------------------------------------------- */
  /* Pin / unpin                                                             */
  /* ---------------------------------------------------------------------- */

  const handleTogglePin = async (
    jobId: string,
    currentPinned: boolean
  ) => {
    if (!user) return;

    try {
      const { data: report, error: findError } =
        await supabase
          .from("reports")
          .select("id")
          .eq("job_id", jobId)
          .maybeSingle();

      if (findError) throw findError;
      if (!report) return;

      const { error: updateError } = await supabase
        .from("reports")
        .update({
          is_pinned: !currentPinned,
        })
        .eq("id", report.id);

      if (updateError) throw updateError;

      queryClient.setQueryData(
        ["scanHistory", user.id],
        (old: ScanRecord[] | undefined) =>
          old?.map((item) =>
            item.id === jobId
              ? {
                  ...item,
                  reports: [
                    {
                      ...(item.reports?.[0] ?? {}),
                      is_pinned: !currentPinned,
                    },
                  ],
                }
              : item
          ) ?? []
      );
    } catch (error) {
      console.error("Failed to update pin:", error);

      void queryClient.invalidateQueries({
        queryKey: ["scanHistory", user.id],
      });
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Share report                                                            */
  /* ---------------------------------------------------------------------- */

  const handleShare = async (jobId: string) => {
    try {
      const url = `${window.location.origin}/report?jobId=${encodeURIComponent(jobId)}`;

      await navigator.clipboard.writeText(url);

      setCopiedReportId(jobId);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopiedReportId(null);
      }, 2000);
    } catch (error) {
      console.error("Could not copy report link:", error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Select reports                                                          */
  /* ---------------------------------------------------------------------- */

  const allVisibleSelected =
    filteredHistory.length > 0 &&
    filteredHistory.every((item) =>
      selectedJobs.includes(item.id)
    );

  const toggleSelectAll = (checked: boolean) => {
    const visibleIds = filteredHistory.map((item) => item.id);

    setSelectedJobs((previous) => {
      if (checked) {
        return [...new Set([...previous, ...visibleIds])];
      }

      return previous.filter(
        (id) => !visibleIds.includes(id)
      );
    });
  };

  const toggleSelect = (
    jobId: string,
    checked: boolean
  ) => {
    setSelectedJobs((previous) =>
      checked
        ? [...new Set([...previous, jobId])]
        : previous.filter((id) => id !== jobId)
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Loading state                                                           */
  /* ---------------------------------------------------------------------- */

  if (isLoading || (!profile && user)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-5 pb-20 pt-28 sm:px-8">
        <div className="mx-auto max-w-[1320px] animate-pulse space-y-8">

          <div>
            <div className="h-9 w-64 rounded-lg bg-black/[0.05]" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-black/[0.05]" />
          </div>

          <div className="h-48 rounded-xl bg-white" />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 rounded-lg border border-black/[0.05] bg-white"
              />
            ))}
          </div>

          <div className="h-96 rounded-xl border border-black/[0.05] bg-white" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  /* ---------------------------------------------------------------------- */
  /* Render report row / card                                                */
  /* ---------------------------------------------------------------------- */

  const renderReportActions = (item: ScanRecord) => {
    const pinned = item.reports?.[0]?.is_pinned ?? false;

    return (
      <ReportActions
        item={item}
        isPinned={pinned}
        onView={() =>
          navigate(`/report?jobId=${encodeURIComponent(item.id)}`)
        }
        onTogglePin={() =>
          void handleTogglePin(item.id, pinned)
        }
        onShare={() => void handleShare(item.id)}
        onRescan={() => {
          const target = normalizeScanUrl(item.url);

          if (target) {
            void initiateNewScan(target);
          }
        }}
        onDelete={() => {
          setJobToDelete(item.id);
          setDeleteDialogOpen(true);
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#171715]">

      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-10">

        {/* ============================================================ */}
        {/* HEADER                                                       */}
        {/* ============================================================ */}

        <section className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a09c91]">
              <span>Workspace</span>
              <span className="text-[#c96442]">/</span>
              <span className="text-[#6c6961]">Overview</span>
            </div>

            <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.035em] text-[#171715] sm:text-[43px]">
              Your workspace
            </h1>

            <p className="mt-3 max-w-[570px] text-[13px] leading-[1.8] text-[#77746c] sm:text-[14px]">
              Your website audits, reports, and account usage,
              all in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 border border-[#e8e5dc] bg-white px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1eee7] text-[13px] font-bold text-[#555148]">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[#272620]">
                {profile.name || "Your account"}
              </p>

              <p className="mt-0.5 text-[10px] capitalize text-[#88857c]">
                {profile.tier ?? "Free"} plan
              </p>
            </div>
          </div>

        </section>

        {/* ============================================================ */}
        {/* QUICK SCAN                                                   */}
        {/* ============================================================ */}

        <section className="relative mb-8 overflow-hidden bg-[#171715] text-white">

          <div className="pointer-events-none absolute -right-10 -top-28 h-72 w-72 rounded-full border border-white/[0.07]" />

          <div className="pointer-events-none absolute -right-3 -top-20 h-52 w-52 rounded-full border border-[#c96442]/25" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:p-10">

            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d18a64]">
                <Zap className="h-3.5 w-3.5" />
                Website analysis
              </div>

              <h2 className="mt-4 font-serif text-[29px] font-medium leading-[1.2] sm:text-[36px]">
                Ready to analyze a website?
              </h2>

              <p className="mt-3 max-w-[410px] text-[12px] leading-[1.8] text-[#aaa79e] sm:text-[13px]">
                Enter a website URL to start a new SEO analysis
                and uncover potential optimization opportunities.
              </p>

              <div className="mt-6 flex items-center gap-2 text-[11px] text-[#99958a]">
                <ShieldCheck className="h-4 w-4 text-[#d18a64]" />

                {remainingCredits} scan credits available
              </div>
            </div>

            <form
              onSubmit={handleQuickScan}
              className="min-w-0"
            >
              <label
                htmlFor="scan-url"
                className="mb-2 block text-[11px] font-semibold text-[#ddd9cf]"
              >
                Website URL
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">

                <div className="relative min-w-0 flex-1">
                  <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878279]" />

                  <input
                    id="scan-url"
                    type="text"
                    value={scanUrl}
                    disabled={isScanning}
                    onChange={(event) => {
                      setScanUrl(event.target.value);
                      setScanError("");
                    }}
                    placeholder="https://example.com"
                    autoComplete="url"
                    inputMode="url"
                    className="h-12 w-full rounded-md border border-white/10 bg-white/[0.07] pl-11 pr-4 text-[13px] text-white outline-none transition-colors placeholder:text-[#858178] focus:border-[#d18a64] focus:bg-white/[0.1] disabled:opacity-60"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isScanning || !scanUrl.trim()}
                  className="h-12 shrink-0 rounded-md bg-[#c96442] px-6 text-[12px] font-semibold text-white shadow-none transition-colors hover:bg-[#b05437] disabled:opacity-60"
                >
                  {isScanning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}

                  {isScanning ? "Starting..." : "Start scan"}

                  {!isScanning && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>

              {scanError && (
                <p
                  role="alert"
                  className="mt-3 text-[11px] text-[#ffb9a2]"
                >
                  {scanError}
                </p>
              )}

              <p className="mt-3 text-[10px] leading-relaxed text-[#878279]">
                Example: example.com or https://example.com
              </p>
            </form>

          </div>
        </section>

        {/* ============================================================ */}
        {/* OVERVIEW METRICS                                             */}
        {/* ============================================================ */}

        <section className="mb-10">

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#67645c]">
              Account overview
            </h2>

            <span className="text-[10px] text-[#99958a]">
              Based on available scan history
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            <MetricCard
              label="Total scans"
              value={scanHistory.length}
              description="All recorded scan jobs"
              icon={Globe}
            />

            <MetricCard
              label="Completed"
              value={completedScans.length}
              description="Successfully completed reports"
              icon={CheckCircle2}
            />

            <MetricCard
              label="Average score"
              value={averageScore === null ? "—" : averageScore}
              description="Average of scored completed reports"
              icon={TrendingUp}
              accent
            />

            <MetricCard
              label="In progress"
              value={inProgressCount}
              description="Scans currently processing"
              icon={Activity}
            />

          </div>
        </section>

        {/* ============================================================ */}
        {/* MAIN CONTENT                                                 */}
        {/* ============================================================ */}

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px] xl:gap-8">

          {/* ======================================================== */}
          {/* REPORT HISTORY                                           */}
          {/* ======================================================== */}

          <section className="min-w-0 border border-[#e8e5dc] bg-white">

            {/* Section header */}
            <div className="flex flex-col gap-4 border-b border-[#eeeae2] p-5 sm:p-6">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-[#c96442]" />

                    <h2 className="text-[15px] font-semibold text-[#24231f]">
                      Your reports
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-[#89867d]">
                    View and manage your website analysis history.
                  </p>
                </div>

                <span className="text-[10px] font-medium text-[#858279]">
                  {filteredHistory.length} results
                </span>

              </div>

              {/* Tabs */}
              <div
                role="tablist"
                aria-label="Filter reports"
                className="-mx-1 flex gap-1 overflow-x-auto pb-1"
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedJobs([]);
                    }}
                    className={`min-h-9 shrink-0 rounded-md px-3 text-[11px] font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#171715] text-white"
                        : "text-[#77746c] hover:bg-[#f3f1eb] hover:text-[#171715]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969287]" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by domain or website URL"
                  aria-label="Search reports"
                  className="h-11 w-full rounded-md border border-[#e7e4da] bg-[#fcfbf8] pl-10 pr-10 text-[12px] text-[#24231f] outline-none transition-colors placeholder:text-[#a09c92] focus:border-[#c96442]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear report search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#969287] hover:text-[#171715]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

            </div>

            {/* Bulk selection */}
            {selectedJobs.length > 0 && (
              <div className="flex flex-col justify-between gap-3 border-b border-[#30302e] bg-[#171715] px-5 py-3 text-white sm:flex-row sm:items-center">

                <span className="text-[12px] font-medium">
                  {selectedJobs.length} report
                  {selectedJobs.length === 1 ? "" : "s"} selected
                </span>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedJobs([])}
                    className="h-9 rounded-md text-[11px] text-[#c5c1b6] hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setJobToDelete(null);
                      setDeleteDialogOpen(true);
                    }}
                    className="h-9 rounded-md bg-[#c96442] text-[11px] text-white hover:bg-[#ae5438]"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete selected
                  </Button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {historyLoading && (
              <div className="space-y-4 p-5 sm:p-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-md bg-[#f4f2eb]"
                  />
                ))}
              </div>
            )}

            {/* Error state */}
            {!historyLoading && historyError && (
              <div className="px-5 py-20 text-center sm:px-8">
                <FileText className="mx-auto h-8 w-8 text-[#a09c91]" />

                <h3 className="mt-5 text-[14px] font-semibold text-[#24231f]">
                  Could not load your reports
                </h3>

                <p className="mt-2 text-[12px] text-[#89867d]">
                  There was a problem retrieving your scan history.
                </p>

                <Button
                  type="button"
                  onClick={() => void refetchHistory()}
                  className="mt-5 rounded-md bg-[#171715] text-[11px] text-white hover:bg-[#30302e]"
                >
                  Try again
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!historyLoading &&
              !historyError &&
              filteredHistory.length === 0 && (
                <div className="flex min-h-[330px] flex-col items-center justify-center px-5 py-16 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e8e5dc] bg-[#f5f3ed]">
                    {searchQuery ? (
                      <Search className="h-5 w-5 text-[#77746c]" />
                    ) : (
                      <History className="h-5 w-5 text-[#77746c]" />
                    )}
                  </div>

                  <h3 className="mt-5 text-[15px] font-semibold text-[#24231f]">
                    {searchQuery
                      ? "No matching reports"
                      : "Nothing here yet"}
                  </h3>

                  <p className="mt-2 max-w-[280px] text-[12px] leading-[1.8] text-[#89867d]">
                    {searchQuery
                      ? "Try another domain or clear your search."
                      : activeTab === "all"
                        ? "Your completed website audits will appear here. Start your first scan to get going."
                        : `There are no ${currentTab?.label.toLowerCase()} reports to display.`}
                  </p>

                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-5 text-[11px] font-semibold text-[#c96442] hover:text-[#a94f31]"
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("scan-url")
                          ?.focus()
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#171715] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#30302e]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Start your first scan
                    </button>
                  )}
                </div>
              )}

            {/* Desktop history table */}
            {!historyLoading &&
              !historyError &&
              filteredHistory.length > 0 && (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#eeeae2] bg-[#fcfbf8]">
                          <th className="w-12 px-5 py-4">
                            <input
                              type="checkbox"
                              aria-label="Select all visible reports"
                              checked={allVisibleSelected}
                              onChange={(event) =>
                                toggleSelectAll(event.target.checked)
                              }
                              className="h-4 w-4 cursor-pointer accent-[#171715]"
                            />
                          </th>

                          <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#89867d]">
                            Website
                          </th>

                          <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#89867d]">
                            Date
                          </th>

                          <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.13em] text-[#89867d]">
                            Status
                          </th>

                          <th className="px-4 py-4 text-right text-[9px] font-bold uppercase tracking-[0.13em] text-[#89867d]">
                            Score
                          </th>

                          <th className="w-14 px-3 py-4" />
                        </tr>
                      </thead>

                      <tbody>
                        {filteredHistory.map((item) => {
                          const pinned =
                            item.reports?.[0]?.is_pinned ?? false;

                          const selected = selectedJobs.includes(item.id);

                          return (
                            <tr
                              key={item.id}
                              className={`group border-b border-[#f0eee7] transition-colors last:border-0 hover:bg-[#fbfaf6] ${
                                selected ? "bg-[#f8f5ef]" : ""
                              }`}
                            >
                              <td className="px-5 py-4">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${getDomain(item.url)}`}
                                  checked={selected}
                                  onChange={(event) =>
                                    toggleSelect(item.id, event.target.checked)
                                  }
                                  className="h-4 w-4 cursor-pointer accent-[#171715]"
                                />
                              </td>

                              <td className="max-w-[280px] px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/report?jobId=${encodeURIComponent(item.id)}`
                                    )
                                  }
                                  className="flex min-w-0 items-center gap-3 text-left"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#e8e5dc] bg-white text-[#77746c]">
                                    <Globe className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-[12px] font-semibold text-[#25241f]">
                                        {item.domain || getDomain(item.url)}
                                      </p>

                                      {pinned && (
                                        <Pin className="h-3 w-3 shrink-0 text-[#c96442]" />
                                      )}
                                    </div>

                                    <p className="mt-1 truncate font-mono text-[10px] text-[#99958a]">
                                      {item.url}
                                    </p>
                                  </div>
                                </button>
                              </td>

                              <td className="whitespace-nowrap px-4 py-4">
                                <p className="text-[11px] font-medium text-[#494740]">
                                  {timeAgo(item.created_at)}
                                </p>

                                {formatDuration(
                                  item.created_at,
                                  item.completed_at
                                ) && (
                                  <p className="mt-1 text-[10px] text-[#9a968b]">
                                    {formatDuration(
                                      item.created_at,
                                      item.completed_at
                                    )} duration
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <StatusBadge status={item.status} />
                              </td>

                              <td className="px-4 py-4 text-right">
                                {item.status === "completed" ? (
                                  <ScoreBadge score={item.score} />
                                ) : (
                                  <span className="text-[11px] text-[#9a968b]">
                                    —
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-4 text-right">
                                {renderReportActions(item)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile report cards */}
                  <div className="divide-y divide-[#eeeae2] md:hidden">
                    {filteredHistory.map((item) => {
                      const pinned =
                        item.reports?.[0]?.is_pinned ?? false;

                      const selected = selectedJobs.includes(item.id);

                      return (
                        <article
                          key={item.id}
                          className={`p-4 transition-colors ${
                            selected ? "bg-[#f8f5ef]" : "bg-white"
                          }`}
                        >
                          <div className="flex min-w-0 items-start gap-3">

                            <input
                              type="checkbox"
                              aria-label={`Select ${getDomain(item.url)}`}
                              checked={selected}
                              onChange={(event) =>
                                toggleSelect(item.id, event.target.checked)
                              }
                              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#171715]"
                            />

                            <div className="flex min-w-0 flex-1 gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e8e5dc] bg-[#faf9f5]">
                                <Globe className="h-4 w-4 text-[#77746c]" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <h3 className="truncate text-[13px] font-semibold text-[#24231f]">
                                    {item.domain || getDomain(item.url)}
                                  </h3>

                                  {pinned && (
                                    <Pin className="h-3 w-3 shrink-0 text-[#c96442]" />
                                  )}
                                </div>

                                <p className="mt-1 truncate font-mono text-[10px] text-[#969287]">
                                  {item.url}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <StatusBadge status={item.status} />

                                  {item.status === "completed" && (
                                    <ScoreBadge score={item.score} />
                                  )}
                                </div>

                                <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-[#89867d]">
                                  <Clock3 className="h-3 w-3" />

                                  {timeAgo(item.created_at)}

                                  {formatDuration(
                                    item.created_at,
                                    item.completed_at
                                  ) && (
                                    <>
                                      <span>·</span>

                                      {formatDuration(
                                        item.created_at,
                                        item.completed_at
                                      )}
                                    </>
                                  )}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/report?jobId=${encodeURIComponent(item.id)}`
                                    )
                                  }
                                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#c96442] hover:text-[#a94f31]"
                                >
                                  View report
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="-mr-2 shrink-0">
                                {renderReportActions(item)}
                              </div>

                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}

          </section>

          {/* ======================================================== */}
          {/* ACCOUNT SIDEBAR                                          */}
          {/* ======================================================== */}

          <aside className="min-w-0 space-y-5">

            {/* Credit usage */}
            <section className="border border-[#e8e5dc] bg-white p-5 sm:p-6">

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#89867d]">
                    Subscription
                  </p>

                  <h2 className="mt-2 text-[19px] font-semibold capitalize tracking-tight text-[#24231f]">
                    {plan} plan
                  </h2>
                </div>

                <span className="rounded-md border border-[#e8e5dc] bg-[#faf9f5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#77746c]">
                  Active
                </span>
              </div>

              <div className="mt-7 border-t border-[#eeeae2] pt-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#89867d]">
                      Available credits
                    </p>

                    <p className="mt-2 text-[35px] font-semibold leading-none tracking-[-0.04em] text-[#171715] tabular-nums">
                      {remainingCredits}
                      <span className="ml-1 text-[14px] font-medium text-[#89867d]">
                        / {maxCredits}
                      </span>
                    </p>
                  </div>

                  <div className="pb-1 text-right">
                    <p className="text-[11px] font-semibold text-[#77746c]">
                      {Math.round(usagePercentage)}%
                    </p>

                    <p className="text-[9px] text-[#a09c91]">
                      Used
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 h-2 overflow-hidden rounded-full bg-[#efede6]"
                  role="progressbar"
                  aria-label="Credit usage"
                  aria-valuemin={0}
                  aria-valuemax={maxCredits}
                  aria-valuenow={creditsUsed}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercentage >= 90
                        ? "bg-[#c96442]"
                        : usagePercentage >= 75
                          ? "bg-amber-500"
                          : "bg-[#25241f]"
                    }`}
                    style={{
                      width: `${usagePercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-[#89867d]">
                  <span>{creditsUsed} used</span>
                  <span>{remainingCredits} remaining</span>
                </div>
              </div>

              {plan === "free" ? (
                <div className="mt-7 border border-[#eaded3] bg-[#faf5ef] p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#c96442]" />

                    <h3 className="text-[12px] font-semibold text-[#272620]">
                      Get more from your audits
                    </h3>
                  </div>

                  <p className="mt-2 text-[11px] leading-[1.8] text-[#77746c]">
                    Explore Pro for a higher scan allowance and
                    additional product features.
                  </p>

                  <Button
                    type="button"
                    onClick={() => upgradeTier("pro")}
                    className="mt-4 h-10 w-full rounded-md bg-[#171715] text-[11px] font-semibold text-white hover:bg-[#30302e]"
                  >
                    Explore Pro plan
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Link
                  to="/pricing"
                  className="mt-6 flex min-h-10 items-center justify-center gap-2 border border-[#e8e5dc] text-[11px] font-semibold text-[#555148] transition-colors hover:border-[#c96442] hover:text-[#c96442]"
                >
                  View plan details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </section>

            {/* Account stats */}
            <section className="border border-[#e8e5dc] bg-white p-5 sm:p-6">

              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#c96442]" />

                <h2 className="text-[12px] font-semibold text-[#282721]">
                  Activity summary
                </h2>
              </div>

              <div className="mt-5 divide-y divide-[#eeeae2]">

                {[
                  {
                    label: "Completed reports",
                    value: completedScans.length,
                  },
                  {
                    label: "Pinned reports",
                    value: pinnedCount,
                  },
                  {
                    label: "Active scans",
                    value: inProgressCount,
                  },
                  {
                    label: "Failed scans",
                    value: failedCount,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <span className="text-[11px] text-[#77746c]">
                      {metric.label}
                    </span>

                    <span className="text-[12px] font-semibold tabular-nums text-[#282721]">
                      {metric.value}
                    </span>
                  </div>
                ))}

              </div>
            </section>

            {/* Useful links */}
            <section className="border border-[#e8e5dc] bg-[#f7f5ef] p-5 sm:p-6">

              <h2 className="text-[12px] font-semibold text-[#282721]">
                Need a hand?
              </h2>

              <p className="mt-2 text-[11px] leading-[1.8] text-[#77746c]">
                Find documentation and guidance to get more out
                of your website analysis.
              </p>

              <div className="mt-5 space-y-3">

                <Link
                  to="/docs"
                  className="flex items-center justify-between text-[11px] font-medium text-[#555148] transition-colors hover:text-[#c96442]"
                >
                  Documentation
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/sample-report"
                  className="flex items-center justify-between text-[11px] font-medium text-[#555148] transition-colors hover:text-[#c96442]"
                >
                  Sample report
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/support"
                  className="flex items-center justify-between text-[11px] font-medium text-[#555148] transition-colors hover:text-[#c96442]"
                >
                  Contact support
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

              </div>
            </section>

          </aside>

        </div>
      </main>

      <Footer />

      {/* ================================================================ */}
      {/* EXISTING REPORT DIALOG                                           */}
      {/* ================================================================ */}

      <Dialog
        open={showExistingModal}
        onOpenChange={setShowExistingModal}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-[450px] rounded-xl border-[#e8e5dc] bg-[#FDFBF7] p-5 sm:p-6">

          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <DialogTitle className="font-serif text-[22px] font-medium text-[#171715]">
              Recent report found
            </DialogTitle>

            <DialogDescription className="pt-2 text-[13px] leading-[1.8] text-[#77746c]">
              An existing report was found for{" "}
              <strong className="break-all text-[#24231f]">
                {getDomain(normalizedUrlForScan)}
              </strong>
              .

              <br />

              <span className="text-[11px]">
                Previous scan:{" "}
                {existingScanDate
                  ? new Date(existingScanDate).toLocaleString()
                  : "Recently"}
              </span>

              <br />
              <br />

              Opening the existing report is free. Running a new
              scan will use one credit.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowExistingModal(false);
                setScanUrl("");

                const target = normalizeScanUrl(
                  normalizedUrlForScan
                );

                if (target) {
                  void initiateNewScan(target);
                }
              }}
              className="h-11 w-full rounded-md border-[#e1ddd3] bg-white text-[11px] text-[#24231f] hover:bg-[#f3f1eb] sm:w-auto"
            >
              Run another scan · 1 credit
            </Button>

            <Button
              type="button"
              onClick={() => {
                setShowExistingModal(false);

                if (existingScanId) {
                  navigate(
                    `/report?jobId=${encodeURIComponent(existingScanId)}`
                  );
                }
              }}
              className="h-11 w-full rounded-md bg-[#171715] text-[11px] text-white hover:bg-[#30302e] sm:w-auto"
            >
              View existing report
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* DELETE CONFIRMATION                                              */}
      {/* ================================================================ */}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);

          if (!open) {
            setJobToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="w-[calc(100%-32px)] max-w-[440px] rounded-xl border-[#e8e5dc] bg-white">

          <AlertDialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center bg-rose-50 text-rose-700">
              <Trash2 className="h-5 w-5" />
            </div>

            <AlertDialogTitle className="text-[18px] font-semibold text-[#171715]">
              Delete{" "}
              {jobToDelete
                ? "this report"
                : `${selectedJobs.length} reports`}
              ?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-[13px] leading-[1.8] text-[#77746c]">
              This action permanently deletes the selected report
              data and associated scan records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">

            <AlertDialogCancel className="mt-0 h-10 w-full rounded-md border-[#e8e5dc] text-[11px] sm:w-auto">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="h-10 w-full rounded-md bg-[#c96442] text-[11px] font-semibold text-white hover:bg-[#ad5134] sm:w-auto"
            >
              Delete permanently
            </AlertDialogAction>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================================ */}
      {/* UPGRADE MODAL                                                    */}
      {/* ================================================================ */}

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
      />

    </div>
  );
};

export default Dashboard;
