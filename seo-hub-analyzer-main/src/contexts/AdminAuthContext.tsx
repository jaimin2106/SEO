// src/contexts/AdminAuthContext.tsx
// Isolated admin auth context — completely separate from the user AuthContext.
// On mount: validates session → loads user_role from DB → exposes can() helper.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '@/lib/supabase';
import {
  AdminRole,
  Permission,
  hasPermission,
  isAdminRole,
} from '@/lib/adminRbac';
import { logAdminAction } from '@/lib/adminAudit';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  /** True only during the initial session + role check */
  isLoading: boolean;
  /** True once role has been confirmed from DB */
  isAdminAuthenticated: boolean;
  /** True if the user has an active session, even if they aren't an admin */
  hasSession: boolean;
  /** Check a specific permission for the current admin */
  can: (permission: Permission) => boolean;
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signOutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  /**
   * Given a Supabase auth user id + email, look up their role in user_roles.
   * Returns null if the user has no admin role at all.
   */
  const fetchAdminRole = useCallback(async (userId: string, email: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, admin_roles(name)')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error?.code === 'PGRST116' || !data) return null;
    if (error) throw new Error(`Unable to verify admin role: ${error.message}`);

    // data.admin_roles may be an array (join) or object depending on supabase-js version
    const roleRow = Array.isArray(data.admin_roles) ? data.admin_roles[0] : data.admin_roles;
    const roleName = roleRow?.name;

    if (!isAdminRole(roleName)) return null;

    return { id: userId, email, role: roleName };
  }, []);

  const initDoneRef = React.useRef(false);

  // On mount: check existing session
  useEffect(() => {
    let cancelled = false;
    let roleLookupSequence = 0;

    const init = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!cancelled && session?.user) {
          setHasSession(true);
          const admin = await fetchAdminRole(session.user.id, session.user.email ?? '');
          if (!cancelled) setAdminUser(admin);
        } else if (!cancelled) {
          setHasSession(false);
        }
      } catch (err) {
        console.error("AdminAuthContext init error:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          initDoneRef.current = true;
        }
      }
    };

    init();

    // Listen for auth changes (tab re-focus, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      
      // Skip duplicate initial session fetch
      if (!initDoneRef.current && event !== 'SIGNED_OUT') return;

      if (session?.user) {
        setHasSession(true);
        const requestSequence = ++roleLookupSequence;
        const { id, email } = session.user;

        // Supabase auth callbacks must return before making requests with the client.
        window.setTimeout(() => {
          void fetchAdminRole(id, email ?? '')
            .then((admin) => {
              if (!cancelled && requestSequence === roleLookupSequence) setAdminUser(admin);
            })
            .catch((error: unknown) => {
              console.error('Admin role refresh failed:', error);
              if (!cancelled && requestSequence === roleLookupSequence) setAdminUser(null);
            });
        }, 0);
      } else {
        roleLookupSequence += 1;
        setHasSession(false);
        setAdminUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchAdminRole]);

  // ------------------------------------------------------------

  const signInAdmin = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign-in failed. Please try again.' };

    let admin: AdminUser | null;
    try {
      admin = await fetchAdminRole(data.user.id, data.user.email ?? '');
    } catch (roleError) {
      await supabase.auth.signOut();
      return {
        error: roleError instanceof Error ? roleError.message : 'Unable to verify admin access.',
      };
    }

    if (!admin) {
      await supabase.auth.signOut();
      return { error: 'Access denied. You do not have admin privileges.' };
    }

    setAdminUser(admin);
    logAdminAction({ action: 'ADMIN_LOGIN', metadata: { email } });
    return { error: null };
  }, [fetchAdminRole]);

  const signOutAdmin = useCallback(async () => {
    if (adminUser) {
      logAdminAction({ action: 'ADMIN_LOGOUT', metadata: { email: adminUser.email } });
    }
    await supabase.auth.signOut();
    setAdminUser(null);
  }, [adminUser]);

  const can = useCallback((permission: Permission): boolean => {
    if (!adminUser) return false;
    return hasPermission(adminUser.role, permission);
  }, [adminUser]);

  // ------------------------------------------------------------

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        isAdminAuthenticated: !!adminUser,
        hasSession,
        can,
        signInAdmin,
        signOutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export function useAdminAuth(): AdminAuthContextType {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
