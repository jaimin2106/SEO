import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "./UpgradeModal";
import { AuthModal } from "@/components/seohub/AuthModal";
import { Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumLockProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /**
   * "upgrade" (default) — visible to all logged-in users but blurred for free tier.
   * "auth"    — hidden from guests; requires login to see anything.
   * false     — no gating, always render children.
   */
  gate?: "upgrade" | "auth" | false;
}

export function PremiumLock({
  children,
  title = "Premium Insight",
  description = "Unlock the full forensic report to access this deep technical analysis.",
  gate = "upgrade",
}: PremiumLockProps) {
  const { profile, user, isLoading } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Never gate while auth is still resolving — avoids flicker
  if (isLoading) return <>{children}</>;

  // No gating requested
  if (gate === false) return <>{children}</>;

  // Auth gate: user is not logged in at all
  if (gate === "auth" && !user) {
    return (
      <>
        <div className="relative group overflow-hidden rounded-[16px]">
          <div className="blur-sm opacity-50 select-none pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/10 via-white/85 to-white/98">
            <div className="bg-white border border-[#e8e6dc] shadow-lg rounded-2xl p-6 max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mx-auto w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-5 w-5 text-[#1d4ed8]" />
              </div>
              <h4 className="text-[16px] font-semibold text-[#141413] mb-2">Sign in to view</h4>
              <p className="text-[13px] text-[#5e5d59] leading-relaxed mb-5">
                Create a free account to access this section. No credit card required.
              </p>
              <Button
                onClick={() => setShowAuth(true)}
                className="w-full rounded-full bg-[#141413] text-[#faf9f5] hover:bg-[#30302e] text-[13px]"
              >
                Sign in free
              </Button>
            </div>
          </div>
        </div>
        <AuthModal
          open={showAuth}
          onOpenChange={setShowAuth}
          title="Create your free account"
          description="Sign in to unlock this section and get 5 free report credits."
        />
      </>
    );
  }

  // Upgrade gate: user is logged in but on free tier
  if (gate === "upgrade" && profile?.tier !== "pro" && profile?.tier !== "scale") {
    return (
      <>
        <div className="relative group overflow-hidden rounded-[16px]">
          <div className="blur-sm opacity-60 select-none pointer-events-none transition-all group-hover:blur-md group-hover:opacity-40">
            {children}
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/10 via-white/80 to-white/95">
            <div className="bg-white border border-[#e8e6dc] shadow-lg rounded-2xl p-6 max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mx-auto w-10 h-10 bg-[#fff5f2] rounded-full flex items-center justify-center mb-4">
                <Lock className="h-5 w-5 text-[#c96442]" />
              </div>
              <h4 className="text-[16px] font-semibold text-[#141413] mb-2">{title}</h4>
              <p className="text-[13px] text-[#5e5d59] leading-relaxed mb-5">
                {description}
              </p>
              <Button
                onClick={() => setShowUpgrade(true)}
                className="w-full rounded-full bg-[#141413] text-[#faf9f5] hover:bg-[#30302e] text-[13px]"
              >
                Unlock Full Report
              </Button>
            </div>
          </div>
        </div>
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      </>
    );
  }

  // All checks passed — render content
  return <>{children}</>;
}
