import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Github, Mail, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

// Google icon — inline SVG for accurate brand color rendering
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AuthModal({
  open,
  onOpenChange,
  title = "Welcome back",
  description = "Sign in to access your SEO reports and full forensic intelligence.",
}: AuthModalProps) {
  const { signInWithProvider, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "github" | "magic" | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProvider = async (provider: "google" | "github") => {
    setError(null);
    setLoading(provider);
    try {
      await signInWithProvider(provider);
      onOpenChange(false);
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading("magic");
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send magic link. Please try again.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleReset = () => {
    setMagicSent(false);
    setEmail("");
    setError(null);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        handleReset();
      }, 300);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2
          w-[calc(100%-32px)] sm:w-full sm:max-w-[420px]
          bg-[#faf9f5]
          border border-[#e8e6dc]
          rounded-[16px]
          p-0
          shadow-[0_8px_32px_rgba(20,20,19,0.08),0_0_0_1px_rgba(20,20,19,0.04)]
          overflow-hidden
          gap-0
        "
      >
        {magicSent ? (
          /* ── Magic link sent state ── */
          <div className="px-8 py-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mb-6">
              <CheckCircle2 className="h-6 w-6 text-[#16a34a]" />
            </div>
            <h2 className="font-serif font-medium text-[22px] text-[#141413] mb-2">Check your inbox</h2>
            <p className="text-[14px] text-[#5e5d59] leading-[1.7] max-w-[270px] mb-6">
              We sent a magic sign-in link to{" "}
              <span className="text-[#141413] font-medium">{email}</span>.{" "}
              Click the link to instantly log in — no password needed.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-[13px] font-medium text-[#141413] hover:text-[#5e5d59] transition-colors underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* ── Main auth form ── */
          <>
            {/* Header */}
            <div className="px-5 sm:px-8 pt-7 sm:pt-9 pb-6 sm:pb-7 border-b border-[#f0eee6]">
              <h2 className="font-serif font-medium text-[24px] leading-[1.2] text-[#141413] mb-2">
                {title}
              </h2>
              <p className="text-[13px] leading-[1.65] text-[#87867f] max-w-[300px]">
                {description}
              </p>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-8 py-6 sm:py-7 space-y-3">

              {/* Google */}
              <button
                id="auth-google-btn"
                onClick={() => handleProvider("google")}
                disabled={!!loading}
                className="
                  w-full flex items-center justify-center gap-2.5
                  h-11 px-4 rounded-[10px]
                  bg-white border border-[#e8e6dc]
                  text-[13px] font-medium text-[#141413]
                  hover:bg-[#faf9f5] hover:border-[#d1cfc5]
                  transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#87867f]" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                id="auth-github-btn"
                onClick={() => handleProvider("github")}
                disabled={!!loading}
                className="
                  w-full flex items-center justify-center gap-2.5
                  h-11 px-4 rounded-[10px]
                  bg-white border border-[#e8e6dc]
                  text-[13px] font-medium text-[#141413]
                  hover:bg-[#faf9f5] hover:border-[#d1cfc5]
                  transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#87867f]" />
                ) : (
                  <Github className="h-4 w-4 text-[#141413]" />
                )}
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-[#f0eee6]" />
                <span className="text-[11px] text-[#b0aea5] font-medium uppercase tracking-[0.18em]">or</span>
                <div className="flex-1 h-px bg-[#f0eee6]" />
              </div>

              {/* Magic Link form */}
              <form onSubmit={handleMagicLink} className="space-y-2.5">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4c2bc] pointer-events-none" />
                  <input
                    id="auth-email-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!loading}
                    className="
                      w-full h-11 pl-10 pr-4 rounded-[10px]
                      bg-white border border-[#e8e6dc]
                      text-[13px] text-[#141413]
                      placeholder:text-[#c4c2bc]
                      focus:outline-none focus:border-[#a09e96]
                      transition-colors duration-150
                      disabled:opacity-50
                    "
                  />
                </div>

                {error && (
                  <p className="text-[12px] text-red-500 px-1">{error}</p>
                )}

                <button
                  id="auth-magic-link-btn"
                  type="submit"
                  disabled={!!loading || !email}
                  className="
                    w-full h-11 rounded-[10px]
                    bg-[#141413] text-[#faf9f5]
                    text-[13px] font-medium
                    hover:bg-[#2a2927]
                    transition-colors duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {loading === "magic" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>

            </div>

            {/* Footer */}
            <div className="px-5 sm:px-8 pb-6 sm:pb-7 border-t border-[#f0eee6] pt-4 sm:pt-5">
              <p className="text-[11px] text-[#b0aea5] leading-[1.65] text-center">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-[#87867f] hover:text-[#5e5d59] transition-colors underline underline-offset-2">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#87867f] hover:text-[#5e5d59] transition-colors underline underline-offset-2">
                  Privacy Policy
                </a>
                . No credit card required.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
