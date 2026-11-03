import { useState, useCallback } from "react";
import { Download, Loader2, CheckCircle2, FileText } from "lucide-react";
import { triggerPdfExport } from "./pdfExport";
import type { ForensicReport } from "@/lib/forensicTypes";
import type { SubscriptionTier } from "@/contexts/AuthContext";

interface PdfExportButtonProps {
  report: ForensicReport;
  tier: SubscriptionTier;
  /** Called before export — return false to block (e.g. open auth modal) */
  onBeforeExport?: () => boolean;
  /** Optional size variant */
  size?: "sm" | "md";
  /** The scan job ID */
  jobId?: string;
}

const STEPS = [
  "Generating PDF…",
  "Preparing charts…",
  "Rendering sections…",
  "Finalizing report…",
];

export function PdfExportButton({
  report,
  tier,
  onBeforeExport,
  size = "md",
  jobId,
}: PdfExportButtonProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [stepIdx, setStepIdx] = useState(0);

  const handleClick = useCallback(async () => {
    // Optional gate (auth / upgrade check)
    if (onBeforeExport && !onBeforeExport()) return;

    setPhase("loading");
    setStepIdx(0);

    // Animate through the steps before opening the window
    for (let i = 0; i < STEPS.length; i++) {
      setStepIdx(i);
      await delay(i === STEPS.length - 1 ? 400 : 320);
    }

    // Try to use the Edge Function (cached PDF logic)
    let usedEdgeFunction = false;
    if (jobId) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase.functions.invoke('generate-pdf', {
          body: { job_id: jobId }
        });
        
        if (!error && data?.pdf_url) {
          window.open(data.pdf_url, '_blank');
          usedEdgeFunction = true;
        }
      } catch (e) {
        console.warn("Edge function failed, falling back to local print", e);
      }
    }

    // Fallback if edge function failed or no jobId
    if (!usedEdgeFunction) {
      triggerPdfExport(report, tier);
    }

    setPhase("done");

    // Reset back to idle after a moment
    await delay(2200);
    setPhase("idle");
    setStepIdx(0);
  }, [report, tier, onBeforeExport]);

  const isSm = size === "sm";

  if (phase === "done") {
    return (
      <button
        disabled
        className={`
          inline-flex items-center gap-2 font-medium rounded-full
          bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]
          transition-all duration-300
          ${isSm ? "h-9 px-3 text-[12px]" : "h-10 px-4 text-[13px]"}
        `}
      >
        <CheckCircle2 className={isSm ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Report Ready!
      </button>
    );
  }

  if (phase === "loading") {
    return (
      <button
        disabled
        className={`
          inline-flex items-center gap-2 font-medium rounded-full
          bg-[#141413] text-[#faf9f5] border border-[#141413]
          opacity-90 cursor-not-allowed transition-all duration-300
          ${isSm ? "h-9 px-3 text-[12px]" : "h-10 px-4 text-[13px]"}
        `}
        style={{ minWidth: isSm ? 140 : 180 }}
      >
        <Loader2 className={`${isSm ? "h-3.5 w-3.5" : "h-4 w-4"} animate-spin`} />
        <span
          key={stepIdx}
          style={{
            animation: "fadeInUp 0.25s ease forwards",
          }}
        >
          {STEPS[stepIdx]}
        </span>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </button>
    );
  }

  // Idle state
  return (
    <button
      id="pdf-export-btn"
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 font-medium rounded-full
        bg-[#141413] text-[#faf9f5] border border-[#141413]
        hover:bg-[#2a2927] hover:shadow-lg
        active:scale-[0.97]
        transition-all duration-150
        ${isSm ? "h-9 px-3 text-[12px]" : "h-10 px-4 text-[13px]"}
        ${tier === "free" ? "opacity-80" : ""}
      `}
    >
      {tier === "free" ? (
        <FileText className={isSm ? "h-3.5 w-3.5" : "h-4 w-4"} />
      ) : (
        <Download className={isSm ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
      {tier === "free" ? "Preview PDF" : "Download PDF"}
    </button>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
