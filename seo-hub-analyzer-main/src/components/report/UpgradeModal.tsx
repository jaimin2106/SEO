import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[#faf9f5] text-[#141413] border border-[#ebe6db] p-0 overflow-hidden rounded-[24px] shadow-[0_24px_80px_rgba(20,20,19,0.08),0_0_0_1px_rgba(20,20,19,0.02)]">
        
        <div className="p-10 pb-8 text-center bg-[#faf9f5]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eee6] border border-[#e8e6dc] mb-6 shadow-sm">
            <Sparkles className="h-5 w-5 text-[#c96442]" />
          </div>
          <DialogTitle className="font-serif text-[32px] font-medium leading-tight mb-3 tracking-tight text-[#141413]">
            Unlock Full Intelligence
          </DialogTitle>
          <DialogDescription className="text-[#5e5d59] text-[15px] mx-auto max-w-[340px] leading-relaxed">
            Upgrade to Pro to access deep technical insights, AI remediation, and unbranded PDF exports.
          </DialogDescription>
        </div>

        <div className="px-10 pb-10 bg-[#ffffff] border-t border-[#ebe6db]">
          <ul className="space-y-4 mb-8 pt-8">
            {[
              "Full Forensic Technical Crawl (No depth limits)",
              "AI-Powered Fixes & Code Snippets",
              "Export Premium Unbranded PDFs",
              "Complete Keyword Intelligence Data",
              "Historical Scan Comparisons",
            ].map((text, idx) => (
              <li key={idx} className="flex items-start gap-3.5">
                <div className="mt-1 shrink-0 rounded-full bg-[#f0fdf4] p-0.5 border border-[#bbf7d0]">
                  <Check className="h-3.5 w-3.5 text-[#166534]" />
                </div>
                <span className="text-[15px] text-[#141413] font-medium flex-1 pt-[3px] leading-snug">
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <Button 
            onClick={handleUpgrade}
            className="w-full h-[52px] rounded-xl bg-[#141413] text-[#faf9f5] hover:bg-[#2a2927] hover:shadow-[0_8px_20px_rgba(20,20,19,0.12)] text-[15px] font-medium tracking-[0.01em] transition-all duration-200 border-none"
          >
            Upgrade to Pro — $29/mo
          </Button>
          <p className="text-center text-[11px] text-[#87867f] mt-5 uppercase tracking-[0.18em] font-semibold">
            Cancel anytime. Secure checkout.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}
