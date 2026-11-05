import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { supabase, isMockMode } from "@/lib/supabase";
import { toast } from "sonner";
import { trackEvent } from "@/lib/activityTracker";
import { queryClient } from "@/App";

export type SubscriptionTier = "free" | "pro" | "scale";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  credits_remaining: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  /** True ONLY during the very first cold-start session check. Never true during login/logout. */
  isLoading: boolean;
  signInWithProvider: (provider: "google" | "github") => Promise<void>;
  signInWithPhone: (phone: string, name?: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  upgradeTier: (tier: SubscriptionTier) => void;
  deductCredit: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Mock mode constants ───────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: "mock-user-123",
  app_metadata: {},
  user_metadata: { full_name: "Demo User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "demo@seohub.ai",
} as User;

const INITIAL_MOCK_PROFILE: UserProfile = {
  id: "mock-user-123",
  email: "demo@seohub.ai",
  name: "Demo User",
  tier: "free",
  credits_remaining: 5,
};

// ── Row shape from the `users` table ─────────────────────────────────────────

interface DbUserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  name: string | null;
  tier: string | null;
  subscription_tier: string | null;
  credits_remaining: number | null;
  credits: number | null;
  avatar_url: string | null;
}

function rowToProfile(row: DbUserRow): UserProfile {
  const rawTier = (row.tier ?? row.subscription_tier ?? "free").toLowerCase();
  const tier: SubscriptionTier =
    rawTier === "pro" ? "pro" : rawTier === "scale" ? "scale" : "free";

  const credits =
    row.credits_remaining !== null && row.credits_remaining !== undefined
      ? row.credits_remaining
      : (row.credits ?? 5);

  const name =
    row.name ||
    row.full_name ||
    (row.email ? row.email.split("@")[0] : "User");

  return {
    id: row.id,
    email: row.email ?? "",
    name,
    tier,
    credits_remaining: credits,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const userRef = useRef<User | null>(null);
  // isLoading is ONLY true during the initial cold-start check.
  // It must NEVER be set back to true during normal auth transitions.
  const [isLoading, setIsLoading] = useState(true);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  // Guard: prevent duplicate profile fetches if onAuthStateChange fires during init
  const initDoneRef = useRef(false);

  // ── ensureProfile ──────────────────────────────────────────────────────────
  // Calls the SECURITY DEFINER RPC that guarantees a profile+5 credits exists.
  // Faster than a table SELECT because it runs a single atomic upsert server-side.

  const ensureProfile = useCallback(async (userId: string): Promise<void> => {
    if (isMockMode) return;
    try {
      const { data, error } = await supabase.rpc("ensure_user_profile");
      if (error) {
        console.warn("[Auth] ensure_user_profile RPC error — falling back to direct fetch:", error.message);
        // Fallback: direct table read
        const { data: row } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        if (row) setProfile(rowToProfile(row as DbUserRow));
        return;
      }
      if (data) {
        // RPC returns the profile JSON directly
        const p: UserProfile = {
          id: data.id ?? userId,
          email: data.email ?? "",
          name: data.name ?? "User",
          tier: (data.tier ?? "free") as SubscriptionTier,
          credits_remaining: data.credits_remaining ?? 5,
        };
        setProfile(p);

        // Also check if a monthly credit refill is due (fire-and-forget)
        supabase.rpc("refill_credits_if_due", { p_user_id: userId }).then(({ data: refill }) => {
          if (refill?.refilled) {
            setProfile((prev) =>
              prev ? { ...prev, credits_remaining: refill.credits_remaining } : prev
            );
            trackEvent({ userId, action: 'CREDIT_REFILLED', metadata: { new_balance: refill.credits_remaining } });
          }
        });
      }
    } catch (err) {
      console.error("[Auth] ensureProfile unexpected error:", err);
    }
  }, []);

  // ── Realtime subscription on own user row ─────────────────────────────────

  const subscribeRealtime = useCallback((userId: string) => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const channel = supabase
      .channel(`user-row-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(rowToProfile(payload.new as DbUserRow));
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, []);

  // ── Init auth state ───────────────────────────────────────────────────────

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem("seohub_mock_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UserProfile;
          setUser(MOCK_USER);
          setProfile(parsed);
        } catch {
          localStorage.removeItem("seohub_mock_profile");
        }
      }
      setIsLoading(false);
      initDoneRef.current = true;
      return;
    }

    // Check for OAuth error in URL hash before processing session
    if (window.location.hash && window.location.hash.includes("error_description")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = params.get("error_description");
      if (errorDesc) {
        toast.error(errorDesc.replace(/\+/g, ' '));
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    // Cold-start: check existing session.
    // isLoading is already true (initial state) — no need to set it again.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        userRef.current = session.user;
        setUser(session.user);
        await ensureProfile(session.user.id);
        subscribeRealtime(session.user.id);
      }
      // Mark loading done. From this point, any auth change is an update, not an init.
      setIsLoading(false);
      initDoneRef.current = true;
    });

    // Listen for future auth changes (login, logout, token refresh, magic link callback, OTP verify)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If the initial getSession hasn't completed yet, skip — it will handle it.
      if (!initDoneRef.current && event !== "SIGNED_OUT") return;

      if (session?.user) {
        // Update user state immediately for instant navbar/UI update
        userRef.current = session.user;
        setUser(session.user);
        const currentUser = session.user;

        // Return from the auth callback before making requests with the Supabase client.
        window.setTimeout(() => {
          void ensureProfile(currentUser.id).then(() => subscribeRealtime(currentUser.id));

          if (event === "SIGNED_IN") {
            toast.success("Signed in successfully!");
            void trackEvent({ userId: currentUser.id, action: 'LOGIN' });
          }
        }, 0);
      } else {
        // Signed out — clean up
        const previousUser = userRef.current;
        userRef.current = null;
        if (previousUser) {
          window.setTimeout(() => {
            void trackEvent({ userId: previousUser.id, action: 'LOGOUT' });
          }, 0);
        }
        setUser(null);
        setProfile(null);
        queryClient.clear();
        if (realtimeChannelRef.current) {
          const channel = realtimeChannelRef.current;
          realtimeChannelRef.current = null;
          window.setTimeout(() => {
            void supabase.removeChannel(channel);
          }, 0);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [ensureProfile, subscribeRealtime]);

  // ── refreshProfile ────────────────────────────────────────────────────────

  const refreshProfile = useCallback(async () => {
    if (isMockMode || !user) return;
    await ensureProfile(user.id);
  }, [user, ensureProfile]);

  // ── signInWithProvider ────────────────────────────────────────────────────

  const signInWithProvider = async (provider: "google" | "github") => {
    if (isMockMode) {
      const mockProfile = { ...INITIAL_MOCK_PROFILE };
      setUser(MOCK_USER);
      setProfile(mockProfile);
      localStorage.setItem("seohub_mock_profile", JSON.stringify(mockProfile));
      toast.success(`Signed in with ${provider} (Simulation)`);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  // ── signInWithPhone ───────────────────────────────────────────────────────

  const signInWithPhone = async (phone: string, name?: string) => {
    if (isMockMode) {
      toast.success(`Mock SMS sent to ${phone} (Code: 123456)`);
      if (name) localStorage.setItem("mock_pending_name", name);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { data: name ? { full_name: name } : undefined },
    });
    if (error) throw error;
    toast.success("OTP sent! Check your phone.");
  };

  // ── verifyOtp ─────────────────────────────────────────────────────────────

  const verifyOtp = async (phone: string, token: string) => {
    if (isMockMode) {
      if (token !== "123456") throw new Error("Invalid mock OTP. Use 123456.");
      const name = localStorage.getItem("mock_pending_name") || phone;
      const mockProfile = { ...INITIAL_MOCK_PROFILE, email: `${phone}@mock.local`, name };
      setUser({ ...MOCK_USER, phone } as unknown as User);
      setProfile(mockProfile);
      localStorage.setItem("seohub_mock_profile", JSON.stringify(mockProfile));
      toast.success("Logged in successfully (Simulation).");
      return;
    }
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    if (error) throw error;
    // onAuthStateChange will fire and handle setUser + ensureProfile
  };

  // ── signInWithMagicLink ───────────────────────────────────────────────────

  const signInWithMagicLink = async (email: string) => {
    if (isMockMode) {
      const mockProfile = { ...INITIAL_MOCK_PROFILE, email, name: email.split("@")[0] };
      setUser({ ...MOCK_USER, email } as User);
      setProfile(mockProfile);
      localStorage.setItem("seohub_mock_profile", JSON.stringify(mockProfile));
      toast.success("Magic link sent! (Simulation — auto-logged in)");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    toast.success("Magic link sent! Check your inbox to sign in.");
  };

  // ── signOut ───────────────────────────────────────────────────────────────

  const signOut = async () => {
    if (isMockMode) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem("seohub_mock_profile");
      localStorage.removeItem("mock_pending_name");
      toast.success("Signed out successfully.");
      return;
    }
    await supabase.auth.signOut();
    // onAuthStateChange handles state cleanup
  };

  // ── upgradeTier ───────────────────────────────────────────────────────────

  const upgradeTier = (tier: SubscriptionTier) => {
    if (!profile) return;

    const newCredits = tier === "scale" ? 100 : tier === "pro" ? 50 : 5;
    const tierEnum = tier.toUpperCase() as "FREE" | "PRO" | "SCALE";

    // Optimistic update
    const updated: UserProfile = { ...profile, tier, credits_remaining: newCredits };
    setProfile(updated);

    if (isMockMode) {
      localStorage.setItem("seohub_mock_profile", JSON.stringify(updated));
      toast.success(`Successfully upgraded to ${tier.toUpperCase()} tier!`);
    } else {
      supabase
        .from("users")
        .update({
          subscription_tier: tierEnum,
          tier,
          credits_remaining: newCredits,
          credits: newCredits,
        })
        .eq("id", profile.id)
        .then(({ error }) => {
          if (error) {
            console.error("[Auth] upgradeTier error:", error.message);
            toast.error("Failed to update plan. Please contact support.");
            setProfile(profile); // revert
          } else {
            supabase
              .from("credit_transactions")
              .insert({ user_id: profile.id, delta: newCredits, reason: `upgrade_to_${tier}` })
              .then();
            toast.success(`Successfully upgraded to ${tier.toUpperCase()} tier!`);
            trackEvent({ userId: profile.id, action: 'UPGRADED', metadata: { tier: tierEnum } });
          }
        });
    }
  };

  // ── deductCredit ──────────────────────────────────────────────────────────

  const deductCredit = async (): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to use credits.");
      return false;
    }
    if (!profile) {
      // Profile may still be loading — try to fetch it first
      await ensureProfile(user.id);
      return false;
    }
    if (profile.credits_remaining <= 0) {
      toast.error("You are out of report credits. Please upgrade your plan.");
      return false;
    }

    // Optimistic update for instant UI feedback
    const before = profile.credits_remaining;
    setProfile((prev) => prev ? { ...prev, credits_remaining: before - 1 } : prev);

    if (isMockMode) {
      const updated = { ...profile, credits_remaining: before - 1 };
      localStorage.setItem("seohub_mock_profile", JSON.stringify(updated));
      return true;
    }

    // Atomic server-side deduction
    const { data, error } = await supabase.rpc("deduct_credit", {
      p_user_id: profile.id,
      p_reason: "scan",
    });

    if (error || !data?.success) {
      // Rollback
      setProfile((prev) => prev ? { ...prev, credits_remaining: before } : prev);
      const msg = data?.error ?? error?.message ?? "Failed to deduct credit.";
      toast.error(msg);
      return false;
    }

    // Confirm with server value
    setProfile((prev) =>
      prev ? { ...prev, credits_remaining: data.credits_remaining } : prev
    );

    trackEvent({ userId: profile.id, action: 'CREDIT_DEDUCTED', metadata: { reason: "scan" } });

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signInWithProvider,
        signInWithPhone,
        verifyOtp,
        signInWithMagicLink,
        signOut,
        upgradeTier,
        deductCredit,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
