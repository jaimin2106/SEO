import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/seohub/AuthModal";
import { UpgradeModal } from "@/components/report/UpgradeModal";
import { useState } from "react";
import { User, Zap, History, Search, ChevronRight } from "lucide-react";

export function ReportUserPanel() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Don't render during auth loading to avoid flicker
  if (isLoading) return null;

  // Guest view
  if (!user) {
    return (
      <>
        <div className="rounded-[18px] border border-[#e8e6dc] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center">
              <User className="w-4 h-4 text-[#87867f]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#141413]">Not signed in</p>
              <p className="text-[11px] text-[#87867f]">Sign in for free credits</p>
            </div>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="w-full rounded-full bg-[#141413] text-[#faf9f5] text-[12px] font-medium py-2 hover:bg-[#30302e] transition-colors"
          >
            Sign in — 5 free credits
          </button>
        </div>
        <AuthModal
          open={showAuth}
          onOpenChange={setShowAuth}
          title="Create your free account"
          description="Sign in to save reports, access history, and get 5 free monthly credits."
        />
      </>
    );
  }

  const maxCredits = profile?.tier === "scale" ? 100 : profile?.tier === "pro" ? 50 : 5;
  const creditsUsed = maxCredits - (profile?.credits_remaining ?? 0);
  const usagePercent = Math.min(100, Math.round((creditsUsed / maxCredits) * 100));
  const barColor = usagePercent > 90 ? "bg-[#c96442]" : usagePercent > 70 ? "bg-[#eab308]" : "bg-[#22c55e]";
  const tierLabel = (profile?.tier ?? "free").toUpperCase();
  const tierBadgeColor = profile?.tier === "pro" || profile?.tier === "scale"
    ? "bg-[#fefce8] text-[#a16207] border-[#fde68a]"
    : "bg-[#f0eee6] text-[#5e5d59] border-[#e8e6dc]";

  const initial = (profile?.name ?? user.email ?? "U").charAt(0).toUpperCase();

  return (
    <>
      <div className="rounded-[18px] border border-[#e8e6dc] bg-white p-4 shadow-sm space-y-4">
        {/* User identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#141413] flex items-center justify-center text-[#faf9f5] text-[14px] font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#141413] truncate">{profile?.name ?? user.email?.split("@")[0] ?? "User"}</p>
            <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.12em] border px-1.5 py-0.5 rounded mt-0.5 ${tierBadgeColor}`}>
              {tierLabel}
            </span>
          </div>
        </div>

        {/* Credits */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#87867f]" />
              <span className="text-[11px] text-[#87867f]">Credits</span>
            </div>
            <span className="text-[11px] font-semibold text-[#141413]">
              {profile?.credits_remaining ?? 0} / {maxCredits}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#f0eee6] overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${usagePercent}%` }} />
          </div>
          <p className="text-[10px] text-[#87867f] mt-1">{creditsUsed} used this period</p>
        </div>

        {/* Actions */}
        <div className="space-y-1.5">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[12px] text-[#5e5d59] hover:bg-[#faf9f5] transition-colors group"
          >
            <span className="flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              Scan History
            </span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[12px] text-[#5e5d59] hover:bg-[#faf9f5] transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              New Scan
            </span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Upgrade CTA for free tier */}
        {(profile?.tier === "free" || !profile?.tier) && (
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full rounded-full bg-gradient-to-r from-[#c96442] to-[#e07a54] text-white text-[12px] font-medium py-2 hover:opacity-90 transition-opacity"
          >
            Upgrade to Pro →
          </button>
        )}
      </div>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
